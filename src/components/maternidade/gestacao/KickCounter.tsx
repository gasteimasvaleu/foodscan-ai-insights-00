import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { matGet, matSet } from '@/lib/maternidadeStorage';
import { Plus } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface KickEntry { ts: string; }

export const KickCounter = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<KickEntry[]>([]);

  useEffect(() => {
    setEntries(matGet<KickEntry[]>(user?.id, 'gestacao:kicks', []));
  }, [user?.id]);

  const todayStart = startOfDay(new Date()).getTime();
  const todayEntries = entries.filter((e) => new Date(e.ts).getTime() >= todayStart);
  const todayCount = todayEntries.length;
  const lastKick = todayEntries[todayEntries.length - 1];
  const goalReached = todayCount >= 10;

  const record = () => {
    const next = [...entries, { ts: new Date().toISOString() }];
    setEntries(next);
    matSet(user?.id, 'gestacao:kicks', next);
    if (todayCount + 1 === 10) {
      toast({ title: '🎉 Meta atingida!', description: '10 movimentos registrados hoje.' });
    }
  };

  // Last 7 days summary
  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const c = entries.filter((e) => {
      const t = new Date(e.ts).getTime();
      return t >= d.getTime() && t < next.getTime();
    }).length;
    days.push({ date: format(d, 'EEE', { locale: ptBR }).slice(0,3), count: c });
  }

  return (
    <div className="bg-[#FFD1E7] rounded-3xl p-5 space-y-4">
      <div>
        <h3 className="text-base text-gray-800">Contador de Movimentos</h3>
        <p className="text-xs text-gray-600 mt-0.5">Acompanhe os movimentos do bebê</p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={record}
          className={`w-32 h-32 rounded-full text-white flex flex-col items-center justify-center shadow-lg active:scale-95 transition ${
            goalReached ? 'bg-emerald-500' : 'bg-[#FD46A1]'
          }`}
        >
          <Plus className="w-7 h-7 mb-1" />
          <span className="text-3xl font-bold">{todayCount}</span>
        </button>
        <p className="text-xs text-gray-700">Meta: 10 movimentos em 2 horas</p>
        {lastKick && (
          <p className="text-xs text-gray-600">Último: {format(new Date(lastKick.ts), 'HH:mm')}</p>
        )}
      </div>

      <div className="pt-3 border-t border-white/60">
        <p className="text-xs font-medium text-gray-700 mb-2">Últimos 7 dias</p>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => (
            <div
              key={i}
              className={`text-center rounded-xl py-1.5 ${
                d.count >= 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-white/60 text-gray-700'
              }`}
            >
              <p className="text-[10px] capitalize">{d.date}</p>
              <p className="text-sm font-semibold">{d.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
