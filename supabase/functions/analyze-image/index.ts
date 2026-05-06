import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-platform',
}

const FOODSCAN_DAILY_LIMIT = 3
const todayISO = () => new Date().toISOString().slice(0, 10)

type QuotaResult =
  | { ok: true; commit: () => Promise<void> }
  | { ok: false; response: Response }

async function enforceFoodscanQuota(req: Request): Promise<QuotaResult> {
  const platform = req.headers.get('x-app-platform') ?? 'web'
  if (platform !== 'ios-native') {
    return { ok: true, commit: async () => {} }
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }),
    }
  }
  const token = authHeader.replace('Bearer ', '')

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token)
  if (claimsError || !claimsData?.claims?.sub) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }),
    }
  }
  const userId = claimsData.claims.sub as string

  const { data: sub } = await supabaseAdmin
    .from('subscribers')
    .select('subscribed')
    .eq('user_id', userId)
    .maybeSingle()
  if (sub?.subscribed) {
    return { ok: true, commit: async () => {} }
  }

  const today = todayISO()
  const { data: existing } = await supabaseAdmin
    .from('daily_usage_limits')
    .select('id, count')
    .eq('user_id', userId)
    .eq('feature', 'foodscan')
    .eq('usage_date', today)
    .maybeSingle()

  const currentCount = existing?.count ?? 0
  if (currentCount >= FOODSCAN_DAILY_LIMIT) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: 'quota_exceeded', feature: 'foodscan' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      ),
    }
  }

  const commit = async () => {
    const newCount = currentCount + 1
    if (existing) {
      await supabaseAdmin
        .from('daily_usage_limits')
        .update({ count: newCount })
        .eq('id', existing.id)
    } else {
      await supabaseAdmin.from('daily_usage_limits').insert({
        user_id: userId,
        feature: 'foodscan',
        usage_date: today,
        count: newCount,
      })
    }
  }
  return { ok: true, commit }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const quota = await enforceFoodscanQuota(req)
    if (!quota.ok) return quota.response

    const { base64Image } = await req.json()

    if (!base64Image) {
      return new Response(
        JSON.stringify({ error: 'Base64 image is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analise esta imagem de comida e forneça uma descrição detalhada mas objetiva com informações nutricionais.

INSTRUÇÕES:
- Identifique todos os alimentos visíveis
- Descreva ingredientes principais de cada item
- Estime quantidades/porções aproximadas (ex: "150g", "1 xícara", "1 unidade")
- Mencione método de preparo quando visível (grelhado, frito, assado, cozido)
- Se houver múltiplos itens, liste cada um separadamente
- Seja específico (ex: "peito de frango grelhado" ao invés de apenas "frango")

CÁLCULO NUTRICIONAL OBRIGATÓRIO:
Após listar os alimentos, adicione uma seção com o cálculo nutricional TOTAL da refeição:
- Calorias (kcal)
- Proteínas (g)
- Carboidratos (g)
- Gorduras (g)

Use valores nutricionais típicos dos alimentos identificados e suas porções estimadas.

FORMATO DA RESPOSTA:
Liste cada alimento em uma linha, com porção e preparo.
Depois adicione uma linha em branco e as informações nutricionais no formato exato:

NUTRIÇÃO: X kcal | Yg proteínas | Zg carboidratos | Wg gorduras

Exemplo:
- Peito de frango grelhado (~150g)
- Arroz branco cozido (1 xícara, ~150g)
- Salada verde com tomate (1 porção)
- Molho de tomate caseiro (2 colheres de sopa)

NUTRIÇÃO: 450 kcal | 35g proteínas | 55g carboidratos | 8g gorduras`
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
        max_tokens: 1000
      })
    })

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openAIData = await openAIResponse.json()
    const description = openAIData.choices[0]?.message?.content

    if (!description) {
      return new Response(
        JSON.stringify({ error: 'No description generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    await quota.commit()

    return new Response(
      JSON.stringify({ description }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in analyze-image function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
