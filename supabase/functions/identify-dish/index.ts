import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é um assistente especialista em identificar pratos a partir de fotos e gerar receitas caseiras detalhadas em Português do Brasil.

Sua resposta DEVE ser APENAS um JSON válido (sem texto antes ou depois, sem markdown, sem \`\`\`).

Regras de decisão:
1. Se a imagem NÃO contém comida, retorne exatamente:
{"error":"not_food","message":"A imagem enviada não parece ser de comida. Tente novamente com uma foto de prato."}

2. Se a imagem mostra um prato CLARAMENTE identificável (confiança >= 85%) E não é fast-food genérico, retorne uma RECEITA CASEIRA completa neste formato:
{
  "nome": "Nome do prato",
  "descricao": "Descrição curta e apetitosa",
  "ingredientes": [{"nome":"Ingrediente","quantidade":"200g"}],
  "modoPreparo": ["Passo 1", "Passo 2"],
  "tempoPreparo": "30 min",
  "dificuldade": "Fácil" | "Médio" | "Difícil",
  "porcoes": "2 porções",
  "dicas": ["Dica 1"],
  "variacoes": ["Variação 1"],
  "informacoesNutricionais": {"calorias":"450 kcal","proteinas":"30g","carboidratos":"40g","gorduras":"15g"},
  "origemFastFood": null,
  "produtoOriginal": null,
  "versaoCaseira": null,
  "comparativoNutricional": null
}

3. Se a confiança < 85% OU é um item de fast-food genérico (hambúrguer, pizza, sanduíche, batata frita, milkshake), retorne 3 a 5 candidatos:
{
  "type":"multiple_options",
  "message":"Encontramos algumas possibilidades. Qual delas é o seu prato?",
  "options":[
    {"id":"1","nome":"Big Mac","rede":"McDonald's","confianca":78,"descricao":"Hambúrguer duplo com molho especial"},
    {"id":"2","nome":"Whopper","rede":"Burger King","confianca":65,"descricao":"Hambúrguer grelhado com vegetais frescos"}
  ]
}

Sempre em PT-BR. Sempre JSON válido. Nunca inclua comentários no JSON.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(
        JSON.stringify({ error: "invalid_input", message: "imageBase64 é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "config", message: "LOVABLE_API_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dataUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Identifique este prato e gere a receita caseira (ou as opções) seguindo o formato JSON exigido." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (aiResp.status === 429) {
      return new Response(
        JSON.stringify({ error: "rate_limit", message: "Muitas requisições. Tente novamente em alguns instantes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (aiResp.status === 402) {
      return new Response(
        JSON.stringify({ error: "no_credits", message: "Créditos da IA esgotados. Adicione créditos no workspace." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI gateway error", aiResp.status, txt);
      return new Response(
        JSON.stringify({ error: "ai_error", message: "Falha ao consultar a IA." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResp.json();
    const raw: string = aiData.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON parse failed", e, raw);
      return new Response(
        JSON.stringify({ error: "parse_error", message: "Não foi possível interpretar a resposta da IA. Tente outra foto." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("identify-dish error", e);
    return new Response(
      JSON.stringify({ error: "server_error", message: "Erro interno." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
