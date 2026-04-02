import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { format, startOfWeek, endOfWeek, parseISO } from "npm:date-fns@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OBJECTIVE_CATALOG: Record<string, { label: string; keywords: string[]; }> = {
  limit_snacks: {
    label: "Limitar Lanches",
    keywords: ["lanche", "snack", "salgado", "coxinha", "pastel", "empada", "esfiha"],
  },
  limit_fast_food: {
    label: "Limitar Fast Food",
    keywords: ["pizza", "hambúrguer", "hamburger", "hot dog", "cachorro-quente", "batata frita", "fast food", "mc", "burger king", "subway"],
  },
  limit_sugar: {
    label: "Limitar Açúcar",
    keywords: ["bolo", "sorvete", "chocolate", "doce", "brigadeiro", "pudim", "torta", "biscoito", "bolacha", "açúcar", "sobremesa", "cookie", "brownie", "mousse"],
  },
  no_overeating: {
    label: "Não Comer em Excesso",
    keywords: [],
  },
  healthy_eating: {
    label: "Alimentação Saudável",
    keywords: [],
  },
  start_exercising: {
    label: "Começar a se Exercitar",
    keywords: [],
  },
  reduce_meat: {
    label: "Reduzir Carne",
    keywords: ["carne", "bife", "picanha", "costela", "churrasco", "bacon", "linguiça", "salsicha", "carne moída", "filé mignon", "alcatra"],
  },
  home_cooking: {
    label: "Origem do Alimento",
    keywords: ["caseiro", "feito em casa", "homemade"],
  },
};

