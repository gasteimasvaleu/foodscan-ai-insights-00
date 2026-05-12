const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { motherImage, fatherImage } = await req.json();
    if (!motherImage || !fatherImage) {
      return new Response(JSON.stringify({ error: 'Envie ambas as fotos (mãe e pai)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!KEY) throw new Error('LOVABLE_API_KEY not configured');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Generate a photorealistic image of a baby that combines facial features of these two parents. The baby should have a natural blend of skin tone, eye color, hair color and facial structure. Soft lighting, neutral background, peaceful and adorable newborn. Ultra high resolution.' },
            { type: 'image_url', image_url: { url: motherImage } },
            { type: 'image_url', image_url: { url: fatherImage } },
          ],
        }],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Gateway error', response.status, text);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Muitas requisições. Tente em instantes.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos esgotados. Contate o suporte.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'Erro ao gerar imagem' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      console.error('No image in response', data);
      return new Response(JSON.stringify({ error: 'Nenhuma imagem foi gerada' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ imageUrl }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('generate-baby error:', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
