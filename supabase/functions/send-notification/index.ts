import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Base64URL encoding without padding
function base64urlEncode(data: string | Uint8Array): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Base64URL decoding
function base64urlDecode(str: string): Uint8Array {
  const padding = '='.repeat((4 - str.length % 4) % 4)
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// ECDH key agreement for Web Push encryption
async function performECDH(
  receiverPublicKey: Uint8Array,
  senderPrivateKey: CryptoKey
): Promise<ArrayBuffer> {
  const receiverKey = await crypto.subtle.importKey(
    "raw",
    receiverPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  )
  
  return await crypto.subtle.deriveBits(
    { name: "ECDH", public: receiverKey },
    senderPrivateKey,
    256
  )
}

// HKDF key derivation
async function hkdf(
  salt: Uint8Array,
  ikm: ArrayBuffer,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  // Extract
  const saltKey = await crypto.subtle.importKey(
    "raw",
    salt,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  
  const prk = await crypto.subtle.sign("HMAC", saltKey, ikm)
  
  // Expand
  const prkKey = await crypto.subtle.importKey(
    "raw", 
    prk,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  
  const infoWithLength = new Uint8Array([...info, 0x01])
  const okm = await crypto.subtle.sign("HMAC", prkKey, infoWithLength)
  
  return new Uint8Array(okm.slice(0, length))
}

// Encrypt payload for Web Push
async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<Uint8Array> {
  console.log('Starting payload encryption...')
  
  // Generate salt and local key pair
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  )
  
  // Get receiver's public key
  const receiverPublicKey = base64urlDecode(p256dhKey)
  const authSecretBytes = base64urlDecode(authSecret)
  
  // Perform ECDH
  const sharedSecret = await performECDH(receiverPublicKey, localKeyPair.privateKey)
  
  // Export local public key
  const localPublicKey = await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
  
  // Derive encryption key using HKDF
  const keyInfo = new TextEncoder().encode("WebPush: info\x00")
  const keyInfoWithKeys = new Uint8Array([
    ...keyInfo,
    ...new Uint8Array(localPublicKey),
    ...receiverPublicKey
  ])
  
  // Auth secret as salt for first HKDF
  const prk = await hkdf(authSecretBytes, sharedSecret, new Uint8Array(0), 32)
  
  // Content encryption key
  const contentInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\x00")
  const cek = await hkdf(salt, prk, contentInfo, 16)
  
  // Nonce
  const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\x00")
  const nonce = await hkdf(salt, prk, nonceInfo, 12)
  
  // Import CEK for AES-GCM
  const aesKey = await crypto.subtle.importKey(
    "raw",
    cek,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  )
  
  // Encrypt the payload
  const paddedPayload = new TextEncoder().encode(payload + '\x02')
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    paddedPayload
  )
  
  // Construct the final payload according to RFC 8188
  const recordSize = 4096 // Standard record size
  const header = new ArrayBuffer(21 + localPublicKey.byteLength)
  const headerView = new DataView(header)
  
  // Salt (16 bytes)
  new Uint8Array(header, 0, 16).set(salt)
  
  // Record size (4 bytes, big-endian)
  headerView.setUint32(16, recordSize, false)
  
  // Key ID length (1 byte)
  headerView.setUint8(20, localPublicKey.byteLength)
  
  // Public key
  new Uint8Array(header, 21).set(new Uint8Array(localPublicKey))
  
  // Combine header and encrypted content
  const result = new Uint8Array(header.byteLength + encrypted.byteLength)
  result.set(new Uint8Array(header), 0)
  result.set(new Uint8Array(encrypted), header.byteLength)
  
  console.log(`Payload encrypted successfully, final size: ${result.length} bytes`)
  return result
}

// JWT signing for VAPID
async function signJWT(payload: object, privateKey: string): Promise<string> {
  console.log('Starting JWT signing process...')
  
  const header = { typ: "JWT", alg: "ES256" }
  
  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(payload))
  
  const signingInput = `${encodedHeader}.${encodedPayload}`
  
  try {
    // Clean the private key - remove headers and whitespace
    let cleanedKey = privateKey.trim()
    cleanedKey = cleanedKey.replace(/-----BEGIN[^-]+-----/g, '')
    cleanedKey = cleanedKey.replace(/-----END[^-]+-----/g, '')
    cleanedKey = cleanedKey.replace(/\s/g, '')
    
    console.log('Cleaned key length:', cleanedKey.length)
    
    // Decode from base64
    const keyBytes = Uint8Array.from(atob(cleanedKey), c => c.charCodeAt(0))
    console.log('Key bytes length:', keyBytes.length)
    
    // Import the private key
    const key = await crypto.subtle.importKey(
      "pkcs8",
      keyBytes,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    )
    
    console.log('Private key imported successfully')
    
    // Sign the JWT
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

// Send push notification with proper encryption and detailed Apple debugging
async function sendPushNotification(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<void> {
  console.log(`Preparing to send notification to: ${endpoint.substring(0, 50)}...`)
  
  // Detect Apple Push Service
  const isApplePush = endpoint.includes('web.push.apple.com')
  if (isApplePush) {
    console.log('🍎 [APPLE PUSH] Detected Apple Push Service endpoint')
    console.log('🍎 [APPLE PUSH] Full endpoint:', endpoint)
  }
  
  try {
    // Validate subscription keys
    if (!p256dh || !auth) {
      throw new Error('Missing p256dh or auth keys in subscription')
    }
    
    if (isApplePush) {
      console.log('🍎 [APPLE PUSH] Key validation:', {
        p256dhLength: p256dh.length,
        authLength: auth.length,
        p256dhValid: p256dh.length === 87, // Standard length for p256dh
        authValid: auth.length === 22 // Standard length for auth
      })
    }
    
    // Encrypt the payload
    console.log('Encrypting payload...')
    const encryptedPayload = await encryptPayload(payload, p256dh, auth)
    
    if (isApplePush) {
      console.log('🍎 [APPLE PUSH] Payload encrypted:', {
        originalSize: payload.length,
        encryptedSize: encryptedPayload.length,
        payloadPreview: payload.substring(0, 100) + '...'
      })
    }
    
    // Create VAPID JWT
    const jwtPayload = {
      aud: new URL(endpoint).origin,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
      sub: `mailto:noreply@foodscanai.com`
    }
    
    console.log('Signing VAPID JWT...')
    const jwt = await signJWT(jwtPayload, vapidPrivateKey)
    
    // Prepare headers
    const headers = {
      'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'Content-Length': encryptedPayload.length.toString(),
      'TTL': '86400'
    }
    
    if (isApplePush) {
      console.log('🍎 [APPLE PUSH] Request headers:', JSON.stringify(headers, null, 2))
      console.log('🍎 [APPLE PUSH] JWT payload used:', JSON.stringify(jwtPayload, null, 2))
    }
    
    // Send the push notification with timeout for Apple
    console.log('Sending HTTP request to push service...')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), isApplePush ? 30000 : 10000) // 30s for Apple, 10s for others
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: encryptedPayload,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (isApplePush) {
        console.log('🍎 [APPLE PUSH] Response received:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        })
      }
      
      if (!response.ok) {
        const errorText = await response.text()
        
        if (isApplePush) {
          console.error('🍎 [APPLE PUSH] Error response body:', errorText)
          
          // Apple-specific error handling
          switch (response.status) {
            case 400:
              console.error('🍎 [APPLE PUSH] Bad Request - Invalid payload or headers')
              break
            case 403:
              console.error('🍎 [APPLE PUSH] Forbidden - Invalid VAPID token or expired')
              break
            case 410:
              console.error('🍎 [APPLE PUSH] Gone - Subscription is no longer valid')
              break
            case 413:
              console.error('🍎 [APPLE PUSH] Payload Too Large - Reduce notification content')
              break
            case 429:
              console.error('🍎 [APPLE PUSH] Too Many Requests - Rate limited')
              break
            default:
              console.error(`🍎 [APPLE PUSH] Unexpected status: ${response.status}`)
          }
        }
        
        console.error(`Push service error: ${response.status} - ${errorText}`)
        throw new Error(`Push service responded with status ${response.status}: ${errorText}`)
      }
      
      if (isApplePush) {
        console.log('🍎 [APPLE PUSH] ✅ Notification sent successfully to Apple Push Service!')
      } else {
        console.log('Push notification sent successfully')
      }
      
    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        const errorMsg = `Request timeout after ${isApplePush ? 30 : 10} seconds`
        if (isApplePush) {
          console.error('🍎 [APPLE PUSH] ⏰ Timeout error:', errorMsg)
        }
        throw new Error(errorMsg)
      }
      
      throw fetchError
    }
    
  } catch (error) {
    if (isApplePush) {
      console.error('🍎 [APPLE PUSH] ❌ Error in sendPushNotification:', error)
      console.error('🍎 [APPLE PUSH] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500)
      })
    } else {
      console.error('Error in sendPushNotification:', error)
    }
    throw error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting notification send process...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      throw new Error('Authentication failed')
    }

    // Check admin role
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

    console.log(`Notification details: title="${title}", type="${type || 'info'}"`)

    // Get VAPID keys
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not found in environment')
      throw new Error('VAPID keys not configured')
    }
    
    console.log('VAPID keys loaded successfully')

    // Get all active push subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true)

    if (subscriptionsError) {
      console.error('Error fetching push subscriptions:', subscriptionsError)
      throw new Error('Failed to fetch push subscriptions')
    }

    const totalSubscriptions = subscriptions?.length || 0
    console.log(`Found ${totalSubscriptions} active subscriptions`)

    if (totalSubscriptions === 0) {
      console.log('No active subscriptions found')
      return new Response(
        JSON.stringify({ 
          success: true, 
          recipients_count: 0,
          total_subscriptions: 0,
          successful_notifications: 0,
          failed_notifications: 0,
          message: 'No active push subscriptions found'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    let successful_notifications = 0
    let failed_notifications = 0

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title,
      body: message,
      type: type || 'info',
      icon: '/icons/icon-192x192-foodscan.png',
      badge: '/icons/icon-192x192-foodscan.png',
      timestamp: new Date().toISOString(),
      data: {
        url: '/',
        type: type || 'info'
      }
    })

    console.log('Payload prepared:', notificationPayload.substring(0, 100) + '...')

    // Send notifications to all subscriptions
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        console.log(`Sending to user ${subscription.user_id}...`)
        
        await sendPushNotification(
          subscription.endpoint,
          subscription.p256dh_key,
          subscription.auth_key,
          notificationPayload,
          vapidPublicKey,
          vapidPrivateKey
        )
        
        successful_notifications++
        console.log(`✓ Notification sent successfully to user ${subscription.user_id}`)
        
      } catch (error) {
        failed_notifications++
        console.error(`✗ Failed to send notification to user ${subscription.user_id}:`, error)
        
        // Deactivate invalid subscriptions
        if (error.message.includes('status 410') || 
            error.message.includes('status 404') ||
            error.message.includes('expired') ||
            error.message.includes('invalid')) {
          
          console.log(`Deactivating invalid subscription for user ${subscription.user_id}`)
          await supabaseClient
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', subscription.id)
        }
      }
    })

    // Wait for all notifications to complete
    await Promise.allSettled(sendPromises)

    // Save notification to history
    const { error: insertError } = await supabaseClient
      .from('notifications_sent')
      .insert({
        title,
        message,
        type: type || 'info',
        sent_by: user.id,
        recipients_count: totalSubscriptions // Use total subscriptions, not just successful ones
      })

    if (insertError) {
      console.error('Error saving notification to history:', insertError)
    }

    console.log(`Notification processing complete: ${successful_notifications} successful, ${failed_notifications} failed`)
    console.log(`Total subscriptions processed: ${totalSubscriptions}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipients_count: totalSubscriptions, // Show total subscriptions to user
        total_subscriptions: totalSubscriptions,
        successful_notifications,
        failed_notifications,
        message: `Notificação enviada para ${totalSubscriptions} usuários (${successful_notifications} com sucesso, ${failed_notifications} falharam)`
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