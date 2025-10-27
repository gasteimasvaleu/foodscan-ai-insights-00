import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

// Normalize Brazilian phone numbers to international format
const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Remove whatsapp: prefix if present
  cleaned = cleaned.replace('whatsapp:', '').trim();
  
  // If already has country code with +, return as is
  if (cleaned.startsWith('+55') && cleaned.length === 13) {
    return cleaned;
  }
  
  // If has 55 prefix without +, add it
  if (cleaned.startsWith('55') && cleaned.length === 12) {
    return '+' + cleaned;
  }
  
  // If has only DDD + number (11 digits), add +55
  if (cleaned.length === 11 && !cleaned.startsWith('+')) {
    return '+55' + cleaned;
  }
  
  // If has 10 digits (old format without 9), add +55 and 9
  if (cleaned.length === 10 && !cleaned.startsWith('+')) {
    const ddd = cleaned.substring(0, 2);
    const number = cleaned.substring(2);
    return `+55${ddd}9${number}`;
  }
  
  // Return as is if format is unrecognized
  return cleaned.startsWith('+') ? cleaned : '+55' + cleaned;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const numMedia = parseInt(formData.get('NumMedia') as string || '0');
    const mediaUrl = numMedia > 0 ? formData.get('MediaUrl0') as string : null;
    const messageType = numMedia > 0 ? 'image' : 'text';

    console.log('Received WhatsApp message:', { from, body, numMedia, mediaUrl, messageType });

    // Normalize the incoming phone number
    const phoneNumber = normalizePhoneNumber(from);
    console.log('Normalized phone number:', phoneNumber);

    // Find user by phone number
    const { data: subscription } = await supabase
      .from('whatsapp_subscriptions')
      .select('user_id, verified')
      .eq('phone_number', phoneNumber)
      .eq('verified', true)
      .single();

    const userId = subscription?.user_id || null;

    // Log incoming message
    await supabase.from('whatsapp_messages').insert({
      user_id: userId,
      phone_number: phoneNumber,
      direction: 'inbound',
      message_type: messageType,
      content: body,
      media_url: mediaUrl,
      status: 'received',
      metadata: { numMedia, from }
    });

    // Route to appropriate processor
    if (messageType === 'image' && mediaUrl) {
      // Process image
      const { data: processResult } = await supabase.functions.invoke('whatsapp-process-image', {
        body: { userId, phoneNumber, mediaUrl, body }
      });
      console.log('Image processing result:', processResult);
    } else if (body) {
      // Process text command
      const { data: processResult } = await supabase.functions.invoke('whatsapp-process-text', {
        body: { userId, phoneNumber, text: body }
      });
      console.log('Text processing result:', processResult);
    }

    // Twilio expects empty 200 response
    return new Response('', {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    console.error('Error in whatsapp-webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});