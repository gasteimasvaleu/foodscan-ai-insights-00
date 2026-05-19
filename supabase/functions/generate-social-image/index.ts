import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-app-platform",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
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
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = userData.user.id;

    const { theme, post_type, style } = await req.json();
    if (!theme) {
      return new Response(JSON.stringify({ error: "invalid_input" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const imagePrompt = `Imagem quadrada 1080x1080 para post de Instagram de nutricionista, em português do Brasil.
Tipo: ${post_type || "dica"}.
Tema: ${theme}.
Estilo visual: ${style || "moderno, clean, cores quentes, fotografia de alimentos saudáveis quando aplicável"}.
Pode conter um texto curto e legível em português (máximo 6 palavras) como título principal.
Composição centralizada, alta qualidade, paleta harmônica, sem marcas d'água.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: imagePrompt }],
        modalities: ["image", "text"],
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
      console.error("image AI error", aiResp.status, txt);
      return new Response(JSON.stringify({ error: "ai_error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResp.json();
    const dataUrl: string | undefined = aiData?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!dataUrl || !dataUrl.startsWith("data:")) {
      console.error("no image returned", JSON.stringify(aiData).slice(0, 400));
      return new Response(JSON.stringify({ error: "no_image" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // data:image/png;base64,xxx
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
    if (!match) {
      return new Response(JSON.stringify({ error: "bad_image" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const mime = match[1];
    const ext = mime.split("/")[1].replace("jpeg", "jpg");
    const b64 = match[2];
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const fileName = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await adminClient.storage
      .from("social-posts")
      .upload(fileName, bytes, { contentType: mime, upsert: false });
    if (upErr) {
      console.error("storage upload error", upErr);
      return new Response(JSON.stringify({ error: "upload_failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: pub } = adminClient.storage.from("social-posts").getPublicUrl(fileName);

    return new Response(JSON.stringify({ image_url: pub.publicUrl, path: fileName }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-social-image error", e);
    return new Response(JSON.stringify({ error: "server_error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
