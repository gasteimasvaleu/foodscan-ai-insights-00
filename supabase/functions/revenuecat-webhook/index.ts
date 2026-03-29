import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
      console.error("[RevenueCat Webhook] No event in payload");
      return new Response(JSON.stringify({ error: "No event" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const eventType = event.type;
    const appUserId = event.app_user_id;
    const expirationDate = event.expiration_at_ms
      ? new Date(event.expiration_at_ms).toISOString()
      : null;

    console.log(
      `[RevenueCat Webhook] Event: ${eventType}, User: ${appUserId}, Expiration: ${expirationDate}`
    );

    if (!appUserId) {
      console.error("[RevenueCat Webhook] No app_user_id in event");
      return new Response(JSON.stringify({ error: "No app_user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Determine update based on event type
    let updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      payment_provider: "apple",
    };

    switch (eventType) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "UNCANCELLATION":
        updateData.subscribed = true;
        updateData.subscription_tier = "Premium";
        if (expirationDate) {
          updateData.subscription_end = expirationDate;
        }
        break;

      case "CANCELLATION":
        // Keep active until expiration, just log the intent
        if (expirationDate) {
          updateData.subscription_end = expirationDate;
        }
        console.log(
          `[RevenueCat Webhook] Cancellation for ${appUserId}, active until ${expirationDate}`
        );
        break;

      case "EXPIRATION":
        updateData.subscribed = false;
        break;

      case "BILLING_ISSUE":
        console.warn(
          `[RevenueCat Webhook] Billing issue for user ${appUserId}`
        );
        // Don't change subscription status yet, Apple retries billing
        break;

      case "PRODUCT_CHANGE":
        updateData.subscription_tier = "Premium";
        if (expirationDate) {
          updateData.subscription_end = expirationDate;
        }
        break;

      case "REFUND":
        updateData.subscribed = false;
        updateData.subscription_end = new Date().toISOString();
        break;

      default:
        console.log(
          `[RevenueCat Webhook] Unhandled event type: ${eventType}`
        );
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Check if appUserId is an anonymous RC ID (not a valid UUID)
    const isAnonymousId = appUserId.startsWith("$RCAnonymousID:");

    if (isAnonymousId) {
      console.log(
        `[RevenueCat Webhook] Anonymous user ${appUserId}, skipping (no Supabase user to match)`
      );
      return new Response(JSON.stringify({ success: true, skipped: "anonymous_user" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to update by user_id first
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
        console.error("[RevenueCat Webhook] Update error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Try to find by looking up the user's email from auth
      try {
        const { data: authUser } =
          await supabaseClient.auth.admin.getUserById(appUserId);

        if (authUser?.user?.email) {
          const { error } = await supabaseClient.from("subscribers").upsert(
            {
              user_id: appUserId,
              email: authUser.user.email,
              ...updateData,
            },
            { onConflict: "email" }
          );

          if (error) {
            console.error("[RevenueCat Webhook] Upsert error:", error);
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else {
          console.error(
            `[RevenueCat Webhook] No subscriber or auth user found for ${appUserId}`
          );
        }
      } catch (authErr) {
        console.error(
          `[RevenueCat Webhook] Error looking up auth user ${appUserId}:`,
          authErr
        );
      }
    }

    console.log(
      `[RevenueCat Webhook] Successfully processed ${eventType} for ${appUserId}`
    );

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
