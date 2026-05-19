import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { raw_hint } = await req.json();
    if (!raw_hint || typeof raw_hint !== "string" || raw_hint.trim().length < 3) {
      return new Response(JSON.stringify({ error: "raw_hint inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const cleaned = raw_hint.trim().slice(0, 200);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY ausente");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Você cria dicas misteriosas e poéticas em PT-BR para um chat de bar/festa. " +
              "A pessoa quer dar pistas sobre si mesma sem se identificar. " +
              "Gere 3 dicas curtas (máx 80 caracteres cada), divertidas, charmosas, no estilo 'caça ao tesouro'. " +
              "Nunca inclua links, telefones, emails, nomes próprios, marcas óbvias ou qualquer dado pessoal. " +
              "Use emojis com moderação.",
          },
          {
            role: "user",
            content: `Pista bruta da pessoa: "${cleaned}". Gere 3 dicas misteriosas.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_hints",
              description: "Retorna 3 dicas misteriosas",
              parameters: {
                type: "object",
                properties: {
                  hints: {
                    type: "array",
                    items: { type: "string", maxLength: 80 },
                    minItems: 3,
                    maxItems: 3,
                  },
                },
                required: ["hints"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_hints" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Muitas requisições, tente novamente em instantes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos da IA esgotados." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "Erro na IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let hints: string[] = [];
    if (args) {
      try {
        hints = JSON.parse(args).hints ?? [];
      } catch {
        hints = [];
      }
    }
    if (!Array.isArray(hints) || hints.length === 0) {
      return new Response(JSON.stringify({ error: "Não consegui gerar dicas, tente reescrever." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ hints: hints.slice(0, 3) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
