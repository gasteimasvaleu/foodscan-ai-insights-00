
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Droplets, ChevronRight } from 'lucide-react';

export const DailyHydrationSummaryCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goalMl, setGoalMl] = useState(3000);
  const [consumedMl, setConsumedMl] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const today = new Date().toISOString().split('T')[0];

    const fetchData = async () => {
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
    fetchData();
  }, [user?.id]);

  const percentage = Math.min(Math.round((consumedMl / goalMl) * 100), 100);
  const remaining = Math.max(goalMl - consumedMl, 0);

  // SVG ring
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500 flex items-center justify-center">
        <div className="animate-pulse text-white/80 text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500 flex flex-col items-center justify-center p-4 cursor-pointer relative"
      onClick={() => navigate('/hidratacao')}
    >
      <p className="text-white/90 text-[10px] font-semibold uppercase tracking-wider mb-2">Hidratação do Dia</p>

      <div className="flex items-center justify-center gap-4 w-full">
        {/* Remaining */}
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-white text-lg font-bold">{remaining}</span>
          <span className="text-white/70 text-[9px]">ml restantes</span>
        </div>

        {/* Ring */}
        <div className="relative w-[90px] h-[90px] flex items-center justify-center">
          <svg width="90" height="90" className="rotate-[-90deg]">
            <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
            <circle
              cx="45" cy="45" r={radius} fill="none"
              stroke="white" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplets className="w-5 h-5 text-white" />
            <span className="text-white text-xs font-bold">{percentage}%</span>
          </div>
        </div>

        {/* Consumed */}
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-white text-lg font-bold">{consumedMl}</span>
          <span className="text-white/70 text-[9px]">ml consumidos</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[220px] mt-2">
        <div className="flex justify-between text-[9px] text-white/70 mb-0.5">
          <span>Progresso</span>
          <span>{consumedMl} / {goalMl} ml</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {/* CTA */}
      <button className="mt-2 flex items-center gap-1 text-white text-[10px] font-medium bg-white/20 rounded-full px-3 py-1 hover:bg-white/30 transition-colors">
        Ver Hidratação <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};
