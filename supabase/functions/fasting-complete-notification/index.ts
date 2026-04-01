import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

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

    // Get active fast
    const { data: activeFast, error: fastError } = await supabase
      .from("fasting_records")
      .select("*")
      .eq("user_id", user_id)
      .is("ended_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fastError || !activeFast) {
      console.log("⚠️ No active fast found for user", user_id);
      return new Response(
        JSON.stringify({ success: false, reason: "no_active_fast" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if target was actually reached
    const startedAt = new Date(activeFast.started_at);
    const now = new Date();
    const elapsedHours = (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60);

    if (elapsedHours < activeFast.target_hours) {
      return new Response(
        JSON.stringify({ success: false, reason: "target_not_reached" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get WhatsApp subscription
    const { data: subscription } = await supabase
      .from("whatsapp_subscriptions")
      .select("phone_number, preferences")
      .eq("user_id", user_id)
      .eq("verified", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription) {
      console.log("⚠️ No verified WhatsApp subscription for user", user_id);
      return new Response(
        JSON.stringify({ success: false, reason: "no_whatsapp" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check preferences
    const prefs = subscription.preferences as Record<string, boolean> | null;
    if (prefs && prefs.reminders === false) {
      console.log("⚠️ Reminders disabled for user", user_id);
      return new Response(
        JSON.stringify({ success: false, reason: "reminders_disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanPhone = subscription.phone_number.replace(/\D/g, "");
    const message = `🎉 *Parabéns! Seu jejum de ${activeFast.target_hours}h foi concluído!*\n\n⏰ Protocolo ${activeFast.protocol} — Meta atingida! 💪\n\nVocê pode finalizar o jejum no app quando quiser.\n\n🥗 We Diet - Cuidando da sua saúde!`;

    const zapiUrl = `https://api.z-api.io/instances/${instanceId}/token/${zapiToken}/send-text`;

    const zapiResponse = await fetch(zapiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": securityToken,
      },
      body: JSON.stringify({ phone: cleanPhone, message }),
    });

    const zapiResult = await zapiResponse.json();
    console.log("📱 Z-API response:", JSON.stringify(zapiResult));

    if (zapiResponse.ok) {
      console.log(`✅ Fasting notification sent to ${cleanPhone}`);
      return new Response(
        JSON.stringify({ success: true, sent: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.error("❌ Z-API send failed:", zapiResult);
      return new Response(
        JSON.stringify({ success: false, reason: "zapi_error" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
