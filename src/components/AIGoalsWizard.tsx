import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, ArrowRight, Check, User, Ruler, Weight, Activity, Target, CalendarHeart, ShieldAlert, Briefcase, History, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const TOTAL_STEPS = 12;

interface WizardData {
  sex: string;
  age: number;
  weight: number;
  height: number;
  activityLevel: string;
  goal: string;
  event: string;
  eventDate: Date | undefined;
  healthRestrictions: string[];
  otherRestriction: string;
  workType: string;
  sleepHours: number;
  stressLevel: number;
  mealsPerDay: number;
  hasDietHistory: boolean;
  dietTypes: string;
  hadRebound: boolean;
  lowestWeight: number;
  highestWeight: number;
}

interface AIResult {
  calories: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
  diet_objective: string;
  explanation: string;
}

interface AIGoalsWizardProps {
  open: boolean;
  onClose: () => void;
  onApplyGoals: (goals: { calories: number; carbohydrates: number; proteins: number; fats: number; diet_objective: string }) => void;
}

const initialData: WizardData = {
  sex: '',
  age: 30,
  weight: 70,
  height: 170,
  activityLevel: '',
  goal: '',
  event: '',
  eventDate: undefined,
  healthRestrictions: [],
  otherRestriction: '',
  workType: '',
  sleepHours: 7,
  stressLevel: 3,
  mealsPerDay: 4,
  hasDietHistory: false,
  dietTypes: '',
  hadRebound: false,
  lowestWeight: 0,
  highestWeight: 0,
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export const AIGoalsWizard: React.FC<AIGoalsWizardProps> = ({ open, onClose, onApplyGoals }) => {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<WizardData>({ ...initialData });
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  const goNext = () => { setDir(1); setStep(s => s + 1); };
  const goBack = () => { setDir(-1); setStep(s => s - 1); };

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return !!data.sex;
      case 2: return data.age > 0 && data.age < 120;
      case 3: return data.weight > 20 && data.weight < 400;
      case 4: return data.height > 100 && data.height < 250;
      case 5: return !!data.activityLevel;
      case 6: return !!data.goal;
      default: return true;
    }
  };

  const isSkippable = step >= 7 && step <= 10;

  const handleCalculate = async () => {
    setIsCalculating(true);
    setDir(1);
    setStep(11);
    try {
      const { data: fnData, error } = await supabase.functions.invoke('ai-goals-calculator', {
        body: data,
      });
      if (error) throw error;
      if (fnData?.error) throw new Error(fnData.error);
      setResult(fnData as AIResult);
    } catch (err: any) {
      console.error('AI goals error:', err);
      toast({ title: 'Erro', description: err.message || 'Erro ao calcular metas com IA', variant: 'destructive' });
      setStep(10);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApplyGoals({
      calories: result.calories,
      carbohydrates: result.carbohydrates,
      proteins: result.proteins,
      fats: result.fats,
      diet_objective: result.diet_objective,
    });
    handleClose();
  };

  const handleClose = () => {
    setStep(0);
    setData({ ...initialData });
    setResult(null);
    setIsCalculating(false);
    onClose();
  };

  const toggleRestriction = (r: string) => {
    setData(prev => ({
      ...prev,
      healthRestrictions: prev.healthRestrictions.includes(r)
        ? prev.healthRestrictions.filter(x => x !== r)
        : [...prev.healthRestrictions, r],
    }));
  };

  const SelectCard = ({ selected, onClick, children, className }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-4 rounded-2xl border-2 transition-all text-left w-full',
        selected ? 'border-primary bg-primary/10 shadow-md' : 'border-gray-200 bg-white/50 hover:border-primary/50',
        className
      )}
    >
      {children}
    </button>
  );

  const renderStep = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
            <div className="bg-gradient-to-br from-primary to-accent p-5 rounded-3xl shadow-lg">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Assistente IA de Metas</h2>
            <p className="text-gray-600 text-sm leading-relaxed px-4">
              Vou te fazer algumas perguntas para calcular suas metas nutricionais personalizadas com inteligência artificial.
            </p>
            <Button onClick={goNext} className="bg-[#FD46A1] hover:bg-[#e03d8f] text-white rounded-xl px-8 py-3 text-lg font-semibold shadow-lg w-full">
              Começar ✨
            </Button>
          </div>
        );

      case 1: // Sex
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-800">Qual seu sexo?</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectCard selected={data.sex === 'male'} onClick={() => setData(d => ({ ...d, sex: 'male' }))}>
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">👨</div>
                  <span className="font-semibold text-gray-800">Masculino</span>
                </div>
              </SelectCard>
              <SelectCard selected={data.sex === 'female'} onClick={() => setData(d => ({ ...d, sex: 'female' }))}>
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">👩</div>
                  <span className="font-semibold text-gray-800">Feminino</span>
                </div>
              </SelectCard>
            </div>
          </div>
        );

      case 2: // Age
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800">Qual sua idade?</h3>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl font-bold text-primary">{data.age}</div>
              <span className="text-gray-500">anos</span>
              <Input
                type="range"
                min={10}
                max={100}
                value={data.age}
                onChange={e => setData(d => ({ ...d, age: Number(e.target.value) }))}
                className="w-full accent-primary h-3"
              />
              <Input
                type="number"
                inputMode="numeric"
                value={data.age}
                onChange={e => setData(d => ({ ...d, age: Number(e.target.value) || 0 }))}
                className="w-24 text-center rounded-xl"
              />
            </div>
          </div>
        );

      case 3: // Weight
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Weight className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-800">Qual seu peso atual?</h3>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl font-bold text-primary">{data.weight}</div>
              <span className="text-gray-500">kg</span>
              <Input
                type="number"
                inputMode="decimal"
                value={data.weight}
                onChange={e => setData(d => ({ ...d, weight: Number(e.target.value) || 0 }))}
                className="w-32 text-center rounded-xl text-2xl py-4"
              />
            </div>
          </div>
        );

      case 4: // Height
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Ruler className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-800">Qual sua altura?</h3>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl font-bold text-primary">{data.height}</div>
              <span className="text-gray-500">cm</span>
              <Input
                type="number"
                inputMode="numeric"
                value={data.height}
                onChange={e => setData(d => ({ ...d, height: Number(e.target.value) || 0 }))}
                className="w-32 text-center rounded-xl text-2xl py-4"
              />
            </div>
          </div>
        );

      case 5: // Activity Level
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Activity className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-800">Nível de atividade</h3>
            </div>
            {[
              { key: 'sedentario', label: 'Sedentário', desc: 'Pouco ou nenhum exercício', emoji: '🛋️' },
              { key: 'leve', label: 'Leve', desc: 'Exercício 1-3x/semana', emoji: '🚶' },
              { key: 'moderado', label: 'Moderado', desc: 'Exercício 3-5x/semana', emoji: '🏃' },
              { key: 'intenso', label: 'Intenso', desc: 'Exercício 6-7x/semana', emoji: '🏋️' },
              { key: 'muito_intenso', label: 'Muito Intenso', desc: 'Atleta / 2x por dia', emoji: '⚡' },
            ].map(item => (
              <SelectCard key={item.key} selected={data.activityLevel === item.key} onClick={() => setData(d => ({ ...d, activityLevel: item.key }))}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                </div>
              </SelectCard>
            ))}
          </div>
        );

      case 6: // Goal
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-800">Objetivo principal</h3>
            </div>
            {[
              { key: 'perder', label: 'Perder Peso', desc: 'Reduzir gordura corporal', emoji: '⬇️' },
              { key: 'manter', label: 'Manter Peso', desc: 'Manter composição atual', emoji: '⚖️' },
              { key: 'ganhar', label: 'Ganhar Massa', desc: 'Aumentar massa muscular', emoji: '💪' },
            ].map(item => (
              <SelectCard key={item.key} selected={data.goal === item.key} onClick={() => setData(d => ({ ...d, goal: item.key }))}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </div>
                </div>
              </SelectCard>
            ))}
          </div>
        );

      case 7: // Event
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <CalendarHeart className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-800">Evento especial?</h3>
              <p className="text-sm text-gray-500">Tem alguma motivação especial?</p>
            </div>
            {[
              { key: 'casamento', label: 'Casamento', emoji: '💒' },
              { key: 'ferias', label: 'Férias', emoji: '🏖️' },
              { key: 'formatura', label: 'Formatura', emoji: '🎓' },
              { key: 'competicao', label: 'Competição', emoji: '🏆' },
              { key: 'nenhum', label: 'Nenhum', emoji: '➡️' },
            ].map(item => (
              <SelectCard key={item.key} selected={data.event === item.key} onClick={() => setData(d => ({ ...d, event: item.key }))}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="font-semibold text-gray-800">{item.label}</span>
                </div>
              </SelectCard>
            ))}
            {data.event && data.event !== 'nenhum' && (
              <div className="space-y-2">
                <Label>Data do evento (opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full rounded-xl justify-start">
                      {data.eventDate ? format(data.eventDate, 'PPP', { locale: ptBR }) : 'Selecionar data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={data.eventDate}
                      onSelect={d => setData(prev => ({ ...prev, eventDate: d }))}
                      disabled={d => d < new Date()}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        );

      case 8: // Health restrictions
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <ShieldAlert className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-800">Restrições de saúde</h3>
              <p className="text-sm text-gray-500">Selecione todas que se aplicam</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'diabetico', label: 'Diabético' },
                { key: 'hipertenso', label: 'Hipertenso' },
                { key: 'intolerancia_lactose', label: 'Intolerância à lactose' },
                { key: 'celiaco', label: 'Celíaco' },
                { key: 'vegano', label: 'Vegano' },
                { key: 'vegetariano', label: 'Vegetariano' },
                { key: 'alergia_frutos_mar', label: 'Alergia a frutos do mar' },
                { key: 'alergia_amendoim', label: 'Alergia a amendoim' },
              ].map(item => (
                <SelectCard
                  key={item.key}
                  selected={data.healthRestrictions.includes(item.key)}
                  onClick={() => toggleRestriction(item.key)}
                >
                  <div className="text-center py-1">
                    <span className="text-sm font-medium text-gray-800">{item.label}</span>
                  </div>
                </SelectCard>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Outra restrição</Label>
              <Input
                value={data.otherRestriction}
                onChange={e => setData(d => ({ ...d, otherRestriction: e.target.value }))}
                placeholder="Ex: alergia a ovo..."
                className="rounded-xl"
              />
            </div>
          </div>
        );

      case 9: // Routine
        return (
          <div className="space-y-5">
            <div className="text-center mb-4">
              <Briefcase className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-800">Rotina e estilo de vida</h3>
            </div>
            <div className="space-y-2">
              <Label>Tipo de trabalho</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'sentado', label: 'Sentado' },
                  { key: 'em_pe', label: 'Em pé' },
                  { key: 'misto', label: 'Misto' },
                ].map(item => (
                  <SelectCard key={item.key} selected={data.workType === item.key} onClick={() => setData(d => ({ ...d, workType: item.key }))}>
                    <div className="text-center text-sm font-medium">{item.label}</div>
                  </SelectCard>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Horas de sono: {data.sleepHours}h</Label>
              <Input type="range" min={3} max={12} value={data.sleepHours} onChange={e => setData(d => ({ ...d, sleepHours: Number(e.target.value) }))} className="accent-primary" />
            </div>
            <div className="space-y-2">
              <Label>Nível de estresse: {data.stressLevel}/5</Label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setData(d => ({ ...d, stressLevel: n }))}
                    className={cn('flex-1 py-3 rounded-xl font-bold text-lg transition-all', data.stressLevel === n ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600')}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Refeições por dia: {data.mealsPerDay}</Label>
              <Input type="range" min={1} max={8} value={data.mealsPerDay} onChange={e => setData(d => ({ ...d, mealsPerDay: Number(e.target.value) }))} className="accent-primary" />
            </div>
          </div>
        );

      case 10: // Diet history
        return (
          <div className="space-y-5">
            <div className="text-center mb-4">
              <History className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-800">Histórico de dietas</h3>
            </div>
            <div className="space-y-2">
              <Label>Já fez dieta antes?</Label>
              <div className="grid grid-cols-2 gap-3">
                <SelectCard selected={data.hasDietHistory === true} onClick={() => setData(d => ({ ...d, hasDietHistory: true }))}>
                  <div className="text-center font-semibold">Sim</div>
                </SelectCard>
                <SelectCard selected={data.hasDietHistory === false} onClick={() => setData(d => ({ ...d, hasDietHistory: false }))}>
                  <div className="text-center font-semibold">Não</div>
                </SelectCard>
              </div>
            </div>
            {data.hasDietHistory && (
              <>
                <div className="space-y-2">
                  <Label>Quais tipos de dieta?</Label>
                  <Input value={data.dietTypes} onChange={e => setData(d => ({ ...d, dietTypes: e.target.value }))} placeholder="Ex: low carb, jejum, cetogênica..." className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Teve efeito rebote?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <SelectCard selected={data.hadRebound === true} onClick={() => setData(d => ({ ...d, hadRebound: true }))}>
                      <div className="text-center font-semibold">Sim</div>
                    </SelectCard>
                    <SelectCard selected={data.hadRebound === false} onClick={() => setData(d => ({ ...d, hadRebound: false }))}>
                      <div className="text-center font-semibold">Não</div>
                    </SelectCard>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Peso mais baixo (kg)</Label>
                    <Input type="number" inputMode="decimal" value={data.lowestWeight || ''} onChange={e => setData(d => ({ ...d, lowestWeight: Number(e.target.value) || 0 }))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Peso mais alto (kg)</Label>
                    <Input type="number" inputMode="decimal" value={data.highestWeight || ''} onChange={e => setData(d => ({ ...d, highestWeight: Number(e.target.value) || 0 }))} className="rounded-xl" />
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 11: // Result
        return (
          <div className="space-y-6 py-4">
            {isCalculating ? (
              <div className="flex flex-col items-center justify-center space-y-6 py-12">
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary to-accent p-5 rounded-3xl shadow-lg animate-pulse">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <Loader2 className="w-8 h-8 text-primary animate-spin absolute -bottom-2 -right-2" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Calculando suas metas...</h3>
                <p className="text-sm text-gray-500 text-center">A IA está analisando seu perfil para criar metas personalizadas</p>
              </div>
            ) : result ? (
              <>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-2xl shadow-lg inline-block mb-3">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Suas Metas Personalizadas</h3>
                  <p className="text-sm text-primary font-semibold">{result.diet_objective}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Calorias', value: result.calories, unit: 'kcal', color: 'from-red-400 to-red-500' },
                    { label: 'Carboidratos', value: result.carbohydrates, unit: 'g', color: 'from-orange-400 to-orange-500' },
                    { label: 'Proteínas', value: result.proteins, unit: 'g', color: 'from-blue-400 to-blue-500' },
                    { label: 'Gorduras', value: result.fats, unit: 'g', color: 'from-yellow-400 to-yellow-500' },
                  ].map(item => (
                    <div key={item.label} className="bg-white/80 rounded-2xl p-4 text-center border border-gray-100">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{item.label}</div>
                      <div className="text-2xl font-bold text-gray-800">{item.value}</div>
                      <div className="text-xs text-gray-400">{item.unit}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white/80 rounded-2xl p-4 border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" /> Análise da IA
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{result.explanation}</p>
                </div>

                <Button onClick={handleApply} className="bg-[#FD46A1] hover:bg-[#e03d8f] text-white rounded-xl px-8 py-4 text-lg font-semibold shadow-lg w-full">
                  <Check className="w-5 h-5 mr-2" />
                  Aplicar Metas
                </Button>
              </>
            ) : null}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DrawerContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[90vh] flex flex-col">
        <DrawerTitle className="sr-only">Assistente IA de Metas</DrawerTitle>
        {/* Header with progress */}
        <div className="px-5 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">
              {step === 0 ? '' : step === 11 ? 'Resultado' : `Passo ${step} de ${TOTAL_STEPS - 2}`}
            </span>
            <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          {step > 0 && step < 11 && (
            <Progress value={(step / (TOTAL_STEPS - 2)) * 100} className="h-2 mb-2" />
          )}
        </div>

        {/* Content */}
        <div className="px-5 pb-5 overflow-y-auto flex-1">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {step > 0 && step < 11 && (
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={goBack} className="rounded-xl flex-1">
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
              {step === 10 ? (
                <Button onClick={handleCalculate} className="bg-[#FD46A1] hover:bg-[#e03d8f] text-white rounded-xl flex-1">
                  <Sparkles className="w-4 h-4 mr-1" /> Calcular
                </Button>
              ) : (
                <div className="flex gap-2 flex-1">
                  {isSkippable && (
                    <Button variant="ghost" onClick={goNext} className="rounded-xl text-gray-400 text-sm px-3">
                      Pular
                    </Button>
                  )}
                  <Button
                    onClick={goNext}
                    disabled={!canProceed()}
                    className="bg-primary text-white rounded-xl flex-1"
                  >
                    Próximo <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
