import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { decodeBase64 } from "jsr:@std/encoding@1/base64";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-app-platform, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    console.log("generate-social-image: request received");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "config" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      console.error("generate-social-image: auth failed", userErr?.message);
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = userData.user.id;

    const { theme, post_type, style } = await req.json();
    if (!theme) {
      return new Response(JSON.stringify({ error: "invalid_input" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const isVertical = post_type === "story" || post_type === "reel";
    const dims = isVertical ? "vertical 1080x1920 (proporção 9:16)" : "quadrada 1080x1080 (proporção 1:1)";
    const safeArea = isVertical
      ? "Mantenha margem segura de 15% em todas as bordas — sujeito principal centralizado no terço central vertical, longe do topo e da base (onde o Instagram coloca avatar e barra de resposta)."
      : "Mantenha margem segura de 8% em todas as bordas, com sujeito principal bem centralizado.";

    const imagePrompt = `Imagem ${dims} para post de Instagram de nutricionista.
Tema: ${theme}.
Estilo visual: ${style || "moderno, clean, fotografia profissional de alimentos saudáveis, luz natural, cores quentes e apetitosas"}.
Composição puramente visual focada em alimentos, ingredientes, pratos, mesa posta ou ambiente — sem nenhum elemento textual.
${safeArea}

REGRA ABSOLUTA: a imagem NÃO PODE conter NENHUM texto, letras, palavras, números, frases, legendas, títulos, rótulos, logos, marcas, assinaturas ou marcas d'água. Apenas elementos visuais (comida, objetos, cenário). Zero tipografia. Zero caracteres escritos.

Alta qualidade, paleta harmônica, sem texto, sem letras, sem watermark.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-image-2.5-sunburst",
        prompt: imagePrompt,
        size: isVertical ? "1024x1536" : "1024x1024",
        quality: "medium",
        output_format: "jpeg",
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "rate_limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "no_credits" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("image AI error", aiResp.status, txt.slice(0, 500));
      return new Response(JSON.stringify({ error: "ai_error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResp.json();
    console.log("generate-social-image: AI responded", aiResp.status);
    const b64Out: string | undefined = aiData?.data?.[0]?.b64_json;
    if (!b64Out) {
      console.error("no image returned", JSON.stringify(aiData).slice(0, 400));
      return new Response(JSON.stringify({ error: "no_image" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const mime = "image/jpeg";
    const ext = "jpg";
    const bytes = decodeBase64(b64Out.replace(/\s/g, ""));

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const fileName = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await adminClient.storage
      .from("social-posts")
      .upload(fileName, bytes, { contentType: mime, upsert: false });
    if (upErr) {
      console.error("storage upload error", upErr);
      return new Response(JSON.stringify({ error: "upload_failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    console.log("generate-social-image: uploaded", fileName, bytes.length);
    const { data: pub } = adminClient.storage.from("social-posts").getPublicUrl(fileName);

    return new Response(JSON.stringify({ image_url: pub.publicUrl, path: fileName }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-social-image error", e);
    return new Response(JSON.stringify({ error: "server_error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
