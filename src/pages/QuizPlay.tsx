import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Question {
  id: string;
  position: number;
  prompt: string;
  options: string[];
}

interface Feedback {
  is_correct: boolean;
  correct_index: number;
  explanation: string | null;
  points_awarded: number;
}

export default function QuizPlay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timePerQ, setTimePerQ] = useState(20);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    init();
  }, [user, id]);

  async function init() {
    setLoading(true);
    try {
      const [{ data: quiz }, { data: qs }, { data: startRes, error: startErr }] = await Promise.all([
        supabase.from("quizzes").select("time_per_question_seconds, status").eq("id", id!).maybeSingle(),
        supabase.from("quiz_questions_public").select("*").eq("quiz_id", id!).order("position"),
        supabase.functions.invoke("quiz-start-attempt", { body: { quiz_id: id } }),
      ]);

      if (!quiz || quiz.status !== "published") {
        toast.error("Quiz indisponível");
        navigate("/quiz");
        return;
      }
      if (startErr || (startRes as any)?.error) {
        const err = (startRes as any)?.error;
        if (err === "already_finished") {
          toast.info("Você já finalizou este quiz");
          navigate(`/quiz/${id}/resultado`);
          return;
        }
        toast.error("Erro ao iniciar");
        navigate("/quiz");
        return;
      }
      setQuestions((qs ?? []) as any);
      setAttemptId((startRes as any).attempt.id);
      setTimePerQ(quiz.time_per_question_seconds);
      setTimeLeft(quiz.time_per_question_seconds);
      startedAtRef.current = Date.now();
    } finally {
      setLoading(false);
    }
  }

  // Timer
  useEffect(() => {
    if (loading || feedback || !questions.length) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const left = Math.max(0, timePerQ - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(interval);
        submit(-1);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [loading, idx, feedback, questions.length]);

  async function submit(choice: number) {
    if (submitting || feedback) return;
    setSubmitting(true);
    setChosen(choice);
    const q = questions[idx];
    const time_ms = Math.min(timePerQ * 1000, Date.now() - startedAtRef.current);
    const { data, error } = await supabase.functions.invoke("quiz-submit-answer", {
      body: { attempt_id: attemptId, question_id: q.id, chosen_index: choice, time_ms },
    });
    setSubmitting(false);
    if (error || (data as any)?.error) {
      toast.error("Erro ao enviar resposta");
      return;
    }
    setFeedback(data as Feedback);
    setTimeout(next, 2200);
  }

  async function next() {
    if (idx + 1 >= questions.length) {
      await supabase.functions.invoke("quiz-finish-attempt", { body: { attempt_id: attemptId } });
      navigate(`/quiz/${id}/resultado`);
      return;
    }
    setIdx(i => i + 1);
    setChosen(null);
    setFeedback(null);
    setTimeLeft(timePerQ);
    startedAtRef.current = Date.now();
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFB]">Carregando…</div>;
  }
  if (!questions.length) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFB]">Quiz vazio.</div>;
  }

  const q = questions[idx];
  const progress = ((idx + (feedback ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#F7FAFB] pt-[calc(env(safe-area-inset-top)+1rem)] pb-10">
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Pergunta {idx + 1} de {questions.length}</span>
          <span>{Math.ceil(timeLeft)}s</span>
        </div>
        <Progress value={progress} className="h-2" />
        <Progress value={(timeLeft / timePerQ) * 100} className="h-1" />

        <Card className="bg-white rounded-3xl border-0">
          <CardContent className="p-5">
            <div className="text-base mb-4">{q.prompt}</div>
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const isCorrect = feedback && i === feedback.correct_index;
                const isWrongChoice = feedback && i === chosen && !feedback.is_correct;
                return (
                  <Button
                    key={i}
                    variant="outline"
                    disabled={!!feedback || submitting}
                    onClick={() => submit(i)}
                    className={`w-full justify-start text-left h-auto py-3 text-base whitespace-normal rounded-2xl ${
                      isCorrect ? "bg-green-100 border-green-400" :
                      isWrongChoice ? "bg-red-100 border-red-400" :
                      chosen === i ? "bg-[#FFD1E7]" : ""
                    }`}
                  >
                    {opt}
                  </Button>
                );
              })}
            </div>

            {feedback && (
              <div className="mt-4 p-3 rounded-2xl bg-[#FFD1E7]">
                <div className="text-base font-medium">
                  {feedback.is_correct ? `+${feedback.points_awarded} pontos` : "Resposta incorreta"}
                </div>
                {feedback.explanation && <div className="text-sm mt-1">{feedback.explanation}</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
