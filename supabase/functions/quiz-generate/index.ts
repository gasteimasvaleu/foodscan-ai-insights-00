import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-app-platform, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type GeneratedQuestion = {
  prompt?: unknown;
  options?: unknown;
  correct_index?: unknown;
  explanation?: unknown;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'unauthorized' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: 'unauthorized' }, 401);

    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) return json({ error: 'forbidden' }, 403);

    const body = await req.json();
    const theme = String(body.theme ?? 'geral');
    const difficulty = String(body.difficulty ?? 'medio');
    const numQuestions = Math.min(20, Math.max(3, Number(body.num_questions ?? 5)));
    const title = body.title ? String(body.title).slice(0, 200) : '';
    const description = body.description ? String(body.description).slice(0, 1000) : '';

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) return json({ error: 'missing LOVABLE_API_KEY' }, 500);

    const systemPrompt = `Você é um criador de quizzes em português brasileiro sobre saúde, nutrição, hidratação, treinos, gestação e bem-estar feminino. Cada pergunta deve ser clara, com 4 alternativas plausíveis, exatamente uma correta, e uma explicação curta da resposta. Sem ambiguidade, sem "todas as alternativas".`;
    const contextLines = [
      title && `Título do quiz: "${title}"`,
      description && `Descrição/contexto fornecida pelo admin: "${description}"`,
      `Tema: "${theme}"`,
      `Dificuldade: ${difficulty}`,
    ].filter(Boolean).join('\n');
    const userPrompt = `${contextLines}\n\nGere ${numQuestions} perguntas de quiz coerentes com o título e a descrição acima. Se o título e a descrição forem específicos, foque nesse subtema; caso estejam vazios, use o tema geral. Sugira também um título curto e uma descrição de 1 frase para o quiz (eles podem ser usados como sugestão se o admin não tiver preenchido).`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'emit_quiz',
            description: 'Emite o quiz gerado',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                questions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      prompt: { type: 'string' },
                      options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
                      correct_index: { type: 'integer', minimum: 0, maximum: 3 },
                      explanation: { type: 'string' },
                    },
                    required: ['prompt', 'options', 'correct_index', 'explanation'],
                  },
                },
              },
              required: ['title', 'description', 'questions'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'emit_quiz' } },
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error('AI error', aiRes.status, text);
      if (aiRes.status === 429) return json({ error: 'rate_limited' }, 429);
      if (aiRes.status === 402) return json({ error: 'payment_required' }, 402);
      return json({ error: 'ai_failed' }, 500);
    }

    const data = await aiRes.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) return json({ error: 'no_tool_call' }, 500);

    let args: unknown;
    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error('Invalid AI JSON', parseError, toolCall.function.arguments);
      return json({ error: 'invalid_ai_json' }, 500);
    }

    const quiz = normalizeQuiz(args, numQuestions);
    if (!quiz) return json({ error: 'invalid_ai_response' }, 500);
    return json({ quiz });
  } catch (e) {
    console.error(e);
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

function normalizeQuiz(value: unknown, expectedCount: number) {
  if (!value || typeof value !== 'object') return null;
  const raw = value as { title?: unknown; description?: unknown; questions?: unknown };
  if (!Array.isArray(raw.questions) || raw.questions.length < 1) return null;

  const questions = raw.questions
    .slice(0, expectedCount)
    .map((question: GeneratedQuestion) => {
      const options = Array.isArray(question.options)
        ? question.options.map((option) => String(option ?? '').trim()).slice(0, 4)
        : [];
      const correctIndex = Number(question.correct_index);

      if (
        typeof question !== 'object' ||
        !String(question.prompt ?? '').trim() ||
        options.length !== 4 ||
        options.some((option) => !option) ||
        !Number.isInteger(correctIndex) ||
        correctIndex < 0 ||
        correctIndex > 3
      ) {
        return null;
      }

      return {
        prompt: String(question.prompt).trim(),
        options,
        correct_index: correctIndex,
        explanation: String(question.explanation ?? '').trim(),
      };
    })
    .filter(Boolean);

  if (questions.length < 1) return null;
  return {
    title: String(raw.title ?? 'Quiz gerado por IA').trim() || 'Quiz gerado por IA',
    description: String(raw.description ?? '').trim(),
    questions,
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
