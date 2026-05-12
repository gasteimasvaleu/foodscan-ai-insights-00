import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ClipboardCheck, AlertTriangle, CheckCircle, AlertCircle, RotateCcw, Share2, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { matGet, matSet } from '@/lib/maternidadeStorage';

interface SelfAssessmentProps {
  content: {
    title: string;
    intro: string;
    disclaimer: string;
    questions: Array<{ question: string; options: Array<{ text: string; score: number }> }>;
    results: Record<'low' | 'moderate' | 'high', { range: string; title: string; description: string; recommendation: string }>;
    buttons: { start: string; next: string; previous: string; finish: string; restart: string; share: string };
  };
  emergencyContent: { title: string; cvv: string };
}

type State = 'intro' | 'questions' | 'result';

interface SavedResult {
  date: string;
  score: number;
  level: 'low' | 'moderate' | 'high';
}

export function SelfAssessment({ content, emergencyContent }: SelfAssessmentProps) {
  const { user } = useAuth();
  const [state, setState] = useState<State>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<number | null>(null);
  const [history, setHistory] = useState<SavedResult[]>([]);

  useEffect(() => {
    setHistory(matGet<SavedResult[]>(user?.id, 'posparto:epds:history', []));
  }, [user?.id]);

  const totalScore = (arr: number[]) => arr.reduce((s, n) => s + n, 0);
  const levelFor = (score: number): 'low' | 'moderate' | 'high' =>
    score <= 9 ? 'low' : score <= 12 ? 'moderate' : 'high';

  const handleStart = () => {
    setState('questions');
    setCurrentQuestion(0);
    setAnswers([]);
    setCurrentAnswer(null);
  };

  const persistResult = (finalAnswers: number[]) => {
    const score = totalScore(finalAnswers);
    const level = levelFor(score);
    const entry: SavedResult = { date: new Date().toISOString(), score, level };
    const next = [entry, ...history].slice(0, 20);
    setHistory(next);
    matSet(user?.id, 'posparto:epds:history', next);
    matSet(user?.id, 'posparto:epds:last', entry);
  };

  const handleNext = () => {
    if (currentAnswer === null) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = currentAnswer;
    setAnswers(newAnswers);
    if (currentQuestion < content.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer(newAnswers[currentQuestion + 1] ?? null);
    } else {
      persistResult(newAnswers);
      setState('result');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentAnswer(answers[currentQuestion - 1] ?? null);
    }
  };

  const handleRestart = () => {
    setState('intro');
    setCurrentQuestion(0);
    setAnswers([]);
    setCurrentAnswer(null);
  };

  const colors = {
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle },
    moderate: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: AlertCircle },
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: AlertTriangle },
  } as const;

  if (state === 'intro') {
    return (
      <div className="space-y-4">
        <Card className="border-none bg-[#FFD1E7]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-[#FD46A1]" />
              {content.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-700">{content.intro}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-700 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />{content.disclaimer}
              </p>
            </div>
            <Button onClick={handleStart} className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90" size="lg">
              {content.buttons.start}
            </Button>
          </CardContent>
        </Card>

        {history.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-md border-white/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-5 w-5 text-[#FD46A1]" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.slice(0, 5).map((h, i) => {
                  const c = colors[h.level];
                  const Icon = c.icon;
                  return (
                    <div key={i} className={`flex items-center justify-between p-2 rounded-xl border ${c.bg} ${c.border}`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${c.text}`} />
                        <span className="text-sm text-gray-700">
                          {new Date(h.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <Badge className={`${c.bg} ${c.text} border ${c.border}`}>
                        {h.score}/30
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (state === 'questions') {
    const q = content.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / content.questions.length) * 100;
    return (
      <div className="space-y-4">
        <Card className="bg-white/70 backdrop-blur-md border-white/40">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{currentQuestion + 1} / {content.questions.length}</Badge>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <CardTitle className="text-base leading-relaxed">{q.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={currentAnswer?.toString() ?? ''}
              onValueChange={(v) => setCurrentAnswer(parseInt(v))}
              className="space-y-2"
            >
              {q.options.map((opt, i) => (
                <div
                  key={i}
                  className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-colors ${currentAnswer === opt.score ? 'border-[#FD46A1] bg-[#FFD1E7]' : 'border-pink-100 hover:border-[#FD46A1]/50'}`}
                  onClick={() => setCurrentAnswer(opt.score)}
                >
                  <RadioGroupItem value={opt.score.toString()} id={`opt-${i}`} />
                  <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-sm">{opt.text}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="flex-1">
              {content.buttons.previous}
            </Button>
            <Button onClick={handleNext} disabled={currentAnswer === null} className="flex-1 bg-[#FD46A1] hover:bg-[#FD46A1]/90">
              {currentQuestion === content.questions.length - 1 ? content.buttons.finish : content.buttons.next}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const score = totalScore(answers);
  const level = levelFor(score);
  const c = colors[level];
  const Icon = c.icon;
  const r = content.results[level];

  return (
    <div className="space-y-4">
      <Card className={`${c.bg} ${c.border} border-2`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={c.text}>{r.range}</Badge>
            <span className="text-2xl font-bold">{score}/30</span>
          </div>
          <CardTitle className={`text-base flex items-center gap-2 ${c.text}`}>
            <Icon className="h-5 w-5" />{r.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">{r.description}</p>
          <div className="p-3 rounded-xl bg-white/70 border">
            <p className="text-sm font-medium">{r.recommendation}</p>
          </div>
        </CardContent>
      </Card>

      {level === 'high' && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-700">{emergencyContent.title}</p>
                <p className="text-xs text-red-600">{emergencyContent.cvv}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleRestart} className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />{content.buttons.restart}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            const text = `${r.title}\nPontuação: ${score}/30\n${r.recommendation}`;
            if (navigator.share) navigator.share({ title: content.title, text }).catch(() => {});
            else navigator.clipboard.writeText(text);
          }}
        >
          <Share2 className="h-4 w-4 mr-2" />{content.buttons.share}
        </Button>
      </div>

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardContent className="pt-6">
          <p className="text-xs text-gray-600 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />{content.disclaimer}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
