import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, phoneNumber, mediaUrl, body } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!userId) {
      await supabase.functions.invoke('whatsapp-send', {
        body: {
          to: phoneNumber,
          message: '❌ Para analisar fotos, você precisa estar cadastrado no app. Acesse o FoodScan e conecte seu WhatsApp!',
          userId: null
        }
      });
      return new Response(JSON.stringify({ success: false, error: 'User not registered' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Download image from Twilio
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    const imageResponse = await fetch(mediaUrl, {
      headers: { 'Authorization': `Basic ${auth}` }
    });

    if (!imageResponse.ok) {
      throw new Error('Failed to download image from Twilio');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Convert to base64 safely for large images
    const uint8Array = new Uint8Array(imageBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Image = btoa(binaryString);

    // Call analyze-nutrition function (same AI used by FoodScan - two-step analysis)
    const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-nutrition', {
      body: { base64Image }
    });

    if (analysisError || !analysisData?.foodName) {
      console.error('Analysis error:', analysisError, 'Data:', analysisData);
      await supabase.functions.invoke('whatsapp-send', {
        body: {
          to: phoneNumber,
          message: '❌ Não consegui analisar a imagem. Tente enviar uma foto mais clara da comida!',
          userId
        }
      });
      return new Response(JSON.stringify({ success: false, error: 'Analysis failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract structured nutrition data directly from JSON (no regex needed!)
    const calories = analysisData.nutrition?.calories || 0;
    const proteins = analysisData.nutrition?.proteins || 0;
    const carbs = analysisData.nutrition?.carbohydrates || 0;
    const fats = analysisData.nutrition?.fats || 0;
    const fiber = analysisData.nutrition?.fiber || 0;

    const foodName = analysisData.foodName;
    const description = analysisData.description || '';
    const portion = analysisData.quantity || '1 porção';

    // Calculate inferred meal_type based on current BRT time (UTC-3)
    const nowUtc = new Date();
    const brtHour = (nowUtc.getUTCHours() - 3 + 24) % 24;
    const brtMinutes = nowUtc.getUTCMinutes();
    const brtTime = brtHour + brtMinutes / 60;
    let mealTypeInferred: string;
    if (brtTime >= 4 && brtTime < 10.5) mealTypeInferred = 'cafe_da_manha';
    else if (brtTime >= 10.5 && brtTime < 14.5) mealTypeInferred = 'almoco';
    else if (brtTime >= 14.5 && brtTime < 17.5) mealTypeInferred = 'lanche';
    else if (brtTime >= 17.5 && brtTime < 21.5) mealTypeInferred = 'jantar';
    else mealTypeInferred = 'ceia';

    const mealTypeLabels: Record<string, string> = {
      cafe_da_manha: 'Café da manhã',
      lanche: 'Lanche',
      almoco: 'Almoço',
      jantar: 'Jantar',
      ceia: 'Ceia',
    };
    const inferredLabel = mealTypeLabels[mealTypeInferred];

    console.log(`✅ Structured nutrition from analyze-nutrition: ${calories} kcal, ${proteins}g prot, ${carbs}g carbs, ${fats}g fats`);

    // Build elements list if multiple items detected
    let elementsText = '';
    if (analysisData.elements && analysisData.elements.length > 0) {
      elementsText = analysisData.elements.map((el: any) => 
        `• ${el.name}: ${el.nutrition?.calories || 0} kcal`
      ).join('\n');
      elementsText = `\n\n🍽️ *Itens identificados:*\n${elementsText}\n`;
    }

    // Build message
    const header = `📸 *Análise da Imagem*\n\n*${foodName}*\n`;
    const nutritionInfo = `\n📊 *Informações Nutricionais:*\n` +
      `🔥 Calorias: ~${calories} kcal\n` +
      `💪 Proteínas: ~${proteins}g\n` +
      `🍞 Carboidratos: ~${carbs}g\n` +
      `🥑 Gorduras: ~${fats}g\n` +
      (fiber > 0 ? `🥬 Fibras: ~${fiber}g\n` : '') +
      `\n`;
    const footer = `✅ Quer registrar esta refeição?\n` +
      `Responda "SIM" para registrar ou "NÃO" para cancelar.`;

    // Truncate description if needed
    const maxTotalLength = 1500;
    const fixedPartsLength = header.length + elementsText.length + nutritionInfo.length + footer.length;
    const maxDescriptionLength = maxTotalLength - fixedPartsLength - 10;

    let truncatedDesc = description;
    if (truncatedDesc.length > maxDescriptionLength) {
      truncatedDesc = truncatedDesc.substring(0, maxDescriptionLength - 3) + '...';
    }

    const responseMessage = header + truncatedDesc + elementsText + nutritionInfo + footer;

    console.log(`📏 Final message length: ${responseMessage.length} chars`);

    // Send message
    await supabase.functions.invoke('whatsapp-send', {
      body: {
        to: phoneNumber,
        message: responseMessage,
        userId
      }
    });

    // Store pending meal for confirmation
    await supabase.from('whatsapp_messages').insert({
      user_id: userId,
      phone_number: phoneNumber,
      direction: 'outbound',
      message_type: 'text',
      content: responseMessage,
      status: 'sent',
      metadata: {
        pending_meal: {
          food_name: foodName,
          calories,
          proteins,
          carbohydrates: carbs,
          fats,
          portion,
          meal_time: new Date().toISOString()
        }
      }
    });

    return new Response(JSON.stringify({ success: true, analysis: foodName }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in whatsapp-process-image:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
