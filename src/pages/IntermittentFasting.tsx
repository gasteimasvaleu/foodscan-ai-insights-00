
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Square, Flame, TrendingUp, Calendar, ChevronDown } from 'lucide-react';
import { format, differenceInSeconds, differenceInHours, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Navbar } from '@/components/Navbar';
import { AuthCard } from '@/components/AuthCard';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { WheelPicker } from '@/components/ui/wheel-picker';

const PROTOCOLS = [
  { label: '16:8', hours: 16 },
  { label: '18:6', hours: 18 },
  { label: '20:4', hours: 20 },
  { label: 'OMAD', hours: 23 },
  { label: '14:10', hours: 14 },
];

const IntermittentFasting = () => {
  const { user } = useAuth();
  const [selectedProtocol, setSelectedProtocol] = useState(PROTOCOLS[0]);
  const [activeFast, setActiveFast] = useState<any>(null);
  const [isProtocolDrawerOpen, setIsProtocolDrawerOpen] = useState(false);
  const [pendingProtocol, setPendingProtocol] = useState(PROTOCOLS[0].label);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [weekHistory, setWeekHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ streak: 0, avgHours: 0, longestHours: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    // Fetch active fast (no ended_at)
    const { data: active } = await supabase
      .from('fasting_records')
      .select('*')
      .eq('user_id', user.id)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1);

    if (active && active.length > 0) {
      setActiveFast(active[0]);
      const proto = PROTOCOLS.find(p => p.label === active[0].protocol);
      if (proto) setSelectedProtocol(proto);
    } else {
      setActiveFast(null);
    }

    // Fetch last 7 days of completed fasts
    const sevenDaysAgo = subDays(new Date(), 6).toISOString();
    const { data: history } = await supabase
      .from('fasting_records')
      .select('*')
      .eq('user_id', user.id)
      .not('ended_at', 'is', null)
      .gte('started_at', sevenDaysAgo)
      .order('started_at', { ascending: false });

    setWeekHistory(history || []);

    // Fetch all completed for stats
    const { data: allCompleted } = await supabase
      .from('fasting_records')
      .select('*')
      .eq('user_id', user.id)
      .not('ended_at', 'is', null)
      .order('started_at', { ascending: false });

    if (allCompleted && allCompleted.length > 0) {
      const durations = allCompleted.map(r => {
        const diff = differenceInSeconds(new Date(r.ended_at), new Date(r.started_at));
        return diff / 3600;
      });
      const longest = Math.max(...durations);
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;

      // Calculate streak (consecutive days with a completed fast)
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const day = startOfDay(subDays(new Date(), i));
        const nextDay = startOfDay(subDays(new Date(), i - 1));
        const hasFast = allCompleted.some(r => {
          const start = new Date(r.started_at);
          return start >= day && start < nextDay;
        });
        if (hasFast) streak++;
        else if (i > 0) break; // allow today to be missing
      }

      setStats({ streak, avgHours: Math.round(avg * 10) / 10, longestHours: Math.round(longest * 10) / 10 });
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Timer interval
  useEffect(() => {
    if (!activeFast) {
      setElapsedSeconds(0);
      return;
    }
    const calc = () => differenceInSeconds(new Date(), new Date(activeFast.started_at));
    setElapsedSeconds(calc());
    const interval = setInterval(() => setElapsedSeconds(calc()), 1000);
    return () => clearInterval(interval);
  }, [activeFast]);

  const targetSeconds = selectedProtocol.hours * 3600;
  const progress = activeFast ? Math.min((elapsedSeconds / targetSeconds) * 100, 100) : 0;
  const completed = progress >= 100;

  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('fasting_records')
      .insert({
        user_id: user.id,
        target_hours: selectedProtocol.hours,
        protocol: selectedProtocol.label,
      })
      .select()
      .single();
    if (!error && data) {
      setActiveFast(data);
    }
  };

  const handleStop = async () => {
    if (!activeFast) return;
    await supabase
      .from('fasting_records')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', activeFast.id);
    setActiveFast(null);
    fetchData();
  };

  // Build week days
  // Find the most recent Sunday (0 = Sunday)
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const lastSunday = subDays(today, currentDayOfWeek);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(lastSunday, -i); // Sunday + i days
    const dayStart = startOfDay(day);
    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);
    const record = weekHistory.find(r => {
      const s = new Date(r.started_at);
      return s >= dayStart && s < nextDay;
    });
    const hours = record
      ? Math.round(differenceInSeconds(new Date(record.ended_at), new Date(record.started_at)) / 3600 * 10) / 10
      : 0;
    const target = record ? record.target_hours : selectedProtocol.hours;
    return {
      label: format(day, 'EEE', { locale: ptBR }),
      date: format(day, 'dd/MM'),
      hours,
      target,
      hit: hours >= target,
      hasRecord: !!record,
    };
  });

  if (!user) return <AuthCard />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-[calc(env(safe-area-inset-top)+4rem)] pb-40">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[calc(env(safe-area-inset-top)+4rem)] pb-40">
      <Navbar />
      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg font-bold text-primary">Jejum Intermitente</h1>
        </div>
        {/* Timer Card */}
        <Card className="rounded-3xl border-primary/20 bg-primary/10 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">Timer de Jejum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Protocol selector */}
            {!activeFast && (
              <button
                onClick={() => {
                  setPendingProtocol(selectedProtocol.label);
                  setIsProtocolDrawerOpen(true);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-primary text-primary rounded-xl font-semibold text-sm"
              >
                <span>Selecionar Jejum — {selectedProtocol.label}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}

            {activeFast && (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  completed ? 'bg-green-100 text-green-700' : 'bg-primary/20 text-primary'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${completed ? 'bg-green-500' : 'bg-primary animate-pulse'}`} />
                  {completed ? 'Meta atingida!' : 'Em jejum'}
                </span>
                <span className="text-xs text-muted-foreground">Protocolo {activeFast.protocol}</span>
              </div>
            )}

            {/* Ring */}
            <div className="bg-[#F9FAFB] rounded-2xl p-6 shadow-sm">
              <div className="relative w-[160px] h-[160px] flex items-center justify-center mx-auto">
                <svg width="160" height="160" className="rotate-[-90deg]">
                  <circle cx="80" cy="80" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle
                    cx="80" cy="80" r={radius} fill="none"
                    stroke={completed ? 'hsl(142, 71%, 45%)' : 'hsl(var(--primary))'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-foreground font-mono">
                    {activeFast ? formatTime(elapsedSeconds) : formatTime(0)}
                  </span>
                  <span className="text-[9px] text-muted-foreground mt-1">
                    Meta: {selectedProtocol.hours}h
                  </span>
                </div>
              </div>
            </div>

            {/* Action button */}
            {!activeFast ? (
              <Button onClick={handleStart} className="w-full rounded-full gap-2">
                <Play className="w-4 h-4" /> Iniciar Jejum
              </Button>
            ) : (
              <Button onClick={handleStop} variant="destructive" className="w-full rounded-full gap-2">
                <Square className="w-4 h-4" /> Finalizar Jejum
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Week History Card */}
        <Card className="rounded-3xl border-primary/20 bg-primary/10 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] text-muted-foreground capitalize">{day.label}</span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                    day.hasRecord
                      ? day.hit
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-600'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {day.hasRecord ? `${day.hours}h` : '-'}
                  </div>
                  <span className="text-[8px] text-muted-foreground">{day.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="rounded-3xl border-primary/20 bg-primary/10 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-background rounded-2xl p-3 text-center">
                <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-lg font-bold text-foreground">{stats.streak}</span>
                <p className="text-[9px] text-muted-foreground">Dias seguidos</p>
              </div>
              <div className="bg-background rounded-2xl p-3 text-center">
                <Timer className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-lg font-bold text-foreground">{stats.avgHours}h</span>
                <p className="text-[9px] text-muted-foreground">Média</p>
              </div>
              <div className="bg-background rounded-2xl p-3 text-center">
                <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-lg font-bold text-foreground">{stats.longestHours}h</span>
                <p className="text-[9px] text-muted-foreground">Recorde</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Protocol Drawer */}
      <Drawer open={isProtocolDrawerOpen} onOpenChange={setIsProtocolDrawerOpen}>
        <DrawerContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
          <DrawerHeader>
            <DrawerTitle className="text-center text-foreground">Selecionar Protocolo</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">
            <WheelPicker
              value={pendingProtocol}
              onChange={setPendingProtocol}
              options={PROTOCOLS.map(p => ({ label: `${p.label} (${p.hours}h jejum)`, value: p.label }))}
            />
          </div>
          <DrawerFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setIsProtocolDrawerOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 rounded-xl"
              onClick={() => {
                const proto = PROTOCOLS.find(p => p.label === pendingProtocol);
                if (proto) setSelectedProtocol(proto);
                setIsProtocolDrawerOpen(false);
              }}
            >
              Confirmar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default IntermittentFasting;
