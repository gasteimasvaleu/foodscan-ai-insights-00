
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

    // Busca simples por enquanto (pode ser expandida com OpenAI depois)
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
        ad.profiles?.name || '',
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
