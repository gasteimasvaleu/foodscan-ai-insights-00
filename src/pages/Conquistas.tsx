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

        <Card className="bg-[#FFD1E7] rounded-3xl border-0">
          <CardContent className="p-5">
            <div className="text-base mb-2">Sua sequência</div>
            <div className="flex items-end gap-3">
              <Flame className="h-10 w-10 text-[#FD46A1]" />
              <div>
                <div className="text-4xl font-semibold leading-none">{streak?.current_streak ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">dias seguidos</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-muted-foreground">Recorde</div>
                <div className="text-lg">{streak?.longest_streak ?? 0} dias</div>
              </div>
            </div>
            {(streak?.streak_freezes ?? 0) > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <Snowflake className="h-4 w-4 text-blue-500" />
                <span>{streak?.streak_freezes} congelamento(s) disponível(eis)</span>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-3">
              Registre pelo menos 1 refeição por dia para manter sua sequência.
            </div>
          </CardContent>
        </Card>

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
                  <Card
                    key={b.id}
                    className={`rounded-3xl border-0 ${isUnlocked ? tierBg[b.tier] ?? "bg-[#FFD1E7]" : "bg-white"}`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`text-4xl mb-2 ${isUnlocked ? "" : "grayscale opacity-40"}`}>
                        {b.icon}
                      </div>
                      <div className="text-sm">{b.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.description}</div>
                      {!isUnlocked && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-[#FD46A1]" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {cur}/{b.condition_value}
                          </div>
                        </div>
                      )}
                      {isUnlocked && (
                        <div className="text-[10px] text-[#FD46A1] mt-2">Desbloqueada</div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
