import { useEffect, useMemo, useState } from "react";
import { Droplets, Plus, Save, Target, Trash2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { AuthCard } from "@/components/AuthCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { hydrationCatalog } from "@/data/hydrationCatalog";

interface HydrationRecord {
  id: string;
  beverage_key: string;
  beverage_name: string;
  volume_ml: number;
  calories: number;
  hydration_factor: number;
  hydration_impact_ml: number;
  consumed_at: string;
  consumption_date: string;
}

const formatDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Hydration() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<HydrationRecord[]>([]);
  const [hydrationGoalMl, setHydrationGoalMl] = useState(3000);
  const [goalInput, setGoalInput] = useState("3000");
  const [savingGoal, setSavingGoal] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBeverageKey, setSelectedBeverageKey] = useState(hydrationCatalog[0].key);
  const [volumeMl, setVolumeMl] = useState(hydrationCatalog[0].defaultVolumeOptions[0]);
  const [savingRecord, setSavingRecord] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  const todayDate = useMemo(() => formatDateOnly(new Date()), []);

  const selectedBeverage = useMemo(
    () => hydrationCatalog.find((beverage) => beverage.key === selectedBeverageKey) ?? hydrationCatalog[0],
    [selectedBeverageKey]
  );

  const loadHydrationData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6);

      const [recordsResult, profileResult] = await Promise.all([
        supabase
          .from("hydration_records")
          .select("*")
          .eq("user_id", user.id)
          .gte("consumption_date", formatDateOnly(weekStart))
          .lte("consumption_date", formatDateOnly(today))
          .order("consumed_at", { ascending: false }),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      ]);

      if (recordsResult.error) throw recordsResult.error;
      if (profileResult.error) throw profileResult.error;

      const userGoal = Number((profileResult.data as { hydration_goal_ml?: number } | null)?.hydration_goal_ml) || 3000;
      setRecords((recordsResult.data ?? []) as HydrationRecord[]);
      setHydrationGoalMl(userGoal);
      setGoalInput(String(userGoal));
    } catch (error) {
      console.error("Erro ao carregar hidratação:", error);
      toast.error("Erro ao carregar dados de hidratação");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadHydrationData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const todayRecords = records.filter((record) => record.consumption_date === todayDate);

  const hydrationTodayMl = todayRecords.reduce(
    (total, record) => total + Number(record.hydration_impact_ml || 0),
    0
  );

  const hydrationPercentRaw = hydrationGoalMl > 0 ? (hydrationTodayMl / hydrationGoalMl) * 100 : 0;
  const hydrationPercentBar = Math.max(0, Math.min(100, hydrationPercentRaw));

  const weeklyData = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const key = formatDateOnly(date);

      const dayRecords = records.filter((record) => record.consumption_date === key);
      const calories = dayRecords.reduce((sum, record) => sum + Number(record.calories || 0), 0);
      const volume = dayRecords.reduce((sum, record) => sum + Number(record.volume_ml || 0), 0);

      return {
        key,
        label: WEEKDAY_LABELS[date.getDay()],
        calories,
        volume,
      };
    });

    return days;
  }, [records]);

  const maxWeeklyCalories = Math.max(1, ...weeklyData.map((item) => item.calories));
  const weeklyVolumeTotal = weeklyData.reduce((sum, item) => sum + item.volume, 0);

  const handleSaveGoal = async () => {
    if (!user) return;

    const parsedGoal = Math.max(500, Number(goalInput) || 3000);
    setSavingGoal(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ hydration_goal_ml: parsedGoal } as never)
        .eq("id", user.id);

      if (error) throw error;
      setHydrationGoalMl(parsedGoal);
      setGoalInput(String(parsedGoal));
      toast.success("Meta de hidratação atualizada");
    } catch (error) {
      console.error("Erro ao salvar meta de hidratação:", error);
      toast.error("Não foi possível salvar sua meta");
    } finally {
      setSavingGoal(false);
    }
  };

  const handleSaveRecord = async () => {
    if (!user || !selectedBeverage) return;

    const now = new Date();
    const hydrationImpactMl = volumeMl * (selectedBeverage.hydrationFactor / 100);
    const calories = Math.round((volumeMl / 100) * selectedBeverage.defaultCaloriesPer100ml);

    setSavingRecord(true);
    try {
      const { error } = await supabase.from("hydration_records").insert({
        user_id: user.id,
        beverage_key: selectedBeverage.key,
        beverage_name: selectedBeverage.name,
        volume_ml: volumeMl,
        calories,
        hydration_factor: selectedBeverage.hydrationFactor,
        hydration_impact_ml: hydrationImpactMl,
        consumed_at: now.toISOString(),
        consumption_date: formatDateOnly(now),
      } as never);

      if (error) throw error;

      setDialogOpen(false);
      setSelectedBeverageKey(hydrationCatalog[0].key);
      setVolumeMl(hydrationCatalog[0].defaultVolumeOptions[0]);
      toast.success("Bebida registrada");
      loadHydrationData();
    } catch (error) {
      console.error("Erro ao registrar bebida:", error);
      toast.error("Erro ao registrar bebida");
    } finally {
      setSavingRecord(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!user) return;

    setDeletingRecordId(recordId);
    try {
      const { error } = await supabase
        .from("hydration_records")
        .delete()
        .eq("id", recordId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Bebida removida");
      await loadHydrationData();
    } catch (error) {
      console.error("Erro ao remover bebida:", error);
      toast.error("Não foi possível remover a bebida");
    } finally {
      setDeletingRecordId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-primary pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-28">
          <div className="container mx-auto px-4 py-8">
            <p className="text-center text-muted-foreground">Carregando hidratação...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-primary pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-28">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-foreground mb-4">Acesso Restrito</h1>
                <p className="text-muted-foreground mb-8">Você precisa estar logado para acessar a hidratação.</p>
              </div>
              <AuthCard mode="login" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-40">
        <div className="container mx-auto px-4 py-8 space-y-4">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-background/60 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <Droplets className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-primary">Hidratação</h1>
          </div>

          <Card className="rounded-3xl border-primary/20 bg-primary/10 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Progresso de hidratação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-2xl font-bold text-primary">{hydrationPercentRaw.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(hydrationTodayMl)} ml de impacto hidratante hoje
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">Meta: {hydrationGoalMl} ml</p>
                </div>
              </div>

              <Progress value={hydrationPercentBar} className="h-3 bg-background/80" />

              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <div>
                  <Label htmlFor="hydration-goal" className="text-xs text-muted-foreground">
                    Meta diária personalizada (ml)
                  </Label>
                  <Input
                    id="hydration-goal"
                    type="number"
                    min={500}
                    step={100}
                    value={goalInput}
                    onChange={(event) => setGoalInput(event.target.value)}
                    className="bg-background"
                  />
                </div>
                <Button type="button" onClick={handleSaveGoal} disabled={savingGoal} className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-primary/20 bg-primary/10 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Calorias por bebida (semana)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Últimos 7 dias</span>
                <span className="font-semibold">Volume total: {weeklyVolumeTotal} ml</span>
              </div>

              <div className="grid grid-cols-7 gap-2 items-end h-44">
                {weeklyData.map((day) => {
                  const barHeight = (day.calories / maxWeeklyCalories) * 100;

                  return (
                    <div key={day.key} className="flex flex-col items-center gap-2">
                      <div className="h-24 w-full rounded-xl bg-background/80 flex items-end p-1">
                        <div
                          className="w-full rounded-lg bg-primary transition-all duration-300"
                          style={{ height: `${Math.max(6, barHeight)}%` }}
                        />
                      </div>
                      <p className="text-[10px] leading-none font-semibold uppercase">{day.label}</p>
                      <p className="text-[10px] leading-none text-muted-foreground">{day.calories} kcal</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-primary/20 bg-primary/10 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bebidas consumidas hoje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma bebida registrada hoje.</p>
              ) : (
                todayRecords.map((record) => {
                  const catalogItem = hydrationCatalog.find((beverage) => beverage.key === record.beverage_key);
                  return (
                    <div key={record.id} className="rounded-2xl border border-primary/20 bg-background p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-lg">
                          {catalogItem?.icon ?? "🥤"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{record.beverage_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {record.volume_ml} ml • {record.calories} kcal
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <p className="text-xs font-semibold text-muted-foreground">
                          {new Date(record.consumed_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                          disabled={deletingRecordId === record.id}
                          className="h-7 px-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingRecordId === record.id ? "Removendo..." : "Remover"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="fixed left-1/2 -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] w-full max-w-md px-4 z-40">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-12 rounded-2xl shadow-lg gap-2 text-base">
                <Plus className="h-5 w-5" />
                Adicionar bebida
              </Button>
            </DialogTrigger>

            <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-background/70 backdrop-blur-md border-2 border-primary shadow-xl p-4 sm:p-6">
              <DialogHeader className="pr-8">
                <DialogTitle>Registrar bebida</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pr-1 sm:pr-0">
                <div className="space-y-2">
                  <Label>Escolha a bebida</Label>
                  <div className="max-h-[38vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {hydrationCatalog.map((beverage) => (
                        <button
                          key={beverage.key}
                          type="button"
                          onClick={() => {
                            setSelectedBeverageKey(beverage.key);
                            setVolumeMl(beverage.defaultVolumeOptions[0]);
                          }}
                          className={`w-full px-3 py-2 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-1 min-h-10 ${
                            selectedBeverageKey === beverage.key
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-foreground border-border"
                          }`}
                        >
                          <span>{beverage.icon}</span>
                          <span className="truncate">{beverage.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quantidade (ml)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedBeverage.defaultVolumeOptions.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={volumeMl === option ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => setVolumeMl(option)}
                      >
                        {option} ml
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    min={10}
                    step={10}
                    value={volumeMl}
                    onChange={(event) => setVolumeMl(Math.max(10, Number(event.target.value) || 10))}
                  />
                </div>

                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-sm space-y-1">
                  <p className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Prévia do registro
                  </p>
                  <p>
                    Impacto de hidratação: <strong>{Math.round(volumeMl * (selectedBeverage.hydrationFactor / 100))} ml</strong>
                  </p>
                  <p>
                    Calorias: <strong>{Math.round((volumeMl / 100) * selectedBeverage.defaultCaloriesPer100ml)} kcal</strong>
                  </p>
                </div>

                <Button type="button" onClick={handleSaveRecord} disabled={savingRecord} className="w-full">
                  Salvar consumo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}