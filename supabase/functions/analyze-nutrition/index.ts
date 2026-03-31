// v2.1 - 2026-03-27 - Valores por 100g para múltiplos elementos
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
    const { description, base64Image } = await req.json();
    
    let finalDescription = description;
    
    // If base64Image is provided, analyze it first to get description
    if (base64Image) {
      console.log("Analyzing image first...");
      
      const imageAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
          max_tokens: 2050
        })
      });

      if (!imageAnalysisResponse.ok) {
        throw new Error('Failed to analyze image');
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
            content: 'Você é um especialista em nutrição que analisa alimentos e fornece informações nutricionais precisas em JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2050,
      }),
    });

    if (!nutritionResponse.ok) {
      throw new Error(`OpenAI API error: ${nutritionResponse.status}`);
    }

    const data = await nutritionResponse.json();
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

    // If we analyzed an image, extract and preserve the detailed analysis
    let response = parsedResult;
    
    if (base64Image && finalDescription) {
      // Since we're now returning natural text descriptions, just add it to the response
      response = {
        ...parsedResult,
        description: finalDescription
      };
    }

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