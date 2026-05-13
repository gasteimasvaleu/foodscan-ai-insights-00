import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-platform',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

    const { quiz_id } = await req.json();
    if (!quiz_id) return json({ error: 'missing quiz_id' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: existing } = await admin
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', quiz_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      if (existing.finished_at) return json({ error: 'already_finished', attempt: existing }, 409);
      return json({ attempt: existing });
    }

    const { data: quiz, error: qErr } = await admin
      .from('quizzes')
      .select('id, status')
      .eq('id', quiz_id)
      .maybeSingle();
    if (qErr || !quiz || quiz.status !== 'published') return json({ error: 'quiz_not_available' }, 404);

    const { data: totalQ } = await admin
      .from('quiz_questions')
      .select('id', { count: 'exact', head: true })
      .eq('quiz_id', quiz_id);

    const { data: sub } = await admin
      .from('subscribers')
      .select('subscribed')
      .eq('user_id', user.id)
      .maybeSingle();
    const isPro = !!sub?.subscribed;

    const { data: attempt, error } = await admin
      .from('quiz_attempts')
      .insert({
        quiz_id,
        user_id: user.id,
        total_questions: (totalQ as any)?.length ?? 0,
        pro_bonus_applied: isPro,
      })
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);

    return json({ attempt });
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
