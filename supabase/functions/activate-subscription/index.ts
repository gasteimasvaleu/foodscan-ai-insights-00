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
      console.error('❌ Parâmetros faltando:', { token: !!token, user_id: !!user_id });
      return new Response(
        JSON.stringify({ success: false, error: 'Token e user_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('🔄 Iniciando ativação de assinatura para user_id:', user_id);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar token
    console.log('📝 Buscando token no banco de dados...');
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

    console.log('✅ Token encontrado:', {
      id: tokenData.id,
      email: tokenData.email,
      plan_type: tokenData.plan_type,
      is_used: tokenData.is_used,
      subscription_end: tokenData.subscription_end
    });

    // Verificar se já foi usado
    if (tokenData.is_used) {
      console.log('❌ Token já utilizado em:', tokenData.used_at);
      return new Response(
        JSON.stringify({ success: false, error: 'Token já foi utilizado' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar expiração
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      console.log('❌ Token expirado em:', tokenData.expires_at);
      return new Response(
        JSON.stringify({ success: false, error: 'Token expirado' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar dados antes do upsert
    if (!tokenData.subscription_end) {
      console.error('⚠️ AVISO: subscription_end está NULL no token!');
    }
    if (!tokenData.hotmart_transaction_id) {
      console.error('⚠️ AVISO: hotmart_transaction_id está NULL no token!');
    }

    // PASSO 1: Criar/atualizar assinatura PRIMEIRO (antes de marcar token como usado)
    const tierName = TIER_NAMES[tokenData.plan_type as keyof typeof TIER_NAMES];
    
    const subscriptionData = {
      user_id: user_id,
      email: tokenData.email,
      subscribed: true,
      subscription_tier: tierName,
      subscription_end: tokenData.subscription_end,
      payment_provider: 'hotmart',
      hotmart_transaction_id: tokenData.hotmart_transaction_id,
      is_hotmart_managed: true, // 🛡️ PROTEÇÃO: Marca como gerenciado pelo Hotmart
      updated_at: new Date().toISOString()
    };

    console.log('💾 Tentando criar/atualizar assinatura com dados:', subscriptionData);

    const { data: upsertData, error: upsertError } = await supabase
      .from('subscribers')
      .upsert(subscriptionData, {
        onConflict: 'user_id'
      })
      .select();

    if (upsertError) {
      console.error('❌ Erro ao criar assinatura:', {
        message: upsertError.message,
        details: upsertError.details,
        hint: upsertError.hint,
        code: upsertError.code
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao ativar assinatura: ' + upsertError.message,
          code: upsertError.code
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('✅ Assinatura criada/atualizada com sucesso:', upsertData);

    // PASSO 2: Só agora marcar token como usado (após sucesso do upsert)
    console.log('🔒 Marcando token como usado...');
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
      // Nota: não retornamos erro aqui pois a assinatura já foi criada com sucesso
      console.error('⚠️ IMPORTANTE: Assinatura foi criada mas token não foi marcado como usado!');
    } else {
      console.log('✅ Token marcado como usado');
    }

    console.log('🎉 Processo completo! Assinatura ativada com sucesso');

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
