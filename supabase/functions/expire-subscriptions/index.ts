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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("subscribers")
      .update({ subscribed: false, updated_at: new Date().toISOString() })
      .eq("subscribed", true)
      .lt("subscription_end", new Date().toISOString())
      .select("id, email, subscription_end");

    if (error) {
      console.error("Error expiring subscriptions:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const count = data?.length || 0;
    console.log(`Expired ${count} subscriptions at ${new Date().toISOString()}`);
    if (count > 0) {
      console.log("Expired emails:", data.map((s: any) => s.email).join(", "));
    }

    return new Response(
      JSON.stringify({ expired_count: count, timestamp: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
