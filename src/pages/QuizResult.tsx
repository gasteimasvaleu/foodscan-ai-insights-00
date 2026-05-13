import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export default function QuizResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFB]">Carregando…</div>;
  if (!attempt) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFB]">Sem tentativa.</div>;

  const isPro = attempt.pro_bonus_applied;
  const proExtraIfNot = !isPro ? Math.round(attempt.score * 0.25) : 0;

  return (
    <div className="min-h-screen bg-[#F7FAFB] pb-28 pt-[calc(env(safe-area-inset-top)+4rem)]">
      <div className="max-w-md mx-auto px-4 space-y-4">
        <Card className="bg-[#FFD1E7] rounded-3xl border-0">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto text-[#FD46A1] mb-2" />
            <div className="text-sm text-muted-foreground">Sua pontuação</div>
            <div className="text-5xl font-medium text-[#FD46A1] my-2">{attempt.score}</div>
            <div className="text-base">
              {attempt.correct_count} de {attempt.total_questions} corretas
            </div>
            {attempt.is_perfect && (
              <div className="mt-3 text-sm bg-white inline-block px-3 py-1 rounded-full">Quiz perfeito! 🎉</div>
            )}
            {isPro && (
              <div className="mt-2 text-xs text-muted-foreground">Bônus Pro ×1,25 aplicado</div>
            )}
          </CardContent>
        </Card>

        {!isPro && proExtraIfNot > 0 && (
          <Card className="bg-white rounded-3xl border-0">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="text-sm">
                Com Pro você ganharia <span className="font-medium">+{proExtraIfNot}</span> pontos
              </div>
              <Button size="sm" className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full" onClick={() => navigate("/assinar")}>
                Assinar
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full" onClick={() => navigate("/quiz")}>
            Ver ranking
          </Button>
          <Button className="flex-1 bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full" onClick={() => navigate("/")}>
            Início
          </Button>
        </div>
      </div>
    </div>
  );
}
