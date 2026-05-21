import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const CATEGORIES_DESPESA = [
  "Mercado",
  "Transporte",
  "Lazer",
  "Saúde",
  "Casa",
  "Contas",
  "Educação",
  "Restaurante",
  "Outros",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { imageUrl, imageBase64 } = await req.json();
    if (!imageUrl && !imageBase64) {
      return new Response(JSON.stringify({ error: "imageUrl ou imageBase64 obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const imageContent = imageBase64
      ? { type: "image_url", image_url: { url: imageBase64 } }
      : { type: "image_url", image_url: { url: imageUrl } };

    const systemPrompt = `Você é um assistente que lê cupons fiscais, contas de restaurante, comprovantes e notas em português do Brasil.
Extraia os dados da despesa. Para o valor total, considere o TOTAL FINAL pago (incluindo taxa de serviço/gorjeta quando presente).
Escolha UMA categoria entre: ${CATEGORIES_DESPESA.join(", ")}.
Se for conta de restaurante/bar, use "Restaurante". Se for supermercado, "Mercado". Se for farmácia/clínica, "Saúde".
A descrição deve ser curta (ex: "Restaurante X - Almoço", "Mercado Y", "Posto Z - Combustível").
Se a data não estiver legível, retorne null em occurred_on. Formato de data: YYYY-MM-DD.
Confidence entre 0 e 1 indicando sua confiança na extração.`;

    const body = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Extraia os dados desta conta/cupom:" },
            imageContent,
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "extract_receipt",
            description: "Extrai dados estruturados da conta",
            parameters: {
              type: "object",
              properties: {
                amount: { type: "number", description: "Valor total em reais (ex: 87.50)" },
                description: { type: "string", description: "Descrição curta da despesa" },
                suggested_category: { type: "string", enum: CATEGORIES_DESPESA },
                occurred_on: { type: ["string", "null"], description: "Data YYYY-MM-DD ou null" },
                merchant: { type: ["string", "null"], description: "Nome do estabelecimento" },
                confidence: { type: "number", minimum: 0, maximum: 1 },
              },
              required: ["amount", "description", "suggested_category", "confidence"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "extract_receipt" } },
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em instantes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "Falha ao analisar a imagem" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Não foi possível ler a conta" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const args = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-receipt error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
