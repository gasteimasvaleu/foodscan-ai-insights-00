import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Footprints, ChevronRight, Heart } from 'lucide-react';
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
  const { isSupported, isConnected, dailySteps, isLoading } = useHealthKit();

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
        className="bg-[#FFD1E7] rounded-3xl overflow-hidden shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex flex-col text-left"
      >
        <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-[#FA1690] to-[#E24989] overflow-hidden">
          {workout?.thumbnail_url ? (
            <img
              src={workout.thumbnail_url}
              alt={workout.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dumbbell className="w-10 h-10 text-white/80" />
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-between gap-2 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-[#FD46A1]/70">
              Último treino
            </p>
            <p className="text-base text-foreground truncate">
              {workout?.title ?? 'Ver treinos'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#FD46A1] flex-shrink-0" />
        </div>
      </button>

      {/* Card direito: passos */}
      <button
        onClick={() => navigate('/fit-tracker')}
        className="bg-[#FFD1E7] rounded-3xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all aspect-[4/5] flex flex-col items-center justify-center p-4 text-center"
      >
        {isSupported && isConnected ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center mb-2">
              <Footprints className="w-6 h-6 text-[#FD46A1]" />
            </div>
            <div className="text-3xl font-bold text-[#FD46A1] leading-none">
              {isLoading ? '...' : dailySteps.toLocaleString('pt-BR')}
            </div>
            <p className="text-base text-foreground mt-1.5">Passos hoje</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center mb-2">
              <Heart className="w-6 h-6 text-[#FD46A1]" fill="currentColor" />
            </div>
            <p className="text-base text-foreground leading-tight">
              Conectar Apple Health
            </p>
            <ChevronRight className="w-4 h-4 text-[#FD46A1] mt-1.5" />
          </>
        )}
      </button>
    </div>
  );
};
