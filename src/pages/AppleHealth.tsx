import { useAuth } from "@/hooks/useAuth";
import { useHealthKit, type WeeklyDataPoint, type RecentWorkout, type HeartRateData, type SleepData } from "@/hooks/useHealthKit";
import { AuthCard } from "@/components/AuthCard";
import { Navbar } from "@/components/Navbar";
import { HealthKitConnect } from "@/components/HealthKitConnect";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart, Footprints, Flame, Scale, RefreshCw, Unlink,
  ArrowLeft, Smartphone, Watch, Activity, HelpCircle, CheckCircle2, Settings, Trash2,
  Moon
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

const HEALTHKIT_DISMISSED_KEY = 'healthkit_prompt_dismissed';
const HIDDEN_WORKOUTS_KEY = 'healthkit_hidden_workouts';

const SOURCE_STYLES: Record<string, { color: string; bg: string; icon: typeof Smartphone }> = {
  'Strava': { color: 'text-orange-600', bg: 'bg-orange-50', icon: Activity },
  'Garmin Connect': { color: 'text-blue-600', bg: 'bg-blue-50', icon: Watch },
  'Garmin': { color: 'text-blue-600', bg: 'bg-blue-50', icon: Watch },
  'Nike Run Club': { color: 'text-green-600', bg: 'bg-green-50', icon: Activity },
  'Apple Watch': { color: 'text-green-600', bg: 'bg-emerald-50', icon: Watch },
};

const getSourceStyle = (sourceName: string) => {
  for (const [key, style] of Object.entries(SOURCE_STYLES)) {
    if (sourceName.toLowerCase().includes(key.toLowerCase())) return style;
  }
  return { color: 'text-[#FD46A1]', bg: 'bg-pink-50', icon: Smartphone };
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

const FRIENDLY_DETAIL_LABELS: Record<string, string> = {
  indoorWorkout: 'Ambiente',
  isIndoorWorkout: 'Ambiente',
  averageHeartRate: 'Frequência cardíaca média',
  avgHeartRate: 'Frequência cardíaca média',
  maxHeartRate: 'Frequência cardíaca máxima',
  heartRateAverage: 'Frequência cardíaca média',
  heartRateMax: 'Frequência cardíaca máxima',
  elevationAscended: 'Elevação acumulada',
  flightsClimbed: 'Andares subidos',
  averageSpeed: 'Velocidade média',
  avgSpeed: 'Velocidade média',
  maxSpeed: 'Velocidade máxima',
  averagePace: 'Ritmo médio',
  cadence: 'Cadência',
  averageCadence: 'Cadência média',
  lapLength: 'Tamanho da volta',
  stepCount: 'Passos',
  deviceName: 'Dispositivo',
  brandName: 'Dispositivo',
  workoutBrandName: 'App que registrou',
  location: 'Local',
  city: 'Cidade',
  country: 'País',
  swimmingStrokeStyle: 'Estilo de nado',
};

const PRIMARY_DETAIL_KEYS = new Set([
  'sourceName', 'source', 'appName', 'duration', 'value', 'totalDuration', 'startDate', 'dateFrom',
  'endDate', 'dateTo', 'unit', 'sourceId', 'bundleIdentifier', 'bundleId', 'workoutType',
  'activityType', 'type', 'workoutActivityType', 'title', 'name', 'calories', 'caloriesUnit',
  'totalEnergyBurned', 'activeEnergyBurned', 'energyBurned', 'distance', 'totalDistance',
  'distanceWalkingRunning', 'distanceUnit', 'lengthUnit', 'distanceMeasurementUnit', 'notes',
  'description', 'metadata', 'workoutStatistics',
]);

const TECHNICAL_KEY_PATTERN = /(uuid|identifier|bundle|schema|sync|version|url|uri|debug|internal|raw)/i;

const isUuidLike = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const isBundleLike = (value: string) =>
  /^[a-z0-9-]+(\.[a-z0-9-]+){2,}$/i.test(value);

const isUrlLike = (value: string) =>
  /^(https?:\/\/|[a-z]+:\/\/)/i.test(value);

const formatTechnicalValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

const formatFriendlyValue = (key: string, value: unknown): string | null => {
  if (value === null || value === undefined || value === '') return null;

  if (typeof value === 'boolean') {
    if (key === 'indoorWorkout' || key === 'isIndoorWorkout') {
      return value ? 'Ambiente interno' : 'Ambiente externo';
    }
    return value ? 'Sim' : 'Não';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (/heartRate/i.test(key)) return `${value.toLocaleString('pt-BR')} bpm`;
    if (/elevation|lapLength/i.test(key)) return `${value.toLocaleString('pt-BR')} m`;
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }

  if (Array.isArray(value) && value.every((item) => ['string', 'number', 'boolean'].includes(typeof item))) {
    return value.map((item) => String(item)).join(', ');
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || isUuidLike(trimmed) || isBundleLike(trimmed) || isUrlLike(trimmed)) return null;
    return trimmed;
  }

  return null;
};

