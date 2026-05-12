const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Suggestion {
  name: string;
  meaning: string;
  origin: string;
  gender: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { mode = 'generate', gender, initialLetter, origin, length, searchQuery } = await req.json();
    const KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!KEY) throw new Error('LOVABLE_API_KEY not configured');

    const filters: string[] = [];
    if (gender && gender !== 'any') {
      filters.push({ male: 'masculinos', female: 'femininos', unisex: 'unissex' }[gender as 'male'|'female'|'unisex']);
    }
    if (initialLetter && initialLetter !== 'any') filters.push(`começando com a letra ${initialLetter}`);
    if (origin && origin !== 'any') filters.push(`de origem ${origin}`);
    if (length && length !== 'any') {
      filters.push({ short: 'curtos (até 5 letras)', medium: 'médios (6-8 letras)', long: 'longos (mais de 8 letras)' }[length as 'short'|'medium'|'long']);
    }

    const isSearch = mode === 'search' && searchQuery;
    const userPrompt = isSearch
      ? `Forneça informações sobre o nome de bebê "${searchQuery}". Inclua significado, origem cultural, gênero (male/female/unisex), variações comuns e curiosidades. Se o nome for muito incomum ou não existir, indique found=false.`
      : `Sugira 5 nomes de bebê reais e populares ${filters.length ? filters.join(', ') : ''}. Para cada um, inclua nome, significado curto (até 2 frases), origem cultural e gênero (male/female/unisex). Diversifique as sugestões.`;

    const tool = isSearch ? {
      type: 'function',
      function: {
        name: 'return_name',
        description: 'Retorna informações sobre um nome',
        parameters: {
          type: 'object',
          properties: {
            result: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                meaning: { type: 'string' },
                origin: { type: 'string' },
                gender: { type: 'string', enum: ['male','female','unisex'] },
                variations: { type: 'array', items: { type: 'string' } },
                funFacts: { type: 'string' },
                found: { type: 'boolean' },
              },
              required: ['name','meaning','origin','gender','found'],
            },
          },
          required: ['result'],
        },
      },
    } : {
      type: 'function',
      function: {
        name: 'return_names',
        description: 'Retorna lista de sugestões de nomes',
        parameters: {
          type: 'object',
          properties: {
            names: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  meaning: { type: 'string' },
                  origin: { type: 'string' },
                  gender: { type: 'string', enum: ['male','female','unisex'] },
                },
                required: ['name','meaning','origin','gender'],
              },
            },
          },
          required: ['names'],
        },
      },
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um especialista em onomástica e nomes de bebê. Use sempre nomes reais e seja informativo.' },
          { role: 'user', content: userPrompt },
        ],
        tools: [tool],
        tool_choice: { type: 'function', function: { name: tool.function.name } },
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
      return new Response(JSON.stringify({ error: 'Falha ao consultar IA' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error('Resposta vazia da IA');
    const parsed = JSON.parse(args);

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('suggest-baby-names error:', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
