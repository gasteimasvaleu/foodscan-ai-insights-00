import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const AIMTELL_API_URL = 'https://api.aimtell.com/prod/push'
const AIMTELL_SITE_ID = '33322'
const AIMTELL_SEGMENT_ID = '644851' // All Subscribers

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔔 [SEND-NOTIFICATION] Starting notification send process...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // ===== AUTHENTICATION & AUTHORIZATION =====
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ [SEND-NOTIFICATION] Authentication error:', authError)
      throw new Error('Authentication failed')
    }

    console.log(`✅ [SEND-NOTIFICATION] User authenticated: ${user.email}`)

    // Check admin role
    const { data: isAdmin, error: roleError } = await supabaseClient.rpc('has_role', { 
      _user_id: user.id,
      _role: 'admin' 
    })

    if (roleError) {
      console.error('❌ [SEND-NOTIFICATION] Role check error:', roleError)
      throw new Error('Failed to verify admin role')
    }

    if (!isAdmin) {
      console.error('❌ [SEND-NOTIFICATION] Access denied: User is not admin')
      throw new Error('Access denied: Admin role required')
    }

    console.log(`✅ [SEND-NOTIFICATION] Admin role verified`)

    // ===== GET NOTIFICATION DATA =====
    const { title, message, type } = await req.json()

    if (!title || !message) {
      throw new Error('Title and message are required')
    }

    console.log(`📋 [SEND-NOTIFICATION] Notification details:`, {
      title,
      messageLength: message.length,
      type: type || 'info'
    })

    // ===== VERIFY AIMTELL API KEY =====
    const aimtellApiKey = Deno.env.get('AIMTELL_API_KEY')
    
    if (!aimtellApiKey) {
      console.error('❌ [SEND-NOTIFICATION] AIMTELL_API_KEY not configured')
      throw new Error('Aimtell API key not configured')
    }
    
    console.log('✅ [SEND-NOTIFICATION] Aimtell API key found')

    // ===== SEND VIA AIMTELL API =====
    console.log(`🚀 [SEND-NOTIFICATION] Sending notification via Aimtell API...`)
    
    const aimtellPayload = {
      idSite: AIMTELL_SITE_ID,
      segmentId: AIMTELL_SEGMENT_ID,
      title: title,
      body: message,
      link: 'https://foodscan-ai.lovable.app',
      icon: 'https://foodscan-ai.lovable.app/icons/icon-192x192-foodscan.png'
    }

    console.log(`📦 [SEND-NOTIFICATION] Aimtell payload:`, JSON.stringify(aimtellPayload, null, 2))

    const aimtellResponse = await fetch(AIMTELL_API_URL, {
      method: 'POST',
      headers: {
        'X-Authorization': aimtellApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(aimtellPayload)
    })

    const aimtellResponseText = await aimtellResponse.text()
    console.log(`📬 [SEND-NOTIFICATION] Aimtell response status: ${aimtellResponse.status}`)
    console.log(`📬 [SEND-NOTIFICATION] Aimtell response body: ${aimtellResponseText}`)

    if (!aimtellResponse.ok) {
      console.error('❌ [SEND-NOTIFICATION] Aimtell API error:', {
        status: aimtellResponse.status,
        statusText: aimtellResponse.statusText,
        body: aimtellResponseText
      })
      throw new Error(`Aimtell API error: ${aimtellResponse.status} - ${aimtellResponseText}`)
    }

    // Parse response
    let aimtellResult: any = {}
    try {
      aimtellResult = JSON.parse(aimtellResponseText)
      console.log(`✅ [SEND-NOTIFICATION] Aimtell response parsed:`, aimtellResult)
    } catch (parseError) {
      console.log(`⚠️ [SEND-NOTIFICATION] Could not parse Aimtell response as JSON, using text response`)
      aimtellResult = { raw: aimtellResponseText }
    }

    // Extract recipients count from response (if available)
    const recipientsCount = aimtellResult.subscribers_sent 
      || aimtellResult.sent_count 
      || aimtellResult.total 
      || 0

    console.log(`📊 [SEND-NOTIFICATION] Recipients count: ${recipientsCount}`)

    // ===== SAVE TO HISTORY =====
    console.log(`💾 [SEND-NOTIFICATION] Saving notification to history...`)
    
    const { error: insertError } = await supabaseClient
      .from('notifications_sent')
      .insert({
        title,
        message,
        type: type || 'info',
        sent_by: user.id,
        recipients_count: recipientsCount
      })

    if (insertError) {
      console.error('❌ [SEND-NOTIFICATION] Error saving to history:', insertError)
      // Don't fail the request if history save fails
    } else {
      console.log('✅ [SEND-NOTIFICATION] Notification saved to history')
    }

    // ===== SUCCESS RESPONSE =====
    console.log(`🎉 [SEND-NOTIFICATION] Notification sent successfully!`)

    return new Response(
      JSON.stringify({ 
        success: true,
        recipients_count: recipientsCount,
        message: recipientsCount > 0 
          ? `Notificação enviada com sucesso para ${recipientsCount} usuários via Aimtell!`
          : 'Notificação enviada via Aimtell (contagem de destinatários não disponível)',
        aimtell_response: aimtellResult
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ [SEND-NOTIFICATION] Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
