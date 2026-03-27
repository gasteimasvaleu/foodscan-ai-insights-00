import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check for existing subscription
    const { data: existingSubscription } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    logStep("Existing subscription check", { 
      found: !!existingSubscription,
      provider: existingSubscription?.payment_provider,
      subscribed: existingSubscription?.subscribed,
      tier: existingSubscription?.subscription_tier,
      end: existingSubscription?.subscription_end
    });

    if (!existingSubscription) {
      logStep("No subscription record found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Validate subscription_end for all providers
    const subEnd = existingSubscription.subscription_end 
      ? new Date(existingSubscription.subscription_end) : null;
    const isActive = subEnd ? subEnd > new Date() : false;

    logStep("Subscription validation", {
      provider: existingSubscription.payment_provider,
      tier: existingSubscription.subscription_tier,
      end: existingSubscription.subscription_end,
      subscribed: existingSubscription.subscribed,
      isActive
    });

    // If expired but still marked as subscribed, update
    if (!isActive && existingSubscription.subscribed) {
      logStep("⏰ Subscription expired, marking as inactive");
      await supabaseClient.from("subscribers").update({
        subscribed: false,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);
    }

    return new Response(JSON.stringify({
      subscribed: isActive,
      subscription_tier: existingSubscription.subscription_tier,
      subscription_end: existingSubscription.subscription_end,
      payment_provider: existingSubscription.payment_provider
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
