
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Timer, ChevronRight } from 'lucide-react';

export const DailyFastingSummaryCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isFasting, setIsFasting] = useState(false);
  const [elapsedHours, setElapsedHours] = useState(0);
  const [targetHours, setTargetHours] = useState(16);
  const [protocol, setProtocol] = useState('16:8');

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      // Get active fasting (no ended_at) or last completed today
      const { data } = await supabase
        .from('fasting_records')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const record = data[0];
        setTargetHours(record.target_hours);
        setProtocol(record.protocol);

        if (!record.ended_at) {
          setIsFasting(true);
          const started = new Date(record.started_at).getTime();
          const now = Date.now();
          setElapsedHours((now - started) / (1000 * 60 * 60));
        } else {
          setIsFasting(false);
          const started = new Date(record.started_at).getTime();
          const ended = new Date(record.ended_at).getTime();
          setElapsedHours((ended - started) / (1000 * 60 * 60));
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user?.id]);

  // Live timer update
  useEffect(() => {
    if (!isFasting) return;
    const interval = setInterval(() => {
      setElapsedHours(prev => prev + 1 / 3600);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFasting]);

  const percentage = Math.min(Math.round((elapsedHours / targetHours) * 100), 100);
  const remainingHours = Math.max(targetHours - elapsedHours, 0);

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h${m.toString().padStart(2, '0')}`;
  };

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 flex items-center justify-center">
        <div className="animate-pulse text-white/80 text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 flex flex-col items-center justify-center p-4 cursor-pointer relative"
      onClick={() => navigate('/jejum')}
    >
      <p className="text-white/90 text-[10px] font-semibold uppercase tracking-wider mb-2">
        Jejum Intermitente
      </p>

      <div className="flex items-center justify-center gap-4 w-full">
        {/* Remaining */}
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-white text-lg font-bold">{formatTime(remainingHours)}</span>
          <span className="text-white/70 text-[9px]">restantes</span>
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
            <Timer className="w-5 h-5 text-white" />
            <span className="text-white text-xs font-bold">{percentage}%</span>
          </div>
        </div>

        {/* Elapsed */}
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-white text-lg font-bold">{formatTime(elapsedHours)}</span>
          <span className="text-white/70 text-[9px]">decorrido</span>
        </div>
      </div>

      {/* Status + progress */}
      <div className="w-full max-w-[220px] mt-2">
        <div className="flex justify-between text-[9px] text-white/70 mb-0.5">
          <span>{isFasting ? '🟢 Em jejum' : '⚪ Sem jejum ativo'}</span>
          <span>{protocol}</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {/* CTA */}
      <button className="mt-2 flex items-center gap-1 text-white text-[10px] font-medium bg-white/20 rounded-full px-3 py-1 hover:bg-white/30 transition-colors">
        Ver Jejum <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};
