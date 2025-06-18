
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchTerm, ads } = await req.json()

    if (!searchTerm || !ads) {
      return new Response(
        JSON.stringify({ error: 'Missing searchTerm or ads' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIApiKey) {
      console.log('OpenAI API key not found, falling back to simple search')
      return performSimpleSearch(searchTerm, ads)
    }

    try {
      // Usar OpenAI para busca inteligente
      const filteredAds = await performAISearch(searchTerm, ads, openAIApiKey)
      
      return new Response(
        JSON.stringify({ filteredAds }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } catch (aiError) {
      console.error('AI search failed, falling back to simple search:', aiError)
      return performSimpleSearch(searchTerm, ads)
    }
  } catch (error) {
    console.error('Error in ai-search-nutritionists:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function performAISearch(searchTerm: string, ads: any[], apiKey: string) {
  const specialties = {
    'nutricao_clinica': 'nutrição clínica',
    'nutricao_esportiva': 'nutrição esportiva',
    'nutricao_funcional': 'nutrição funcional',
    'nutricao_estetica': 'nutrição estética',
    'nutricao_materno_infantil': 'nutrição materno-infantil',
    'nutricao_hospitalar': 'nutrição hospitalar',
    'nutricao_coletiva': 'nutrição coletiva',
    'nutricao_saude_publica': 'nutrição em saúde pública'
  }

  // Preparar dados dos anúncios para análise da IA
  const adsData = ads.map((ad, index) => ({
    index,
    city: ad.city,
    state: ad.state,
    specialty: specialties[ad.specialty as keyof typeof specialties] || ad.specialty,
    professionalName: ad.profiles?.name || ad.profile_name || 'Nutricionista',
    phone: `(${ad.phone_ddd}) ${ad.phone_number}`
  }))

  const prompt = `
Você é um assistente especializado em encontrar nutricionistas. Analise a busca do usuário e retorne os índices dos anúncios mais relevantes.

Busca do usuário: "${searchTerm}"

Anúncios disponíveis:
${adsData.map(ad => `${ad.index}: ${ad.professionalName} - ${ad.specialty} - ${ad.city}, ${ad.state}`).join('\n')}

Instruções:
1. Considere sinônimos e variações (ex: "emagrecimento" = "nutrição estética", "esporte" = "nutrição esportiva")
2. Busque por localização (cidade, estado, região)
3. Busque por especialidade ou área de atuação
4. Busque por nome do profissional
5. Seja flexível com a ortografia e abreviações

Retorne APENAS um array JSON com os índices dos anúncios relevantes, ordenados por relevância (mais relevante primeiro).
Exemplo: [2, 5, 1]

Se nenhum anúncio for relevante, retorne um array vazio: []
`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um assistente especializado em busca de nutricionistas. Sempre retorne apenas um array JSON válido com índices.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 200
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const aiResponse = data.choices[0].message.content.trim()
  
  console.log('AI Response:', aiResponse)

  try {
    const relevantIndices = JSON.parse(aiResponse)
    
    if (!Array.isArray(relevantIndices)) {
      throw new Error('AI response is not an array')
    }

    // Filtrar anúncios com base nos índices retornados pela IA
    const filteredAds = relevantIndices
      .filter(index => index >= 0 && index < ads.length)
      .map(index => ads[index])

    return filteredAds
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError)
    throw new Error('Invalid AI response format')
  }
}

function performSimpleSearch(searchTerm: string, ads: any[]) {
  const normalizedSearch = searchTerm.toLowerCase()
  
  const specialties = {
    'nutricao_clinica': 'nutrição clínica',
    'nutricao_esportiva': 'nutrição esportiva',
    'nutricao_funcional': 'nutrição funcional',
    'nutricao_estetica': 'nutrição estética',
    'nutricao_materno_infantil': 'nutrição materno-infantil',
    'nutricao_hospitalar': 'nutrição hospitalar',
    'nutricao_coletiva': 'nutrição coletiva',
    'nutricao_saude_publica': 'nutrição em saúde pública'
  }

  const filteredAds = ads.filter((ad: any) => {
    const searchableText = [
      ad.city,
      ad.state,
      ad.profiles?.name || ad.profile_name || '',
      specialties[ad.specialty as keyof typeof specialties] || ad.specialty,
      ad.phone_ddd,
      ad.phone_number
    ].join(' ').toLowerCase()

    return searchableText.includes(normalizedSearch)
  })

  return new Response(
    JSON.stringify({ filteredAds }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}
