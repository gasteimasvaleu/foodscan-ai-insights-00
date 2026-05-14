import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Timer, Trophy, Flame, Zap, Sparkles, Battery, Utensils } from 'lucide-react';

const QUICK_PROTOCOLS = [
  { label: '16:8', hours: 16 },
  { label: '18:6', hours: 18 },
  { label: '20:4', hours: 20 },
];

const FAST_PHASES = [
  { max: 4, label: 'Digestão', Icon: Utensils, color: 'text-amber-200' },
  { max: 8, label: 'Reservas', Icon: Battery, color: 'text-sky-200' },
  { max: 14, label: 'Queima de gordura', Icon: Flame, color: 'text-orange-200' },
  { max: 18, label: 'Cetose', Icon: Zap, color: 'text-yellow-200' },
  { max: Infinity, label: 'Autofagia', Icon: Sparkles, color: 'text-emerald-200' },
];

const getPhase = (hours: number) =>
  FAST_PHASES.find(p => hours < p.max) ?? FAST_PHASES[FAST_PHASES.length - 1];

export const DailyFastingSummaryCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isFasting, setIsFasting] = useState(false);
  const [elapsedHours, setElapsedHours] = useState(0);
  const [targetHours, setTargetHours] = useState(16);
  const [protocol, setProtocol] = useState('16:8');
  const [busy, setBusy] = useState(false);

  const loadActive = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('fasting_records')
      .select('*')
      .eq('user_id', user.id)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      const r = data[0];
      setActiveId(r.id);
      setIsFasting(true);
      setTargetHours(r.target_hours);
      setProtocol(r.protocol);
      setElapsedHours((Date.now() - new Date(r.started_at).getTime()) / 3_600_000);
    } else {
      setActiveId(null);
      setIsFasting(false);
      setElapsedHours(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Live timer
  useEffect(() => {
    if (!isFasting) return;
    const interval = setInterval(() => {
      setElapsedHours(prev => prev + 1 / 3600);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFasting]);

  const percentage = Math.min(Math.round((elapsedHours / targetHours) * 100), 100);
  const remainingHours = Math.max(targetHours - elapsedHours, 0);
  const goalReached = isFasting && elapsedHours >= targetHours;
  const phase = getPhase(elapsedHours);

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h${m.toString().padStart(2, '0')}`;
  };

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const startFast = async (e: React.MouseEvent, p: typeof QUICK_PROTOCOLS[number]) => {
    e.stopPropagation();
    if (!user?.id || busy) return;
    setBusy(true);
    const { data, error } = await supabase
      .from('fasting_records')
      .insert({ user_id: user.id, target_hours: p.hours, protocol: p.label })
      .select()
      .single();
    setBusy(false);
    if (error || !data) {
      toast.error('Erro ao iniciar jejum');
      return;
    }
    setActiveId(data.id);
    setIsFasting(true);
    setTargetHours(p.hours);
    setProtocol(p.label);
    setElapsedHours(0);
    toast.success(`Jejum ${p.label} iniciado 🔥`);
  };

  const stopFast = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeId || busy) return;
    setBusy(true);
    const { error } = await supabase
      .from('fasting_records')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', activeId);
    setBusy(false);
    if (error) {
      toast.error('Erro ao encerrar jejum');
      return;
    }
    setIsFasting(false);
    setActiveId(null);
    setElapsedHours(0);
    toast.success('Jejum encerrado ✨');
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 flex items-center justify-center">
        <div className="animate-pulse text-white/80 text-sm">Carregando...</div>
      </div>
    );
  }

  const gradient = goalReached
    ? 'from-amber-400 via-orange-400 to-emerald-500'
    : 'from-purple-500 via-violet-500 to-indigo-600';

  const ringStroke = goalReached ? '#fde68a' : 'white';

  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${gradient} transition-colors duration-500 flex flex-col px-3 pt-2.5 pb-6 cursor-pointer relative`}
      onClick={() => navigate('/jejum')}
    >
      {/* Header */}
      <div className="relative flex items-center justify-center mb-1.5">
        <p className="text-white/90 text-[10px] font-semibold uppercase tracking-wider">
          Jejum Intermitente
        </p>
      </div>

      {/* Hero: ring + text */}
      <div className="flex items-center gap-3 flex-1">
        {/* Ring */}
        <div className="relative w-[104px] h-[104px] flex items-center justify-center shrink-0">
          <svg width="104" height="104" className="rotate-[-90deg]">
            <circle cx="52" cy="52" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="7" />
            <circle
              cx="52" cy="52" r={radius} fill="none"
              stroke={ringStroke} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {goalReached ? (
              <Trophy className="w-5 h-5 text-white" />
            ) : (
              <Timer className="w-4 h-4 text-white/90" />
            )}
            <span className="text-white text-lg font-black leading-tight">{percentage}%</span>
          </div>
        </div>

        {/* Text column */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {isFasting ? (
            <>
              <span className="text-white text-3xl font-black leading-none tracking-tight">
                {goalReached ? formatTime(elapsedHours) : formatTime(remainingHours)}
              </span>
              <span className="text-white/80 text-[11px] mt-0.5">
                {goalReached ? 'meta atingida!' : 'restantes'}
              </span>
              <div className={`flex items-center gap-1 mt-1.5 ${phase.color}`}>
                <phase.Icon className={`w-3.5 h-3.5 ${phase.label === 'Queima de gordura' ? 'animate-pulse' : ''}`} />
                <span className="text-[11px] font-semibold">{phase.label}</span>
              </div>
              <span className="text-white/70 text-[10px] mt-0.5">
                Decorrido {formatTime(elapsedHours)} · Meta {targetHours}h
              </span>
            </>
          ) : (
            <>
              <span className="text-white text-2xl font-black leading-tight">Pronto?</span>
              <span className="text-white/80 text-[11px] mt-1 leading-snug">
                Escolha um protocolo abaixo e começe agora.
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="relative z-10 mt-2">
        {isFasting ? (
          <button
            onClick={stopFast}
            disabled={busy}
            className="w-full bg-white/30 hover:bg-white/40 active:scale-95 disabled:opacity-50 transition-all rounded-full py-2 text-white text-xs font-bold"
          >
            Encerrar jejum
          </button>
        ) : (
          <div className="flex gap-1.5">
            {QUICK_PROTOCOLS.map(p => (
              <button
                key={p.label}
                onClick={(e) => startFast(e, p)}
                disabled={busy}
                className="flex-1 bg-white/25 hover:bg-white/35 active:scale-95 disabled:opacity-50 transition-all rounded-full py-1.5 text-white text-[12px] font-bold"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
