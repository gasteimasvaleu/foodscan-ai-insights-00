import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Sparkles, Target, ArrowRight } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

export default function QuizResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", id!)
        .eq("user_id", user.id)
        .maybeSingle();
      setAttempt(data);
      setLoading(false);
    })();
  }, [user, id]);

  const score = attempt?.score ?? 0;
  const animatedScore = useCountUp(score, 1500);

  useEffect(() => {
    if (!attempt) return;
    const pct = attempt.total_questions > 0
      ? (attempt.correct_count / attempt.total_questions) * 100
      : 0;
    const t = setTimeout(() => setProgress(pct), 200);
    return () => clearTimeout(t);
  }, [attempt]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFB] pt-[calc(env(safe-area-inset-top)+4rem)]">
        <Navbar />
        <div className="max-w-md mx-auto px-4 space-y-4">
          <div className="h-64 rounded-3xl bg-[#FFD1E7] animate-pulse" />
          <div className="h-20 rounded-3xl bg-[#FFD1E7]/60 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-[#F7FAFB] pt-[calc(env(safe-area-inset-top)+4rem)]">
        <Navbar />
        <div className="max-w-md mx-auto px-4 text-center text-muted-foreground">
          Sem tentativa registrada.
        </div>
      </div>
    );
  }

  const isPro = attempt.pro_bonus_applied;
  const proExtraIfNot = !isPro ? Math.round(attempt.score * 0.25) : 0;

  return (
    <div className="min-h-screen bg-[#F7FAFB] pb-28 pt-[calc(env(safe-area-inset-top)+4rem)]">
      <Navbar />
      <div className="max-w-md mx-auto px-4 space-y-4 animate-fade-in">
        {/* Hero card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FD46A1] via-[#FF6FB3] to-[#FF9DCB] text-white shadow-xl">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 w-56 h-56 rounded-full bg-white/15 blur-3xl" />

          <div className="relative p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 animate-scale-in">
              <Trophy className="h-8 w-8 text-white" />
            </div>

            <div className="text-sm text-white/85">Sua pontuação</div>
            <div className="text-7xl font-bold tabular-nums leading-none my-2 drop-shadow-sm">
              {Math.round(animatedScore)}
            </div>

            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-sm">
              <Target className="h-3.5 w-3.5" />
              <span>
                {attempt.correct_count} de {attempt.total_questions} corretas
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full mt-5">
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-[11px] text-white/80 mt-1.5">
                {Math.round(progress)}% de acerto
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {attempt.is_perfect && (
                <div className="inline-flex items-center gap-1 bg-white text-[#FD46A1] rounded-full px-3 py-1 text-xs font-medium animate-fade-in">
                  <Sparkles className="h-3.5 w-3.5" />
                  Quiz perfeito!
                </div>
              )}
              {isPro && (
                <div className="inline-flex items-center gap-1 bg-white/25 backdrop-blur-md rounded-full px-3 py-1 text-xs font-medium">
                  <Crown className="h-3.5 w-3.5" />
                  Bônus Pro ×1,25
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pro upsell */}
        {!isPro && proExtraIfNot > 0 && (
          <Card className="bg-white rounded-3xl border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFD1E7] flex items-center justify-center flex-shrink-0">
                <Crown className="h-5 w-5 text-[#FD46A1]" />
              </div>
              <div className="flex-1 text-sm">
                Com Pro você ganharia{" "}
                <span className="font-medium text-[#FD46A1]">+{proExtraIfNot}</span>{" "}
                pontos nesse quiz
              </div>
              <Button
                size="sm"
                className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full"
                onClick={() => navigate("/assinar")}
              >
                Assinar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Next steps */}
        <div className="space-y-2 pt-1">
          <Button
            className="w-full h-12 bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full text-base font-medium"
            onClick={() => navigate("/quiz")}
          >
            Jogar outro quiz
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="ghost"
            className="w-full text-[#FD46A1] hover:bg-[#FFD1E7]/40 rounded-full"
            onClick={() => navigate("/quiz")}
          >
            Ver ranking completo
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:bg-transparent rounded-full"
            onClick={() => navigate("/")}
          >
            Voltar para o início
          </Button>
        </div>
      </div>
    </div>
  );
}