const collectFriendlyDetails = (workout: RecentWorkout) => {
  const displayMap = new Map<string, string>();
  const sources = [workout.rawData, workout.metadata ?? {}];

  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (PRIMARY_DETAIL_KEYS.has(key) || TECHNICAL_KEY_PATTERN.test(key)) continue;

      const label = FRIENDLY_DETAIL_LABELS[key];
      if (!label || displayMap.has(label)) continue;

      const formattedValue = formatFriendlyValue(key, value);
      if (formattedValue) displayMap.set(label, formattedValue);
    }
  }

  return Array.from(displayMap, ([label, value]) => ({ label, value }));
};

export default function AppleHealth() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    isSupported,
    isConnected,
    isLoading,
    debugStatus,
    dailySteps,
    dailyCalories,
    weight,
    weeklyData,
    recentWorkouts,
    requestPermissions,
    disconnect,
    refreshData,
  } = useHealthKit();

  const [hiddenWorkouts, setHiddenWorkouts] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(HIDDEN_WORKOUTS_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [selectedWorkout, setSelectedWorkout] = useState<RecentWorkout | null>(null);

  useEffect(() => {
    if (isConnected) {
      refreshData();
    }
  }, [isConnected]);

  const handleHideWorkout = useCallback((startDate: string) => {
    setHiddenWorkouts(prev => {
      const next = new Set(prev);
      next.add(startDate);
      localStorage.setItem(HIDDEN_WORKOUTS_KEY, JSON.stringify([...next]));
      return next;
    });
    toast.success("Atividade removida da lista");
  }, []);

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem(HEALTHKIT_DISMISSED_KEY);
    localStorage.removeItem(HIDDEN_WORKOUTS_KEY);
    setHiddenWorkouts(new Set());
  };

  const visibleWorkouts = recentWorkouts.filter(w => !hiddenWorkouts.has(w.startDate));

  const stepsGoal = 10000;
  const stepsPercent = Math.min((dailySteps / stepsGoal) * 100, 100);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '—';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDistance = (workout: RecentWorkout) => {
    if (typeof workout.distance !== 'number') return '—';

    const unit = workout.distanceUnit?.toLowerCase();
    if (unit === 'm' || unit === 'meter' || unit === 'meters') {
      return workout.distance >= 1000
        ? `${(workout.distance / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} km`
        : `${workout.distance.toLocaleString('pt-BR')} m`;
    }

    return `${workout.distance.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${workout.distanceUnit ?? ''}`.trim();
  };

  const workoutSummaryDetails = selectedWorkout ? collectFriendlyDetails(selectedWorkout) : [];

  const technicalDetails = selectedWorkout
    ? [
        ...Object.entries(selectedWorkout.rawData),
        ...Object.entries(selectedWorkout.metadata ?? {}).map(([key, value]) => [`metadata.${key}`, value] as const),
      ]
        .filter(([key, value]) => !PRIMARY_DETAIL_KEYS.has(key) && value !== null && value !== undefined && value !== '')
        .map(([key, value]) => ({ key, value: formatTechnicalValue(value) }))
    : [];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary pb-28">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-[calc(env(safe-area-inset-top)+2.5rem)]">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-primary pb-28">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-[calc(env(safe-area-inset-top)+2.5rem)]">
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Acesso Restrito</h1>
              <p className="text-gray-600 mb-8">Você precisa estar logado para acessar esta página</p>
            </div>
            <AuthCard mode="login" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-28">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <div className="mb-4 animate-fade-in">
          <div className="bg-gradient-to-r from-red-500/20 via-pink-500/20 to-primary/20 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 p-2.5 rounded-xl shadow-lg">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <h1 className="text-xl font-bold text-[#FD46A1]">Apple Health</h1>
            </div>
            <Badge
              variant="secondary"
              className={`text-xs ${isConnected ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500'}`}
            >
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
        </div>

        {/* FitTracker button */}
        <Button
          onClick={() => navigate('/fit-tracker')}
          className="w-full mb-6 rounded-2xl bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Acessar FitTracker
        </Button>

        {/* Not connected */}
        {!isConnected && (
          <HealthKitConnect
            onConnect={requestPermissions}
            onDismiss={() => navigate('/fit-tracker')}
            isLoading={isLoading}
            debugStatus={debugStatus}
          />
        )}

        {/* Connected content */}
        {isConnected && (
          <div className="space-y-4 animate-fade-in">
            {/* Action buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading} className="rounded-xl">
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleDisconnect} className="rounded-xl text-muted-foreground hover:text-destructive">
                <Unlink className="w-4 h-4 mr-1" />
                Desconectar
              </Button>
            </div>

            {/* Steps card */}
            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Footprints className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-foreground">Passos Hoje</span>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {isLoading ? '...' : dailySteps.toLocaleString('pt-BR')}
              </div>
              <Progress value={stepsPercent} className="h-3 mb-1" />
              <p className="text-xs text-muted-foreground">
                {isLoading ? '' : `${Math.round(stepsPercent)}% da meta de ${stepsGoal.toLocaleString('pt-BR')} passos`}
              </p>
            </div>

            {/* Calories + Weight row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg">
                <Flame className="w-5 h-5 text-orange-500 mb-2" />
                <div className="text-3xl font-bold text-orange-600">
                  {isLoading ? '...' : dailyCalories.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">kcal ativas</p>
              </div>

              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg">
                <Scale className="w-5 h-5 text-purple-500 mb-2" />
                <div className="text-3xl font-bold text-purple-600">
                  {isLoading ? '...' : weight !== null ? `${weight.toFixed(1)}` : '—'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{weight !== null ? 'kg' : 'Sem dados'}</p>
              </div>
            </div>

            {/* Weekly chart */}
            {weeklyData.length > 0 && (
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg">
                <h3 className="font-semibold text-foreground mb-4">Histórico Semanal</h3>

                {/* Steps bars */}
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Footprints className="w-3 h-3 text-blue-500" /> Passos
                </p>
                <div className="flex items-end gap-1 h-20 mb-4">
                  {weeklyData.map((d) => {
                    const maxSteps = Math.max(...weeklyData.map(w => w.steps), 1);
                    const height = Math.max((d.steps / maxSteps) * 100, 4);
                    const dayLabel = new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'narrow' });
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">{d.steps > 0 ? (d.steps / 1000).toFixed(1) + 'k' : ''}</span>
                        <div
                          className="w-full bg-blue-400 rounded-t-md transition-all"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-[10px] text-muted-foreground">{dayLabel}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Calories bars */}
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" /> Calorias
                </p>
                <div className="flex items-end gap-1 h-20">
                  {weeklyData.map((d) => {
                    const maxCal = Math.max(...weeklyData.map(w => w.calories), 1);
                    const height = Math.max((d.calories / maxCal) * 100, 4);
                    const dayLabel = new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'narrow' });
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">{d.calories > 0 ? d.calories : ''}</span>
                        <div
                          className="w-full bg-orange-400 rounded-t-md transition-all"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-[10px] text-muted-foreground">{dayLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Connected Apps Workouts */}
            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#FD46A1]" />
                Atividades de Apps Conectados
              </h3>

              {visibleWorkouts.length === 0 ? (
                <div className="text-center py-6">
                  <Watch className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum treino recente encontrado.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Treinos do Strava, Garmin, Nike Run Club e outros apps aparecerão aqui automaticamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleWorkouts.map((workout, index) => {
                    const style = getSourceStyle(workout.sourceName);
                    const IconComponent = style.icon;
                    const date = new Date(workout.startDate);
                    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={workout.startDate + index}
                        className={`flex items-center gap-3 p-3 rounded-xl ${style.bg} transition-all cursor-pointer`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedWorkout(workout)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedWorkout(workout);
                          }
                        }}
                      >
                        <div className={`p-2 rounded-lg bg-white/70 shadow-sm`}>
                          <IconComponent className={`w-5 h-5 ${style.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${style.color} truncate`}>
                            {workout.sourceName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dateStr} às {timeStr}
                          </p>
                        </div>
                        <div className="text-right mr-1">
                          <p className="text-sm font-bold text-foreground">
                            {formatDuration(workout.value)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleHideWorkout(workout.startDate);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Guia de conexão de apps externos */}
            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#FD46A1]" />
                Como conectar apps externos
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Para que seus treinos apareçam aqui, ative a integração com o Apple Health no app de origem:
              </p>

              <Accordion type="single" collapsible className="space-y-2">
                {/* Strava */}
                <AccordionItem value="strava" className="border rounded-xl px-3 bg-orange-50/50 border-orange-200/50">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-semibold text-orange-600">Strava</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
                      <li>Abra o <strong>Strava</strong> e toque no seu perfil</li>
                      <li>Vá em <strong>Configurações → Aplicativos, Serviços e Dispositivos</strong></li>
                      <li>Toque em <strong>Saúde</strong> e ative <strong>Apple Health</strong></li>
                      <li>Na tela de permissões, ative <strong>"Treinos"</strong> para escrita</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                {/* Garmin */}
                <AccordionItem value="garmin" className="border rounded-xl px-3 bg-blue-50/50 border-blue-200/50">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Watch className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-600">Garmin Connect</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
                      <li>Abra o <strong>Garmin Connect</strong> e toque em <strong>"Mais" (⋯)</strong></li>
                      <li>Vá em <strong>Configurações → Saúde e Bem-estar</strong></li>
                      <li>Ative a integração com <strong>Apple Health</strong></li>
                      <li>Permita o acesso para <strong>leitura e escrita</strong> de treinos</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                {/* Nike Run Club */}
                <AccordionItem value="nike" className="border rounded-xl px-3 bg-green-50/50 border-green-200/50">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">Nike Run Club</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
                      <li>Abra o <strong>Nike Run Club</strong> e vá em <strong>Configurações</strong></li>
                      <li>Toque em <strong>Apple Health</strong></li>
                      <li>Ative <strong>todas as categorias</strong> de dados para sincronização</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                {/* Verificação */}
                <AccordionItem value="verify" className="border rounded-xl px-3 bg-muted/30 border-border/50">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">Como verificar</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
                      <li>Abra <strong>Ajustes</strong> do iPhone → <strong>Saúde</strong></li>
                      <li>Toque em <strong>Acesso e Dispositivos</strong></li>
                      <li>Verifique que o app (Strava, Garmin, etc.) aparece com permissões <strong>ativas</strong></li>
                      <li className="flex items-start gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                        <span>Após um treino, volte aqui e toque em <strong>"Atualizar"</strong></span>
                      </li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <Dialog open={!!selectedWorkout} onOpenChange={(open) => !open && setSelectedWorkout(null)}>
              <DialogContent className="flex max-h-[85vh] w-[calc(100%-2rem)] max-w-md flex-col rounded-2xl border-2 border-primary bg-white/70 shadow-xl backdrop-blur-md">
                {selectedWorkout && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="pr-8 text-left text-foreground">
                        {selectedWorkout.title || selectedWorkout.workoutType || selectedWorkout.sourceName}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-primary/30 bg-background/75 p-3 shadow-sm">
                          <p className="text-xs text-muted-foreground">Origem</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">{selectedWorkout.sourceName}</p>
                        </div>
                        <div className="rounded-xl border border-primary/30 bg-background/75 p-3 shadow-sm">
                          <p className="text-xs text-muted-foreground">Duração</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">{formatDuration(selectedWorkout.value)}</p>
                        </div>
                        <div className="rounded-xl border border-primary/30 bg-background/75 p-3 shadow-sm">
                          <p className="text-xs text-muted-foreground">Início</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">{formatDateTime(selectedWorkout.startDate)}</p>
                        </div>
                        <div className="rounded-xl border border-primary/30 bg-background/75 p-3 shadow-sm">
                          <p className="text-xs text-muted-foreground">Fim</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">{formatDateTime(selectedWorkout.endDate)}</p>
                        </div>
                        <div className="rounded-xl border border-primary/30 bg-background/75 p-3 shadow-sm">
                          <p className="text-xs text-muted-foreground">Tipo</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">{selectedWorkout.workoutType || '—'}</p>
                        </div>
                        <div className="rounded-xl border border-primary/30 bg-background/75 p-3 shadow-sm">
                          <p className="text-xs text-muted-foreground">Distância</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">{formatDistance(selectedWorkout)}</p>
                        </div>
                        <div className="rounded-xl border border-primary/30 bg-background/75 p-3 shadow-sm">
                          <p className="text-xs text-muted-foreground">Calorias</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {typeof selectedWorkout.calories === 'number'
                              ? `${selectedWorkout.calories.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${selectedWorkout.caloriesUnit ?? 'kcal'}`
                              : '—'}
                          </p>
                        </div>
                      </div>

                      {selectedWorkout.notes && (
                        <div className="rounded-xl border border-primary/30 bg-background/75 p-3 shadow-sm">
                          <p className="text-xs text-muted-foreground">Observações</p>
                          <p className="mt-1 break-words text-sm text-foreground">{selectedWorkout.notes}</p>
                        </div>
                      )}

                      {workoutSummaryDetails.length > 0 && (
                        <div className="rounded-xl border border-primary/30 bg-background/75 p-3 shadow-sm">
                          <p className="text-xs text-muted-foreground">Informações adicionais</p>
                          <div className="mt-2 space-y-2">
                            {workoutSummaryDetails.map((detail) => (
                              <div key={detail.label} className="rounded-lg border border-primary/20 bg-background/90 px-3 py-2">
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{detail.label}</p>
                                <p className="mt-1 break-words text-sm text-foreground">{detail.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {technicalDetails.length > 0 && (
                        <Accordion type="single" collapsible>
                          <AccordionItem value="technical-details" className="rounded-xl border border-primary/30 bg-background/75 px-3 shadow-sm">
                            <AccordionTrigger className="py-3 text-xs text-muted-foreground hover:no-underline">
                              Detalhes técnicos
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="max-h-40 space-y-2 overflow-y-auto pb-1">
                                {technicalDetails.map((detail) => (
                                  <div key={detail.key} className="rounded-lg border border-primary/20 bg-background/90 px-3 py-2">
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{detail.key}</p>
                                    <pre className="mt-1 whitespace-pre-wrap break-words text-xs text-foreground">{detail.value}</pre>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}