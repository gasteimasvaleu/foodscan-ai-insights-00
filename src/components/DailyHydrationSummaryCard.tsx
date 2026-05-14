import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const QUICK_ADDS = [200, 300, 500];
const DAY_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']; // seg→dom

const formatDateOnly = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Index 0 = segunda, 6 = domingo
const getDayIndex = (d: Date) => {
  const js = d.getDay(); // 0 = dom
  return (js + 6) % 7;
};

const getMonday = (d: Date) => {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - getDayIndex(m));
  return m;
};

export const DailyHydrationSummaryCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goalMl, setGoalMl] = useState(3000);
  const [consumedMl, setConsumedMl] = useState(0);
  const [weekly, setWeekly] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]); // ml por dia
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);

  const todayIdx = getDayIndex(new Date());

  const fetchData = async () => {
    if (!user?.id) return;
    const today = new Date();
    const monday = getMonday(today);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const mondayISO = formatDateOnly(monday);
    const sundayISO = formatDateOnly(sunday);
    const todayISO = formatDateOnly(today);

    const [profileRes, hydrationRes] = await Promise.all([
      supabase.from('profiles').select('hydration_goal_ml').eq('id', user.id).single(),
      supabase
        .from('hydration_records')
        .select('hydration_impact_ml, consumption_date')
        .eq('user_id', user.id)
        .gte('consumption_date', mondayISO)
        .lte('consumption_date', sundayISO),
    ]);

    if (profileRes.data?.hydration_goal_ml) setGoalMl(profileRes.data.hydration_goal_ml);

    const week = [0, 0, 0, 0, 0, 0, 0];
    let todaySum = 0;
    if (hydrationRes.data) {
      for (const r of hydrationRes.data as Array<{ hydration_impact_ml: number; consumption_date: string }>) {
        const [y, mo, da] = r.consumption_date.split('-').map(Number);
        const dt = new Date(y, mo - 1, da);
        const idx = getDayIndex(dt);
        const val = Number(r.hydration_impact_ml) || 0;
        if (idx >= 0 && idx < 7) week[idx] += val;
        if (r.consumption_date === todayISO) todaySum += val;
      }
    }
    setWeekly(week);
    setConsumedMl(todaySum);
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const percentage = Math.min(Math.round((consumedMl / goalMl) * 100), 100);
  const goalReached = consumedMl >= goalMl && goalMl > 0;

  const quickAdd = async (e: React.MouseEvent, ml: number) => {
    e.stopPropagation();
    if (!user || adding !== null) return;
    setAdding(ml);
    setConsumedMl((prev) => prev + ml);
    setWeekly((prev) => {
      const next = [...prev];
      next[todayIdx] = (next[todayIdx] || 0) + ml;
      return next;
    });
    const now = new Date();
    const { error } = await supabase.from('hydration_records').insert({
      user_id: user.id,
      beverage_key: 'water',
      beverage_name: 'Água',
      volume_ml: ml,
      calories: 0,
      hydration_factor: 100,
      hydration_impact_ml: ml,
      consumed_at: now.toISOString(),
      consumption_date: formatDateOnly(now),
    } as never);
    setAdding(null);
    if (error) {
      setConsumedMl((prev) => prev - ml);
      setWeekly((prev) => {
        const next = [...prev];
        next[todayIdx] = Math.max(0, (next[todayIdx] || 0) - ml);
        return next;
      });
      toast.error('Erro ao registrar');
    } else {
      toast.success(`+${ml}ml registrados 💧`);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500 flex items-center justify-center">
        <div className="animate-pulse text-white/80 text-sm">Carregando...</div>
      </div>
    );
  }

  // Bottle fill height (visual)
  const BOTTLE_W = 56;
  const BOTTLE_H = 110;
  const BODY_TOP = 22;
  const BODY_BOTTOM = 108;
  const BODY_RANGE = BODY_BOTTOM - BODY_TOP;
  const fillY = BODY_BOTTOM - (percentage / 100) * BODY_RANGE;

  const bgClass = goalReached
    ? 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500'
    : 'bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500';

  return (
    <div
      className={`w-full h-full ${bgClass} flex flex-col px-3 pt-2.5 pb-6 cursor-pointer relative overflow-hidden transition-colors duration-500`}
      onClick={() => navigate('/hidratacao')}
    >
      {/* Decorative bubbles */}
      <div aria-hidden className="pointer-events-none absolute -top-8 -right-6 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

      {/* Top row: bottle | text stack | weekly chart */}
      <div className="flex items-center gap-6 flex-1 min-h-0 relative">
        {/* Bottle (left, big) */}
        <div className="flex items-center justify-center shrink-0 relative">
          <svg width={BOTTLE_W} height={BOTTLE_H} viewBox="0 0 56 112" className="drop-shadow-md">
            <defs>
              <clipPath id="bottleClip">
                <path d="M12 22 Q12 17 20 17 L36 17 Q44 17 44 22 L44 102 Q44 108 37 108 L19 108 Q12 108 12 102 Z" />
              </clipPath>
            </defs>
            <rect x="20" y="0" width="16" height="8" rx="2" fill="white" opacity="0.95" />
            <rect x="22" y="8" width="12" height="9" fill="white" opacity="0.95" />
            <path
              d="M12 22 Q12 17 20 17 L36 17 Q44 17 44 22 L44 102 Q44 108 37 108 L19 108 Q12 108 12 102 Z"
              fill="rgba(255,255,255,0.18)"
              stroke="white"
              strokeWidth="2"
            />
            <rect
              x="12"
              y={fillY}
              width="32"
              height={BODY_BOTTOM - fillY}
              fill="white"
              clipPath="url(#bottleClip)"
              className="transition-all duration-700 ease-out"
            />
            {percentage > 0 && (
              <ellipse
                cx="28"
                cy={fillY}
                rx="16"
                ry="2.5"
                fill="white"
                opacity="0.7"
                clipPath="url(#bottleClip)"
                className="transition-all duration-700 ease-out"
              />
            )}
          </svg>
        </div>

        {/* Middle column: title + percent + ml */}
        <div className="flex-1 flex flex-col justify-center min-w-0 mr-3">
          <p className="text-white/90 text-xs font-semibold uppercase tracking-wider">
            Hidratação do Dia
          </p>

          {goalReached ? (
            <div className="flex items-center gap-1.5 mt-1">
              <Trophy className="w-6 h-6 text-white" />
              <span className="text-white text-lg font-bold">Meta batida!</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-white text-5xl font-black leading-none">{percentage}</span>
              <span className="text-white/80 text-xl font-semibold">%</span>
            </div>
          )}

          <span className="text-white/85 text-sm mt-1 truncate">
            {consumedMl} / {goalMl} ml
          </span>
        </div>

        {/* Right column: weekly mini chart */}
        <div
          className="flex flex-col items-center justify-center shrink-0 mr-2"
          aria-label="Constância semanal de hidratação"
        >
          <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider mb-1">
            Semana
          </p>
          <div className="flex items-end gap-[4px] h-20">
            {weekly.map((ml, i) => {
              const rawPct = goalMl > 0 ? (ml / goalMl) * 100 : 0;
              const clamped = Math.min(100, rawPct);
              const isToday = i === todayIdx;
              const reached = rawPct >= 100;
              const heightPct = ml > 0 ? Math.max(8, clamped) : 4;
              return (
                <div key={i} className="relative flex items-end w-[7px] h-full">
                  <div className="absolute inset-0 rounded-sm bg-white/15" />
                  <div
                    className={`relative w-full rounded-sm transition-[height] duration-500 ease-out ${
                      isToday ? 'bg-white ring-1 ring-white/70' : 'bg-white/85'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  >
                    {reached && (
                      <span
                        aria-hidden
                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-yellow-300 shadow"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-end gap-[4px] mt-1">
            {DAY_LABELS.map((lbl, i) => (
              <span
                key={i}
                className={`w-[7px] text-center text-[10px] leading-none ${
                  i === todayIdx ? 'text-white font-bold' : 'text-white/70'
                }`}
              >
                {lbl}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: quick add buttons spanning full width */}
      <div className="flex items-center gap-1.5 mt-1.5 relative">
        {QUICK_ADDS.map((ml) => (
          <button
            key={ml}
            onClick={(e) => quickAdd(e, ml)}
            disabled={adding !== null}
            className="flex-1 flex items-center justify-center gap-0.5 bg-white/25 hover:bg-white/40 active:scale-95 transition-all rounded-full px-1.5 py-1 text-white text-[11px] font-bold backdrop-blur-sm disabled:opacity-50"
            aria-label={`Adicionar ${ml}ml`}
          >
            <Plus className="w-3 h-3" strokeWidth={3} />
            {ml}
          </button>
        ))}
      </div>
    </div>
  );
};
