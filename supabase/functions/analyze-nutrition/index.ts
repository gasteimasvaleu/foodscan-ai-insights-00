// v3.0 - 2026-07-02 - Migrado para Lovable AI Gateway (google/gemini-3-flash-preview)
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const AI_MODEL = 'google/gemini-3-flash-preview';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-platform',
};

const FOODSCAN_DAILY_LIMIT = 3;
const todayISO = () => new Date().toISOString().slice(0, 10);

type QuotaResult =
  | { ok: true; commit: () => Promise<void> }
  | { ok: false; response: Response };

async function enforceFoodscanQuota(req: Request): Promise<QuotaResult> {
  const platform = req.headers.get('x-app-platform') ?? 'web';
  if (platform !== 'ios-native') {
    return { ok: true, commit: async () => {} };
  }
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }),
    };
  }
  const token = authHeader.replace('Bearer ', '');
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }),
    };
  }
  const userId = claimsData.claims.sub as string;
  const { data: sub } = await supabaseAdmin
    .from('subscribers')
    .select('subscribed')
    .eq('user_id', userId)
    .maybeSingle();
  if (sub?.subscribed) return { ok: true, commit: async () => {} };

  const today = todayISO();
  const { data: existing } = await supabaseAdmin
    .from('daily_usage_limits')
    .select('id, count')
    .eq('user_id', userId)
    .eq('feature', 'foodscan')
    .eq('usage_date', today)
    .maybeSingle();
  const currentCount = existing?.count ?? 0;
  if (currentCount >= FOODSCAN_DAILY_LIMIT) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: 'quota_exceeded', feature: 'foodscan' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      ),
    };
  }
  const commit = async () => {
    const newCount = currentCount + 1;
    if (existing) {
      await supabaseAdmin
        .from('daily_usage_limits')
        .update({ count: newCount })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin.from('daily_usage_limits').insert({
        user_id: userId,
        feature: 'foodscan',
        usage_date: today,
        count: newCount,
      });
    }
  };
  return { ok: true, commit };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const quota = await enforceFoodscanQuota(req);
    if (!quota.ok) return quota.response;

    const { description, base64Image } = await req.json();
    
    let finalDescription = description;
    
    // If base64Image is provided, analyze it first to get description
    if (base64Image) {
      console.log("Analyzing image first...");
      
      const imageAnalysisResponse = await fetch(AI_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analise esta imagem de comida e descreva detalhadamente o que você vê.

Comece com uma descrição geral do prato, depois detalhe cada alimento usando o formato:

**Nome do Alimento** (~Xg): Descrição detalhada incluindo método de preparo, características visuais, temperos aparentes, textura e qualidade.

IMPORTANTE: Estime o peso aproximado em gramas de cada alimento visível no prato, baseando-se no tamanho visual, proporções do prato/recipiente e referências comuns. Inclua a estimativa entre parênteses após o nome, no formato (~Xg).

Exemplo:
"Este prato apresenta uma refeição típica brasileira com arroz, feijão e carne grelhada. **Arroz Branco** (~150g): Grãos soltos e bem cozidos, preparados de forma tradicional, apresentando coloração branca uniforme e textura macia. **Feijão Preto** (~120g): Caldo escuro e cremoso, tempero aparentemente caseiro com cebola e alho, textura consistente típica do feijão bem refogado."

Mantenha o texto natural e fluido, sem usar estruturas de lista ou markdown pesado. Foque na descrição visual e culinária dos alimentos.

IMPORTANTE: Retorne APENAS o texto descritivo, sem JSON ou outras estruturas.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
        })
      });

      if (!imageAnalysisResponse.ok) {
        const errorBody = await imageAnalysisResponse.text();
        console.error(`AI Gateway (image) error ${imageAnalysisResponse.status}: ${errorBody}`);
        if (imageAnalysisResponse.status === 429) {
          return new Response(JSON.stringify({ error: 'rate_limit', message: 'Muitas requisições. Tente novamente em instantes.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (imageAnalysisResponse.status === 402) {
          return new Response(JSON.stringify({ error: 'payment_required', message: 'Créditos de IA esgotados. Adicione créditos no workspace Lovable.' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error(`AI Gateway image analysis failed: ${imageAnalysisResponse.status} - ${errorBody.slice(0, 200)}`);
      }

      const imageData = await imageAnalysisResponse.json();
      finalDescription = imageData.choices[0]?.message?.content;
      
      if (!finalDescription) {
        throw new Error('No description generated from image');
      }
      
      console.log("Image description generated:", finalDescription);
    }

    
    console.log('Analyzing nutrition for description:', finalDescription);

    const prompt = `Baseado nesta descrição detalhada de um alimento: "${finalDescription}"

ANALISE SE HÁ MÚLTIPLOS ELEMENTOS NO PRATO:

Se houver MÚLTIPLOS elementos distintos (como carne + arroz + feijão + salada), retorne no formato:
{
  "foodName": "Nome do prato completo",
  "description": "Descrição do prato",
  "quantity": "Porção típica do prato completo",
  "elements": [
    {
      "name": "Nome do elemento 1",
      "estimated_weight": peso_estimado_em_gramas,
      "nutrition": {
        "calories": valor_por_100g,
        "carbohydrates": valor_por_100g,
        "proteins": valor_por_100g,
        "fats": valor_por_100g,
        "fiber": valor_por_100g,
        "sodium": valor_por_100g
      }
    }
  ],
  "nutrition": {
    "calories": soma_total,
    "carbohydrates": soma_total,
    "proteins": soma_total,
    "fats": soma_total,
    "fiber": soma_total,
    "sodium": soma_total
  }
}

Se for UM elemento único, use o formato:
{
  "foodName": "Nome específico do alimento",
  "description": "Descrição nutricional",
  "quantity": "Porção típica",
  "estimated_weight": peso_estimado_em_gramas,
  "nutrition": {
    "calories": número_por_porção,
    "carbohydrates": gramas_por_porção,
    "proteins": gramas_por_porção,
    "fats": gramas_por_porção,
    "fiber": gramas_por_porção,
    "sodium": miligramas_por_porção
  }
}

IMPORTANTE: 
- Para múltiplos elementos, calcule valores nutricionais por 100g de cada elemento.
- Se a descrição contiver estimativas de peso (ex: ~150g), use esses valores no campo "estimated_weight".
- Se não houver estimativa na descrição, estime o peso baseado em porções típicas brasileiras.
- O campo "estimated_weight" representa quanto daquele alimento está no prato (em gramas).`;

    const nutritionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em nutrição que analisa alimentos e fornece informações nutricionais precisas. RESPONDA APENAS COM UM OBJETO JSON VÁLIDO, sem texto antes ou depois, sem explicações, sem markdown.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2050,
        response_format: { type: 'json_object' },
      }),
    });

    if (!nutritionResponse.ok) {
      throw new Error(`OpenAI API error: ${nutritionResponse.status}`);
    }

    const data = await nutritionResponse.json();
    const nutritionAnalysis = data.choices[0].message.content;
    
    console.log('Nutrition analysis result:', nutritionAnalysis);

    // Try to parse the JSON response (tolerant to extra text after JSON)
    let parsedResult;
    try {
      const cleanedResponse = nutritionAnalysis.replace(/```json\n?|\n?```/g, '').trim();
      try {
        parsedResult = JSON.parse(cleanedResponse);
      } catch {
        // Fallback: extract first balanced JSON object (respecting strings/escapes)
        const start = cleanedResponse.indexOf('{');
        if (start === -1) throw new Error('No JSON object found');
        let depth = 0;
        let inStr = false;
        let escape = false;
        let end = -1;
        for (let i = start; i < cleanedResponse.length; i++) {
          const ch = cleanedResponse[i];
          if (escape) { escape = false; continue; }
          if (ch === '\\') { escape = true; continue; }
          if (ch === '"') { inStr = !inStr; continue; }
          if (inStr) continue;
          if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) { end = i; break; }
          }
        }
        if (end === -1) throw new Error('Unbalanced JSON object');
        parsedResult = JSON.parse(cleanedResponse.slice(start, end + 1));
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Failed to parse nutrition analysis result');
    }

    // If we analyzed an image, extract and preserve the detailed analysis
    let response = parsedResult;
    
    if (base64Image && finalDescription) {
      // Since we're now returning natural text descriptions, just add it to the response
      response = {
        ...parsedResult,
        description: finalDescription
      };
    }

    await quota.commit();

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-nutrition function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to analyze nutrition' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});