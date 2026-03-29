import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const log = (msg: string, data?: unknown) => {
  const extra = data ? ` - ${JSON.stringify(data)}` : '';
  console.log(`[RevenueCat Webhook] ${msg}${extra}`);
};

const isValidUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
    if (webhookSecret) {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${webhookSecret}`) {
        console.error("[RevenueCat Webhook] Invalid authorization header");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();
    const event = body.event;

    if (!event) {
      return new Response(JSON.stringify({ error: "No event" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const eventType: string = event.type;
    const appUserId: string = event.app_user_id;
    const expirationDate = event.expiration_at_ms
      ? new Date(event.expiration_at_ms).toISOString()
      : null;
    const originalTransactionId: string | null =
      event.original_transaction_id || event.transaction_id || null;

    log(`Event: ${eventType}`, { user: appUserId, exp: expirationDate, txn: originalTransactionId });

    if (!appUserId) {
      return new Response(JSON.stringify({ error: "No app_user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Determine subscription state based on event type
    let subscribed = true;
    let subscriptionStatus = "active";

    switch (eventType) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "UNCANCELLATION":
      case "PRODUCT_CHANGE":
        subscribed = true;
        subscriptionStatus = "active";
        break;
      case "CANCELLATION":
        // Keep active until expiration
        subscribed = true;
        subscriptionStatus = "cancelled";
        break;
      case "EXPIRATION":
        subscribed = false;
        subscriptionStatus = "expired";
        break;
      case "BILLING_ISSUE":
        subscribed = true;
        subscriptionStatus = "pending";
        break;
      case "REFUND":
        subscribed = false;
        subscriptionStatus = "expired";
        break;
      default:
        log(`Unhandled event type: ${eventType}`);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const isAnonymous = appUserId.startsWith("$RCAnonymousID:");
    const isUUID = isValidUUID(appUserId);

    const updateData: Record<string, unknown> = {
      subscribed,
      subscription_status: subscriptionStatus,
      subscription_tier: "Premium",
      payment_provider: "apple",
      product_source: "revenuecat",
      transaction_id: originalTransactionId,
      updated_at: new Date().toISOString(),
    };
    if (expirationDate) {
      updateData.subscription_end = expirationDate;
    }

    if (isUUID) {
      // ─── Known user (real UUID) ───
      log(`Processing for known user: ${appUserId}`);

      const { data: existing } = await supabaseClient
        .from("subscribers")
        .select("id")
        .eq("user_id", appUserId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabaseClient
          .from("subscribers")
          .update(updateData)
          .eq("user_id", appUserId);
        if (error) {
          log("Update error", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        // Try to find user email from auth
        let email = `user_${appUserId}@revenuecat.local`;
        try {
          const { data: authUser } =
            await supabaseClient.auth.admin.getUserById(appUserId);
          if (authUser?.user?.email) {
            email = authUser.user.email;
          }
        } catch (e) {
          log("Could not fetch auth user email", e);
        }

        const { error } = await supabaseClient.from("subscribers").insert({
          user_id: appUserId,
          email,
          ...updateData,
        });
        if (error) {
          log("Insert error", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      log(`Successfully processed ${eventType} for ${appUserId}`);
    } else if (isAnonymous) {
      // ─── Anonymous user → create/update orphan record ───
      const orphanEmail = originalTransactionId
        ? `anonymous+${originalTransactionId}@revenuecat.local`
        : `anonymous+${appUserId.replace('$RCAnonymousID:', '')}@revenuecat.local`;

      log(`Creating/updating orphan for anonymous user`, { orphanEmail, txn: originalTransactionId });

      // Try to find existing orphan by transaction_id first
      let existingOrphan = null;
      if (originalTransactionId) {
        const { data } = await supabaseClient
          .from("subscribers")
          .select("id")
          .eq("transaction_id", originalTransactionId)
          .maybeSingle();
        existingOrphan = data;
      }

      // Fallback: find by orphan email
      if (!existingOrphan) {
        const { data } = await supabaseClient
          .from("subscribers")
          .select("id")
          .eq("email", orphanEmail)
          .maybeSingle();
        existingOrphan = data;
      }

      if (existingOrphan) {
        const { error } = await supabaseClient
          .from("subscribers")
          .update(updateData)
          .eq("id", existingOrphan.id);
        if (error) log("Orphan update error", error);
        else log("Orphan updated successfully");
      } else {
        const { error } = await supabaseClient.from("subscribers").insert({
          email: orphanEmail,
          user_id: null,
          ...updateData,
        });
        if (error) log("Orphan insert error", error);
        else log("Orphan created successfully");
      }
    } else {
      log(`Unknown app_user_id format, skipping: ${appUserId}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[RevenueCat Webhook] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
