import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PLAN_NAMES: Record<string, { name: string; months: number }> = {
  monthly: { name: "Plano Mensal", months: 1 },
  annual: { name: "Plano Anual", months: 12 },
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { phone, name, plan_type, registration_token } = await req.json();

    if (!phone || !name || !plan_type || !registration_token) {
      return new Response(
        JSON.stringify({ error: "phone, name, plan_type e registration_token são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize phone: keep only digits
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return new Response(
        JSON.stringify({ error: "Número de telefone inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const plan = PLAN_NAMES[plan_type] || PLAN_NAMES["monthly"];
    const registrationUrl = `https://app.dietainteligente.app/auth?token=${registration_token}`;

    const message = `🎉 Olá ${name}!\n\nSeu acesso ao *We Diet* foi liberado! 🎊\n\n📋 *Plano:* ${plan.name}\n⏰ *Duração:* ${plan.months} ${plan.months === 1 ? "mês" : "meses"}\n\nPara começar, clique no link abaixo e finalize seu cadastro:\n👉 ${registrationUrl}\n\n⚠️ Este link é válido por 7 dias e pode ser usado apenas uma vez.\n\n💪 We Diet - Sua jornada fitness começa aqui!`;

    const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
    const zapiToken = Deno.env.get("ZAPI_TOKEN");
    const securityToken = Deno.env.get("ZAPI_SECURITY_TOKEN");

    if (!instanceId || !zapiToken || !securityToken) {
      console.error("❌ Z-API secrets not configured");
      return new Response(
        JSON.stringify({ error: "Z-API não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const zapiUrl = `https://api.z-api.io/instances/${instanceId}/token/${zapiToken}/send-text`;

    console.log("📱 Enviando WhatsApp para:", cleanPhone);

    const zapiResponse = await fetch(zapiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": securityToken,
      },
      body: JSON.stringify({
        phone: cleanPhone,
        message,
      }),
    });

    const zapiResult = await zapiResponse.json();
    console.log("📱 Z-API response:", JSON.stringify(zapiResult));

    if (!zapiResponse.ok) {
      throw new Error(`Z-API error: ${JSON.stringify(zapiResult)}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "WhatsApp enviado com sucesso" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("❌ Erro:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
