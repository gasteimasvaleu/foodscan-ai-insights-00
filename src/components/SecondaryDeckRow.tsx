import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHealthKit } from '@/hooks/useHealthKit';

interface BalanceDay {
  day: string;
  balance: number;
}

const LOJA_BG =
  'https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/gpt-image-2-edit-1%20(1).png';

export const SecondaryDeckRow: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected: hkConnected, getWeeklyData: getHKWeeklyData } = useHealthKit();
  const [data, setData] = useState<BalanceDay[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);

        const [{ data: profileData }, { data: mealsData }, { data: hydrationData }, { data: exercisesData }] =
          await Promise.all([
            supabase.from('profiles').select('basal_metabolic_rate').eq('id', user.id).maybeSingle(),
            supabase
              .from('meal_records')
              .select('calories, created_at')
              .eq('user_id', user.id)
              .gte('created_at', sevenDaysAgo.toISOString())
              .lte('created_at', today.toISOString()),
            supabase
              .from('hydration_records')
              .select('calories, consumed_at')
              .eq('user_id', user.id)
              .gte('consumed_at', sevenDaysAgo.toISOString())
              .lte('consumed_at', today.toISOString()),
            supabase
              .from('exercise_records')
              .select('calories_burned, date')
              .eq('user_id', user.id)
              .gte('date', sevenDaysAgo.toISOString().split('T')[0])
              .lte('date', today.toISOString().split('T')[0]),
          ]);

        const bmr = profileData?.basal_metabolic_rate || 0;
        const map = new Map<string, { consumed: number; burned: number }>();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          map.set(d.toISOString().split('T')[0], { consumed: 0, burned: 0 });
        }
        mealsData?.forEach((m: any) => {
          const k = new Date(m.created_at).toISOString().split('T')[0];
          if (map.has(k)) map.get(k)!.consumed += Number(m.calories || 0);
        });
        hydrationData?.forEach((h: any) => {
          const k = new Date(h.consumed_at).toISOString().split('T')[0];
          if (map.has(k)) map.get(k)!.consumed += Number(h.calories || 0);
        });
        exercisesData?.forEach((e: any) => {
          if (map.has(e.date)) map.get(e.date)!.burned += Number(e.calories_burned || 0);
        });
        if (hkConnected) {
          try {
            const hk = await getHKWeeklyData();
            hk.forEach((d: any) => {
              if (map.has(d.date)) map.get(d.date)!.burned += d.calories;
            });
          } catch {}
        }
        map.forEach((v) => {
          v.burned += bmr;
        });

        const result: BalanceDay[] = Array.from(map.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, v]) => {
            const dt = new Date(date);
            const dayName = dt.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            return {
              day: dayName.charAt(0).toUpperCase() + dayName.slice(1, 3),
              balance: Math.round(v.consumed - v.burned),
            };
          });
        if (!cancelled) setData(result);
      } catch (err) {
        console.error('Erro ao carregar balanço (mini):', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, hkConnected, getHKWeeklyData]);

  const hasData = data.some((d) => d.balance !== 0);

  return (
    <div className="grid grid-cols-[1fr_1.6fr] gap-3 items-stretch">
      {/* Card esquerdo: Loja */}
      <button
        onClick={() => navigate('/loja')}
        className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-xl active:scale-[0.98] transition-all aspect-[4/5]"
      >
        <img
          src={LOJA_BG}
          alt="Loja We Diet"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#FD46A1] text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-md">
          Comprar
        </span>
      </button>

      {/* Card direito: mini balanço calórico */}
      <button
        onClick={() => navigate('/graficos-progresso')}
        className="relative bg-gradient-to-b from-[#FFD1E7] to-white border border-[#FD46A1]/40 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl active:scale-[0.98] transition-all h-full flex flex-col p-3 text-left"
      >
        <div className="flex-shrink-0">
          <p className="text-[10px] uppercase tracking-wide text-foreground/60 leading-none">
            Últimos 7 dias
          </p>
          <p className="text-base text-foreground leading-tight mt-0.5">Balanço Calórico</p>
        </div>
        <div className="flex-1 min-h-0 mt-2">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: 'hsl(var(--foreground) / 0.6)' }}
                  interval={0}
                />
                <Bar dataKey="balance" radius={[4, 4, 4, 4]}>
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.balance > 0 ? '#FD46A1' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-foreground/50">
              <BarChart3 className="w-8 h-8" />
              <p className="text-[11px] mt-1">Toque para ver</p>
            </div>
          )}
        </div>
      </button>
    </div>
  );
};
