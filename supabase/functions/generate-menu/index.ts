
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
    const { favoriteIngredients, specificRequirements, maxCalories } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não está configurada');
    }

    // Distribui as calorias entre as refeições
    const calorieDistribution = {
      breakfast: 0.25,      // 25%
      morningSnack: 0.10,   // 10%
      lunch: 0.35,          // 35%
      afternoonSnack: 0.10, // 10%
      dinner: 0.20          // 20%
    };

    const prompt = `Você é um chef especialista em nutrição. Crie um cardápio completo para 1 dia com 5 refeições baseado nas seguintes informações:

PREFERÊNCIAS DO USUÁRIO:
- Ingredientes favoritos: ${favoriteIngredients}
- Especificações especiais: ${specificRequirements || 'Nenhuma especificação especial'}
- Total de calorias para o dia todo: ${maxCalories} calorias

DISTRIBUIÇÃO DE CALORIAS:
- Café da Manhã: ${Math.round(maxCalories * calorieDistribution.breakfast)} calorias (25%)
- Lanche da Manhã: ${Math.round(maxCalories * calorieDistribution.morningSnack)} calorias (10%)
- Almoço: ${Math.round(maxCalories * calorieDistribution.lunch)} calorias (35%)
- Lanche da Tarde: ${Math.round(maxCalories * calorieDistribution.afternoonSnack)} calorias (10%)
- Jantar: ${Math.round(maxCalories * calorieDistribution.dinner)} calorias (20%)

IMPORTANTE:
- Use PRIORITARIAMENTE os ingredientes favoritos mencionados
- Respeite as especificações especiais (vegano, sem glúten, etc.)
- Cada refeição deve ter aproximadamente as calorias especificadas
- Inclua receitas práticas e realistas
- Use ingredientes facilmente encontrados no Brasil

RESPONDA APENAS com um JSON VÁLIDO no formato:
{
  "breakfast": {
    "name": "Nome da receita",
    "recipe": "Lista de ingredientes separados por vírgula",
    "instructions": "Modo de preparo passo a passo numerado",
    "calories": número_de_calorias,
    "time": "tempo de preparo",
    "servings": 1
  },
  "morningSnack": { ... },
  "lunch": { ... },
  "afternoonSnack": { ... },
  "dinner": { ... }
}

NÃO adicione \`\`\`json ou \`\`\` na resposta, apenas o JSON puro.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Limpar markdown se houver
    content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    
    console.log('Resposta da IA:', content);
    
    // Parse do JSON retornado pela IA
    const menuPlan = JSON.parse(content);

    return new Response(JSON.stringify(menuPlan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na geração do cardápio:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
