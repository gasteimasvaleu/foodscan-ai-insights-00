import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check for existing subscription first
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, checking for other providers");
      
      // Check if there's an active Hotmart subscription
      if (existingSubscription?.payment_provider === 'hotmart') {
        const subEnd = existingSubscription.subscription_end ? new Date(existingSubscription.subscription_end) : null;
        const isActive = subEnd && subEnd > new Date();
        
        if (isActive) {
          logStep("Active Hotmart subscription found, preserving it", {
            tier: existingSubscription.subscription_tier,
            end: existingSubscription.subscription_end
          });
          return new Response(JSON.stringify({
            subscribed: true,
            subscription_tier: existingSubscription.subscription_tier,
            subscription_end: existingSubscription.subscription_end,
            payment_provider: 'hotmart'
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          logStep("Hotmart subscription expired, marking as inactive");
        }
      }
      
      // PROTEÇÃO CONTRA RACE CONDITION - DUPLA VERIFICAÇÃO
      // Verificar se o registro foi criado OU atualizado recentemente (< 30s)
      if (existingSubscription) {
        const now = Date.now();
        const createdTime = new Date(existingSubscription.created_at).getTime();
        const updatedTime = new Date(existingSubscription.updated_at).getTime();
        
        const secondsSinceCreation = (now - createdTime) / 1000;
        const secondsSinceUpdate = (now - updatedTime) / 1000;
        
        // NOVA LÓGICA: Proteger se foi criado OU atualizado nos últimos 30 segundos
        if (secondsSinceCreation < 30 || secondsSinceUpdate < 30) {
          logStep("⚠️ RACE CONDITION PROTECTION: Record too recent", {
            secondsSinceCreation: Math.floor(secondsSinceCreation),
            secondsSinceUpdate: Math.floor(secondsSinceUpdate),
            provider: existingSubscription.payment_provider,
            subscribed: existingSubscription.subscribed,
            tier: existingSubscription.subscription_tier
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
      
      // PROTEÇÃO ADICIONAL: Verificar se já existe uma assinatura Hotmart válida
      // Nunca sobrescrever dados Hotmart válidos com dados vazios
      if (existingSubscription?.payment_provider === 'hotmart' && 
          existingSubscription?.subscribed === true &&
          existingSubscription?.subscription_end) {
        
        logStep("🛡️ PRESERVING VALID HOTMART SUBSCRIPTION - Não sobrescrever com dados vazios");
        
        return new Response(JSON.stringify({
          subscribed: existingSubscription.subscribed,
          subscription_tier: existingSubscription.subscription_tier,
          subscription_end: existingSubscription.subscription_end,
          payment_provider: 'hotmart'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // No active subscription from any provider
      logStep("No active subscription found, updating to unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: existingSubscription?.subscription_tier || null,
        subscription_end: existingSubscription?.subscription_end || null,
        payment_provider: existingSubscription?.payment_provider || null,
        hotmart_transaction_id: existingSubscription?.hotmart_transaction_id || null,
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
      // Determine subscription tier from price
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
    } else {
      logStep("No active Stripe subscription found, checking for Hotmart");
      
      // Check if there's an active Hotmart subscription
      if (existingSubscription?.payment_provider === 'hotmart') {
        const subEnd = existingSubscription.subscription_end ? new Date(existingSubscription.subscription_end) : null;
        const isActive = subEnd && subEnd > new Date();
        
        if (isActive) {
          logStep("Active Hotmart subscription found, preserving it despite Stripe customer", {
            tier: existingSubscription.subscription_tier,
            end: existingSubscription.subscription_end
          });
          return new Response(JSON.stringify({
            subscribed: true,
            subscription_tier: existingSubscription.subscription_tier,
            subscription_end: existingSubscription.subscription_end,
            payment_provider: 'hotmart'
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          logStep("Hotmart subscription expired");
        }
      }
    }

    // Verificação final: não sobrescrever assinatura Hotmart ativa
    if (!hasActiveSub && existingSubscription?.payment_provider === 'hotmart') {
      const subEnd = existingSubscription.subscription_end ? new Date(existingSubscription.subscription_end) : null;
      const isActive = subEnd && subEnd > new Date();
      
      if (isActive) {
        logStep("Preserving active Hotmart subscription in final check", {
          tier: existingSubscription.subscription_tier,
          end: existingSubscription.subscription_end
        });
        
        // Atualizar apenas stripe_customer_id, mantendo dados Hotmart
        await supabaseClient.from("subscribers").upsert({
          email: user.email,
          user_id: user.id,
          stripe_customer_id: customerId,
          subscribed: true,
          subscription_tier: existingSubscription.subscription_tier,
          subscription_end: existingSubscription.subscription_end,
          payment_provider: 'hotmart',
          hotmart_transaction_id: existingSubscription.hotmart_transaction_id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
        
        return new Response(JSON.stringify({
          subscribed: true,
          subscription_tier: existingSubscription.subscription_tier,
          subscription_end: existingSubscription.subscription_end,
          payment_provider: 'hotmart'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: hasActiveSub ? subscriptionTier : (existingSubscription?.subscription_tier || null),
      subscription_end: hasActiveSub ? subscriptionEnd : (existingSubscription?.subscription_end || null),
      payment_provider: hasActiveSub ? 'stripe' : (existingSubscription?.payment_provider || null),
      hotmart_transaction_id: existingSubscription?.hotmart_transaction_id || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier });
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
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});