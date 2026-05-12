import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-base h-12 rounded-xl bg-white w-full"
            />
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

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader>
          <CardTitle className="text-base">Sua janela estimada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Menstruação" value={fmt(result.start)} color="bg-red-100 text-red-700" />
          <Row
            label="Janela fértil"
            value={`${fmt(result.fertileStart)} – ${fmt(result.fertileEnd)}`}
            color="bg-pink-100 text-[#FD46A1]"
          />
          <Row label="Ovulação prevista" value={fmt(result.ovulation)} color="bg-purple-100 text-purple-700" />
          <Row label="Próxima menstruação" value={fmt(result.next)} color="bg-gray-100 text-gray-700" />
        </CardContent>
      </Card>

      <p className="text-xs text-gray-500 px-1">
        Estimativa baseada em ciclo regular de {cycleLength} dias. Não substitui acompanhamento médico.
      </p>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-sm px-3 py-1 rounded-lg ${color}`}>{value}</span>
    </div>
  );
}
