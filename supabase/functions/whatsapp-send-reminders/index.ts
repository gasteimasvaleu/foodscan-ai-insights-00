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

    // Get current time in Brazil timezone (UTC-3)
    const now = new Date();
    const brNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const currentTime = brNow.toISOString().slice(11, 19); // HH:MM:SS in BRT

    console.log(`⏰ Checking reminders at ${currentTime} (BRT, UTC was ${now.toISOString().slice(11, 19)})`);

    // Query active reminders for today, within ±5 min window, not yet sent today
    const { data: reminders, error: remindersError } = await supabase
      .from("reminders")
      .select(`
        id,
        title,
        description,
        reminder_time,
        reminder_type,
        user_id,
        last_whatsapp_sent_at
      `)
      .eq("is_active", true)
      .eq("reminder_date", brNow.toISOString().split("T")[0])
      .gte("reminder_time", _subtractMinutes(currentTime, 5))
      .lte("reminder_time", _addMinutes(currentTime, 5));

    if (remindersError) {
      console.error("❌ Error fetching reminders:", remindersError);
      throw new Error(remindersError.message);
    }

    if (!reminders || reminders.length === 0) {
      console.log("✅ No reminders to send right now");
      return new Response(
        JSON.stringify({
          success: true,
          sent: 0,
          total: 0,
          skipped_no_subscription: 0,
          skipped_pref_disabled: 0,
          send_errors: 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter out reminders already sent today
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);

    const pendingReminders = reminders.filter((r) => {
      if (!r.last_whatsapp_sent_at) return true;
      const lastSent = new Date(r.last_whatsapp_sent_at);
      return lastSent < todayStart;
    });

    console.log(`📋 Found ${pendingReminders.length} pending reminders to send`);

    let sentCount = 0;
    let skippedNoSubscriptionCount = 0;
    let skippedPrefDisabledCount = 0;
    let sendErrorsCount = 0;

    for (const reminder of pendingReminders) {
      // Get user's WhatsApp subscription
      const { data: subscription, error: subError } = await supabase
        .from("whatsapp_subscriptions")
        .select("phone_number")
        .eq("user_id", reminder.user_id)
        .eq("verified", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError || !subscription) {
        skippedNoSubscriptionCount++;
        console.log(`⚠️ Skipping reminder ${reminder.id}: no verified WhatsApp subscription for user ${reminder.user_id}`);
        continue;
      }

      // Build message
      const typeEmoji: Record<string, string> = {
        water: "💧",
        meal: "🍽️",
        supplement: "💊",
        exercise: "🏋️",
        medication: "💉",
        sleep: "😴",
      };
      const emoji = typeEmoji[reminder.reminder_type] || "⏰";
      const message = `${emoji} *Lembrete: ${reminder.title}*\n\n${reminder.description || "Está na hora!"}\n\n💪 We Diet - Cuidando da sua saúde!`;

      const cleanPhone = subscription.phone_number.replace(/\D/g, "");

      // Send via Z-API
      const zapiUrl = `https://api.z-api.io/instances/${instanceId}/token/${zapiToken}/send-text`;

      try {
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
        console.log(`📱 Z-API response for reminder ${reminder.id}:`, JSON.stringify(zapiResult));

        if (zapiResponse.ok) {
          // Mark as sent
          await supabase
            .from("reminders")
            .update({ last_whatsapp_sent_at: new Date().toISOString() })
            .eq("id", reminder.id);

          // Log in whatsapp_messages
          await supabase.from("whatsapp_messages").insert({
            phone_number: cleanPhone,
            content: message,
            message_type: "reminder",
            direction: "outbound",
            status: "sent",
            user_id: reminder.user_id,
            metadata: { reminder_id: reminder.id, reminder_type: reminder.reminder_type },
          });

          sentCount++;
          console.log(`✅ Reminder ${reminder.id} sent to ${cleanPhone}`);
        } else {
          sendErrorsCount++;
          console.error(`❌ Failed to send reminder ${reminder.id}:`, zapiResult);
        }
      } catch (sendError) {
        sendErrorsCount++;
        console.error(`❌ Error sending reminder ${reminder.id}:`, sendError);
      }
    }

    console.log(
      `📊 Summary | sent: ${sentCount}, total: ${pendingReminders.length}, skipped_no_subscription: ${skippedNoSubscriptionCount}, skipped_pref_disabled: ${skippedPrefDisabledCount}, send_errors: ${sendErrorsCount}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        total: pendingReminders.length,
        skipped_no_subscription: skippedNoSubscriptionCount,
        skipped_pref_disabled: skippedPrefDisabledCount,
        send_errors: sendErrorsCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper: subtract minutes from a time string HH:MM:SS
function _subtractMinutes(time: string, minutes: number): string {
  const [h, m, s] = time.split(":").map(Number);
  const totalMin = h * 60 + m - minutes;
  const newH = Math.floor(((totalMin % 1440) + 1440) % 1440 / 60);
  const newM = ((totalMin % 60) + 60) % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Helper: add minutes to a time string HH:MM:SS
function _addMinutes(time: string, minutes: number): string {
  const [h, m, s] = time.split(":").map(Number);
  const totalMin = h * 60 + m + minutes;
  const newH = Math.floor((totalMin % 1440) / 60);
  const newM = totalMin % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
