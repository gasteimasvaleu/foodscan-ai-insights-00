const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app-platform",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      return json({ error: "JSON inválido" }, 400);
    }
    const raw_hint = payload?.raw_hint;
    if (!raw_hint || typeof raw_hint !== "string" || raw_hint.trim().length < 3) {
      return json({ error: "Escreva uma pista com pelo menos 3 caracteres." }, 400);
    }
    const cleaned = raw_hint.trim().slice(0, 200);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY ausente" }, 500);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Você cria dicas misteriosas e poéticas em PT-BR para um chat de bar/festa. " +
              "A pessoa quer dar pistas sobre si mesma sem se identificar. " +
              "Responda APENAS com JSON válido no formato {\"hints\":[\"...\",\"...\",\"...\"]} com exatamente 3 dicas, " +
              "cada uma com no máximo 80 caracteres, charmosas, estilo caça ao tesouro. " +
              "Nunca inclua links, telefones, emails, nomes próprios ou marcas óbvias. Emojis com moderação.",
          },
          { role: "user", content: `Pista bruta: "${cleaned}". Gere 3 dicas misteriosas.` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (resp.status === 429) return json({ error: "Muitas requisições, tente em instantes." }, 429);
    if (resp.status === 402) return json({ error: "Créditos da IA esgotados." }, 402);
    if (!resp.ok) {
      const t = await resp.text();
      console.error("gateway error", resp.status, t);
      return json({ error: "Erro na IA" }, 500);
    }

    const data = await resp.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    let hints: string[] = [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed?.hints)) hints = parsed.hints;
    } catch {
      // fallback: split lines
      hints = content
        .split(/\n+/)
        .map((l) => l.replace(/^[\s\-\d\.\)]+/, "").trim())
        .filter((l) => l.length > 0)
        .slice(0, 3);
    }
    hints = hints.filter((h) => typeof h === "string" && h.trim().length > 0).slice(0, 3);
    if (hints.length === 0) return json({ error: "Não consegui gerar dicas, tente reescrever." }, 500);

    return json({ hints });
  } catch (e) {
    console.error("venue-mystery-hint error", e);
    return json({ error: e instanceof Error ? e.message : "Erro desconhecido" }, 500);
  }
});
