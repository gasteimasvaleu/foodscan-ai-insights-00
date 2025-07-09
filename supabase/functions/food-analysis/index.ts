import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  image: string; // base64 image
  type: 'food' | 'label';
  description?: string; // optional description for food analysis
}

interface NutritionData {
  foodName: string;
  description: string;
  quantity: string;
  nutrition: {
    calories: number;
    carbohydrates: number;
    proteins: number;
    fats: number;
    fiber: number;
    sodium: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, type, description }: AnalysisRequest = await req.json();

    if (!image || !type) {
      throw new Error('Imagem e tipo de análise são obrigatórios');
    }

    if (!openAIApiKey) {
      throw new Error('Chave da OpenAI não configurada');
    }

    console.log(`Iniciando análise ${type}...`);

    let prompt = '';
    
    if (type === 'food') {
      prompt = `Analise este alimento na imagem e forneça informações nutricionais estimadas.

${description ? `Descrição adicional: ${description}` : ''}

Retorne APENAS um JSON válido no formato:
{
  "nome_alimento": "Nome específico do alimento",
  "descricao": "Descrição nutricional",
  "quantidade_referencia": "Porção típica (ex: 100g, 1 fatia média, 1 xícara, 1 unidade média)",
  "calorias": número_por_porção,
  "carboidratos": gramas_por_porção,
  "proteinas": gramas_por_porção,
  "gorduras": gramas_por_porção,
  "fibras": gramas_por_porção,
  "sodio": miligramas_por_porção
}

IMPORTANTE: Identifique uma porção típica realista do alimento e calcule os valores nutricionais para essa porção específica. Por exemplo:
- Pizza: 1 fatia média (120g)
- Maçã: 1 unidade média (180g)
- Arroz: 1 xícara cozida (150g)
- Pão: 1 fatia (25g)

Todos os valores devem ser números reais baseados na porção identificada.`;
    } else {
      prompt = `Analise este rótulo nutricional e extraia as informações nutricionais EXATAS que aparecem no rótulo.

IMPORTANTE: 
- Extraia apenas os valores que estão claramente visíveis no rótulo
- Se a porção for por 100g, mantenha os valores para 100g
- Se a porção for diferente (ex: 1 fatia, 1 xícara), use exatamente essa porção
- NÃO invente valores, use apenas o que está escrito

Retorne APENAS um JSON válido no formato:
{
  "nome_alimento": "Nome do produto conforme aparece no rótulo",
  "descricao": "Descrição do produto e informações adicionais",
  "quantidade_referencia": "Porção conforme aparece no rótulo (ex: 100g, 1 fatia (30g), 1 xícara (240ml))",
  "calorias": valor_numerico,
  "carboidratos": valor_numerico,
  "proteinas": valor_numerico,
  "gorduras": valor_numerico,
  "fibras": valor_numerico,
  "sodio": valor_numerico_em_mg
}

Todos os valores devem ser números baseados na porção especificada no rótulo.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: [{
            type: "text",
            text: prompt
          }, {
            type: "image_url",
            image_url: {
              url: image
            }
          }]
        }],
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro da OpenAI: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Resposta da OpenAI:', content);

    try {
      const nutritionInfo = JSON.parse(content);
      
      const result: NutritionData = {
        foodName: nutritionInfo.nome_alimento || "Alimento identificado",
        description: nutritionInfo.descricao || "Informações nutricionais do alimento analisado",
        quantity: nutritionInfo.quantidade_referencia || "100g",
        nutrition: {
          calories: parseNutritionValue(nutritionInfo.calorias),
          carbohydrates: parseNutritionValue(nutritionInfo.carboidratos),
          proteins: parseNutritionValue(nutritionInfo.proteinas),
          fats: parseNutritionValue(nutritionInfo.gorduras),
          fiber: parseNutritionValue(nutritionInfo.fibras),
          sodium: parseNutritionValue(nutritionInfo.sodio)
        }
      };

      console.log('Análise concluída com sucesso:', result);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('Erro ao parsear resposta da OpenAI:', parseError);
      throw new Error('Não foi possível processar a resposta da IA. Verifique se a imagem está nítida.');
    }

  } catch (error) {
    console.error('Erro na análise:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function parseNutritionValue(value: any): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  if (typeof value === 'string') {
    const cleanValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? 0 : numericValue;
  }
  return 0;
}