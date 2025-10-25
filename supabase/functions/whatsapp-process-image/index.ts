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
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

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

    const description = analysisData.description;

    // Extract nutrition info (simplified parsing)
    const caloriesMatch = description.match(/(\d+)\s*(?:kcal|calorias)/i);
    const proteinsMatch = description.match(/proteínas?:\s*(\d+(?:\.\d+)?)\s*g/i);
    const carbsMatch = description.match(/carboidratos?:\s*(\d+(?:\.\d+)?)\s*g/i);
    const fatsMatch = description.match(/gorduras?:\s*(\d+(?:\.\d+)?)\s*g/i);

    const calories = caloriesMatch ? parseInt(caloriesMatch[1]) : 500;
    const proteins = proteinsMatch ? parseFloat(proteinsMatch[1]) : 25;
    const carbs = carbsMatch ? parseFloat(carbsMatch[1]) : 50;
    const fats = fatsMatch ? parseFloat(fatsMatch[1]) : 15;

    // Format response message
    const responseMessage = `📸 *Análise da Imagem*\n\n` +
      `${description}\n\n` +
      `📊 *Informações Nutricionais:*\n` +
      `🔥 Calorias: ~${calories} kcal\n` +
      `💪 Proteínas: ~${proteins}g\n` +
      `🍞 Carboidratos: ~${carbs}g\n` +
      `🥑 Gorduras: ~${fats}g\n\n` +
      `✅ Quer registrar esta refeição?\n` +
      `Responda "SIM" para registrar ou "NÃO" para cancelar.`;

    // Send analysis result
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