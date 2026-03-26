import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Validate user JWT
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders })
    }

    const userId = claimsData.claims.sub as string

    // Use service role to delete user data and account
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Delete user data from all related tables
    const tables = [
      'meal_records',
      'daily_goals',
      'exercise_records',
      'calorie_adjustments',
      'weekly_summaries',
      'physical_assessments',
      'user_custom_diets',
      'user_menu_plans',
      'user_menu_preferences',
      'workout_plans',
      'community_posts',
      'post_comments',
      'post_likes',
      'push_subscriptions',
      'whatsapp_subscriptions',
      'whatsapp_messages',
      'nutritionist_ads',
      'subscribers',
      'user_roles',
      'profiles',
    ]

    for (const table of tables) {
      await adminClient.from(table).delete().eq('user_id', userId)
    }

    // profiles uses 'id' instead of 'user_id'
    await adminClient.from('profiles').delete().eq('id', userId)

    // Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      return new Response(JSON.stringify({ error: 'Failed to delete account' }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Delete account error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders })
  }
})
