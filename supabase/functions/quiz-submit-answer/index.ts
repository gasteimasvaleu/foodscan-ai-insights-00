import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const PRO_MULTIPLIER = 1.25;
const BASE_POINTS = 100;
const MAX_SPEED_BONUS = 100;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'unauthorized' }, 401);
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: 'unauthorized' }, 401);

    const { attempt_id, question_id, chosen_index, time_ms } = await req.json();
    if (!attempt_id || !question_id || chosen_index == null)
      return json({ error: 'missing_fields' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: attempt } = await admin
      .from('quiz_attempts')
      .select('id, user_id, quiz_id, finished_at, pro_bonus_applied')
      .eq('id', attempt_id)
      .maybeSingle();
    if (!attempt || attempt.user_id !== user.id) return json({ error: 'forbidden' }, 403);
    if (attempt.finished_at) return json({ error: 'already_finished' }, 409);

    const { data: question } = await admin
      .from('quiz_questions')
      .select('id, quiz_id, correct_index, explanation')
      .eq('id', question_id)
      .maybeSingle();
    if (!question || question.quiz_id !== attempt.quiz_id) return json({ error: 'invalid_question' }, 400);

    const { data: quiz } = await admin
      .from('quizzes')
      .select('time_per_question_seconds')
      .eq('id', attempt.quiz_id)
      .maybeSingle();
    const limitMs = (quiz?.time_per_question_seconds ?? 20) * 1000;

    const isCorrect = Number(chosen_index) === question.correct_index;
    let points = 0;
    if (isCorrect) {
      const t = Math.max(0, Math.min(limitMs, Number(time_ms ?? limitMs)));
      const speedBonus = Math.round(MAX_SPEED_BONUS * (1 - t / limitMs));
      points = BASE_POINTS + speedBonus;
      if (attempt.pro_bonus_applied) points = Math.round(points * PRO_MULTIPLIER);
    }

    await admin.from('quiz_attempt_answers').upsert({
      attempt_id,
      question_id,
      chosen_index: Number(chosen_index),
      is_correct: isCorrect,
      time_ms: Number(time_ms ?? 0),
      points_awarded: points,
    }, { onConflict: 'attempt_id,question_id' });

    return json({
      is_correct: isCorrect,
      correct_index: question.correct_index,
      explanation: question.explanation,
      points_awarded: points,
      pro_bonus_applied: attempt.pro_bonus_applied,
    });
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
