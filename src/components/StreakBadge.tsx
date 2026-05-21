import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const StreakBadge = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState<number | null>(null);
  const [longest, setLongest] = useState<number>(0);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setCurrent(data?.current_streak ?? 0);
      setLongest(data?.longest_streak ?? 0);
    };
    load();

    const channel = supabase
      .channel(`user_streaks:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_streaks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const next = (payload.new as any)?.current_streak ?? 0;
          const nextLongest = (payload.new as any)?.longest_streak ?? 0;
          setCurrent((prev) => {
            if (prev !== null && next > prev) {
              setPop(true);
              setTimeout(() => setPop(false), 400);
            }
            return next;
          });
          setLongest(nextLongest);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (!user || current === null) return null;

  const hasStreak = current > 0;

  return (
    <button
      onClick={() => navigate('/conquistas')}
      className={cn(
        'w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-full',
        'bg-white/70 backdrop-blur-md border border-[#FD46A1]/20 shadow-sm',
        'hover:bg-white/85 active:scale-[0.98] transition-all'
      )}
      aria-label="Ver suas conquistas"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
            hasStreak
              ? 'bg-gradient-to-br from-orange-400 to-[#FD46A1]'
              : 'bg-muted'
          )}
          style={{
            transform: pop ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <Flame
            className={cn(
              'w-5 h-5',
              hasStreak ? 'text-white' : 'text-muted-foreground'
            )}
            fill={hasStreak ? 'currentColor' : 'none'}
          />
        </div>
        <div className="text-left min-w-0">
          {hasStreak ? (
            <>
              <p className="text-base font-bold text-foreground leading-tight">
                {current} {current === 1 ? 'dia' : 'dias'} seguidos
              </p>
              {longest > current && (
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Recorde: {longest} dias
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-foreground leading-tight">
                Comece sua sequência hoje
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Registre uma refeição para começar
              </p>
            </>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
};
