import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface Q {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

const THEMES = ["geral", "nutrição", "hidratação", "treino", "maternidade", "sono", "jejum"];
const DIFFS = ["facil", "medio", "dificil"];

export default function AdminQuiz() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
      setChecking(false);
      if (data) loadList();
    });
  }, [user, authLoading]);

  async function loadList() {
    const { data } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false });
    setQuizzes(data ?? []);
  }

  async function openEditor(quiz: any | null) {
    if (quiz) {
      const { data: qs } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quiz.id).order("position");
      setQuestions((qs ?? []).map((q: any) => ({
        prompt: q.prompt,
        options: q.options as string[],
        correct_index: q.correct_index,
        explanation: q.explanation ?? "",
      })));
      setEditing(quiz);
    } else {
      setEditing({
        title: "",
        description: "",
        theme: "geral",
        difficulty: "medio",
        time_per_question_seconds: 20,
        num_questions: 5,
        status: "draft",
      });
      setQuestions([]);
    }
  }

  async function generate() {
    if (!editing) return;
    const theme = editing.theme || "geral";
    const difficulty = editing.difficulty || "medio";
    const num_questions = Math.min(20, Math.max(3, Number(editing.num_questions) || 5));
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke("quiz-generate", {
      body: {
        theme,
        difficulty,
        num_questions,
        title: editing.title ?? "",
        description: editing.description ?? "",
      },
    });
    setGenerating(false);
    if (error || (data as any)?.error) {
      toast.error("Erro ao gerar quiz");
      return;
    }
    const quiz = (data as any).quiz;
    setEditing((e: any) => ({
      ...(e ?? {}),
      title: e?.title?.trim() ? e.title : quiz.title,
      description: e?.description?.trim() ? e.description : quiz.description,
      theme: e?.theme || theme,
      difficulty: e?.difficulty || difficulty,
      time_per_question_seconds: e?.time_per_question_seconds || 20,
      num_questions,
      status: e?.status || "draft",
    }));
    setQuestions(quiz.questions);
    toast.success("Quiz gerado, revise e salve");
  }

  async function save(publish: boolean) {
    if (!editing.title?.trim()) { toast.error("Defina o título"); return; }
    if (questions.length < 1) { toast.error("Adicione pelo menos 1 pergunta"); return; }
    for (const q of questions) {
      if (!q.prompt?.trim() || q.options.length !== 4 || q.options.some(o => !o.trim())) {
        toast.error("Cada pergunta precisa de 4 opções e enunciado"); return;
      }
    }
    setSaving(true);
    const payload: any = {
      title: editing.title,
      description: editing.description ?? null,
      theme: editing.theme,
      difficulty: editing.difficulty,
      time_per_question_seconds: editing.time_per_question_seconds,
      status: publish ? "published" : (editing.status ?? "draft"),
      published_at: publish ? new Date().toISOString() : editing.published_at ?? null,
      created_by: editing.id ? undefined : user!.id,
    };
    let quizId = editing.id;
    if (quizId) {
      const { error } = await supabase.from("quizzes").update(payload).eq("id", quizId);
      if (error) { toast.error(error.message); setSaving(false); return; }
      await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
    } else {
      const { data, error } = await supabase.from("quizzes").insert(payload).select().single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      quizId = data.id;
    }
    const rows = questions.map((q, i) => ({
      quiz_id: quizId,
      position: i,
      prompt: q.prompt,
      options: q.options,
      correct_index: q.correct_index,
      explanation: q.explanation || null,
    }));
    const { error: qErr } = await supabase.from("quiz_questions").insert(rows);
    setSaving(false);
    if (qErr) { toast.error(qErr.message); return; }
    toast.success(publish ? "Publicado!" : "Rascunho salvo");
    setEditing(null);
    loadList();
  }

  async function remove(id: string) {
    if (!confirm("Excluir este quiz?")) return;
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    loadList();
  }

  function addQuestion() {
    setQuestions(qs => [...qs, { prompt: "", options: ["", "", "", ""], correct_index: 0, explanation: "" }]);
  }
  function updateQ(i: number, patch: Partial<Q>) {
    setQuestions(qs => qs.map((q, j) => j === i ? { ...q, ...patch } : q));
  }
  function removeQ(i: number) {
    setQuestions(qs => qs.filter((_, j) => j !== i));
  }

  if (authLoading || checking) return <div className="min-h-screen flex items-center justify-center">…</div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center">Acesso negado</div>;

  if (editing) {
    return (
      <div className="min-h-screen bg-background pb-28 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setEditing(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">{editing.id ? "Editar quiz" : "Novo quiz"}</h1>
            <Button size="sm" variant="outline" disabled={generating} onClick={generate}>
              <Sparkles className="h-4 w-4 mr-1" /> {generating ? "Gerando…" : "IA"}
            </Button>
          </div>

          <Card><CardContent className="p-4 space-y-3">
            <div>
              <Label>Título</Label>
              <Input className="text-base" value={editing.title ?? ""} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea className="text-base" value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Tema</Label>
                <Select value={editing.theme} onValueChange={v => setEditing({ ...editing, theme: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{THEMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dificuldade</Label>
                <Select value={editing.difficulty} onValueChange={v => setEditing({ ...editing, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DIFFS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Seg/Pergunta</Label>
                <Input type="number" className="text-base" value={editing.time_per_question_seconds}
                  onChange={e => setEditing({ ...editing, time_per_question_seconds: parseInt(e.target.value) || 20 })} />
              </div>
              <div>
                <Label>Nº de perguntas (IA)</Label>
                <Input type="number" min={3} max={20} className="text-base" value={editing.num_questions ?? 5}
                  onChange={e => setEditing({ ...editing, num_questions: parseInt(e.target.value) || 5 })} />
              </div>
            </div>
          </CardContent></Card>

          {questions.map((q, i) => (
            <Card key={i}><CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Pergunta {i + 1}</div>
                <Button variant="ghost" size="icon" onClick={() => removeQ(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <Textarea className="text-base" placeholder="Enunciado" value={q.prompt} onChange={e => updateQ(i, { prompt: e.target.value })} />
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input type="radio" checked={q.correct_index === oi} onChange={() => updateQ(i, { correct_index: oi })} />
                  <Input className="text-base flex-1" placeholder={`Opção ${oi + 1}`} value={opt}
                    onChange={e => updateQ(i, { options: q.options.map((o, j) => j === oi ? e.target.value : o) })} />
                </div>
              ))}
              <Textarea className="text-base" placeholder="Explicação (opcional)" value={q.explanation}
                onChange={e => updateQ(i, { explanation: e.target.value })} />
            </CardContent></Card>
          ))}

          <Button variant="outline" className="w-full" onClick={addQuestion}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar pergunta
          </Button>

          <div className="flex gap-2 sticky bottom-2">
            <Button variant="outline" className="flex-1" disabled={saving} onClick={() => save(false)}>Salvar rascunho</Button>
            <Button className="flex-1 bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white" disabled={saving} onClick={() => save(true)}>Publicar</Button>
          </div>
        </div>

        <Dialog open={genOpen} onOpenChange={setGenOpen}>
          <DialogContent className="bg-white/70 backdrop-blur-md max-w-sm">
            <DialogHeader><DialogTitle>Gerar com IA</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Tema</Label>
                <Select value={genTheme} onValueChange={setGenTheme}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{THEMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dificuldade</Label>
                <Select value={genDiff} onValueChange={setGenDiff}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DIFFS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantidade</Label>
                <Input type="number" min={3} max={20} className="text-base" value={genCount}
                  onChange={e => setGenCount(parseInt(e.target.value) || 5)} />
              </div>
              <Button className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white" disabled={generating} onClick={generate}>
                {generating ? "Gerando…" : "Gerar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 pt-[calc(env(safe-area-inset-top)+1rem)]">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Quizzes</h1>
          <Button size="sm" onClick={() => openEditor(null)}>
            <Plus className="h-4 w-4 mr-1" /> Novo
          </Button>
        </div>
        {quizzes.map(q => (
          <Card key={q.id}><CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-base">{q.title}</div>
                <div className="text-xs text-muted-foreground">
                  {q.status} · {q.theme} · {q.difficulty}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => openEditor(q)}>Editar</Button>
              <Button size="icon" variant="ghost" onClick={() => remove(q.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardContent></Card>
        ))}
        {quizzes.length === 0 && <div className="text-center py-8 text-muted-foreground">Nenhum quiz criado.</div>}
      </div>
    </div>
  );
}
