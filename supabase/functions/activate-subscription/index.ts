import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_NAMES = {
  'monthly': 'Premium Mensal',
  'annual': 'Premium Anual'
} as const;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, user_id } = await req.json();

    if (!token || !user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token e user_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('🔄 Ativando assinatura para user_id:', user_id);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar token
    const { data: tokenData, error: tokenError } = await supabase
      .from('registration_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.error('❌ Token não encontrado:', tokenError);
      return new Response(
        JSON.stringify({ success: false, error: 'Token inválido' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se já foi usado
    if (tokenData.is_used) {
      console.log('❌ Token já utilizado');
      return new Response(
        JSON.stringify({ success: false, error: 'Token já foi utilizado' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar expiração
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      console.log('❌ Token expirado');
      return new Response(
        JSON.stringify({ success: false, error: 'Token expirado' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Marcar token como usado
    const { error: updateTokenError } = await supabase
      .from('registration_tokens')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        created_user_id: user_id
      })
      .eq('id', tokenData.id);

    if (updateTokenError) {
      console.error('❌ Erro ao marcar token como usado:', updateTokenError);
      throw updateTokenError;
    }

    console.log('✅ Token marcado como usado');

    // Criar/atualizar assinatura
    const tierName = TIER_NAMES[tokenData.plan_type as keyof typeof TIER_NAMES];

    const { error: upsertError } = await supabase
      .from('subscribers')
      .upsert({
        user_id: user_id,
        email: tokenData.email,
        subscribed: true,
        subscription_tier: tierName,
        subscription_end: tokenData.subscription_end,
        payment_provider: 'hotmart',
        hotmart_transaction_id: tokenData.hotmart_transaction_id,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('❌ Erro ao criar assinatura:', upsertError);
      throw upsertError;
    }

    console.log('✅ Assinatura ativada com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          tier: tierName,
          end: tokenData.subscription_end
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('❌ Erro ao ativar assinatura:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
