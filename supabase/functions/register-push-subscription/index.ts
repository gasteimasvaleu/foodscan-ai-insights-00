import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verificar autenticação do usuário
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    const { subscription } = await req.json()

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      throw new Error('Invalid subscription data')
    }

    // Extrair dados da subscription
    const { endpoint, keys } = subscription
    const { p256dh, auth } = keys

    if (!p256dh || !auth) {
      throw new Error('Missing subscription keys')
    }

    // Salvar/atualizar a subscription no banco
    const { data, error } = await supabaseClient
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: endpoint,
        p256dh_key: p256dh,
        auth_key: auth,
        user_agent: req.headers.get('User-Agent') || 'Unknown',
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,endpoint'
      })
      .select()

    if (error) {
      console.error('Error saving push subscription:', error)
      throw new Error('Failed to save push subscription')
    }

    console.log(`Push subscription registered successfully for user ${user.id}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Push subscription registered successfully',
        data: data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in register-push-subscription function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})