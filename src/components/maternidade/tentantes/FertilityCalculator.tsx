import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Heart, Sparkles, CalendarDays, Info, LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MatDatePicker } from '@/components/maternidade/MatDatePicker';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const fmt = (d: Date) =>
  d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export function FertilityCalculator() {
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [cycleLength, setCycleLength] = useState(28);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('menstrual_cycles')
        .select('cycle_start_date, cycle_length_days')
        .eq('user_id', user.id)
        .order('cycle_start_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setStartDate(data.cycle_start_date);
        setCycleLength(data.cycle_length_days || 28);
      }
    })();
  }, [user]);

  const result = useMemo(() => {
    const start = new Date(startDate + 'T00:00:00');
    const ovulation = addDays(start, cycleLength - 14);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);
    const next = addDays(start, cycleLength);
    return { start, ovulation, fertileStart, fertileEnd, next };
  }, [startDate, cycleLength]);

  return (
    <div className="space-y-4">
      <Card className="border-none bg-[#FFD1E7] rounded-3xl">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">1º dia da última menstruação</Label>
            <MatDatePicker value={startDate} onChange={setStartDate} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">Duração média do ciclo</Label>
            <div className="flex items-center gap-2 bg-white rounded-xl h-12 pr-4">
              <Input
                type="number"
                min={20}
                max={45}
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value) || 28)}
                className="text-base h-12 rounded-xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
              />
              <span className="text-sm text-gray-500">dias</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]">
        <CardHeader className="pl-5">
          <CardTitle className="text-base font-semibold">Sua janela estimada</CardTitle>
          <CardDescription>Baseado no início do último ciclo</CardDescription>
        </CardHeader>
        <CardContent className="pl-5 space-y-3">
          <Row
            icon={Droplet}
            iconColor="text-red-600"
            iconBg="bg-red-100"
            label="Menstruação"
            value={fmt(result.start)}
          />
          <Row
            icon={Heart}
            iconColor="text-[#FD46A1]"
            iconBg="bg-[#FFD1E7]/60"
            label="Janela fértil"
            value={`${fmt(result.fertileStart)} – ${fmt(result.fertileEnd)}`}
            highlight
          />
          <Row
            icon={Sparkles}
            iconColor="text-purple-700"
            iconBg="bg-purple-100"
            label="Ovulação prevista"
            value={fmt(result.ovulation)}
          />
          <Row
            icon={CalendarDays}
            iconColor="text-gray-700"
            iconBg="bg-gray-100"
            label="Próxima menstruação"
            value={fmt(result.next)}
          />

          <div className="flex gap-2 rounded-lg bg-primary/5 border border-primary/10 p-2">
            <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Estimativa baseada em ciclo regular de {cycleLength} dias. Não substitui acompanhamento médico.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  highlight,
}: {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl p-3 border ${
        highlight
          ? 'bg-[#FFD1E7]/40 border-[#FD46A1]/25'
          : 'bg-[#FFD1E7]/20 border-[#FD46A1]/15'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <span className="text-sm font-medium text-gray-800 truncate">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[#FD46A1] shrink-0">{value}</span>
    </div>
  );
}
