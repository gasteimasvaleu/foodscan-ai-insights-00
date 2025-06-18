
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
    const { analysis, goals, consumed } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não está configurada');
    }

    // Calcular proximidade às metas
    const calorieProximity = Math.abs(consumed.calories - goals.calories) / goals.calories;
    const carbProximity = goals.carbohydrates > 0 ? Math.abs(consumed.carbohydrates - goals.carbohydrates) / goals.carbohydrates : 0;
    const proteinProximity = goals.proteins > 0 ? Math.abs(consumed.proteins - goals.proteins) / goals.proteins : 0;
    const fatProximity = Math.abs(consumed.fats - goals.fats) / goals.fats;

    const prompt = `Você é um nutricionista divertido e motivacional. Analise o desempenho nutricional do usuário e dê uma avaliação honesta mas encorajadora.

DADOS DO USUÁRIO:
- Objetivo: ${goals.diet_objective}
- Metas: ${goals.calories} kcal, ${goals.carbohydrates}g carbs, ${goals.proteins}g proteínas, ${goals.fats}g gorduras
- Consumido: ${consumed.calories} kcal, ${consumed.carbohydrates}g carbs, ${consumed.proteins}g proteínas, ${consumed.fats}g gorduras

ANÁLISE PRÉVIA:
${analysis}

INSTRUÇÕES:
1. Dê uma nota de 0 a 10 baseada na proximidade às metas e qualidade nutricional
2. Se muito abaixo das calorias (>50% deficit) = nota baixa
3. Se muito acima das calorias (>30% excess) = nota baixa  
4. Quanto mais próximo das metas, melhor a nota
5. Considere também o equilíbrio nutricional

RESPONDA APENAS com um JSON VÁLIDO no formato:
{"score": número_de_0_a_10, "feedback": "feedback_motivacional_divertido_e_específico_max_300_palavras"}

IMPORTANTE:
- Para notas 8-10: Seja festivo mas alerte para não se acomodar
- Para notas 6-7: Seja encorajador e dê dicas específicas
- Para notas 4-5: Seja firme mas motivacional
- Para notas 0-3: Seja duro mas sempre termine com encorajamento
- Use emojis e seja bem específico sobre os números
- Fale sobre as consequências reais do que aconteceu
- NÃO USE markdown, apenas JSON puro
- NÃO adicione \`\`\`json ou \`\`\` na resposta`;

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
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Limpar markdown se houver
    content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    
    // Parse do JSON retornado pela IA
    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.error('Conteúdo recebido:', content);
      
      // Fallback se a IA não retornar JSON válido
      analysisResult = {
        score: 5,
        feedback: content || "Análise não disponível no momento. Continue se esforçando! 💪"
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na análise Truth Moment:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      score: 5,
      feedback: "Ops! Houve um erro na análise, mas não desista! Continue seguindo suas metas nutricionais. 🚀"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
