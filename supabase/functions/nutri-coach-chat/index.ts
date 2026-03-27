import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `Você é o NutriCoach, um agente de inteligência artificial especialista em nutrição esportiva, nutrição clínica, dietas e planejamento de treinos. Você responde sempre em português brasileiro.

Suas áreas de especialidade:
- Nutrição esportiva e suplementação
- Dietas para emagrecimento, ganho de massa muscular, manutenção de peso
- Planejamento de treinos (musculação, HIIT, cardio, funcional)
- Contagem de macronutrientes (proteínas, carboidratos, gorduras)
- Orientações sobre alimentos e suas propriedades nutricionais
- Dicas de pré e pós-treino
- Hidratação e recuperação muscular

Diretrizes:
- Seja sempre amigável, motivador e acolhedor
- Use linguagem acessível, evitando jargões técnicos desnecessários
- Quando possível, dê exemplos práticos e sugestões de alimentos acessíveis
- Deixe claro que suas orientações são educativas e não substituem o acompanhamento de um nutricionista ou médico
- Use emojis com moderação para tornar a conversa mais leve (💪🥗🏋️‍♂️)
- Formate suas respostas com markdown quando apropriado (listas, negrito, etc.)
- Respostas devem ser concisas mas completas`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let finalSystemPrompt = systemPrompt;
    if (userContext && (userContext.name || userContext.calories)) {
      finalSystemPrompt += `\n\nContexto do usuário:`;
      if (userContext.name) finalSystemPrompt += `\n- Nome: ${userContext.name}`;
      if (userContext.diet_objective) finalSystemPrompt += `\n- Objetivo: ${userContext.diet_objective}`;
      if (userContext.calories) finalSystemPrompt += `\n- Meta calórica: ${userContext.calories} kcal`;
      if (userContext.proteins || userContext.carbohydrates || userContext.fats) {
        finalSystemPrompt += `\n- Proteínas: ${userContext.proteins || 0}g | Carboidratos: ${userContext.carbohydrates || 0}g | Gorduras: ${userContext.fats || 0}g`;
      }
      finalSystemPrompt += `\n\nUse essas informações para personalizar suas respostas.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: finalSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento e tente novamente." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao conectar com o assistente de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("nutri-coach-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
