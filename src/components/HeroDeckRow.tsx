import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Footprints, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useHealthKit } from '@/hooks/useHealthKit';

interface LatestWorkout {
  id: string;
  title: string;
  thumbnail_url: string | null;
}

export const HeroDeckRow: React.FC = () => {
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<LatestWorkout | null>(null);
  const { isSupported, isConnected, dailySteps, isLoading, refreshData } = useHealthKit();

  useEffect(() => {
    if (isSupported && isConnected) {
      refreshData();
    }
  }, [isSupported, isConnected, refreshData]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('workout_content')
        .select('id,title,thumbnail_url')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled && data) setWorkout(data as LatestWorkout);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid grid-cols-[1.6fr_1fr] gap-3 items-stretch">
      {/* Card esquerdo: último vídeo */}
      <button
        onClick={() => navigate('/treinos')}
        className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-xl active:scale-[0.98] transition-all text-left"
      >
        {workout?.thumbnail_url ? (
          <img
            src={workout.thumbnail_url}
            alt={workout.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#FA1690] to-[#E24989] flex items-center justify-center">
            <Dumbbell className="w-10 h-10 text-white/80" />
          </div>
        )}
        {/* placeholder para dar altura caso a thumb absoluta não preencha */}
        <div className="invisible aspect-[5/4]" />
        <div className="absolute bottom-0 inset-x-0 bg-black/55 backdrop-blur-sm px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-white/70">
              Último treino
            </p>
            <p className="text-base text-white truncate">
              {workout?.title ?? 'Ver treinos'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-white flex-shrink-0" />
        </div>
      </button>

      {/* Card direito: passos */}
      <button
        onClick={() => navigate('/apple-health')}
        className="relative bg-gradient-to-b from-[#FFD1E7] to-white border border-[#FD46A1]/40 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl active:scale-[0.98] transition-all aspect-[4/5] flex flex-col items-center justify-center p-3 text-center"
      >
        {isSupported && isConnected ? (() => {
          const STEP_GOAL = 10000;
          const radius = 45;
          const circ = 2 * Math.PI * radius;
          const pct = Math.min(dailySteps / STEP_GOAL, 1);
          const offset = circ * (1 - pct);
          return (
            <>
              <div className="relative w-[68%] aspect-square">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth="7"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#FD46A1"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Footprints className="w-4 h-4 text-[#FD46A1]" />
                  <div className="text-xl font-bold text-[#FD46A1] leading-none mt-0.5">
                    {isLoading ? '...' : dailySteps.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
              <p className="text-base text-foreground mt-2 leading-none">Passos hoje</p>
              <p className="text-[11px] text-foreground/60 mt-0.5">Meta {STEP_GOAL.toLocaleString('pt-BR')}</p>
            </>
          );
        })() : (
          <>
            <img
              src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/gpt-image-2-1.png"
              alt="Apple Health"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#FD46A1] text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-md">
              Conectar
            </span>
          </>
        )}
      </button>
    </div>
  );
};
