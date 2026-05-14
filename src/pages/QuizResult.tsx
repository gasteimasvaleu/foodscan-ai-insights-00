import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Sparkles, ArrowRight } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import confetti from "canvas-confetti";

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

  const confettiFired = useRef(false);
  useEffect(() => {
    if (!attempt || confettiFired.current) return;
    confettiFired.current = true;
    const colors = ["#FD46A1", "#FF6FB3", "#FFD1E7", "#ffffff"];
    const isPerfect = !!attempt.is_perfect;

    confetti({
      particleCount: isPerfect ? 180 : 120,
      spread: 80,
      startVelocity: 45,
      origin: { y: 0.35 },
      colors,
      zIndex: 9999,
    });
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 70, origin: { x: 0, y: 0.6 }, colors, zIndex: 9999 });
    }, 200);
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1, y: 0.6 }, colors, zIndex: 9999 });
    }, 400);
    if (isPerfect) {
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 120, startVelocity: 35, origin: { y: 0.4 }, colors, zIndex: 9999 });
      }, 700);
    }
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
        <div className="relative overflow-hidden rounded-[32px] bg-white border border-[#FFD1E7] shadow-xl shadow-pink-100 p-6">
          {/* Background glows */}
          <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-[#FFD1E7] rounded-full blur-3xl opacity-50" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 w-32 h-32 bg-[#FD46A1] rounded-full blur-3xl opacity-10" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 gap-3">
              <div className="min-w-0">
                <h3 className="text-foreground text-lg font-bold leading-none mb-1">Seu resultado</h3>
                <p className="text-[#FD46A1] text-xs font-semibold uppercase tracking-wider">
                  Quiz concluído
                </p>
              </div>
              {attempt.is_perfect && (
                <div className="flex items-center bg-[#FFD1E7]/40 px-3 py-1.5 rounded-full border border-[#FFD1E7] shrink-0">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#FD46A1]" />
                  <span className="text-[#FD46A1] text-[10px] font-bold">QUIZ PERFEITO</span>
                </div>
              )}
            </div>

            {/* Score visual */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FD46A1] to-[#ff7eb3] flex items-center justify-center shadow-lg shadow-pink-200">
                  <Trophy className="h-12 w-12 text-white" fill="white" />
                </div>
                {isPro && (
                  <div className="absolute -bottom-2 -right-2 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100 flex items-center gap-1">
                    <Crown className="h-3 w-3 text-[#FD46A1]" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                      Pro ×1,25
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-5xl font-extrabold text-foreground tracking-tight leading-none tabular-nums">
                  {Math.round(animatedScore)}
                </span>
                <span className="text-sm font-medium text-muted-foreground mt-1">pontos</span>
              </div>
            </div>

            {/* Acertos / Progress */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <p className="text-xs font-semibold text-foreground/80">
                  Acertos: <span className="text-[#FD46A1]">{attempt.correct_count} de {attempt.total_questions}</span>
                </p>
                <p className="text-[10px] font-bold text-muted-foreground">
                  {Math.round(progress)}%
                </p>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                <div
                  className="h-full bg-gradient-to-r from-[#FD46A1] to-[#ff8cb8] rounded-full shadow-[0_0_8px_rgba(253,70,161,0.4)] transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="text-[13px] leading-relaxed text-muted-foreground font-medium">
                {attempt.is_perfect
                  ? <>Pontuação perfeita! Você dominou o tema 🏆</>
                  : progress >= 70
                    ? <>Ótimo desempenho — continue jogando para subir no <span className="text-[#FD46A1] font-bold">ranking</span>!</>
                    : <>Bom começo! Tente outro quiz para somar mais pontos.</>}
              </p>
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
