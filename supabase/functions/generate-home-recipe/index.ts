import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é um chef que cria receitas caseiras detalhadas a partir de pratos de fast-food, em Português do Brasil.

Sua resposta DEVE ser APENAS um JSON válido (sem texto antes ou depois, sem markdown).

Formato OBRIGATÓRIO:
{
  "nome": "Versão Caseira do <produto>",
  "descricao": "Descrição apetitosa",
  "ingredientes": [{"nome":"...","quantidade":"..."}],
  "modoPreparo": ["Passo 1", "Passo 2"],
  "tempoPreparo": "30 min",
  "dificuldade": "Fácil" | "Médio" | "Difícil",
  "porcoes": "2 porções",
  "dicas": ["..."],
  "variacoes": ["..."],
  "informacoesNutricionais": {"calorias":"...","proteinas":"...","carboidratos":"...","gorduras":"..."},
  "origemFastFood": "Nome da rede",
  "produtoOriginal": "Nome do produto",
  "versaoCaseira": {
    "beneficios": ["Sem conservantes", "Mais barato", "..."],
    "economiaEstimada": "Cerca de R$ X por porção em relação ao original"
  },
  "comparativoNutricional": {
    "original": {"calorias":"...","proteinas":"...","carboidratos":"...","gorduras":"..."},
    "caseiro": {"calorias":"...","proteinas":"...","carboidratos":"...","gorduras":"..."}
  }
}

Sempre em PT-BR. JSON sempre válido. Use estimativas plausíveis para a versão original.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, selectedOption } = await req.json();
    if (!selectedOption?.nome) {
      return new Response(
        JSON.stringify({ error: "invalid_input", message: "selectedOption inválido" }),
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

    const userTextParts = [
      `Gere a receita caseira para o item: "${selectedOption.nome}"`,
      selectedOption.rede ? `da rede ${selectedOption.rede}` : "",
      selectedOption.descricao ? `(descrição: ${selectedOption.descricao})` : "",
      "Inclua obrigatoriamente comparativoNutricional e versaoCaseira preenchidos.",
    ]
      .filter(Boolean)
      .join(" ");

    const userContent: any[] = [{ type: "text", text: userTextParts }];

    if (imageBase64) {
      const dataUrl = imageBase64.startsWith("data:")
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;
      userContent.push({ type: "image_url", image_url: { url: dataUrl } });
    }

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
          { role: "user", content: userContent },
        ],
      }),
    });

    if (aiResp.status === 429) {
      return new Response(
        JSON.stringify({ error: "rate_limit", message: "Muitas requisições. Tente novamente em instantes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (aiResp.status === 402) {
      return new Response(
        JSON.stringify({ error: "no_credits", message: "Créditos da IA esgotados." }),
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
        JSON.stringify({ error: "parse_error", message: "Não foi possível interpretar a resposta da IA." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-home-recipe error", e);
    return new Response(
      JSON.stringify({ error: "server_error", message: "Erro interno." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
