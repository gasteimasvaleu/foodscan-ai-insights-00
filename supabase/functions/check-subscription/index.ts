import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  const extra = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${extra}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    log("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    log("User authenticated", { userId: user.id, email: user.email });

    // ─── Step 1: Check by user_id ───
    let subscription = null;
    const { data: byUserId } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (byUserId) {
      subscription = byUserId;
      log("Found by user_id");
    }

    // ─── Step 2: Fallback — check by email ───
    if (!subscription) {
      const { data: byEmail } = await supabaseClient
        .from("subscribers")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (byEmail) {
        subscription = byEmail;
        log("Found by email", { hasUserId: !!byEmail.user_id });

        // Claim orphan: if record has no user_id, bind it now
        if (!byEmail.user_id) {
          log("Claiming orphan record by email");
          await supabaseClient
            .from("subscribers")
            .update({ user_id: user.id, updated_at: new Date().toISOString() })
            .eq("id", byEmail.id);
        }
      }
    }

    if (!subscription) {
      log("No subscription record found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Validate subscription_end
    const subEnd = subscription.subscription_end
      ? new Date(subscription.subscription_end) : null;
    const isActive = subEnd ? subEnd > new Date() : false;

    log("Subscription validation", {
      provider: subscription.payment_provider,
      tier: subscription.subscription_tier,
      end: subscription.subscription_end,
      subscribed: subscription.subscribed,
      isActive,
    });

    // If expired but still marked as subscribed, update
    if (!isActive && subscription.subscribed) {
      log("⏰ Subscription expired, marking as inactive");
      await supabaseClient.from("subscribers").update({
        subscribed: false,
        subscription_status: 'expired',
        updated_at: new Date().toISOString(),
      }).eq("id", subscription.id);
    }

    return new Response(JSON.stringify({
      subscribed: isActive,
      subscription_tier: subscription.subscription_tier,
      subscription_end: subscription.subscription_end,
      payment_provider: subscription.payment_provider,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
