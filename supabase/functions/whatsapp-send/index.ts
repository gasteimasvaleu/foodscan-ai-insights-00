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
    const { to, message, userId } = await req.json();

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      throw new Error('Twilio credentials not configured');
    }

    // Normalize phone numbers
    // To: must have whatsapp: prefix
    let toNumber = to;
    if (!toNumber.startsWith('whatsapp:')) {
      // Add + if not present
      const cleanNumber = toNumber.startsWith('+') ? toNumber : `+${toNumber}`;
      toNumber = `whatsapp:${cleanNumber}`;
    }

    // From: must NOT have whatsapp: prefix (Twilio adds it automatically)
    const fromNumber = twilioWhatsAppNumber.replace('whatsapp:', '');

    console.log('Sending WhatsApp message:', { from: fromNumber, to: toNumber });

    // Send message via Twilio
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;

    const formBody = new URLSearchParams({
      From: fromNumber,
      To: toNumber,
      Body: message
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

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioData);
      throw new Error(twilioData.message || 'Failed to send WhatsApp message');
    }

    // Log outgoing message
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('whatsapp_messages').insert({
      user_id: userId,
      phone_number: to.replace('whatsapp:', ''),
      direction: 'outbound',
      message_type: 'text',
      content: message,
      status: 'sent',
      metadata: { sid: twilioData.sid }
    });

    console.log('WhatsApp message sent successfully:', twilioData.sid);

    return new Response(JSON.stringify({ success: true, sid: twilioData.sid }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in whatsapp-send:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});