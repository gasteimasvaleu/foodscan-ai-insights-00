import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body = await req.json();
    const {
      sex,
      age,
      weight,
      height,
      activityLevel,
      goal,
      event,
      eventDate,
      healthRestrictions,
      otherRestriction,
      workType,
      sleepHours,
      stressLevel,
      mealsPerDay,
      hasDietHistory,
      dietTypes,
      hadRebound,
      lowestWeight,
      highestWeight,
    } = body;

    const today = new Date().toISOString().split("T")[0];

    let eventContext = "";
    if (event && event !== "nenhum") {
      const eventLabel: Record<string, string> = {
        casamento: "casamento",
        ferias: "férias",
        formatura: "formatura",
        competicao: "competição esportiva",
      };
      eventContext = `O usuário tem um evento especial: ${eventLabel[event] || event}.`;
      if (eventDate) {
        const daysUntil = Math.ceil(
          (new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        eventContext += ` Faltam ${daysUntil} dias (data: ${eventDate}). Ajuste a agressividade da dieta conforme o prazo, mas sempre de forma saudável.`;
      }
    }

    let restrictionsContext = "";
    if (healthRestrictions && healthRestrictions.length > 0) {
      restrictionsContext = `Restrições de saúde: ${healthRestrictions.join(", ")}.`;
      if (otherRestriction) {
        restrictionsContext += ` Outra: ${otherRestriction}.`;
      }
      restrictionsContext += " Adapte os macronutrientes para essas condições.";
    }

    let routineContext = "";
    if (workType || sleepHours || stressLevel || mealsPerDay) {
      const parts = [];
      if (workType) parts.push(`trabalho: ${workType}`);
      if (sleepHours) parts.push(`${sleepHours}h de sono`);
      if (stressLevel) parts.push(`nível de estresse: ${stressLevel}/5`);
      if (mealsPerDay) parts.push(`${mealsPerDay} refeições/dia`);
      routineContext = `Rotina: ${parts.join(", ")}.`;
    }

    let historyContext = "";
    if (hasDietHistory) {
      const parts = [];
      if (dietTypes) parts.push(`tipos: ${dietTypes}`);
      if (hadRebound) parts.push("já teve efeito rebote");
      if (lowestWeight) parts.push(`peso mais baixo: ${lowestWeight}kg`);
      if (highestWeight) parts.push(`peso mais alto: ${highestWeight}kg`);
      historyContext = `Histórico de dietas: ${parts.join(", ")}.`;
    }

    const goalLabel: Record<string, string> = {
      perder: "perder peso / emagrecer",
      manter: "manter o peso atual",
      ganhar: "ganhar massa muscular",
    };

    const systemPrompt = `Você é um nutricionista especialista em calcular metas nutricionais personalizadas.
Calcule a TMB (Taxa Metabólica Basal) usando a fórmula de Harris-Benedict revisada, depois aplique o fator de atividade física.
Ajuste calorias e macros conforme o objetivo, considerando todos os fatores do paciente.
Seja preciso nos cálculos. Retorne valores inteiros.
A explicação deve ser em português brasileiro, amigável, motivacional e personalizada.
Se houver evento especial, mencione-o na explicação.
Se houver restrições de saúde, explique como isso afeta as recomendações.`;

    const userPrompt = `Calcule as metas nutricionais diárias para este perfil:

- Sexo: ${sex === "male" ? "Masculino" : "Feminino"}
- Idade: ${age} anos
- Peso: ${weight} kg
- Altura: ${height} cm
- Nível de atividade: ${activityLevel}
- Objetivo: ${goalLabel[goal] || goal}
${eventContext}
${restrictionsContext}
${routineContext}
${historyContext}

Data de hoje: ${today}

Use a função calculate_goals para retornar o resultado.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "calculate_goals",
                description:
                  "Return personalized daily nutritional goals with explanation",
                parameters: {
                  type: "object",
                  properties: {
                    calories: {
                      type: "integer",
                      description: "Daily calorie goal in kcal",
                    },
                    carbohydrates: {
                      type: "integer",
                      description: "Daily carbohydrate goal in grams",
                    },
                    proteins: {
                      type: "integer",
                      description: "Daily protein goal in grams",
                    },
                    fats: {
                      type: "integer",
                      description: "Daily fat goal in grams",
                    },
                    diet_objective: {
                      type: "string",
                      description:
                        "Short diet objective label in Portuguese (e.g. 'Emagrecimento saudável', 'Ganho de massa')",
                    },
                    explanation: {
                      type: "string",
                      description:
                        "Detailed personalized explanation in Portuguese of why these values were chosen, mentioning the user's profile, event, restrictions etc. Use 3-5 paragraphs.",
                    },
                  },
                  required: [
                    "calories",
                    "carbohydrates",
                    "proteins",
                    "fats",
                    "diet_objective",
                    "explanation",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "calculate_goals" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Muitas requisições. Aguarde um momento e tente novamente.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Créditos insuficientes. Entre em contato com o suporte.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call response from AI");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-goals-calculator error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
