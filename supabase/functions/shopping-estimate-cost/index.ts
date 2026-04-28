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
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0 || items.length > 200) {
      return new Response(
        JSON.stringify({ error: "Lista de itens inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const itemsText = items
      .map((i: any) => `- ${i.quantity}${i.unit} de ${i.name}`)
      .join("\n");

    const systemPrompt = `Você é um assistente que estima preços de mercado no Brasil.
Calcule o custo TOTAL aproximado de uma lista de compras considerando preços médios de varejo brasileiro (grandes redes, 2026).
Considere quantidade × unidade. Seja realista e prático.`;

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
            { role: "user", content: `Lista:\n${itemsText}\n\nEstime o custo total em reais (BRL).` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "save_estimate",
                description: "Retorna estimativa de custo",
                parameters: {
                  type: "object",
                  properties: {
                    total_brl: { type: "number" },
                    notes: { type: "string" },
                  },
                  required: ["total_brl"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "save_estimate" } },
        }),
      },
    );

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "Créditos de IA esgotados." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("Erro ao processar com IA");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("Resposta inválida da IA");
    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        total_brl: Number(parsed.total_brl) || 0,
        notes: parsed.notes ?? "Preços médios de varejo brasileiro",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("shopping-estimate-cost error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
