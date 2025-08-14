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
                  text: `Analise esta imagem de comida e forneça uma análise culinária completa e estruturada em formato JSON.

INSTRUÇÕES PARA ANÁLISE ROBUSTA:

1. IDENTIFICAÇÃO DETALHADA DOS ALIMENTOS:
   - Identifique todos os alimentos visíveis com máxima precisão
   - Seja específico sobre tipos, cortes e variedades (ex: "filé de salmão atlântico grelhado" não apenas "peixe")
   - Identifique temperos, ervas, molhos, acompanhamentos e guarnições
   - Detecte ingredientes parcialmente visíveis ou misturados

2. ANÁLISE PROFUNDA DE MÉTODOS DE PREPARO:
   - Identifique todos os métodos de preparo utilizados para cada alimento
   - Detecte sinais visuais específicos (marcas de grill, douração, crostas, caramelização)
   - Analise equipamentos/utensílios provavelmente utilizados (grill, frigideira, forno, vapor, etc.)
   - Estime tempo de preparo baseado na aparência visual
   - Identifique técnicas culinárias específicas (refogado, braseado, salteado, etc.)

3. ESTIMATIVAS QUANTITATIVAS PRECISAS:
   - Use múltiplas referências visuais (talheres, pratos, mãos, objetos conhecidos)
   - Estime peso em gramas considerando densidade dos alimentos
   - Calcule volume em ml para líquidos
   - Descreva porções usando medidas caseiras precisas
   - Considere contexto da porção (individual, para compartilhar, etc.)

4. ANÁLISE SENSORIAL E QUALITATIVA:
   - Analise textura visual (crocante, macio, suculento, firme, etc.)
   - Examine coloração e o que indica sobre o preparo
   - Avalie sinais de frescor e qualidade
   - Detecte indicadores de temperatura (vapor, derretimento, condensação)
   - Analise apresentação e técnicas de emplatamento

5. ANÁLISE CULINÁRIA COMPLETA:
   - Identifique estilo culinário/origem (brasileiro, italiano, asiático, etc.)
   - Detecte técnicas de cocção específicas
   - Analise harmonização de sabores aparente
   - Avalie complexidade do prato

FORMATO DE RESPOSTA JSON ESTRUTURADO:
{
  "analysis_summary": "Resumo executivo da análise culinária completa",
  "overall_confidence": "Alto/Médio/Baixo - confiança geral da análise",
  "total_estimated_weight": "peso total aproximado com unidade",
  "cuisine_analysis": {
    "cooking_style": "estilo culinário identificado",
    "complexity_level": "Simples/Moderado/Complexo",
    "presentation_quality": "análise da apresentação",
    "temperature_indicators": "sinais de temperatura observados"
  },
  "foods_identified": [
    {
      "name": "Nome específico e detalhado do alimento",
      "detailed_description": "Descrição completa com características específicas",
      "category": "categoria nutricional principal",
      "preparation_analysis": {
        "primary_method": "método principal de preparo",
        "secondary_methods": ["métodos adicionais utilizados"],
        "cooking_tools": ["equipamentos/utensílios provavelmente usados"],
        "cooking_indicators": "sinais visuais do preparo",
        "estimated_cooking_time": "tempo estimado de preparo",
        "cooking_level": "nível de cocção detalhado"
      },
      "texture_analysis": "análise da textura visual",
      "color_analysis": "análise da coloração e significado",
      "size_reference": "referência específica de tamanho",
      "quantity_analysis": {
        "estimated_weight_grams": "peso estimado em gramas",
        "portion_description": "descrição detalhada da porção",
        "volume_if_liquid": "volume em ml se aplicável",
        "density_consideration": "considerações sobre densidade"
      },
      "seasoning_analysis": {
        "visible_seasonings": ["temperos e ervas visíveis"],
        "probable_seasonings": ["temperos prováveis mas não claramente visíveis"],
        "sauce_analysis": "análise de molhos se presentes"
      },
      "quality_indicators": {
        "freshness_signs": "sinais de frescor",
        "cooking_quality": "qualidade aparente do preparo",
        "visual_appeal": "apelo visual do item"
      },
      "nutritional_preview": {
        "macronutrient_profile": "perfil principal de macronutrientes",
        "caloric_density": "densidade calórica estimada",
        "health_indicators": "indicadores visuais de saudabilidade"
      },
      "confidence_level": "Alto/Médio/Baixo",
      "observations": "observações específicas e detalhadas"
    }
  ],
  "comprehensive_observations": {
    "hidden_ingredients": "possíveis ingredientes não claramente visíveis",
    "cooking_sequence": "sequência provável de preparo do prato",
    "flavor_harmony": "análise da harmonização de sabores",
    "visual_composition": "composição visual do prato"
  },
  "dietary_compatibility": {
    "dietary_restrictions": "restrições dietéticas compatíveis",
    "allergen_analysis": "possíveis alérgenos identificados",
    "nutritional_balance": "equilíbrio nutricional aparente"
  },
  "serving_context": {
    "meal_type": "tipo de refeição provável",
    "serving_style": "estilo de servir",
    "cultural_context": "contexto cultural se identificável"
  }
}

RESPONDA APENAS COM O JSON ESTRUTURADO, SEM TEXTO ADICIONAL.`
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
          max_tokens: 1500
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
  "nutrition": {
    "calories": número_por_porção,
    "carbohydrates": gramas_por_porção,
    "proteins": gramas_por_porção,
    "fats": gramas_por_porção,
    "fiber": gramas_por_porção,
    "sodium": miligramas_por_porção
  }
}

