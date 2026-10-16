import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-app-platform, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const log = (m: string, d?: unknown) => console.log(`[RC-SYNC] ${m}${d ? " - " + JSON.stringify(d) : ""}`);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: u, error: ue } = await admin.auth.getUser(token);
    if (ue || !u?.user) return json({ error: "unauthorized" }, 401);
    const user = u.user;

    const rcKey = Deno.env.get("REVENUECAT_SECRET_API_KEY");
    if (!rcKey) return json({ error: "rc_not_configured" }, 500);

    const { data: existing } = await admin.from("subscribers").select("*").eq("user_id", user.id).maybeSingle();

    // Never touch manual / lifetime grants
    if (existing && (existing.payment_provider === "manual" || existing.product_source === "lifetime")) {
      const active = existing.subscription_end ? new Date(existing.subscription_end) > new Date() : false;
      return json({ subscribed: active && existing.subscribed, source: "manual" });
    }
    if (existing && existing.payment_provider && existing.payment_provider !== "apple") {
      // Other providers (Hotmart, VIP) are managed elsewhere
      return json({ subscribed: !!existing.subscribed, source: existing.payment_provider });
    }

    const rcRes = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`, {
      headers: { Authorization: `Bearer ${rcKey}`, "Content-Type": "application/json" },
    });
    if (!rcRes.ok) {
      const t = await rcRes.text();
      log("RevenueCat error", { status: rcRes.status, t });
      return json({ error: "rc_error", status: rcRes.status }, 502);
    }
    const sub = (await rcRes.json())?.subscriber ?? {};
    const now = new Date();
    const ents = Object.values(sub.entitlements ?? {}) as any[];
    const active = ents.find((e) => !e.expires_date || new Date(e.expires_date) > now);

    if (!active) {
      if (existing?.subscribed) {
        log("RC says not active for this user, deactivating", { user: user.id });
        await admin.from("subscribers").update({
          subscribed: false, subscription_status: "expired", updated_at: now.toISOString(),
        }).eq("id", existing.id);
      }
      return json({ subscribed: false });
    }

    const product = active.product_identifier;
    const s = sub.subscriptions?.[product] ?? {};
    const origDate = s.original_purchase_date || active.purchase_date;
    const txn = origDate ? `apple_${product}_${new Date(origDate).toISOString().replace(".000Z", "Z")}` : null;

    // RevenueCat confirmed this user owns it: free the transaction from any other account
    if (txn) {
      await admin.from("subscribers").update({
        subscribed: false, subscription_status: "transferred", transaction_id: null, updated_at: now.toISOString(),
      }).eq("transaction_id", txn).neq("user_id", user.id);
      await admin.from("subscribers").update({ transaction_id: null }).eq("transaction_id", txn).is("user_id", null);
    }

    const fields = {
      subscribed: true, subscription_tier: "Premium", subscription_end: active.expires_date ?? null,
      payment_provider: "apple", product_source: "revenuecat", subscription_status: "active",
      transaction_id: txn, updated_at: now.toISOString(),
    };
    if (existing) {
      await admin.from("subscribers").update(fields).eq("id", existing.id);
    } else {
      await admin.from("subscribers").insert({ user_id: user.id, email: user.email, ...fields });
    }
    log("Synced", { user: user.id, end: fields.subscription_end });
    return json({ subscribed: true, subscription_end: fields.subscription_end });
  } catch (e) {
    log("ERROR", { e: String(e) });
    return json({ error: String(e) }, 500);
  }
});
