
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

    const prompt = `Você é o JUIZ SUPREMO da nutrição - direto, sem papas na língua, mas sempre motivacional.

📊 DADOS DO USUÁRIO:
- Objetivo: ${goals.diet_objective}
- Metas: ${goals.calories} kcal | ${goals.carbohydrates}g carbs | ${goals.proteins}g proteínas | ${goals.fats}g gorduras
- Consumido: ${consumed.calories} kcal | ${consumed.carbohydrates}g carbs | ${consumed.proteins}g proteínas | ${consumed.fats}g gorduras

🎯 SUA MISSÃO:
Dê uma NOTA de 0 a 10 e um feedback CURTÍSSIMO e IMPACTANTE (máximo 150 palavras).

📏 CRITÉRIOS DE NOTA:
- 9-10: Bateu 90-110% das metas (GUERREIRO!)
- 7-8: Entre 80-120% das metas (BOM TRABALHO)
- 5-6: Entre 70-130% das metas (DÁ PRA MELHORAR)
- 3-4: Muito longe das metas (ATENÇÃO)
- 0-2: Ignorou completamente as metas (CRÍTICO)

🎭 ESTILO DO FEEDBACK:
- Use analogias divertidas (ex: "Você treinou igual Rocky Balboa!")
- Seja específico sobre OS NÚMEROS (ex: "bateu 97% das proteínas")
- Tom: 70% motivacional + 30% realista
- Para notas altas: Celebre mas desafie a manter
- Para notas baixas: Seja duro mas termine com esperança
- Use emojis estrategicamente (2-4 no máximo)
- NÃO repita informações da análise anterior
- Seja DIRETO e CURTO (máximo 150 palavras)

RETORNE APENAS JSON VÁLIDO:
{"score": 0-10, "feedback": "texto_impactante_max_150_palavras"}

IMPORTANTE:
- NÃO USE markdown, apenas JSON puro
- NÃO adicione \`\`\`json ou \`\`\` na resposta`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: 'Você é um coach de nutrição gamificado. Seja direto, impactante e motivacional.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 300
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