const POSITIVE_OBJECTIVES = ["no_overeating", "healthy_eating", "start_exercising", "home_cooking"];

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

    // Get all active objectives grouped by user
    const { data: allObjectives, error: objError } = await supabase
      .from("user_objectives")
      .select("*")
      .eq("is_active", true);

    if (objError) throw new Error(objError.message);
    if (!allObjectives || allObjectives.length === 0) {
      console.log("✅ No active objectives found");
      return new Response(
        JSON.stringify({ success: true, sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group objectives by user_id
    const userObjectives: Record<string, any[]> = {};
    for (const obj of allObjectives) {
      if (!userObjectives[obj.user_id]) userObjectives[obj.user_id] = [];
      userObjectives[obj.user_id].push(obj);
    }

    const userIds = Object.keys(userObjectives);
    console.log(`📋 Found ${userIds.length} users with active objectives`);

    // Week range (Monday to Sunday)
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, "yyyy-MM-dd");
    const weekEndStr = format(weekEnd, "yyyy-MM-dd");

    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const userId of userIds) {
      // Get WhatsApp subscription
      const { data: subscription } = await supabase
        .from("whatsapp_subscriptions")
        .select("phone_number, preferences")
        .eq("user_id", userId)
        .eq("verified", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!subscription) {
        skippedCount++;
        continue;
      }

      // Check if weekly_objectives preference is disabled
      const prefs = (subscription as any).preferences;
      if (prefs && prefs.weekly_objectives === false) {
        skippedCount++;
        console.log(`⚠️ User ${userId} disabled weekly objectives`);
        continue;
      }

      // Fetch meals for the week
      const { data: meals } = await supabase
        .from("meal_records")
        .select("food_name, meal_type, calories, proteins, meal_time")
        .eq("user_id", userId)
        .gte("meal_time", weekStart.toISOString())
        .lte("meal_time", weekEnd.toISOString());

      // Fetch exercises for the week
      const { data: exercises } = await supabase
        .from("exercise_records")
        .select("id, date")
        .eq("user_id", userId)
        .gte("date", weekStartStr)
        .lte("date", weekEndStr);

      // Fetch daily goals
      const { data: goalsData } = await supabase
        .from("daily_goals")
        .select("calories, proteins")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      const dailyGoal = goalsData?.[0];
      const mealsList = meals || [];
      const exercisesList = exercises || [];
      const objectives = userObjectives[userId];

      // Calculate progress for each objective
      const results: string[] = [];

      for (const obj of objectives) {
        const catalog = OBJECTIVE_CATALOG[obj.objective_key];
        if (!catalog) continue;

        const keywords = obj.custom_keywords?.length ? obj.custom_keywords : catalog.keywords;
        let currentValue = 0;

        switch (obj.objective_key) {
          case "limit_snacks": {
            currentValue = mealsList.filter((m: any) => {
              const type = (m.meal_type || "").toLowerCase();
              const name = (m.food_name || "").toLowerCase();
              return type === "lanche" || keywords.some((k: string) => name.includes(k.toLowerCase()));
            }).length;
            break;
          }
          case "limit_fast_food":
          case "limit_sugar":
          case "reduce_meat": {
            currentValue = mealsList.filter((m: any) => {
              const name = (m.food_name || "").toLowerCase();
              return keywords.some((k: string) => name.includes(k.toLowerCase()));
            }).length;
            break;
          }
          case "no_overeating": {
            if (dailyGoal) {
              const dayMap: Record<string, number> = {};
              mealsList.forEach((m: any) => {
                const day = format(parseISO(m.meal_time), "yyyy-MM-dd");
                dayMap[day] = (dayMap[day] || 0) + Number(m.calories);
              });
              currentValue = Object.values(dayMap).filter((cal) => cal <= dailyGoal.calories).length;
            }
            break;
          }
          case "healthy_eating": {
            if (dailyGoal) {
              const dayMap: Record<string, number> = {};
              mealsList.forEach((m: any) => {
                const day = format(parseISO(m.meal_time), "yyyy-MM-dd");
                dayMap[day] = (dayMap[day] || 0) + Number(m.proteins);
              });
              currentValue = Object.values(dayMap).filter((p) => p >= dailyGoal.proteins).length;
            }
            break;
          }
          case "start_exercising": {
            currentValue = exercisesList.length;
            break;
          }
          case "home_cooking": {
            currentValue = mealsList.filter((m: any) => {
              const name = (m.food_name || "").toLowerCase();
              return keywords.some((k: string) => name.includes(k.toLowerCase()));
            }).length;
            break;
          }
        }

        const isPositive = POSITIVE_OBJECTIVES.includes(obj.objective_key);
        const isWithinGoal = isPositive ? currentValue >= obj.target_value : currentValue <= obj.target_value;
        const emoji = isWithinGoal ? "✅" : "❌";
        const unitLabel = isPositive ? "dias" : "vezes";
        const statusText = isWithinGoal ? "Meta cumprida!" : "Meta não cumprida";

        results.push(`${emoji} *${catalog.label}* — ${currentValue}/${obj.target_value} ${unitLabel} (${statusText})`);
      }

      if (results.length === 0) continue;

      const metCount = results.filter((r) => r.startsWith("✅")).length;
      const totalCount = results.length;

      let footer = "";
      if (metCount === totalCount) {
        footer = "\n🏆 *Perfeito! Todas as metas cumpridas!* Continue assim! 💪";
      } else if (metCount > 0) {
        footer = `\n💪 Parabéns pelas ${metCount} meta(s) cumprida(s)! Na próxima semana você consegue mais!`;
      } else {
        footer = "\n🔥 Não desanime! A próxima semana é uma nova oportunidade!";
      }

      const message = `📊 *Resumo Semanal de Objetivos*\n\n${results.join("\n")}\n${footer}\n\n🥗 We Diet - Cuidando da sua saúde!`;

      const cleanPhone = subscription.phone_number.replace(/\D/g, "");
      const zapiUrl = `https://api.z-api.io/instances/${instanceId}/token/${zapiToken}/send-text`;

      try {
        const zapiResponse = await fetch(zapiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Client-Token": securityToken,
          },
          body: JSON.stringify({ phone: cleanPhone, message }),
        });

        if (zapiResponse.ok) {
          sentCount++;
          console.log(`✅ Weekly objectives sent to ${cleanPhone}`);
        } else {
          const err = await zapiResponse.json();
          errorCount++;
          console.error(`❌ Failed to send to ${cleanPhone}:`, err);
        }
      } catch (sendError) {
        errorCount++;
        console.error(`❌ Error sending to ${cleanPhone}:`, sendError);
      }
    }

    console.log(`📊 Summary | sent: ${sentCount}, skipped: ${skippedCount}, errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, skipped: skippedCount, errors: errorCount }),
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