IMPORTANTE: Para múltiplos elementos, calcule valores individuais por 100g de cada elemento.`;

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
        max_tokens: 1500,
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
      try {
        // Parse the image analysis to extract detailed information
        const cleanedImageAnalysis = finalDescription.replace(/```json\n?|\n?```/g, '').trim();
        const imageAnalysisData = JSON.parse(cleanedImageAnalysis);
        
        // Preserve all the robust analysis data from the image
        response = {
          ...parsedResult,
          description: finalDescription,
          analysis_summary: imageAnalysisData.analysis_summary,
          overall_confidence: imageAnalysisData.overall_confidence,
          total_estimated_weight: imageAnalysisData.total_estimated_weight,
          cuisine_analysis: imageAnalysisData.cuisine_analysis,
          foods_identified: imageAnalysisData.foods_identified,
          comprehensive_observations: imageAnalysisData.comprehensive_observations,
          dietary_compatibility: imageAnalysisData.dietary_compatibility,
          serving_context: imageAnalysisData.serving_context
        };
        
        // Map the detailed foods_identified to elements with nutrition
        if (imageAnalysisData.foods_identified && parsedResult.elements) {
          response.elements = parsedResult.elements.map((element, index) => {
            const detailedFood = imageAnalysisData.foods_identified[index];
            if (detailedFood) {
              return {
                ...element,
                detailed_description: detailedFood.detailed_description,
                category: detailedFood.category,
                preparation_analysis: detailedFood.preparation_analysis,
                texture_analysis: detailedFood.texture_analysis,
                color_analysis: detailedFood.color_analysis,
                size_reference: detailedFood.size_reference,
                quantity_analysis: detailedFood.quantity_analysis,
                seasoning_analysis: detailedFood.seasoning_analysis,
                quality_indicators: detailedFood.quality_indicators,
                nutritional_preview: detailedFood.nutritional_preview,
                confidence_level: detailedFood.confidence_level,
                observations: detailedFood.observations
              };
            }
            return element;
          });
        }
        
      } catch (parseError) {
        console.error('Error parsing image analysis:', parseError);
        // Fallback to simple format if parsing fails
        response = {
          description: finalDescription,
          ...parsedResult
        };
      }
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