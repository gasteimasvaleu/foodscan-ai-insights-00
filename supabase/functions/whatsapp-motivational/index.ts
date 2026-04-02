import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
    const zapiToken = Deno.env.get("ZAPI_TOKEN");
    const securityToken = Deno.env.get("ZAPI_SECURITY_TOKEN");

    if (!instanceId || !zapiToken || !securityToken) {
      throw new Error("Z-API secrets not configured");
    }

    // Fetch all profiles with motivational_category set
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, motivational_category")
      .not("motivational_category", "is", null);

    if (profilesError) throw new Error(profilesError.message);
    if (!profiles || profiles.length === 0) {
      console.log("✅ No users with motivational category configured");
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`📋 Found ${profiles.length} users with motivational category`);

    let sentCount = 0;
    let errorCount = 0;

    for (const profile of profiles) {
      try {
        // Check verified WhatsApp
        const { data: subscription } = await supabase
          .from("whatsapp_subscriptions")
          .select("phone_number, preferences")
          .eq("user_id", profile.id)
          .eq("verified", true)
          .limit(1)
          .maybeSingle();

        if (!subscription) {
          console.log(`⚠️ No WhatsApp for user ${profile.id}, skipping`);
          continue;
        }

        // Check if motivational preference is disabled
        const prefs = (subscription as any).preferences;
        if (prefs && prefs.motivational === false) {
          console.log(`⚠️ User ${profile.id} disabled motivational messages`);
          continue;
        }

        // Get last 7 days of sleep data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: sleepRecords } = await supabase
          .from("sleep_records")
          .select("duration_minutes, quality_rating")
          .eq("user_id", profile.id)
          .gte("sleep_date", sevenDaysAgo.toISOString().split("T")[0]);

        let avgHours = 0;
        let avgQuality = 0;
        if (sleepRecords && sleepRecords.length > 0) {
          const totalMin = sleepRecords.reduce((a: number, r: any) => a + r.duration_minutes, 0);
          const totalQuality = sleepRecords.reduce((a: number, r: any) => a + r.quality_rating, 0);
          avgHours = Math.round((totalMin / sleepRecords.length / 60) * 10) / 10;
          avgQuality = Math.round((totalQuality / sleepRecords.length) * 10) / 10;
        }

        const categoryLabels: Record<string, string> = {
          gratidao: "Gratidão",
          energia: "Energia",
          saude: "Saúde",
          foco: "Foco",
          superacao: "Superação",
        };
        const categoryLabel = categoryLabels[profile.motivational_category] || profile.motivational_category;

        const systemPrompt = `Você é um coach motivacional. Gere UMA mensagem curta (máx 200 caracteres) na categoria "${categoryLabel}" para alguém que dormiu em média ${avgHours}h com qualidade ${avgQuality}/5 nos últimos 7 dias. Seja empático, positivo e use emojis. Responda APENAS com a mensagem, sem aspas nem explicações.`;

        // Call Lovable AI
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Gere a mensagem motivacional de ${categoryLabel} para ${profile.name || "o usuário"}.` },
            ],
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error(`❌ AI error for ${profile.id}: ${aiResponse.status} ${errText}`);
          errorCount++;
          continue;
        }

        const aiData = await aiResponse.json();
        const motivationalMessage = aiData.choices?.[0]?.message?.content?.trim();

        if (!motivationalMessage) {
          console.error(`❌ Empty AI response for ${profile.id}`);
          errorCount++;
          continue;
        }

        // Send via Z-API
        const fullMessage = `🌅 *Bom dia!*\n\n${motivationalMessage}\n\n💪 We Diet - Cuidando da sua saúde!`;
        const cleanPhone = subscription.phone_number.replace(/\D/g, "");
        const zapiUrl = `https://api.z-api.io/instances/${instanceId}/token/${zapiToken}/send-text`;

        const zapiResponse = await fetch(zapiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Client-Token": securityToken,
          },
          body: JSON.stringify({ phone: cleanPhone, message: fullMessage }),
        });

        const zapiResult = await zapiResponse.json();

        if (zapiResponse.ok) {
          // Log message
          await supabase.from("whatsapp_messages").insert({
            phone_number: cleanPhone,
            content: fullMessage,
            message_type: "motivational",
            direction: "outbound",
            status: "sent",
            user_id: profile.id,
            metadata: { category: profile.motivational_category },
          });

          sentCount++;
          console.log(`✅ Motivational sent to ${profile.id}`);
        } else {
          errorCount++;
          console.error(`❌ Z-API error for ${profile.id}:`, zapiResult);
        }
      } catch (userError) {
        errorCount++;
        console.error(`❌ Error processing user ${profile.id}:`, userError);
      }
    }

    console.log(`📊 Summary: sent=${sentCount}, errors=${errorCount}, total=${profiles.length}`);

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, errors: errorCount, total: profiles.length }),
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
