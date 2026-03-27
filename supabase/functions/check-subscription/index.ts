import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

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

    // 🍎 PROTEÇÃO APPLE: Se payment_provider é 'apple', validar subscription_end
    if (existingSubscription?.payment_provider === 'apple') {
      const subEnd = existingSubscription.subscription_end 
        ? new Date(existingSubscription.subscription_end) : null;
      const isActive = subEnd ? subEnd > new Date() : false;

      logStep("🍎 APPLE SUBSCRIPTION", {
        tier: existingSubscription.subscription_tier,
        end: existingSubscription.subscription_end,
        subscribed: existingSubscription.subscribed,
        isActive
      });

      if (!isActive && existingSubscription.subscribed) {
        logStep("⏰ Apple subscription expired, marking as inactive");
        await supabaseClient.from("subscribers").update({
          subscribed: false,
          updated_at: new Date().toISOString(),
        }).eq("user_id", user.id);
      }

      return new Response(JSON.stringify({
        subscribed: isActive,
        subscription_tier: existingSubscription.subscription_tier,
        subscription_end: existingSubscription.subscription_end,
        payment_provider: 'apple'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      
      // PROTEÇÃO CONTRA RACE CONDITION
      if (existingSubscription) {
        const now = Date.now();
        const createdTime = new Date(existingSubscription.created_at).getTime();
        const updatedTime = new Date(existingSubscription.updated_at).getTime();
        const secondsSinceCreation = (now - createdTime) / 1000;
        const secondsSinceUpdate = (now - updatedTime) / 1000;
        
        if (secondsSinceCreation < 30 || secondsSinceUpdate < 30) {
          logStep("⚠️ RACE CONDITION PROTECTION: Record too recent", {
            secondsSinceCreation: Math.floor(secondsSinceCreation),
            secondsSinceUpdate: Math.floor(secondsSinceUpdate),
            provider: existingSubscription.payment_provider,
            subscribed: existingSubscription.subscribed
          });
          
          return new Response(JSON.stringify({
            subscribed: existingSubscription.subscribed,
            subscription_tier: existingSubscription.subscription_tier,
            subscription_end: existingSubscription.subscription_end,
            payment_provider: existingSubscription.payment_provider
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
      
      logStep("No active subscription found, updating to unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: existingSubscription?.subscription_tier || null,
        subscription_end: existingSubscription?.subscription_end || null,
        payment_provider: existingSubscription?.payment_provider || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      if (amount <= 999) {
        subscriptionTier = "Basic";
      } else if (amount <= 1999) {
        subscriptionTier = "Premium";
      } else {
        subscriptionTier = "Enterprise";
      }
      logStep("Determined subscription tier", { priceId, amount, subscriptionTier });
    }

    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: hasActiveSub ? subscriptionTier : (existingSubscription?.subscription_tier || null),
      subscription_end: hasActiveSub ? subscriptionEnd : (existingSubscription?.subscription_end || null),
      payment_provider: hasActiveSub ? 'stripe' : (existingSubscription?.payment_provider || null),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Updated database", { subscribed: hasActiveSub, subscriptionTier });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
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
