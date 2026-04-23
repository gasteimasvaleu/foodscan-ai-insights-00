import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Scale, ChevronRight, ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface Assessment {
  weight: number | null;
  height: number | null;
  body_fat_percentage: number | null;
  assessment_date: string;
}

export const DailyAssessmentSummaryCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [latest, setLatest] = useState<Assessment | null>(null);
  const [previous, setPrevious] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      const { data } = await supabase
        .from('physical_assessments')
        .select('weight, height, body_fat_percentage, assessment_date')
        .eq('user_id', user.id)
        .order('assessment_date', { ascending: false })
        .limit(2);
      if (data && data.length > 0) {
        setLatest(data[0] as Assessment);
        if (data.length > 1) setPrevious(data[1] as Assessment);
      }
      setLoading(false);
    };
    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 flex items-center justify-center">
        <div className="animate-pulse text-white/80 text-sm">Carregando...</div>
      </div>
    );
  }

  if (!latest) return null;

  const weight = latest.weight ? Number(latest.weight) : null;
  const height = latest.height ? Number(latest.height) : null;
  const bodyFat = latest.body_fat_percentage ? Number(latest.body_fat_percentage) : null;
  const bmi = weight && height ? weight / Math.pow(height / 100, 2) : null;

  const bfPct = bodyFat ? Math.min(Math.max(bodyFat, 0), 100) : 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (bfPct / 100) * circumference;

  const prevWeight = previous?.weight ? Number(previous.weight) : null;
  const delta = weight && prevWeight ? +(weight - prevWeight).toFixed(1) : null;

  return (
    <div
      className="w-full h-full bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 flex flex-col items-center justify-center p-4 cursor-pointer relative"
      onClick={() => navigate('/profile/assessment')}
    >
      <p className="text-white/90 text-[10px] font-semibold uppercase tracking-wider mb-2">Avaliação Física</p>

      <div className="flex items-center justify-center gap-4 w-full">
        {/* Weight */}
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-white text-lg font-bold">{weight ? `${weight}` : '—'}</span>
          <span className="text-white/70 text-[9px]">{weight ? 'kg atual' : 'sem peso'}</span>
        </div>

        {/* Ring (Body Fat) */}
        <div className="relative w-[90px] h-[90px] flex items-center justify-center">
          <svg width="90" height="90" className="rotate-[-90deg]">
            <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
            {bodyFat !== null && (
              <circle
                cx="45" cy="45" r={radius} fill="none"
                stroke="white" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
            <span className="text-white text-xs font-bold">
              {bodyFat !== null ? `${bodyFat.toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>

        {/* BMI */}
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-white text-lg font-bold">{bmi ? bmi.toFixed(1) : '—'}</span>
          <span className="text-white/70 text-[9px]">IMC</span>
        </div>
      </div>

      {/* Variation */}
      {delta !== null && (
        <div className="mt-2 flex items-center gap-1 text-[10px] font-medium bg-white/20 rounded-full px-2.5 py-0.5 text-white">
          {delta < 0 ? (
            <>
              <ArrowDown className="w-3 h-3 text-green-200" />
              <span className="text-green-100">{Math.abs(delta)} kg</span>
            </>
          ) : delta > 0 ? (
            <>
              <ArrowUp className="w-3 h-3 text-red-200" />
              <span className="text-red-100">{delta} kg</span>
            </>
          ) : (
            <>
              <Minus className="w-3 h-3" />
              <span>estável</span>
            </>
          )}
          <span className="text-white/60">vs. anterior</span>
        </div>
      )}

      {/* CTA */}
      <button className="mt-2 flex items-center gap-1 text-white text-[10px] font-medium bg-white/20 rounded-full px-3 py-1 hover:bg-white/30 transition-colors">
        Ver Avaliações <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};
