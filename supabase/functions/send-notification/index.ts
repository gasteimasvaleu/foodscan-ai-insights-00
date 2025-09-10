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

    const recipients_count = profiles?.length || 0

    // Salvar a notificação no histórico
    const { error: insertError } = await supabaseClient
      .from('notifications_sent')
      .insert({
        title,
        message,
        type,
        sent_by: user.id,
        recipients_count
      })

    if (insertError) {
      console.error('Error saving notification:', insertError)
      // Não vamos falhar a requisição por erro no histórico
    }

    // TODO: Implementar envio real de Web Push notifications
    // Por enquanto, apenas simulamos o envio
    console.log(`Notification sent: ${title} to ${recipients_count} users`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipients_count,
        message: 'Notification sent successfully'
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