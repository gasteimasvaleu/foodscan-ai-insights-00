import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Scale, ArrowDown, ArrowUp, Minus, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Assessment {
  weight: number | null;
  height: number | null;
  body_fat_percentage: number | null;
  assessment_date: string;
}

const bmiClass = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Abaixo', chip: 'bg-sky-400/20 text-sky-200' };
  if (bmi < 25) return { label: 'Normal', chip: 'bg-emerald-400/20 text-emerald-200' };
  if (bmi < 30) return { label: 'Sobrepeso', chip: 'bg-amber-400/20 text-amber-200' };
  return { label: 'Obesidade', chip: 'bg-rose-400/20 text-rose-200' };
};

const daysAgoLabel = (date: string) => {
  const today = new Date();
  const a = new Date(date);
  const d = Math.floor((+today - +a) / 86400000);
  if (d <= 0) return 'hoje';
  if (d === 1) return 'ontem';
  if (d < 30) return `há ${d}d`;
  return `há ${Math.floor(d / 30)}m`;
};

const Sparkline = ({ values }: { values: number[] }) => {
  if (values.length < 2) return null;
  const w = 64, h = 28, p = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = p + (i * (w - p * 2)) / (values.length - 1);
    const y = h - p - ((v - min) / range) * (h - p * 2);
    return [x, y] as const;
  });
  const d = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' ');
  const last = points[points.length - 1];
  return (
    <svg width={w} height={h} className="shrink-0">
      <path d={d} fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2" fill="#fff" />
    </svg>
  );
};

export const DailyAssessmentSummaryCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('physical_assessments')
      .select('weight, height, body_fat_percentage, assessment_date')
      .eq('user_id', user.id)
      .order('assessment_date', { ascending: false })
      .limit(7);
    setHistory((data as Assessment[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWeightInput(history[0]?.weight ? String(history[0].weight) : '');
    setOpen(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    const w = parseFloat(weightInput.replace(',', '.'));
    if (!w || w < 20 || w > 400) {
      toast.error('Informe um peso válido (kg)');
      return;
    }
    setSaving(true);
    const latest = history[0];
    const { error } = await supabase.from('physical_assessments').insert({
      user_id: user.id,
      weight: w,
      height: latest?.height ?? null,
      body_fat_percentage: latest?.body_fat_percentage ?? null,
      assessment_date: new Date().toISOString().slice(0, 10),
    });
    setSaving(false);
    if (error) {
      toast.error('Erro ao registrar peso');
      return;
    }
    toast.success('Peso registrado ✨');
    setOpen(false);
    fetchData();
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="animate-pulse text-white/80 text-sm">Carregando...</div>
      </div>
    );
  }

  const latest = history[0] ?? null;
  const previous = history[1] ?? null;
  const weight = latest?.weight ? Number(latest.weight) : null;
  const height = latest?.height ? Number(latest.height) : null;
  const bodyFat = latest?.body_fat_percentage ? Number(latest.body_fat_percentage) : null;
  const bmi = weight && height ? weight / Math.pow(height / 100, 2) : null;
  const prevWeight = previous?.weight ? Number(previous.weight) : null;
  const delta = weight && prevWeight ? +(weight - prevWeight).toFixed(1) : null;
  const sparkValues = [...history].reverse().map(h => Number(h.weight)).filter(v => !isNaN(v) && v > 0);
  const bfPct = bodyFat ? Math.min(Math.max(bodyFat, 0), 100) : 0;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (bfPct / 100) * circumference;

  // Empty state
  if (!latest) {
    return (
      <>
        <div
          className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex flex-col px-4 pt-2.5 pb-6 cursor-pointer relative"
          onClick={() => navigate('/profile/assessment')}
        >
          <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider text-center mb-2">
            Avaliação Física
          </p>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Scale className="w-8 h-8 text-white/70 mb-1.5" />
            <p className="text-white text-base font-bold">Comece sua jornada</p>
            <p className="text-white/70 text-[11px] mt-0.5 px-4 leading-snug">
              Registre sua 1ª avaliação para acompanhar a evolução
            </p>
          </div>
          <button
            onClick={handleOpen}
            className="relative z-10 mt-2 w-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all rounded-full py-2 text-white text-xs font-bold flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Registrar agora
          </button>
        </div>

        <WeightDialog
          open={open}
          onOpenChange={setOpen}
          value={weightInput}
          onChange={setWeightInput}
          onSave={handleSave}
          saving={saving}
        />
      </>
    );
  }

  const bmiInfo = bmi ? bmiClass(bmi) : null;

  return (
    <>
      <div
        className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex flex-col px-4 pt-2.5 pb-6 cursor-pointer relative"
        onClick={() => navigate('/profile/assessment')}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center mb-2">
          <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">
            Avaliação Física
          </p>
          <span className="absolute right-0 text-white/70 text-[9px] font-medium bg-white/10 rounded-full px-1.5 py-0.5">
            {daysAgoLabel(latest.assessment_date)}
          </span>
        </div>

        {/* Hero */}
        <div className="flex items-center justify-between gap-2 flex-1">
          {/* Weight column */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-white text-4xl font-black leading-none tracking-tight">
                {weight ? weight.toFixed(1).replace('.', ',') : '—'}
              </span>
              <span className="text-white/70 text-sm font-semibold">kg</span>
            </div>
            {delta !== null ? (
              <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold">
                {delta < 0 ? (
                  <>
                    <ArrowDown className="w-3 h-3 text-emerald-300" />
                    <span className="text-emerald-300">{Math.abs(delta)} kg</span>
                  </>
                ) : delta > 0 ? (
                  <>
                    <ArrowUp className="w-3 h-3 text-rose-300" />
                    <span className="text-rose-300">{delta} kg</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-3 h-3 text-white/70" />
                    <span className="text-white/70">estável</span>
                  </>
                )}
                <span className="text-white/50 font-normal">vs. anterior</span>
              </div>
            ) : (
              <span className="text-white/40 text-[11px] mt-1">sem comparativo</span>
            )}
            <div className="mt-1.5 h-[28px] flex items-center">
              {sparkValues.length >= 2 ? (
                <Sparkline values={sparkValues} />
              ) : (
                <span className="text-white/40 text-[10px]">Sem histórico ainda</span>
              )}
            </div>
          </div>

          {/* Right cluster: ring + IMC chip */}
          <div className="flex items-center gap-2 shrink-0">
            {bodyFat !== null && (
              <div className="relative w-[64px] h-[64px] flex items-center justify-center shrink-0">
                <svg width="64" height="64" className="rotate-[-90deg]">
                  <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r={radius} fill="none"
                    stroke="white" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white text-sm font-black leading-none">{bodyFat.toFixed(0)}%</span>
                  <span className="text-white/60 text-[8px] uppercase tracking-wider">BG</span>
                </div>
              </div>
            )}

            {bmi && bmiInfo && (
              <div className={`flex flex-col items-center justify-center rounded-2xl px-2.5 py-2 shrink-0 min-w-[56px] ${bmiInfo.chip}`}>
                <span className="text-[9px] font-bold uppercase tracking-wider leading-none">{bmiInfo.label}</span>
                <span className="text-lg font-black leading-none mt-1">{bmi.toFixed(1)}</span>
                <span className="text-[9px] opacity-80 mt-0.5 leading-none">IMC</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick-action */}
        <button
          onClick={handleOpen}
          className="relative z-10 mt-2 w-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all rounded-full py-2 text-white text-xs font-bold flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Registrar peso
        </button>
      </div>

      <WeightDialog
        open={open}
        onOpenChange={setOpen}
        value={weightInput}
        onChange={setWeightInput}
        onSave={handleSave}
        saving={saving}
      />
    </>
  );
};

interface WeightDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

const WeightDialog = ({ open, onOpenChange, value, onChange, onSave, saving }: WeightDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className="bg-white/70 backdrop-blur-md max-w-sm rounded-3xl"
      onClick={(e) => e.stopPropagation()}
    >
      <DialogHeader>
        <DialogTitle>Registrar peso</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 pt-1">
        <label className="block">
          <span className="text-sm text-slate-700">Peso atual (kg)</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="20"
            max="400"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ex: 65,4"
            className="mt-1 text-base"
            autoFocus
          />
        </label>
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
