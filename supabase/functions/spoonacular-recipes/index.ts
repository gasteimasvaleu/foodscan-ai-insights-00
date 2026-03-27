import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('SPOONACULAR_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'SPOONACULAR_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, query, id, diet, cuisine, number = 12, offset = 0 } = await req.json();

    if (action === 'search') {
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'Query is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const params = new URLSearchParams({
        apiKey,
        query: query.trim().slice(0, 100),
        number: String(Math.min(Math.max(1, number), 20)),
        offset: String(Math.max(0, offset)),
        addRecipeNutrition: 'true',
        fillIngredients: 'true',
      });

      if (diet && typeof diet === 'string') params.set('diet', diet);
      if (cuisine && typeof cuisine === 'string') params.set('cuisine', cuisine);

      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`
      );
      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'details') {
      if (!id || typeof id !== 'number') {
        return new Response(JSON.stringify({ error: 'Recipe ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const params = new URLSearchParams({
        apiKey,
        includeNutrition: 'true',
      });

      const response = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?${params.toString()}`
      );
      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action. Use "search" or "details".' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
