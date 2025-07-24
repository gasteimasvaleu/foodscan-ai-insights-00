import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();
    console.log('Analyzing nutrition for description:', description);

    const prompt = `Baseado nesta descrição detalhada de um alimento: "${description}"

ANALISE SE HÁ MÚLTIPLOS ELEMENTOS NO PRATO:

Se houver MÚLTIPLOS elementos distintos (como carne + arroz + feijão + salada), retorne no formato:
{
  "nome_alimento": "Nome do prato completo",
  "descricao": "Descrição do prato",
  "quantidade_referencia": "Porção típica do prato completo",
  "elementos": [
    {
      "nome": "Nome do elemento 1",
      "calorias": valor_por_100g,
      "carboidratos": valor_por_100g,
      "proteinas": valor_por_100g,
      "gorduras": valor_por_100g,
      "fibras": valor_por_100g,
      "sodio": valor_por_100g
    },
    {
      "nome": "Nome do elemento 2",
      "calorias": valor_por_100g,
      ...
    }
  ],
  "calorias": soma_total,
  "carboidratos": soma_total,
  "proteinas": soma_total,
  "gorduras": soma_total,
  "fibras": soma_total,
  "sodio": soma_total
}

Se for UM elemento único, use o formato anterior:
{
  "nome_alimento": "Nome específico do alimento",
  "descricao": "Descrição nutricional",
  "quantidade_referencia": "Porção típica",
  "calorias": número_por_porção,
  "carboidratos": gramas_por_porção,
  "proteinas": gramas_por_porção,
  "gorduras": gramas_por_porção,
  "fibras": gramas_por_porção,
  "sodio": miligramas_por_porção
}

IMPORTANTE: Para múltiplos elementos, calcule valores individuais por 100g de cada elemento.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'Você é um especialista em nutrição que analisa alimentos e fornece informações nutricionais precisas em JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const nutritionAnalysis = data.choices[0].message.content;
    
    console.log('Nutrition analysis result:', nutritionAnalysis);

    // Try to parse the JSON response
    let parsedResult;
    try {
      // Remove markdown formatting if present
      const cleanedResponse = nutritionAnalysis.replace(/```json\n?|\n?```/g, '').trim();
      parsedResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Failed to parse nutrition analysis result');
    }

    return new Response(JSON.stringify(parsedResult), {
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