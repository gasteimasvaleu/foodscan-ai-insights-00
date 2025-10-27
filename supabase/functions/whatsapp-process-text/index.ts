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
    const { userId, phoneNumber, text } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const command = text.toLowerCase().trim();
    let responseMessage = '';

    // Menu de comandos
    if (['oi', 'olá', 'ola', 'menu', 'start'].includes(command)) {
      responseMessage = `👋 Olá! Bem-vindo ao FoodScan!\n\n` +
        `📋 *Comandos disponíveis:*\n` +
        `• "resumo" - Ver resumo do dia\n` +
        `• "meta" - Ver progresso das metas\n` +
        `• "semanal" - Resumo da semana\n` +
        `• "ajuda" - Ver esta mensagem\n\n` +
        `📸 *Envie uma foto da sua comida* para análise nutricional automática!`;
    }
    // Resumo do dia
    else if (['resumo', 'hoje', 'dia'].includes(command)) {
      if (!userId) {
        responseMessage = '❌ Você precisa estar cadastrado no app para ver seu resumo. Acesse o app e conecte seu WhatsApp!';
      } else {
        const today = new Date().toISOString().split('T')[0];

        // Buscar refeições do dia
        const { data: meals } = await supabase
          .from('meal_records')
          .select('calories, proteins, carbohydrates, fats')
          .eq('user_id', userId)
          .gte('meal_time', `${today}T00:00:00`)
          .lte('meal_time', `${today}T23:59:59`);

        // Buscar metas
        const { data: goals } = await supabase
          .from('daily_goals')
          .select('calories, proteins, carbohydrates, fats')
          .eq('user_id', userId)
          .single();

        const totals = meals?.reduce((acc, meal) => ({
          calories: acc.calories + (meal.calories || 0),
          proteins: acc.proteins + (parseFloat(meal.proteins) || 0),
          carbs: acc.carbs + (parseFloat(meal.carbohydrates) || 0),
          fats: acc.fats + (parseFloat(meal.fats) || 0)
        }), { calories: 0, proteins: 0, carbs: 0, fats: 0 }) || { calories: 0, proteins: 0, carbs: 0, fats: 0 };

        const calorieGoal = goals?.calories || 2000;
        const proteinGoal = goals?.proteins || 150;
        const carbGoal = goals?.carbohydrates || 200;
        const fatGoal = goals?.fats || 60;

        const caloriePercent = Math.round((totals.calories / calorieGoal) * 100);

        responseMessage = `📊 *Resumo de Hoje*\n\n` +
          `🔥 Calorias: ${totals.calories}/${calorieGoal} kcal (${caloriePercent}%)\n` +
          `💪 Proteínas: ${totals.proteins.toFixed(1)}/${proteinGoal}g\n` +
          `🍞 Carboidratos: ${totals.carbs.toFixed(1)}/${carbGoal}g\n` +
          `🥑 Gorduras: ${totals.fats.toFixed(1)}/${fatGoal}g\n\n` +
          `📈 Refeições registradas: ${meals?.length || 0}`;
      }
    }
    // Meta/Progresso
    else if (['meta', 'metas', 'progresso', 'objetivo'].includes(command)) {
      if (!userId) {
        responseMessage = '❌ Você precisa estar cadastrado no app para ver suas metas. Acesse o app e conecte seu WhatsApp!';
      } else {
        const { data: goals } = await supabase
          .from('daily_goals')
          .select('calories, proteins, carbohydrates, fats, diet_objective')
          .eq('user_id', userId)
          .single();

        if (!goals) {
          responseMessage = '❌ Você ainda não configurou suas metas. Configure no app primeiro!';
        } else {
          responseMessage = `🎯 *Suas Metas Diárias*\n\n` +
            `🔥 Calorias: ${goals.calories} kcal\n` +
            `💪 Proteínas: ${goals.proteins}g\n` +
            `🍞 Carboidratos: ${goals.carbohydrates}g\n` +
            `🥑 Gorduras: ${goals.fats}g\n\n` +
            `🎯 Objetivo: ${goals.diet_objective}\n\n` +
            `📱 Use "resumo" para ver seu progresso hoje!`;
        }
      }
    }
    // Resumo semanal
    else if (['semanal', 'semana'].includes(command)) {
      if (!userId) {
        responseMessage = '❌ Você precisa estar cadastrado no app para ver seu resumo semanal.';
      } else {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const { data: meals } = await supabase
          .from('meal_records')
          .select('calories, proteins, carbohydrates, fats')
          .eq('user_id', userId)
          .gte('meal_time', weekAgo.toISOString())
          .lte('meal_time', today.toISOString());

        const totals = meals?.reduce((acc, meal) => ({
          calories: acc.calories + (meal.calories || 0),
          proteins: acc.proteins + (parseFloat(meal.proteins) || 0),
          carbs: acc.carbs + (parseFloat(meal.carbohydrates) || 0),
          fats: acc.fats + (parseFloat(meal.fats) || 0)
        }), { calories: 0, proteins: 0, carbs: 0, fats: 0 }) || { calories: 0, proteins: 0, carbs: 0, fats: 0 };

        const avgCalories = Math.round(totals.calories / 7);

        responseMessage = `📊 *Resumo da Última Semana*\n\n` +
          `🔥 Total de Calorias: ${totals.calories} kcal\n` +
          `📊 Média diária: ${avgCalories} kcal\n` +
          `💪 Proteínas totais: ${totals.proteins.toFixed(1)}g\n` +
          `🍞 Carboidratos totais: ${totals.carbs.toFixed(1)}g\n` +
          `🥑 Gorduras totais: ${totals.fats.toFixed(1)}g\n\n` +
          `📈 Refeições registradas: ${meals?.length || 0}`;
      }
    }
    // Ajuda
    else if (['ajuda', 'help', '?'].includes(command)) {
      responseMessage = `ℹ️ *Ajuda - FoodScan WhatsApp*\n\n` +
        `📋 *Comandos:*\n` +
        `• "resumo" - Ver resumo do dia\n` +
        `• "meta" - Ver suas metas\n` +
        `• "semanal" - Resumo da semana\n` +
        `• "oi" ou "menu" - Menu principal\n\n` +
        `📸 *Análise de Fotos:*\n` +
        `Envie uma foto da sua comida e receba análise nutricional automática!\n\n` +
        `❓ Precisa de mais ajuda? Acesse o app!`;
    }
    // Comando não reconhecido
    else {
      responseMessage = `❓ Não entendi o comando "${text}".\n\n` +
        `Digite "ajuda" para ver os comandos disponíveis ou "menu" para o menu principal.\n\n` +
        `📸 Você também pode enviar uma foto da sua comida!`;
    }

    // Send response via Twilio directly
    console.log('📤 Sending response to:', phoneNumber);
    console.log('📝 Message preview:', responseMessage.substring(0, 100) + '...');
    
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      throw new Error('Twilio credentials not configured');
    }

    // Normalize phone numbers - BOTH must have whatsapp: prefix
    let toNumber = phoneNumber;
    if (!toNumber.startsWith('whatsapp:')) {
      const cleanNumber = toNumber.startsWith('+') ? toNumber : `+${toNumber}`;
      toNumber = `whatsapp:${cleanNumber}`;
    }

    let fromNumber = twilioWhatsAppNumber;
    if (!fromNumber.startsWith('whatsapp:')) {
      const cleanNumber = fromNumber.startsWith('+') ? fromNumber : `+${fromNumber}`;
      fromNumber = `whatsapp:${cleanNumber}`;
    }

    console.log('🔄 Sending WhatsApp message:', { from: fromNumber, to: toNumber });

    // Send message via Twilio
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;

    const formBody = new URLSearchParams({
      From: fromNumber,
      To: toNumber,
      Body: responseMessage
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    });

    const twilioData = await twilioResponse.json();

    // Log resposta completa do Twilio
    console.log('📬 Twilio response status:', twilioResponse.status);
    console.log('📬 Twilio response data:', JSON.stringify(twilioData, null, 2));

    if (!twilioResponse.ok) {
      console.error('❌ Twilio error response:', twilioData);
      throw new Error(twilioData.message || 'Failed to send WhatsApp message');
    }

    // Log detalhes da mensagem
    console.log('✅ Message SID:', twilioData.sid);
    console.log('📊 Message status:', twilioData.status);
    console.log('💰 Price:', twilioData.price, twilioData.price_unit);
    console.log('🔢 Segments:', twilioData.num_segments);

    // Log outgoing message to database
    const { error: insertError } = await supabase.from('whatsapp_messages').insert({
      user_id: userId,
      phone_number: phoneNumber.replace('whatsapp:', ''),
      direction: 'outbound',
      message_type: 'text',
      content: responseMessage,
      status: twilioData.status || 'sent',
      metadata: { 
        sid: twilioData.sid,
        status: twilioData.status,
        price: twilioData.price,
        num_segments: twilioData.num_segments,
        date_created: twilioData.date_created
      }
    });

    if (insertError) {
      console.error('⚠️ Failed to log message to database:', insertError);
    }

    console.log('✅ WhatsApp message sent successfully:', twilioData.sid);

    return new Response(JSON.stringify({ 
      success: true, 
      command,
      messageSent: true,
      sid: twilioData.sid,
      status: twilioData.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in whatsapp-process-text:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});