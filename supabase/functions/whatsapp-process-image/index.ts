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

    // Truncate description if too long (max 600 chars to leave room for the rest)
    const maxDescriptionLength = 600;
    if (description.length > maxDescriptionLength) {
      description = description.substring(0, maxDescriptionLength) + '...';
      console.log('⚠️ Description truncated to fit character limit');
    }

    // Extract nutrition info (simplified parsing)
    const caloriesMatch = description.match(/(\d+)\s*(?:kcal|calorias)/i);
    const proteinsMatch = description.match(/proteínas?:\s*(\d+(?:\.\d+)?)\s*g/i);
    const carbsMatch = description.match(/carboidratos?:\s*(\d+(?:\.\d+)?)\s*g/i);
    const fatsMatch = description.match(/gorduras?:\s*(\d+(?:\.\d+)?)\s*g/i);

    const calories = caloriesMatch ? parseInt(caloriesMatch[1]) : 500;
    const proteins = proteinsMatch ? parseFloat(proteinsMatch[1]) : 25;
    const carbs = carbsMatch ? parseFloat(carbsMatch[1]) : 50;
    const fats = fatsMatch ? parseFloat(fatsMatch[1]) : 15;

    // Format response message - keep it under 1500 characters total
    const responseMessage = `📸 *Análise da Imagem*\n\n` +
      `${description}\n\n` +
      `📊 *Nutrição Estimada:*\n` +
      `🔥 ${calories} kcal\n` +
      `💪 ${proteins}g proteínas\n` +
      `🍞 ${carbs}g carboidratos\n` +
      `🥑 ${fats}g gorduras\n\n` +
      `Registrar? Responda SIM ou NÃO`;

    // Final safety check - should never exceed 1500 chars now
    if (responseMessage.length > 1500) {
      console.error('⚠️ Message still too long after truncation:', responseMessage.length);
      // Emergency truncation
      const emergencyMessage = `📸 Imagem analisada!\n\n` +
        `${description.substring(0, 400)}...\n\n` +
        `📊 Nutrição: ${calories}kcal | ${proteins}g prot\n\n` +
        `Registrar? SIM ou NÃO`;
      
      await supabase.functions.invoke('whatsapp-send', {
        body: {
          to: phoneNumber,
          message: emergencyMessage,
          userId
        }
      });
    } else {

      // Send analysis result
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