import { useAuth } from "@/hooks/useAuth";
import { useHealthKit, type WeeklyDataPoint, type RecentWorkout } from "@/hooks/useHealthKit";
import { AuthCard } from "@/components/AuthCard";
import { Navbar } from "@/components/Navbar";
import { HealthKitConnect } from "@/components/HealthKitConnect";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Heart, Footprints, Flame, Scale, RefreshCw, Unlink,
  ArrowLeft, Smartphone, Watch, Activity, HelpCircle, CheckCircle2, Settings, Trash2
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
                        className={`flex items-center gap-3 p-3 rounded-xl ${style.bg} transition-all`}
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
                          onClick={() => handleHideWorkout(workout.startDate)}
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
          </div>
        )}
      </div>
    </div>
  );
}