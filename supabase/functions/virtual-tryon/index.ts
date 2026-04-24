import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TRY_ON_PROMPT = `Você acabou de receber DUAS imagens, nesta ordem exata:
- IMAGE A (1ª imagem): a pessoa de referência (rosto, cabelo, identidade, tom de pele)
- IMAGE B (2ª imagem): a roupa/look a ser vestido (ÚNICA fonte da roupa)

Sua tarefa é gerar UMA nova imagem combinando-as: a pessoa da IMAGE A vestindo EXATAMENTE a roupa da IMAGE B.

REGRA #1 — ROUPA INTOCÁVEL (PRIORIDADE MÁXIMA):
- A IMAGE B é a ÚNICA fonte da roupa. Qualquer roupa visível na IMAGE A deve ser totalmente IGNORADA e DESCARTADA.
- Replicar pixel a pixel: cor exata, estampas, texturas, tecidos, costuras, zíperes, botões, bolsos, fivelas, alças, decote, mangas, comprimento e caimento original da peça.
- Manter EXATAMENTE acessórios e calçados visíveis na IMAGE B (se fizerem parte do look principal).
- PROIBIDO: inventar variações, mudar tom de cor, "modernizar", recolorir, adicionar ou remover estampas/listras/detalhes, inserir logos novos, alterar o modelo da peça.
- Se a IMAGE B mostrar a peça em manequim, cabide ou foto de produto (sem pessoa), transferir o look para o corpo da pessoa da IMAGE A mantendo proporções e detalhes idênticos.

TASK: Gere UMA imagem ultra realista, proporção 1:1 (quadrada),
estilo fotografia publicitária de estúdio premium, mostrando a pessoa
da IMAGE A vestindo EXATAMENTE o look da IMAGE B (ver REGRA #1).

FACE/IDENTIDADE (LOCK TOTAL DA IMAGE A):
- Manter exatamente o rosto, estrutura facial, olhos, nariz, boca
- Manter cor e textura de pele
- Manter cor, comprimento e estilo do cabelo
- Manter expressão natural e idade aparente

CORPO:
- Manter proporções coerentes com a pessoa da IMAGE A
- Pose neutra de catálogo, corpo inteiro centralizado
- Postura ereta, leve contrapposto, mãos relaxadas ao lado do corpo

CENÁRIO:
- Fundo branco infinito de estúdio (cyclorama branco puro)
- Iluminação de estúdio uniforme, suave, sem sombras duras
- Sombra discreta no chão sob os pés
- Enquadramento quadrado 1:1, corpo inteiro centralizado, headroom equilibrado

ESTILO:
- Ultra realista, fotografia de moda profissional
- Pele com textura natural
- Foco nítido em rosto e roupa

INTEGRAÇÃO:
- Transição perfeita entre rosto e corpo
- Ajustar pescoço, iluminação e tom de pele para parecer uma única pessoa
- Sem colagem artificial, sem costuras visíveis

OUTPUT OBRIGATÓRIO:
- Gere uma IMAGEM NOVA combinando as duas entradas.
- NÃO retorne a IMAGE A sem alterações.
- NÃO retorne a IMAGE B sem alterações.
- NÃO retorne nenhuma das imagens de entrada como resposta.

NEGATIVE:
- não retornar a IMAGE A inalterada (proibido)
- não retornar a IMAGE B inalterada (proibido)
- não trocar a cor da roupa por nenhuma hipótese
- não mudar o modelo da peça da IMAGE B
- não adicionar nem remover estampas, listras, bolsos ou detalhes
- não usar a roupa visível na IMAGE A
- não misturar rostos de outras pessoas
- evitar distorções anatômicas, mãos/dedos extras
- evitar artefatos, baixa qualidade, aparência de montagem
- evitar texto, marca d'água, logos não presentes nas imagens originais`;

const BodySchema = z.object({
  userImageUrl: z.string().url(),
  outfitImageUrl: z.string().url(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase env not configured");
    }

    // Auth: identify user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    // Validate input
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Parâmetros inválidos", details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { userImageUrl, outfitImageUrl } = parsed.data;

    // Call Lovable AI Gateway with both images
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Esta é a IMAGE A (pessoa de referência — use o rosto, cabelo e identidade desta imagem; IGNORE qualquer roupa visível aqui):" },
              { type: "image_url", image_url: { url: userImageUrl } },
              { type: "text", text: "Esta é a IMAGE B (roupa/look — use EXATAMENTE esta roupa, replicando cor, estampa, modelo e detalhes pixel a pixel):" },
              { type: "image_url", image_url: { url: outfitImageUrl } },
              { type: "text", text: TRY_ON_PROMPT },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (aiResp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Muitas solicitações. Tente novamente em alguns instantes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (aiResp.status === 402) {
      return new Response(
        JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos para continuar." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "Falha ao gerar a imagem" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const dataUrl: string | undefined =
      aiData?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!dataUrl || !dataUrl.startsWith("data:")) {
      console.error("AI response missing image:", JSON.stringify(aiData).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "A IA não retornou uma imagem. Tente outras fotos." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Decode base64 → bytes
    const commaIdx = dataUrl.indexOf(",");
    const meta = dataUrl.substring(5, commaIdx); // image/png;base64
    const contentType = meta.split(";")[0] || "image/png";
    const base64 = dataUrl.substring(commaIdx + 1);
    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    // Upload to bucket
    const ext = contentType.includes("jpeg") ? "jpg" : "png";
    const filePath = `${userId}/${Date.now()}-result.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("provador")
      .upload(filePath, binary, { contentType, upsert: false });

    if (upErr) {
      console.error("Upload result error:", upErr);
      // Still return data URL fallback so user sees the result
      return new Response(JSON.stringify({ imageUrl: dataUrl }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pub } = supabase.storage.from("provador").getPublicUrl(filePath);
    return new Response(JSON.stringify({ imageUrl: pub.publicUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("virtual-tryon error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
