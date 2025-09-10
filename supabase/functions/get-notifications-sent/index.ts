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

    // Buscar notificações
    const { data, error } = await supabaseClient
      .from('notifications_sent')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(20)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify(data || []),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in get-notifications-sent function:', error)
    return new Response(
      JSON.stringify([]),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})