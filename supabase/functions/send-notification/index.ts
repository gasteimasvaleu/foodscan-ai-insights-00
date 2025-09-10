import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Native Web Push implementation for Deno
import { encode as base64urlEncode } from "https://deno.land/std@0.168.0/encoding/base64url.ts"

// JWT signing for VAPID
async function signJWT(payload: object, privateKey: string): Promise<string> {
  console.log('Starting JWT signing process...')
  
  const header = { typ: "JWT", alg: "ES256" }
  
  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(payload))
  
  const signingInput = `${encodedHeader}.${encodedPayload}`
  
  try {
    // Clean the private key and convert from base64
    const cleanedKey = privateKey.replace(/-----BEGIN PRIVATE KEY-----|\n|-----END PRIVATE KEY-----|\r/g, '')
    console.log('Cleaned key length:', cleanedKey.length)
    
    // Decode from base64 to get the raw key bytes
    const keyBytes = Uint8Array.from(atob(cleanedKey), c => c.charCodeAt(0))
    console.log('Key bytes length:', keyBytes.length)
    
    const key = await crypto.subtle.importKey(
      "pkcs8",
      keyBytes,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    )
    
    console.log('Key imported successfully')
    
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      new TextEncoder().encode(signingInput)
    )
    
    const encodedSignature = base64urlEncode(new Uint8Array(signature))
    console.log('JWT signed successfully')
    return `${signingInput}.${encodedSignature}`
  } catch (error) {
    console.error('JWT signing error:', error)
    throw new Error(`Failed to sign JWT: ${error.message}`)
  }
}

// Send push notification using native fetch
async function sendPushNotification(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<void> {
  const url = new URL(endpoint)
  const audience = `${url.protocol}//${url.host}`
  
  const vapidClaims = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: "mailto:admin@foodscanai.com"
  }
  
  const vapidToken = await signJWT(vapidClaims, vapidPrivateKey)
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${vapidToken}, k=${vapidPublicKey}`,
      'Content-Type': 'application/octet-stream',
      'TTL': '86400'
    },
    body: payload
  })
  
  if (!response.ok) {
    throw new Error(`Push service responded with status ${response.status}`)
  }
}

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar se o usuário é admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    // Verificar se é admin
    const { data: isAdmin, error: roleError } = await supabaseClient.rpc('has_role', { 
      _user_id: user.id,
      _role: 'admin' 
    })

    if (roleError) {
      console.error('Role check error:', roleError)
      throw new Error('Failed to verify admin role')
    }

    if (!isAdmin) {
      throw new Error('Access denied: Admin role required')
    }

    const { title, message, type } = await req.json()

    if (!title || !message) {
      throw new Error('Title and message are required')
    }

    // Buscar todos os usuários para contar destinatários
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      throw new Error('Failed to fetch users')
    }

    // Configurar Web Push com VAPID keys
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured')
    }


    // Buscar todas as subscriptions ativas
    const { data: subscriptions, error: subscriptionsError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true)

    if (subscriptionsError) {
      console.error('Error fetching push subscriptions:', subscriptionsError)
      throw new Error('Failed to fetch push subscriptions')
    }

    const recipients_count = profiles?.length || 0
    let successful_notifications = 0
    let failed_notifications = 0

    // Preparar payload da notificação
    const notificationPayload = JSON.stringify({
      title,
      message,
      body: message,
      type,
      icon: '/icons/icon-192x192-foodscan.png',
      badge: '/icons/icon-192x192-foodscan.png',
      timestamp: new Date().toISOString()
    })

    // Enviar notificações para todas as subscriptions
    if (subscriptions && subscriptions.length > 0) {
      const sendPromises = subscriptions.map(async (subscription) => {
        try {
          await sendPushNotification(
            subscription.endpoint,
            subscription.p256dh_key,
            subscription.auth_key,
            notificationPayload,
            vapidPublicKey,
            vapidPrivateKey
          )
          successful_notifications++
          console.log(`Notification sent successfully to user ${subscription.user_id}`)
        } catch (error) {
          failed_notifications++
          console.error(`Failed to send notification to user ${subscription.user_id}:`, error)
          
          // Se a subscription é inválida (410 Gone ou outros erros de endpoint), desativar ela
          if (error.message.includes('status 410') || error.message.includes('status 404')) {
            await supabaseClient
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('id', subscription.id)
            console.log(`Deactivated invalid subscription for user ${subscription.user_id}`)
          }
        }
      })

      await Promise.allSettled(sendPromises)
    }

    // Salvar a notificação no histórico
    const { error: insertError } = await supabaseClient
      .from('notifications_sent')
      .insert({
        title,
        message,
        type,
        sent_by: user.id,
        recipients_count: successful_notifications
      })

    if (insertError) {
      console.error('Error saving notification:', insertError)
      // Não vamos falhar a requisição por erro no histórico
    }

    console.log(`Notification processing complete: ${successful_notifications} successful, ${failed_notifications} failed`)
    console.log(`Total subscriptions found: ${subscriptions?.length || 0}`)
    console.log(`Total users in database: ${recipients_count}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipients_count: successful_notifications,
        total_subscriptions: subscriptions?.length || 0,
        successful_notifications,
        failed_notifications,
        message: `Notification sent successfully to ${successful_notifications} devices`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in send-notification function:', error)
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