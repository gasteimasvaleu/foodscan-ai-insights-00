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

  // Bottle fill height (visual)
  const BOTTLE_W = 56;
  const BOTTLE_H = 110;
  const BODY_TOP = 22; // y where body starts (after cap/neck)
  const BODY_BOTTOM = 108;
  const BODY_RANGE = BODY_BOTTOM - BODY_TOP;
  const fillY = BODY_BOTTOM - (percentage / 100) * BODY_RANGE;

  const bgClass = goalReached
    ? 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500'
    : 'bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500';

  return (
    <div
      className={`w-full h-full ${bgClass} flex items-stretch px-3 py-2.5 cursor-pointer relative overflow-hidden transition-colors duration-500 gap-3`}
      onClick={() => navigate('/hidratacao')}
    >
      {/* Decorative bubbles */}
      <div aria-hidden className="pointer-events-none absolute -top-8 -right-6 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

      {/* Bottle (left, big) */}
      <div className="flex items-center justify-center shrink-0 relative">
        <svg width={BOTTLE_W} height={BOTTLE_H} viewBox="0 0 56 112" className="drop-shadow-md">
          <defs>
            <clipPath id="bottleClip">
              <path d="M12 22 Q12 17 20 17 L36 17 Q44 17 44 22 L44 102 Q44 108 37 108 L19 108 Q12 108 12 102 Z" />
            </clipPath>
          </defs>
          {/* Cap */}
          <rect x="20" y="0" width="16" height="8" rx="2" fill="white" opacity="0.95" />
          {/* Neck */}
          <rect x="22" y="8" width="12" height="9" fill="white" opacity="0.95" />
          {/* Body outline */}
          <path
            d="M12 22 Q12 17 20 17 L36 17 Q44 17 44 22 L44 102 Q44 108 37 108 L19 108 Q12 108 12 102 Z"
            fill="rgba(255,255,255,0.18)"
            stroke="white"
            strokeWidth="2"
          />
          {/* Water fill */}
          <rect
            x="12"
            y={fillY}
            width="32"
            height={BODY_BOTTOM - fillY}
            fill="white"
            clipPath="url(#bottleClip)"
            className="transition-all duration-700 ease-out"
          />
          {/* Wave on top of fill */}
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

      {/* Right column: title + stats + quick adds */}
      <div className="flex-1 flex flex-col justify-center min-w-0 relative">
        <p className="text-white/90 text-[10px] font-semibold uppercase tracking-wider">
          Hidratação do Dia
        </p>

        {goalReached ? (
          <div className="flex items-center gap-1.5 mt-1">
            <Trophy className="w-5 h-5 text-white" />
            <span className="text-white text-base font-bold">Meta batida!</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-white text-3xl font-black leading-none">{percentage}</span>
            <span className="text-white/80 text-base font-semibold">%</span>
          </div>
        )}

        <span className="text-white/85 text-[11px] mt-0.5 truncate">
          {consumedMl} / {goalMl} ml
        </span>

        {/* Quick add row */}
        <div className="flex items-center gap-1.5 mt-2">
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
    </div>
  );
};
