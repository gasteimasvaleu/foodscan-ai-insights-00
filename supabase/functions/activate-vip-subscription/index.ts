import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token não fornecido' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Client with user's JWT to get user info
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error('❌ Erro ao obter usuário:', userError);
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('👤 Usuário:', user.id, user.email);

    // Admin client for privileged operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 1. Validate token
    const { data: tokenData, error: tokenError } = await adminClient
      .from('registration_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.log('❌ Token não encontrado');
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (tokenData.is_used) {
      console.log('❌ Token já utilizado');
      return new Response(
        JSON.stringify({ error: 'Token já foi utilizado' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      console.log('❌ Token expirado');
      return new Response(
        JSON.stringify({ error: 'Token expirado' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('✅ Token válido, ativando assinatura VIP...');

    // 2. Create subscriber record
    const { error: subError } = await adminClient
      .from('subscribers')
      .upsert({
        user_id: user.id,
        email: user.email!,
        subscribed: true,
        subscription_tier: tokenData.plan_type === 'annual' ? 'Pro Anual' : 'Pro Mensal',
        subscription_end: tokenData.subscription_end,
        payment_provider: 'vip_token',
        subscription_status: 'active',
        product_source: 'vip_registration',
      }, { onConflict: 'user_id' });

    if (subError) {
      console.error('❌ Erro ao criar assinatura:', subError);
      // Try insert without upsert (user_id might not have unique constraint)
      const { error: insertError } = await adminClient
        .from('subscribers')
        .insert({
          user_id: user.id,
          email: user.email!,
          subscribed: true,
          subscription_tier: tokenData.plan_type === 'annual' ? 'Pro Anual' : 'Pro Mensal',
          subscription_end: tokenData.subscription_end,
          payment_provider: 'vip_token',
          subscription_status: 'active',
          product_source: 'vip_registration',
        });

      if (insertError) {
        console.error('❌ Erro no insert fallback:', insertError);
        return new Response(
          JSON.stringify({ error: 'Erro ao ativar assinatura' }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 3. Mark token as used
    const { error: updateError } = await adminClient
      .from('registration_tokens')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        created_user_id: user.id,
      })
      .eq('token', token);

    if (updateError) {
      console.error('⚠️ Erro ao marcar token como usado:', updateError);
    }

    console.log('🎉 Assinatura VIP ativada com sucesso!');

    return new Response(
      JSON.stringify({ success: true, message: 'Assinatura VIP ativada!' }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('❌ Erro:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
