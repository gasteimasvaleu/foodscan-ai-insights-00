import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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