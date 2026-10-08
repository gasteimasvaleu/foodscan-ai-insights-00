import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-platform, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function callAI(system: string, user: string, key: string): Promise<string | null> {
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai/gpt-6-astra',
      reasoning_effort: 'low',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) {
    console.error('translation AI error', res.status, (await res.text()).slice(0, 300));
    return null;
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function translateText(text: string, from: string, to: string, key: string): Promise<string> {
  const out = await callAI(`Translate the following text from ${from} to ${to}. Return ONLY the translation, nothing else.`, text, key);
  return out || text;
}

async function translateBatch(items: string[], from: string, to: string, key: string): Promise<string[]> {
  if (!items.length) return [];
  const numbered = items.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const text = await callAI(`Translate each numbered line from ${from} to ${to}. Keep the same numbered format, one per line. Return ONLY the translations.`, numbered, key);
  if (!text) return items;
  const lines = text.split('\n').map((l: string) => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
  return lines.length === items.length ? lines : items;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('SPOONACULAR_API_KEY');
    const openaiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'SPOONACULAR_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, query, id, diet, cuisine, number = 12, offset = 0 } = await req.json();

    if (action === 'search') {
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'Query is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Translate query PT→EN
      let translatedQuery = query.trim();
      if (openaiKey) {
        try {
          translatedQuery = await translateText(translatedQuery, 'Portuguese', 'English', openaiKey);
        } catch (e) {
          console.error('Translation error:', e);
        }
      }

      const params = new URLSearchParams({
        apiKey,
        query: translatedQuery.slice(0, 100),
        number: String(Math.min(Math.max(1, number), 20)),
        offset: String(Math.max(0, offset)),
        addRecipeNutrition: 'true',
        fillIngredients: 'true',
      });

      if (diet && typeof diet === 'string') params.set('diet', diet);
      if (cuisine && typeof cuisine === 'string') params.set('cuisine', cuisine);

      const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`);
      const data = await response.json();

      // Translate titles EN→PT
      if (openaiKey && data.results?.length) {
        try {
          const titles = data.results.map((r: any) => r.title);
          const translated = await translateBatch(titles, 'English', 'Portuguese', openaiKey);
          data.results.forEach((r: any, i: number) => {
            r.originalTitle = r.title;
            r.title = translated[i];
          });
        } catch (e) {
          console.error('Title translation error:', e);
        }
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'details') {
      if (!id || typeof id !== 'number') {
        return new Response(JSON.stringify({ error: 'Recipe ID is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const params = new URLSearchParams({ apiKey, includeNutrition: 'true' });
      const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?${params.toString()}`);
      const data = await response.json();

      // Translate details EN→PT
      if (openaiKey) {
        try {
          // Translate title
          data.originalTitle = data.title;
          data.title = await translateText(data.title, 'English', 'Portuguese', openaiKey);

          // Translate ingredients
          if (data.extendedIngredients?.length) {
            const originals = data.extendedIngredients.map((i: any) => i.original || i.name);
            const translated = await translateBatch(originals, 'English', 'Portuguese', openaiKey);
            data.extendedIngredients.forEach((ing: any, i: number) => {
              ing.originalText = ing.original;
              ing.original = translated[i];
            });
          }

          // Translate analyzedInstructions steps
          if (data.analyzedInstructions?.[0]?.steps?.length) {
            const steps = data.analyzedInstructions[0].steps;
            const stepTexts = steps.map((s: any) => s.step);
            const translatedSteps = await translateBatch(stepTexts, 'English', 'Portuguese', openaiKey);
            steps.forEach((s: any, i: number) => {
              s.originalStep = s.step;
              s.step = translatedSteps[i];
            });
          }

          // Translate instructions
          if (data.instructions) {
            data.originalInstructions = data.instructions;
            data.instructions = await translateText(data.instructions, 'English', 'Portuguese', openaiKey);
          }
        } catch (e) {
          console.error('Details translation error:', e);
        }
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action. Use "search" or "details".' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
