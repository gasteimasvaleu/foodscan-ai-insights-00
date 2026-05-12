import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { matGet, matSet } from '@/lib/maternidadeStorage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { addDays, differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface State { lastPeriod: string; dueDate: string | null; }

export const DueDateCalculator = () => {
  const { user } = useAuth();
  const [lastPeriod, setLastPeriod] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    const s = matGet<State>(user?.id, 'gestacao:dpp', { lastPeriod: '', dueDate: null });
    setLastPeriod(s.lastPeriod);
    setDueDate(s.dueDate ? new Date(s.dueDate) : null);
  }, [user?.id]);

  const calculate = () => {
    if (!lastPeriod) return;
    const calc = addDays(new Date(lastPeriod), 280);
    setDueDate(calc);
    matSet<State>(user?.id, 'gestacao:dpp', { lastPeriod, dueDate: calc.toISOString() });
  };

  const currentWeek = lastPeriod
    ? Math.floor(differenceInDays(new Date(), new Date(lastPeriod)) / 7)
    : 0;
  const daysRemaining = dueDate ? Math.max(0, differenceInDays(dueDate, new Date())) : 0;
  const trimester = currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3;
  const progress = Math.min(100, (currentWeek / 40) * 100);

  return (
    <div className="bg-[#FFD1E7] rounded-3xl p-5 space-y-4">
      <div>
        <h3 className="text-base text-gray-800">Calculadora de DPP</h3>
        <p className="text-xs text-gray-600 mt-0.5">Calcule a data provável do parto</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-700">Data da última menstruação</label>
        <Input
          type="date"
          value={lastPeriod}
          onChange={(e) => setLastPeriod(e.target.value)}
          className="bg-white/70 backdrop-blur-md border-white/60 text-base"
        />
      </div>

      <Button
        onClick={calculate}
        disabled={!lastPeriod}
        className="w-full bg-[#FD46A1] hover:bg-[#E24989] text-white"
      >
        Calcular
      </Button>

      {dueDate && (
        <div className="space-y-3 pt-3 border-t border-white/60">
          <div className="text-center">
            <p className="text-xs text-gray-600">Data Provável do Parto</p>
            <p className="text-xl font-semibold text-[#FD46A1]">
              {format(dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-2.5">
              <p className="text-[10px] text-gray-600">Semana</p>
              <p className="font-semibold text-[#FD46A1]">{currentWeek}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-2.5">
              <p className="text-[10px] text-gray-600">Dias restantes</p>
              <p className="font-semibold text-[#FD46A1]">{daysRemaining}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-2.5">
              <p className="text-[10px] text-gray-600">Trimestre</p>
              <p className="font-semibold text-[#FD46A1]">{trimester}º</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-700">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}
    </div>
  );
};
