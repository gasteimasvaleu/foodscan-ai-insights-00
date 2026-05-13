import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Trophy, HelpCircle, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  difficulty: string;
  time_per_question_seconds: number;
}

interface RankRow {
  user_id: string;
  name: string;
  avatar_url: string | null;
  is_pro: boolean;
  total_score: number;
  attempts_count: number;
}

export default function Quiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [ranking, setRanking] = useState<RankRow[]>([]);
  const [period, setPeriod] = useState<"weekly" | "monthly" | "all_time">("weekly");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    load();
  }, [user]);

  useEffect(() => { loadRanking(period); }, [period]);

  async function load() {
    setLoading(true);
    const [{ data: qs }, { data: attempts }, { data: sub }] = await Promise.all([
      supabase.from("quizzes").select("*").eq("status", "published").order("published_at", { ascending: false }),
      supabase.from("quiz_attempts").select("quiz_id, finished_at").eq("user_id", user!.id),
      supabase.from("subscribers").select("subscribed").eq("user_id", user!.id).maybeSingle(),
    ]);
    setQuizzes((qs ?? []) as Quiz[]);
    setDoneIds(new Set((attempts ?? []).filter(a => a.finished_at).map(a => a.quiz_id)));
    setIsPro(!!sub?.subscribed);

    const ids = (qs ?? []).map(q => q.id);
    if (ids.length) {
      const { data: counts } = await supabase
        .from("quiz_questions")
        .select("quiz_id")
        .in("quiz_id", ids);
      const map: Record<string, number> = {};
      (counts ?? []).forEach((r: any) => { map[r.quiz_id] = (map[r.quiz_id] ?? 0) + 1; });
      setQuestionCounts(map);
    }
    setLoading(false);
  }

  async function loadRanking(p: typeof period) {
    const { data, error } = await supabase.rpc("get_quiz_ranking", { period: p });
    if (error) { toast.error("Erro ao carregar ranking"); return; }
    setRanking((data ?? []) as RankRow[]);
  }

  async function play(id: string) {
    if (doneIds.has(id)) {
      toast.info("Você já jogou este quiz");
      return;
    }
    navigate(`/quiz/${id}`);
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)] space-y-4">
        <div className="mb-2">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary">Quiz</h1>
          </div>
        </div>

        {!isPro && (
          <div className="relative overflow-hidden rounded-3xl bg-white border border-[#FD46A1]/40 shadow-xl shadow-pink-100 p-4">
            {/* Background glows */}
            <div className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 bg-[#FFD1E7] rounded-full blur-3xl opacity-60" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 w-28 h-28 bg-[#FD46A1] rounded-full blur-3xl opacity-10" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FD46A1] to-[#ff7eb3] flex items-center justify-center shadow-md shadow-pink-200 shrink-0">
                <Sparkles className="w-6 h-6 text-white" fill="white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#FD46A1] mb-0.5">
                  Exclusivo Pro
                </p>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  +25% de pontos <span className="text-muted-foreground font-medium">em todo quiz</span>
                </p>
              </div>
              <Button
                size="sm"
                className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full shadow-md shadow-pink-200 shrink-0 gap-1"
                onClick={() => navigate("/assinar")}
              >
                Assinar
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        <Tabs defaultValue="disponiveis">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="disponiveis">Disponíveis</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
          </TabsList>

          <TabsContent value="disponiveis" className="space-y-3 mt-4">
            {loading && <div className="text-center py-8 text-muted-foreground">Carregando...</div>}
            {!loading && quizzes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-base">Nenhum quiz disponível ainda.</div>
            )}
            {quizzes.map(q => {
              const done = doneIds.has(q.id);
              return (
                <Card key={q.id} className="bg-[#FFD1E7] rounded-3xl border-0 cursor-pointer" onClick={() => play(q.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-base">{q.title}</div>
                        {q.description && <div className="text-sm text-muted-foreground mt-1">{q.description}</div>}
                        <div className="text-xs text-muted-foreground mt-2">
                          {q.theme} · {q.difficulty} · {questionCounts[q.id] ?? 0} perguntas · {q.time_per_question_seconds}s/pergunta
                        </div>
                      </div>
                      {done && <span className="text-xs bg-white px-2 py-1 rounded-full">✓ feito</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="ranking" className="space-y-3 mt-4">
            <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="weekly">Semanal</TabsTrigger>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                <TabsTrigger value="all_time">Geral</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="space-y-2">
              {ranking.length === 0 && <div className="text-center py-8 text-muted-foreground">Nenhuma pontuação ainda.</div>}
              {ranking.map((r, i) => (
                <Card key={r.user_id} className={`rounded-2xl border-0 ${r.user_id === user?.id ? "bg-[#FFD1E7]" : "bg-white"}`}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-8 text-center text-base">
                      {i === 0 ? <Trophy className="h-5 w-5 mx-auto text-yellow-500" /> : `#${i + 1}`}
                    </div>
                    {r.avatar_url ? (
                      <img src={r.avatar_url} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-base flex items-center gap-1">
                        <span className="truncate">{r.name}</span>
                        {r.is_pro && <Crown className="h-3.5 w-3.5 text-yellow-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">{r.attempts_count} quizzes</div>
                    </div>
                    <div className="text-base font-medium text-[#FD46A1]">{r.total_score}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
