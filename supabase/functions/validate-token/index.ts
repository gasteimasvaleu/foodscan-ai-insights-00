import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_NAMES = {
  'monthly': 'Plano Mensal',
  'annual': 'Plano Anual'
} as const;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, reason: 'Token não fornecido' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('🔍 Validando token:', token);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: tokenData, error } = await supabase
      .from('registration_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !tokenData) {
      console.log('❌ Token não encontrado');
      return new Response(
        JSON.stringify({ valid: false, reason: 'Token inválido' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se já foi usado
    if (tokenData.is_used) {
      console.log('❌ Token já utilizado');
      return new Response(
        JSON.stringify({ valid: false, reason: 'Token já foi utilizado' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar expiração
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      console.log('❌ Token expirado');
      return new Response(
        JSON.stringify({ valid: false, reason: 'Token expirado' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('✅ Token válido');

    return new Response(
      JSON.stringify({
        valid: true,
        email: tokenData.email,
        name: tokenData.name,
        plan_type: tokenData.plan_type,
        plan_name: PLAN_NAMES[tokenData.plan_type as keyof typeof PLAN_NAMES],
        subscription_end: tokenData.subscription_end
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('❌ Erro ao validar token:', error);
    return new Response(
      JSON.stringify({ valid: false, reason: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
