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
    const formData = await req.formData();
    
    const messageSid = formData.get('MessageSid')?.toString();
    const messageStatus = formData.get('MessageStatus')?.toString();
    const errorCode = formData.get('ErrorCode')?.toString();
    const errorMessage = formData.get('ErrorMessage')?.toString();
    const to = formData.get('To')?.toString();
    const from = formData.get('From')?.toString();

    console.log('📬 Twilio Status Callback received:');
    console.log('  SID:', messageSid);
    console.log('  Status:', messageStatus);
    console.log('  To:', to);
    console.log('  From:', from);
    
    if (errorCode) {
      console.error('❌ Delivery error:', errorCode, errorMessage);
    }

    // Update message status in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('whatsapp_messages')
      .update({
        status: messageStatus || 'unknown',
        error_message: errorMessage || null,
        metadata: {
          error_code: errorCode,
          status_updated_at: new Date().toISOString()
        }
      })
      .eq('metadata->>sid', messageSid);

    if (updateError) {
      console.error('⚠️ Failed to update message status:', updateError);
    } else {
      console.log('✅ Message status updated in database');
    }

    // If message failed, log for retry
    if (['failed', 'undelivered'].includes(messageStatus || '')) {
      console.error('💥 Message delivery failed!');
      console.error('   SID:', messageSid);
      console.error('   Error:', errorCode, '-', errorMessage);
      console.error('   Consider implementing retry logic');
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Error in whatsapp-status-webhook:', error);
    return new Response('OK', { status: 200 }); // Always return 200 to Twilio
  }
});
