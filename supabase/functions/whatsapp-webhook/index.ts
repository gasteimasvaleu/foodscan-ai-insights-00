import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

// Normalize Brazilian phone numbers to international format (14 chars: +55 + 11 digits)
const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Remove whatsapp: prefix if present
  if (phone.includes('whatsapp:')) {
    cleaned = phone.split('whatsapp:')[1].replace(/[^\d+]/g, '');
  }
  
  console.log('🔄 Normalizing phone:', phone, '→', cleaned);
  
  // If already has country code with + and 11 digits after (modern format: 14 chars total)
  if (cleaned.startsWith('+55') && cleaned.length === 14) {
    console.log('✅ Already in correct format (14 chars):', cleaned);
    return cleaned;
  }
  
  // If has 55 prefix without + and 11 digits after (13 chars total)
  if (cleaned.startsWith('55') && cleaned.length === 13) {
    const result = '+' + cleaned;
    console.log('✅ Added + prefix:', result);
    return result;
  }
  
  // If has only 11 digits (DDD + 9 + number), add +55
  if (cleaned.length === 11 && !cleaned.startsWith('+')) {
    const result = '+55' + cleaned;
    console.log('✅ Added +55 prefix:', result);
    return result;
  }
  
  // If has 10 digits (old format without 9), add +55 and 9
  if (cleaned.length === 10 && !cleaned.startsWith('+')) {
    const ddd = cleaned.substring(0, 2);
    const number = cleaned.substring(2);
    const result = `+55${ddd}9${number}`;
    console.log('✅ Converted old format (added 9):', result);
    return result;
  }
  
  // Return as is if format is unrecognized
  const result = cleaned.startsWith('+') ? cleaned : '+55' + cleaned;
  console.log('⚠️ Unrecognized format, using fallback:', result);
  return result;
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

    // Filter out Twilio internal commands (sandbox activation messages)
    const twilioInternalCommands = ['join', 'stop', 'start', 'unstop'];
    const firstWord = body?.toLowerCase().trim().split(' ')[0] || '';
    
    if (twilioInternalCommands.includes(firstWord)) {
      console.log('🚫 Ignoring Twilio internal command:', body);
      return new Response('', { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
    }

    console.log('Received WhatsApp message:', { from, body, numMedia, mediaUrl, messageType });

    // Normalize the incoming phone number
    console.log('📱 Original from Twilio:', from);
    const phoneNumber = normalizePhoneNumber(from);
    console.log('📱 After normalization:', phoneNumber);

    // Find user by phone number with flexible format lookup
    console.log('🔍 Looking up subscription in database...');
    
    // First attempt: exact format
    let { data: subscription, error: subscriptionError } = await supabase
      .from('whatsapp_subscriptions')
      .select('user_id, verified')
      .eq('phone_number', phoneNumber)
      .eq('verified', true)
      .single();
    
    // If not found and number has 13 chars (missing the '9'), try alternative format
    if (!subscription && phoneNumber.length === 13 && phoneNumber.startsWith('+55')) {
      const ddd = phoneNumber.substring(3, 5); // Extract DDD (area code)
      const number = phoneNumber.substring(5); // Rest of the number
      const alternativeFormat = `+55${ddd}9${number}`; // Add the '9'
      
      console.log('🔄 Trying alternative format (adding 9):', alternativeFormat);
      
      const { data: altSubscription, error: altError } = await supabase
        .from('whatsapp_subscriptions')
        .select('user_id, verified')
        .eq('phone_number', alternativeFormat)
        .eq('verified', true)
        .single();
      
      if (altSubscription) {
        console.log('✅ Found with alternative format!');
        subscription = altSubscription;
        subscriptionError = altError;
      }
    }
    
    console.log('🔍 Subscription lookup result:', subscription ? `Found user: ${subscription.user_id}` : 'NOT FOUND');
    if (subscriptionError && !subscription) {
      console.log('❌ Subscription lookup error:', subscriptionError.message);
    }

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