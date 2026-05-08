import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHealthKit } from '@/hooks/useHealthKit';

interface BalanceDay {
  day: string;
  consumed: number;
  burned: number;
  balance: number;
}

const LOJA_BG =
  'https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/gpt-image-2-edit-1%20(1).png';

const emptyWeek = (): BalanceDay[] => {
  const today = new Date();
  const out: BalanceDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    out.push({
      day: dayName.charAt(0).toUpperCase() + dayName.slice(1, 3),
      consumed: 0,
      burned: 0,
      balance: 0,
    });
  }
  return out;
};

export const SecondaryDeckRow: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected: hkConnected, getWeeklyData: getHKWeeklyData } = useHealthKit();
  const [data, setData] = useState<BalanceDay[]>(emptyWeek);

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
              consumed: Math.round(v.consumed),
              burned: Math.round(v.burned),
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

  const hasAnyActivity = data.some((d) => d.consumed > 0 || d.burned > 0);
  const totalBalance = data.reduce((sum, d) => sum + d.balance, 0);
  const isDeficit = totalBalance < 0;

  return (
    <div className="grid grid-cols-[1fr_1.6fr] gap-3 items-stretch">
      {/* Card esquerdo: Loja */}
      <button
        onClick={() => navigate('/loja')}
        className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-xl active:scale-[0.98] transition-all h-full"
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

        <div className="flex-1 min-h-0 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }} barCategoryGap="18%" barGap={2}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: 'hsl(var(--foreground) / 0.6)' }}
                interval={0}
              />
              <Bar dataKey="consumed" fill="#FD46A1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="burned" fill="#FFB3D4" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-shrink-0 flex items-center justify-between text-[11px] leading-none mt-1">
          {hasAnyActivity ? (
            <>
              <span className="text-foreground/60">Saldo</span>
              <span className={isDeficit ? 'text-[#EF4444] font-semibold' : 'text-[#FD46A1] font-semibold'}>
                {totalBalance > 0 ? '+' : ''}
                {totalBalance.toLocaleString('pt-BR')} kcal
              </span>
            </>
          ) : (
            <span className="text-foreground/50 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> Toque para começar
            </span>
          )}
        </div>
      </button>
    </div>
  );
};
