import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import VideoOverlay from "@/components/VideoOverlay";

interface Question {
  question_id: string;
  question_position: number;
  prompt: string;
  options: string[];
}

interface Feedback {
  is_correct: boolean;
  correct_index: number;
  explanation: string | null;
  points_awarded: number;
}

interface QuizMeta {
  title: string;
  theme: string;
}

export default function QuizPlay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizMeta, setQuizMeta] = useState<QuizMeta | null>(null);
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
        supabase.from("quizzes").select("title, theme, time_per_question_seconds, status").eq("id", id!).maybeSingle(),
        supabase.rpc("get_quiz_play_questions", { _quiz_id: id }),
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
      setQuizMeta({ title: quiz.title, theme: quiz.theme });
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
      body: { attempt_id: attemptId, question_id: q.question_id, chosen_index: choice, time_ms },
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
    return (
      <div className="min-h-screen bg-background pb-32">
        <Navbar />
        <VideoOverlay isVisible={true} message="Preparando seu quiz..." subMessage="Carregando as perguntas" />
      </div>
    );
  }
  if (!questions.length) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <Navbar />
        <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)] text-center text-muted-foreground">
          Quiz vazio.
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const progress = ((idx + (feedback ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)] space-y-4">
        {/* Header card */}
        <div className="w-full bg-[#FFD1E7] rounded-[32px] p-1 shadow-[0_20px_50px_rgba(253,70,161,0.15)]">
          <div className="bg-white/40 rounded-[28px] p-5 flex flex-col gap-3 border border-white/50 backdrop-blur-sm">
            <div className="flex justify-between items-start gap-2">
              {quizMeta?.theme && (
                <span className="px-3 py-1 bg-white/90 text-[#FD46A1] text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm truncate max-w-[60%]">
                  {quizMeta.theme}
                </span>
              )}
              <div className="flex items-center gap-1.5 bg-[#FD46A1] px-3 py-1 rounded-full shadow-sm shadow-pink-300">
                <span className="text-white text-[10px] font-bold">
                  Pergunta {idx + 1} / {questions.length}
                </span>
              </div>
            </div>

            {quizMeta?.title && (
              <h1 className="text-xl font-bold text-[#FD46A1] leading-tight">{quizMeta.title}</h1>
            )}

            <div className="space-y-2">
              <Progress value={progress} className="h-2 bg-white/60 [&>div]:bg-[#FD46A1]" />
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[#FD46A1] font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.ceil(timeLeft)}s restantes
                </span>
                <span className="text-[#FD46A1]/60 font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={(timeLeft / timePerQ) * 100} className="h-1 bg-white/60 [&>div]:bg-[#FD46A1]" />
            </div>
          </div>
        </div>

        {/* Question card */}
        <Card className="bg-white rounded-[28px] border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="text-base mb-4">{q.prompt}</div>
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const isCorrect = feedback && i === feedback.correct_index;
                const isWrongChoice = feedback && i === chosen && !feedback.is_correct;
                const isPicked = !feedback && chosen === i;
                return (
                  <Button
                    key={i}
                    variant="outline"
                    disabled={!!feedback || submitting}
                    onClick={() => submit(i)}
                    className={`w-full justify-start text-left h-auto py-3 text-base whitespace-normal rounded-2xl ${
                      isCorrect ? "bg-green-100 border-green-400" :
                      isWrongChoice ? "bg-red-100 border-red-400" :
                      isPicked ? "bg-[#FD46A1] text-white border-[#FD46A1] hover:bg-[#FD46A1]" : ""
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
