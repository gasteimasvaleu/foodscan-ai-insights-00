import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const QUICK_ADDS = [200, 300, 500];

const formatDateOnly = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const DailyHydrationSummaryCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goalMl, setGoalMl] = useState(3000);
  const [consumedMl, setConsumedMl] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);

  const fetchData = async () => {
    if (!user?.id) return;
    const today = new Date().toISOString().split('T')[0];
    const [profileRes, hydrationRes] = await Promise.all([
      supabase.from('profiles').select('hydration_goal_ml').eq('id', user.id).single(),
      supabase.from('hydration_records').select('hydration_impact_ml').eq('user_id', user.id).eq('consumption_date', today),
    ]);
    if (profileRes.data?.hydration_goal_ml) setGoalMl(profileRes.data.hydration_goal_ml);
    if (hydrationRes.data) {
      setConsumedMl(hydrationRes.data.reduce((sum, r) => sum + Number(r.hydration_impact_ml), 0));
    }
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
    // optimistic
    setConsumedMl((prev) => prev + ml);
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

  // Bottle fill height in pixels (visual, max ~64px)
  const BOTTLE_H = 64;
  const fillHeight = (percentage / 100) * BOTTLE_H;

  const bgClass = goalReached
    ? 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500'
    : 'bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500';

  return (
    <div
      className={`w-full h-full ${bgClass} flex flex-col items-center justify-center px-3 py-3 cursor-pointer relative overflow-hidden transition-colors duration-500`}
      onClick={() => navigate('/hidratacao')}
    >
      {/* Decorative bubbles */}
      <div aria-hidden className="pointer-events-none absolute -top-8 -right-6 h-20 w-20 rounded-full bg-white/15 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-8 -left-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" />

      <p className="text-white/90 text-[10px] font-semibold uppercase tracking-wider mb-1.5 relative">
        Hidratação do Dia
      </p>

      <div className="flex items-center justify-center gap-3 w-full relative">
        {/* Bottle */}
        <div className="relative shrink-0" style={{ width: 36, height: BOTTLE_H + 8 }}>
          {/* Bottle outline */}
          <svg width="36" height={BOTTLE_H + 8} viewBox="0 0 36 72" className="absolute inset-0">
            {/* Cap */}
            <rect x="13" y="0" width="10" height="5" rx="1.5" fill="white" opacity="0.9" />
            {/* Neck */}
            <rect x="14" y="5" width="8" height="6" fill="white" opacity="0.9" />
            {/* Body outline */}
            <path
              d="M9 14 Q9 11 14 11 L22 11 Q27 11 27 14 L27 66 Q27 70 23 70 L13 70 Q9 70 9 66 Z"
              fill="rgba(255,255,255,0.18)"
              stroke="white"
              strokeWidth="1.5"
            />
            {/* Water fill (clipped) */}
            <defs>
              <clipPath id="bottleClip">
                <path d="M9 14 Q9 11 14 11 L22 11 Q27 11 27 14 L27 66 Q27 70 23 70 L13 70 Q9 70 9 66 Z" />
              </clipPath>
            </defs>
            <rect
              x="9"
              y={70 - fillHeight}
              width="18"
              height={fillHeight}
              fill="white"
              clipPath="url(#bottleClip)"
              className="transition-all duration-700 ease-out"
            />
            {/* Wave on top of fill */}
            {fillHeight > 0 && (
              <ellipse
                cx="18"
                cy={70 - fillHeight}
                rx="9"
                ry="1.5"
                fill="white"
                opacity="0.7"
                clipPath="url(#bottleClip)"
                className="transition-all duration-700 ease-out"
              />
            )}
          </svg>
        </div>

        {/* Big number */}
        <div className="flex flex-col items-start">
          {goalReached ? (
            <div className="flex items-center gap-1">
              <Trophy className="w-5 h-5 text-white" />
              <span className="text-white text-base font-bold">Meta batida!</span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-white text-2xl font-black leading-none">{percentage}</span>
                <span className="text-white/80 text-sm font-semibold">%</span>
              </div>
              <span className="text-white/80 text-[10px] mt-0.5">
                {consumedMl} / {goalMl} ml
              </span>
            </>
          )}
        </div>
      </div>

      {/* Quick add row */}
      <div className="flex items-center gap-1.5 mt-2 relative">
        {QUICK_ADDS.map((ml) => (
          <button
            key={ml}
            onClick={(e) => quickAdd(e, ml)}
            disabled={adding !== null}
            className="flex items-center gap-0.5 bg-white/25 hover:bg-white/40 active:scale-95 transition-all rounded-full pl-2 pr-2.5 py-1 text-white text-[11px] font-bold backdrop-blur-sm disabled:opacity-50"
            aria-label={`Adicionar ${ml}ml`}
          >
            <Plus className="w-3 h-3" strokeWidth={3} />
            {ml}ml
          </button>
        ))}
      </div>
    </div>
  );
};
