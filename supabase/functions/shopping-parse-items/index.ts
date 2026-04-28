import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_CATEGORIES = [
  "hortifruti",
  "carnes",
  "laticinios",
  "padaria",
  "mercearia",
  "congelados",
  "bebidas",
  "limpeza",
  "higiene",
  "outros",
];

const VALID_UNITS = ["un", "kg", "g", "L", "ml", "pct", "dz", "cx"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { text } = await req.json();
    if (typeof text !== "string" || !text.trim() || text.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Texto inválido (1-1000 caracteres)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = `Você é um assistente que organiza listas de compras em português do Brasil.
Receba um texto livre do usuário com itens separados por vírgula, "e" ou linhas, e retorne uma lista estruturada.

Categorias válidas: ${VALID_CATEGORIES.join(", ")}
Unidades válidas: ${VALID_UNITS.join(", ")}

Regras:
- Nome do item: singular, capitalizado (ex: "Banana", "Tomate", "Arroz")
- Se quantidade não for especificada, use 1
- Se unidade não for especificada, use "un" (ou "kg" para carnes/frutas vendidas por peso quando óbvio)
- Sempre escolha uma categoria adequada (mercearia para arroz/feijão/macarrão; hortifruti para frutas/verduras; laticinios para leite/queijo/iogurte; etc)
- Mantenha agrupado: "6 bananas" = name "Banana", quantity 6, unit "un"
- "2kg arroz" = name "Arroz", quantity 2, unit "kg", category "mercearia"
- Não invente itens que não estão no texto.`;

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
            { role: "user", content: text },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "save_shopping_items",
                description: "Salva itens de compra estruturados",
                parameters: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          quantity: { type: "number" },
                          unit: { type: "string", enum: VALID_UNITS },
                          category: { type: "string", enum: VALID_CATEGORIES },
                        },
                        required: ["name", "quantity", "unit", "category"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["items"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "save_shopping_items" } },
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
        JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }),
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
    if (!toolCall?.function?.arguments) {
      throw new Error("Resposta inválida da IA");
    }
    const parsed = JSON.parse(toolCall.function.arguments);
    const items = (parsed.items ?? [])
      .filter((i: any) => i?.name && VALID_UNITS.includes(i.unit) && VALID_CATEGORIES.includes(i.category))
      .map((i: any) => ({
        name: String(i.name).slice(0, 80),
        quantity: Number(i.quantity) > 0 ? Number(i.quantity) : 1,
        unit: i.unit,
        category: i.category,
      }));

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("shopping-parse-items error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
