import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-app-platform, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { favoriteIngredients, specificRequirements, maxCalories } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não está configurada');
    }

    const calorieDistribution = {
      breakfast: 0.25,
      morningSnack: 0.10,
      lunch: 0.35,
      afternoonSnack: 0.10,
      dinner: 0.20,
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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Muitas requisições. Aguarde alguns segundos e tente novamente.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA esgotados. Adicione créditos no workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content: string = data.choices?.[0]?.message?.content ?? '';
    content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

    const menuPlan = JSON.parse(content);

    return new Response(JSON.stringify(menuPlan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na geração do cardápio:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
