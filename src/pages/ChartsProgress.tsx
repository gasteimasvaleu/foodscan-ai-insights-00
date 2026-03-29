import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHealthKit } from "@/hooks/useHealthKit";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Utensils, Flame, Dumbbell, Calendar, Calculator, BarChart3 } from "lucide-react";
import { PhysicalEvolutionChart } from "@/components/PhysicalEvolutionChart";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

interface Stats {
  totalMeals: number;
  totalCaloriesBurned: number;
  totalExercises: number;
  activeDays: number;
}

interface WeeklyData {
  week: string;
  calories: number;
  goal: number;
}

interface CalorieBalanceData {
  day: string;
  consumed: number;
  burned: number;
  balance: number;
}

export default function ChartsProgress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isConnected: hkConnected, getWeeklyData: getHKWeeklyData } = useHealthKit();
  const [stats, setStats] = useState<Stats>({ totalMeals: 0, totalCaloriesBurned: 0, totalExercises: 0, activeDays: 0 });
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [calorieBalanceData, setCalorieBalanceData] = useState<CalorieBalanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBMR, setEditBMR] = useState<number>(0);
  const [showBMRCalculator, setShowBMRCalculator] = useState(false);
  const [bmrForm, setBmrForm] = useState({
    sex: "male",
    age: 30,
    weight: 70,
    height: 170,
  });

  useEffect(() => {
    if (user) {
      Promise.all([loadStats(), loadWeeklyData(), loadCalorieBalance(), loadBMR()]).finally(() => setLoading(false));
    }
  }, [user]);

  const loadBMR = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("basal_metabolic_rate")
      .eq("id", user?.id)
      .single();
    setEditBMR(data?.basal_metabolic_rate || 0);
  };

  const loadStats = async () => {
    try {
      const [mealsResult, exercisesResult, summariesResult] = await Promise.all([
        supabase.from("meal_records").select("*", { count: "exact", head: true }).eq("user_id", user?.id),
        supabase.from("exercise_records").select("calories_burned").eq("user_id", user?.id),
        supabase.from("weekly_summaries").select("date", { count: "exact", head: true }).eq("user_id", user?.id),
      ]);
      let totalCaloriesBurned = exercisesResult.data?.reduce((sum, record) => sum + Number(record.calories_burned), 0) || 0;

      // Incluir calorias do Apple Health
      if (hkConnected) {
        try {
          const hkData = await getHKWeeklyData();
          const hkCalories = hkData.reduce((sum, d) => sum + d.calories, 0);
          totalCaloriesBurned += hkCalories;
        } catch (e) {
          console.error('[ChartsProgress] Erro ao carregar calorias do HealthKit:', e);
        }
      }

      setStats({
        totalMeals: mealsResult.count || 0,
        totalCaloriesBurned: Math.round(totalCaloriesBurned),
        totalExercises: exercisesResult.data?.length || 0,
        activeDays: summariesResult.count || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const loadWeeklyData = async () => {
    try {
      const { data, error } = await supabase
        .from("weekly_summaries")
        .select("*")
        .eq("user_id", user?.id)
        .order("date", { ascending: true })
        .limit(4);
      if (error) throw error;
      const { data: goalsData } = await supabase
        .from("daily_goals")
        .select("calories")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      const goalCalories = goalsData?.calories || 2000;
      const chartData = data?.map((week, index) => ({
        week: `Sem ${index + 1}`,
        calories: week.calories,
        goal: goalCalories * 7,
      })) || [];
      setWeeklyData(chartData);
    } catch (error) {
      console.error("Erro ao carregar dados semanais:", error);
    }
  };

  const loadCalorieBalance = async () => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("basal_metabolic_rate")
        .eq("id", user?.id)
        .single();
      const basalMetabolicRate = profileData?.basal_metabolic_rate || 0;
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      const { data: mealsData, error: mealsError } = await supabase
        .from("meal_records")
        .select("calories, created_at")
        .eq("user_id", user?.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .lte("created_at", today.toISOString());
      if (mealsError) throw mealsError;
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercise_records")
        .select("calories_burned, date")
        .eq("user_id", user?.id)
        .gte("date", sevenDaysAgo.toISOString().split('T')[0])
        .lte("date", today.toISOString().split('T')[0]);
      if (exercisesError) throw exercisesError;
      const balanceMap = new Map<string, { consumed: number; burned: number }>();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        balanceMap.set(dateKey, { consumed: 0, burned: 0 });
      }
      mealsData?.forEach((meal) => {
        const dateKey = new Date(meal.created_at).toISOString().split('T')[0];
        if (balanceMap.has(dateKey)) {
          balanceMap.get(dateKey)!.consumed += Number(meal.calories);
        }
      });
      exercisesData?.forEach((exercise) => {
        const dateKey = exercise.date;
        if (balanceMap.has(dateKey)) {
          balanceMap.get(dateKey)!.burned += Number(exercise.calories_burned);
        }
      });
      // Add HealthKit calories if connected
      if (hkConnected) {
        try {
          const hkData = await getHKWeeklyData();
          hkData.forEach((d) => {
            if (balanceMap.has(d.date)) {
              balanceMap.get(d.date)!.burned += d.calories;
            }
          });
        } catch (e) {
          console.warn('Could not load HK data for chart:', e);
        }
      }

      balanceMap.forEach((data) => { data.burned += basalMetabolicRate; });
      const chartData: CalorieBalanceData[] = Array.from(balanceMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => {
          const dayDate = new Date(date);
          const dayName = dayDate.toLocaleDateString("pt-BR", { weekday: "short" });
          return {
            day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            consumed: Math.round(data.consumed),
            burned: Math.round(data.burned),
            balance: Math.round(data.consumed - data.burned),
          };
        });
      setCalorieBalanceData(chartData);
    } catch (error) {
      console.error("Erro ao carregar balanço calórico:", error);
    }
  };

  const handleUpdateBMR = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ basal_metabolic_rate: editBMR })
        .eq("id", user?.id);
      if (error) throw error;
      await loadCalorieBalance();
      toast({ title: "Taxa Metabólica Basal atualizada com sucesso!" });
    } catch (error) {
      console.error("Erro ao atualizar TMB:", error);
      toast({ title: "Erro ao atualizar TMB", variant: "destructive" });
    }
  };

  const calculateBMR = () => {
    const { sex, age, weight, height } = bmrForm;
    let bmr: number;
    if (sex === "male") {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    return Math.round(bmr);
  };

  const handleUseBMR = () => {
    const calculatedBMR = calculateBMR();
    setEditBMR(calculatedBMR);
    setShowBMRCalculator(false);
    toast({ title: `TMB calculada: ${calculatedBMR} kcal/dia` });
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center space-y-6">
              <h1 className="text-3xl font-bold text-gray-800">Acesso Restrito</h1>
              <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
              <Button onClick={() => navigate("/")} className="mt-4">Retornar à Página Inicial</Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28 pt-[calc(env(safe-area-inset-top)+4rem)]">
        <div className="container mx-auto px-4 pb-8 max-w-4xl">
          {/* Header */}
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#FD46A1]">Gráficos e Progresso</h1>
            </div>
          </div>

          {/* Estatísticas Gerais */}
          <Card className="mb-8 bg-[#FFD1E7] rounded-3xl shadow-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-center">Estatísticas Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-2xl bg-[#F9FAFB]">
                  <Utensils className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                  <p className="text-2xl font-bold text-[#FD46A1]">{stats.totalMeals}</p>
                  <p className="text-sm text-muted-foreground">Refeições</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-[#F9FAFB]">
                  <Flame className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                  <p className="text-2xl font-bold text-[#FD46A1]">{stats.totalCaloriesBurned.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Calorias</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-[#F9FAFB]">
                  <Dumbbell className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                  <p className="text-2xl font-bold text-[#FD46A1]">{stats.totalExercises}</p>
                  <p className="text-sm text-muted-foreground">Exercícios</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-[#F9FAFB]">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                  <p className="text-2xl font-bold text-[#FD46A1]">{stats.activeDays}</p>
                  <p className="text-sm text-muted-foreground">Dias Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balanço Calórico */}
          {calorieBalanceData.length > 0 && (
            <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-semibold">Balanço Calórico</CardTitle>
                <CardDescription className="text-center">Últimos 7 dias - Calorias consumidas vs gastas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={calorieBalanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" tick={{ fill: "hsl(var(--foreground))" }} />
                    <YAxis className="text-xs" tick={{ fill: "hsl(var(--foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`${value} kcal`, ""]}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      formatter={(value) => {
                        if (value === "consumed") return "Consumidas";
                        if (value === "burned") return "Gastas";
                        return value;
                      }}
                    />
                    <Bar dataKey="consumed" fill="hsl(142, 76%, 36%)" radius={[8, 8, 0, 0]} name="consumed" />
                    <Bar dataKey="burned" fill="hsl(24, 95%, 53%)" radius={[8, 8, 0, 0]} name="burned" />
                  </BarChart>
                </ResponsiveContainer>

                {/* Summary */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                    <p className="text-sm text-muted-foreground mb-2">TMB Diária</p>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        value={editBMR}
                        onChange={(e) => setEditBMR(Number(e.target.value))}
                        className="text-center font-bold h-8"
                        placeholder="0"
                      />
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={handleUpdateBMR} className="flex-1 h-7 text-xs">
                          Salvar
                        </Button>
                        <Dialog open={showBMRCalculator} onOpenChange={setShowBMRCalculator}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 px-2">
                              <Calculator className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
                            <DialogHeader>
                              <DialogTitle>Calculadora de TMB</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Sexo</Label>
                                <div className="flex gap-2">
                                  <Button variant={bmrForm.sex === "male" ? "default" : "outline"} onClick={() => setBmrForm({ ...bmrForm, sex: "male" })} className="flex-1">Masculino</Button>
                                  <Button variant={bmrForm.sex === "female" ? "default" : "outline"} onClick={() => setBmrForm({ ...bmrForm, sex: "female" })} className="flex-1">Feminino</Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="age">Idade (anos)</Label>
                                <Input id="age" type="number" value={bmrForm.age} onChange={(e) => setBmrForm({ ...bmrForm, age: Number(e.target.value) })} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="weight">Peso (kg)</Label>
                                <Input id="weight" type="number" value={bmrForm.weight} onChange={(e) => setBmrForm({ ...bmrForm, weight: Number(e.target.value) })} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="height">Altura (cm)</Label>
                                <Input id="height" type="number" value={bmrForm.height} onChange={(e) => setBmrForm({ ...bmrForm, height: Number(e.target.value) })} />
                              </div>
                              <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">TMB Calculada:</p>
                                <p className="text-2xl font-bold text-primary">{calculateBMR()} kcal/dia</p>
                              </div>
                              <Button onClick={handleUseBMR} className="w-full">Usar este valor</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5">
                    <p className="text-sm text-muted-foreground mb-1">Total Consumido</p>
                    <p className="text-xl font-bold text-green-600">
                      {calorieBalanceData.reduce((sum, day) => sum + day.consumed, 0).toLocaleString()} kcal
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                    <p className="text-sm text-muted-foreground mb-1">Total Gasto</p>
                    <p className="text-sm text-muted-foreground">TMB: {(editBMR * 7).toLocaleString()} kcal</p>
                    <p className="text-xl font-bold text-orange-600">
                      {calorieBalanceData.reduce((sum, day) => sum + day.burned, 0).toLocaleString()} kcal
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                    <p className="text-sm text-muted-foreground mb-1">Saldo</p>
                    <p className={`text-xl font-bold ${calorieBalanceData.reduce((sum, day) => sum + day.balance, 0) > 0 ? 'text-primary' : 'text-red-600'}`}>
                      {calorieBalanceData.reduce((sum, day) => sum + day.balance, 0) > 0 ? '+' : ''}
                      {calorieBalanceData.reduce((sum, day) => sum + day.balance, 0).toLocaleString()} kcal
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {calorieBalanceData.reduce((sum, day) => sum + day.balance, 0) < 0 ? 'Déficit' : 'Superávit'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evolução Física */}
          <PhysicalEvolutionChart />

          {/* Gráfico de Progresso */}
          {weeklyData.length > 0 && (
            <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-semibold">Gráfico de Progresso</CardTitle>
                <CardDescription className="text-center">Evolução das últimas 4 semanas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Area type="monotone" dataKey="calories" stroke="#6C63FF" fillOpacity={1} fill="url(#colorCalories)" name="Calorias" />
                    <Area type="monotone" dataKey="goal" stroke="#10b981" strokeDasharray="5 5" fill="none" name="Meta" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
