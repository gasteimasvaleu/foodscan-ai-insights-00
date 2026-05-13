import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-platform',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PRO_MULTIPLIER = 1.25;
const PERFECT_BONUS = 500;

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

    const { attempt_id } = await req.json();
    if (!attempt_id) return json({ error: 'missing_attempt_id' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: attempt } = await admin
      .from('quiz_attempts')
      .select('*')
      .eq('id', attempt_id)
      .maybeSingle();
    if (!attempt || attempt.user_id !== user.id) return json({ error: 'forbidden' }, 403);
    if (attempt.finished_at) return json({ attempt });

    const { count: totalQ } = await admin
      .from('quiz_questions')
      .select('id', { count: 'exact', head: true })
      .eq('quiz_id', attempt.quiz_id);

    const { data: answers } = await admin
      .from('quiz_attempt_answers')
      .select('is_correct, points_awarded, time_ms')
      .eq('attempt_id', attempt_id);

    const correct = answers?.filter(a => a.is_correct).length ?? 0;
    let score = answers?.reduce((s, a) => s + (a.points_awarded ?? 0), 0) ?? 0;
    const totalTime = answers?.reduce((s, a) => s + (a.time_ms ?? 0), 0) ?? 0;
    const total = totalQ ?? 0;
    const isPerfect = total > 0 && correct === total;

    let perfectBonus = 0;
    if (isPerfect) {
      perfectBonus = attempt.pro_bonus_applied ? Math.round(PERFECT_BONUS * PRO_MULTIPLIER) : PERFECT_BONUS;
      score += perfectBonus;
    }

    const { data: updated, error } = await admin
      .from('quiz_attempts')
      .update({
        finished_at: new Date().toISOString(),
        score,
        correct_count: correct,
        total_questions: total,
        total_time_ms: totalTime,
        is_perfect: isPerfect,
      })
      .eq('id', attempt_id)
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);

    return json({ attempt: updated, perfect_bonus: perfectBonus });
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
