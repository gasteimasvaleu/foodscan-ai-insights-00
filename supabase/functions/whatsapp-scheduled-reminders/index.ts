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
    const { reminderType } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all verified subscriptions with reminders enabled
    const { data: subscriptions } = await supabase
      .from('whatsapp_subscriptions')
      .select('user_id, phone_number, preferences')
      .eq('verified', true);

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active subscriptions found');
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let message = '';
    let sendCount = 0;

    // Determine message based on reminder type
    switch (reminderType) {
      case 'breakfast':
        message = '🌅 *Bom dia!*\n\nJá tomou café da manhã? Não esqueça de registrar sua refeição!\n\n📸 Envie uma foto ou use "resumo" para ver seu progresso.';
        break;
      case 'lunch':
        message = '🍽️ *Hora do Almoço!*\n\nJá almoçou? Registre sua refeição para manter o controle!\n\n📸 Envie uma foto da sua comida para análise automática.';
        break;
      case 'dinner':
        message = '🌙 *Boa Noite!*\n\nJá jantou? Lembre-se de registrar sua última refeição do dia!\n\n💡 Use "resumo" para ver como foi seu dia.';
        break;
      case 'weekly':
        message = '📊 *Resumo Semanal Disponível!*\n\nComo foi sua semana? Veja seu progresso!\n\n📱 Use o comando "semanal" ou acesse o app para mais detalhes.';
        break;
      default:
        message = '👋 Olá! Lembrete do FoodScan: continue acompanhando suas refeições!\n\n📸 Envie "menu" para ver as opções disponíveis.';
    }

    // Send reminders to all active users
    for (const sub of subscriptions) {
      try {
        await supabase.functions.invoke('whatsapp-send', {
          body: {
            to: sub.phone_number,
            message,
            userId: sub.user_id
          }
        });
        sendCount++;
      } catch (error) {
        console.error(`Failed to send to ${sub.phone_number}:`, error);
      }
    }

    console.log(`Sent ${sendCount} ${reminderType} reminders`);

    return new Response(JSON.stringify({ success: true, sent: sendCount, type: reminderType }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in whatsapp-scheduled-reminders:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});