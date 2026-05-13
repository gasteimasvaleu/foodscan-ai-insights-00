import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flame, Snowflake, Trophy } from "lucide-react";

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  category: string;
  condition_type: string;
  condition_value: number;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
  streak_freezes: number;
  last_activity_date: string | null;
}

const tierBg: Record<string, string> = {
  bronze: "bg-amber-100",
  prata: "bg-slate-100",
  ouro: "bg-yellow-100",
};

export default function Conquistas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState({ totalMeals: 0, quizPerfect: 0 });
  const [tab, setTab] = useState("todos");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    load();
  }, [user]);

  async function load() {
    if (!user) return;
    const [{ data: s }, { data: b }, { data: ub }, { count: meals }, { count: perfects }] = await Promise.all([
      supabase.from("user_streaks").select("current_streak,longest_streak,streak_freezes,last_activity_date").eq("user_id", user.id).maybeSingle(),
      supabase.from("badges").select("*").eq("is_active", true).order("condition_value"),
      supabase.from("user_badges").select("badge_id").eq("user_id", user.id),
      supabase.from("meal_records").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("quiz_attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_perfect", true),
    ]);
    setStreak(s ?? { current_streak: 0, longest_streak: 0, streak_freezes: 0, last_activity_date: null });
    setBadges((b ?? []) as Badge[]);
    setUnlocked(new Set((ub ?? []).map((r: any) => r.badge_id)));
    setProgress({ totalMeals: meals ?? 0, quizPerfect: perfects ?? 0 });
  }

  function progressFor(b: Badge): number {
    if (b.condition_type === "streak_days") return streak?.current_streak ?? 0;
    if (b.condition_type === "total_meals") return progress.totalMeals;
    if (b.condition_type === "quiz_perfect_count") return progress.quizPerfect;
    return 0;
  }

  const filtered = badges.filter(b => tab === "todos" || b.category === tab);

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)] space-y-4">
        <div className="mb-2">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary">Conquistas</h1>
          </div>
        </div>

        {(() => {
          const current = streak?.current_streak ?? 0;
          const longest = streak?.longest_streak ?? 0;
          const freezes = streak?.streak_freezes ?? 0;
          const milestones = [3, 7, 14, 30, 60, 100];
          const nextMilestone = milestones.find((m) => m > current) ?? null;
          const prevMilestone = [...milestones].reverse().find((m) => m <= current) ?? 0;
          const progress = nextMilestone
            ? Math.min(100, Math.round(((current - prevMilestone) / (nextMilestone - prevMilestone)) * 100))
            : 100;
          const remaining = nextMilestone ? nextMilestone - current : 0;
          return (
            <div className="relative overflow-hidden rounded-[32px] bg-white border border-[#FFD1E7] shadow-xl shadow-pink-100 p-6">
              {/* Background glows */}
              <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-[#FFD1E7] rounded-full blur-3xl opacity-50" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 w-32 h-32 bg-[#FD46A1] rounded-full blur-3xl opacity-10" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 gap-3">
                  <div className="min-w-0">
                    <h3 className="text-foreground text-lg font-bold leading-none mb-1">Sua sequência</h3>
                    <p className="text-[#FD46A1] text-xs font-semibold uppercase tracking-wider">
                      {current === 0 ? "Comece hoje" : nextMilestone ? `Rumo a ${nextMilestone} dias` : "Lendário"}
                    </p>
                  </div>
                  {freezes > 0 && (
                    <div className="flex items-center bg-[#FFD1E7]/40 px-3 py-1.5 rounded-full border border-[#FFD1E7] shrink-0">
                      <Snowflake className="h-3.5 w-3.5 mr-1.5 text-[#FD46A1]" />
                      <span className="text-[#FD46A1] text-[10px] font-bold">
                        {freezes} {freezes === 1 ? "CONGELAMENTO" : "CONGELAMENTOS"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Streak visual */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FD46A1] to-[#ff7eb3] flex items-center justify-center shadow-lg shadow-pink-200 animate-pulse">
                      <Flame className="h-12 w-12 text-white" fill="white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                        Recorde: {longest}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-5xl font-extrabold text-foreground tracking-tight leading-none">
                      {current}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground mt-1">dias seguidos</span>
                  </div>
                </div>

                {/* Progress */}
                {nextMilestone && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-semibold text-foreground/80">
                        Próximo marco: <span className="text-[#FD46A1]">{nextMilestone} dias</span>
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground">
                        {current} / {nextMilestone}
                      </p>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                      <div
                        className="h-full bg-gradient-to-r from-[#FD46A1] to-[#ff8cb8] rounded-full shadow-[0_0_8px_rgba(253,70,161,0.4)] transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Motivational footer */}
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <p className="text-[13px] leading-relaxed text-muted-foreground font-medium">
                    {current === 0
                      ? <>Registre uma refeição hoje para começar sua sequência!</>
                      : nextMilestone
                        ? <>Mantenha o ritmo! Você está a apenas <span className="text-[#FD46A1] font-bold">{remaining} {remaining === 1 ? "dia" : "dias"}</span> de desbloquear o emblema de {nextMilestone} dias.</>
                        : <>Você atingiu o marco máximo. Continue mantendo sua sequência lendária!</>}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="streak">Sequência</TabsTrigger>
            <TabsTrigger value="refeicoes">Refeições</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(b => {
                const isUnlocked = unlocked.has(b.id);
                const cur = progressFor(b);
                const pct = Math.min(100, Math.round((cur / b.condition_value) * 100));
                return (
                  <div
                    key={b.id}
                    className={`relative overflow-hidden rounded-3xl border p-4 text-center transition-all ${
                      isUnlocked
                        ? "bg-white border-[#FD46A1]/40 shadow-lg shadow-pink-100"
                        : "bg-white border-[#FFD1E7] shadow-sm"
                    }`}
                  >
                    {isUnlocked && (
                      <>
                        <div className="pointer-events-none absolute -top-8 -right-8 w-20 h-20 bg-[#FFD1E7] rounded-full blur-2xl opacity-60" />
                        <div className="pointer-events-none absolute -bottom-8 -left-8 w-20 h-20 bg-[#FD46A1] rounded-full blur-2xl opacity-10" />
                      </>
                    )}
                    <div className="relative z-10">
                      <div
                        className={`mx-auto mb-2 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                          isUnlocked
                            ? "bg-gradient-to-br from-[#FD46A1] to-[#ff7eb3] shadow-md shadow-pink-200"
                            : "bg-gray-100"
                        }`}
                      >
                        <span className={isUnlocked ? "" : "grayscale opacity-40"}>{b.icon}</span>
                      </div>
                      <div className="text-sm font-semibold text-foreground line-clamp-1">{b.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[2rem]">
                        {b.description}
                      </div>
                      {!isUnlocked ? (
                        <div className="mt-3">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#FD46A1] to-[#ff8cb8] rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="text-[10px] font-bold text-muted-foreground mt-1">
                            {cur}/{b.condition_value}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFD1E7]/50 border border-[#FFD1E7]">
                          <span className="text-[10px] font-bold text-[#FD46A1] uppercase tracking-wider">
                            Desbloqueada
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
