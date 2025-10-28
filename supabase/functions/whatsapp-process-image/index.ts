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

    // Call analyze-image function
    const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-image', {
      body: { base64Image }
    });

    if (analysisError || !analysisData?.description) {
      console.error('Analysis error:', analysisError);
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

    let description = analysisData.description;
    
    console.log(`📏 Original description length: ${description.length} chars`);

    // Extract nutrition info with improved regex for new format
    const nutritionLine = description.match(/NUTRIÇÃO:\s*(\d+)\s*kcal\s*\|\s*(\d+(?:\.\d+)?)g?\s*proteínas\s*\|\s*(\d+(?:\.\d+)?)g?\s*carboidratos\s*\|\s*(\d+(?:\.\d+)?)g?\s*gorduras/i);

    let calories = 500;  // default fallback
    let proteins = 25;
    let carbs = 50;
    let fats = 15;

    if (nutritionLine) {
      calories = parseInt(nutritionLine[1]);
      proteins = parseFloat(nutritionLine[2]);
      carbs = parseFloat(nutritionLine[3]);
      fats = parseFloat(nutritionLine[4]);
      
      console.log(`✅ Nutrition info extracted from AI: ${calories} kcal, ${proteins}g proteins, ${carbs}g carbs, ${fats}g fats`);
      
      // Remove the nutrition line from description so it doesn't appear twice
      description = description.replace(/NUTRIÇÃO:.*$/im, '').trim();
    } else {
      console.log(`⚠️ No nutrition info found in AI response, using defaults`);
      
      // Fallback: try old regex patterns
      const caloriesMatch = description.match(/(\d+)\s*(?:kcal|calorias)/i);
      const proteinsMatch = description.match(/(\d+(?:\.\d+)?)\s*g?\s*(?:de\s+)?(?:proteínas|proteina|protein)/i);
      const carbsMatch = description.match(/(\d+(?:\.\d+)?)\s*g?\s*(?:de\s+)?(?:carboidratos|carbs)/i);
      const fatsMatch = description.match(/(\d+(?:\.\d+)?)\s*g?\s*(?:de\s+)?(?:gorduras|gordura|fat)/i);

      if (caloriesMatch) calories = parseInt(caloriesMatch[1]);
      if (proteinsMatch) proteins = parseFloat(proteinsMatch[1]);
      if (carbsMatch) carbs = parseFloat(carbsMatch[1]);
      if (fatsMatch) fats = parseFloat(fatsMatch[1]);
    }

    // Build message components
    const header = `📸 *Análise da Imagem*\n\n`;
    const nutritionInfo = `📊 *Informações Nutricionais:*\n` +
      `🔥 Calorias: ~${calories} kcal\n` +
      `💪 Proteínas: ~${proteins}g\n` +
      `🍞 Carboidratos: ~${carbs}g\n` +
      `🥑 Gorduras: ~${fats}g\n\n`;
    const footer = `✅ Quer registrar esta refeição?\n` +
      `Responda "SIM" para registrar ou "NÃO" para cancelar.`;

    // Calculate available space for description
    const fixedPartsLength = header.length + nutritionInfo.length + footer.length;
    const maxTotalLength = 1500;
    const maxDescriptionLength = maxTotalLength - fixedPartsLength - 10; // 10 chars buffer

    console.log(`📊 Message size calculation:
      - Fixed parts: ${fixedPartsLength} chars
      - Max description: ${maxDescriptionLength} chars
      - Total limit: ${maxTotalLength} chars`);

    // Intelligent truncation: keep full paragraphs when possible
    if (description.length > maxDescriptionLength) {
      console.log(`⚠️ Description too long (${description.length} chars), truncating to ${maxDescriptionLength}`);
      
      // Try to break at last complete line/paragraph
      const truncated = description.substring(0, maxDescriptionLength);
      const lines = truncated.split('\n');
      
      // Remove last incomplete line and add indicator
      description = lines.slice(0, -1).join('\n') + '\n\n[...análise resumida]';
      
      // If still too long, hard cut
      if (description.length > maxDescriptionLength) {
        description = description.substring(0, maxDescriptionLength - 3) + '...';
      }
      
      console.log(`✂️ Description truncated to ${description.length} chars`);
    }

    // Assemble final message
    const responseMessage = header + description + '\n\n' + nutritionInfo + footer;

    console.log(`📏 Final message length: ${responseMessage.length} chars`);

    // Final safety check
    if (responseMessage.length > maxTotalLength) {
      console.error(`🚨 Message STILL too long (${responseMessage.length}), emergency truncation!`);
      // This should never happen, but just in case
      const emergencyDesc = description.substring(0, 400) + '...';
      const emergencyMessage = header + emergencyDesc + '\n\n' + nutritionInfo + footer;
      
      console.log(`🆘 Emergency message length: ${emergencyMessage.length} chars`);
      
      await supabase.functions.invoke('whatsapp-send', {
        body: {
          to: phoneNumber,
          message: emergencyMessage,
          userId
        }
      });
    } else {
      // Send normal message
      console.log(`✅ Sending message within limits`);
      await supabase.functions.invoke('whatsapp-send', {
        body: {
          to: phoneNumber,
          message: responseMessage,
          userId
        }
      });
    }

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
          food_name: 'Refeição analisada via WhatsApp',
          calories,
          proteins,
          carbohydrates: carbs,
          fats,
          portion: '1 porção',
          meal_time: new Date().toISOString()
        }
      }
    });

    return new Response(JSON.stringify({ success: true, analysis: description }), {
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