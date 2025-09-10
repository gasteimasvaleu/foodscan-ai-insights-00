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
    console.log('🔧 [REGISTER-PUSH] Function started')
    
    // Verificar se há header de autorização
    const authHeader = req.headers.get('Authorization')
    console.log('🔍 [REGISTER-PUSH] Authorization header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader) {
      console.error('❌ [REGISTER-PUSH] No authorization header found')
      throw new Error('No authorization header')
    }

    // Criar cliente Supabase com service role para verificar autenticação
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extrair token
    const token = authHeader.replace('Bearer ', '')
    console.log('🔑 [REGISTER-PUSH] Token extracted, length:', token.length)
    
    // Verificar autenticação do usuário usando service role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    console.log('👤 [REGISTER-PUSH] User authentication result:', {
      user: user ? { id: user.id, email: user.email } : null,
      error: authError ? authError.message : null
    })
    
    if (authError) {
      console.error('❌ [REGISTER-PUSH] Authentication error:', authError)
      throw new Error(`Authentication error: ${authError.message}`)
    }

    if (!user) {
      console.error('❌ [REGISTER-PUSH] No user found')
      throw new Error('User not found')
    }

    console.log('✅ [REGISTER-PUSH] User authenticated successfully:', user.id)

    // Parsear dados da requisição
    console.log('📦 [REGISTER-PUSH] Parsing request body...')
    const { subscription } = await req.json()
    
    console.log('📋 [REGISTER-PUSH] Subscription data received:', {
      hasSubscription: !!subscription,
      hasEndpoint: !!subscription?.endpoint,
      hasKeys: !!subscription?.keys,
      endpoint: subscription?.endpoint ? subscription.endpoint.substring(0, 50) + '...' : 'None'
    })

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      console.error('❌ [REGISTER-PUSH] Invalid subscription data')
      throw new Error('Invalid subscription data')
    }

    // Extrair dados da subscription
    const { endpoint, keys } = subscription
    const { p256dh, auth } = keys

    console.log('🔑 [REGISTER-PUSH] Subscription keys:', {
      hasP256dh: !!p256dh,
      hasAuth: !!auth,
      p256dhLength: p256dh ? p256dh.length : 0,
      authLength: auth ? auth.length : 0
    })

    if (!p256dh || !auth) {
      console.error('❌ [REGISTER-PUSH] Missing subscription keys')
      throw new Error('Missing subscription keys')
    }

    // Criar cliente com as permissões do usuário autenticado
    const userSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    console.log('💾 [REGISTER-PUSH] Attempting to save subscription to database...')
    
    // Salvar/atualizar a subscription no banco usando o cliente do usuário
    const { data, error } = await userSupabaseClient
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
      console.error('❌ [REGISTER-PUSH] Database error:', error)
      console.error('❌ [REGISTER-PUSH] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw new Error(`Failed to save push subscription: ${error.message}`)
    }

    console.log('🎉 [REGISTER-PUSH] Push subscription saved successfully!')
    console.log('📋 [REGISTER-PUSH] Saved data:', data)

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