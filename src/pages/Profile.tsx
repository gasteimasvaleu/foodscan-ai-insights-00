import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { User, Upload, Utensils, Flame, Dumbbell, Calendar, Edit2, Settings, ClipboardList, Salad, Calculator } from "lucide-react";
import { PhysicalEvolutionChart } from "@/components/PhysicalEvolutionChart";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

interface ProfileData {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  basal_metabolic_rate: number;
}

interface Stats {
  totalMeals: number;
  totalCaloriesBurned: number;
  totalExercises: number;
  activeDays: number;
}

interface Goals {
  calories: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
  diet_objective: string;
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

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<Stats>({ totalMeals: 0, totalCaloriesBurned: 0, totalExercises: 0, activeDays: 0 });
  const [goals, setGoals] = useState<Goals | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [calorieBalanceData, setCalorieBalanceData] = useState<CalorieBalanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
      loadProfileData();
      loadStats();
      loadGoals();
      loadWeeklyData();
      loadCalorieBalance();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditName(data.name);
      setEditBMR(data.basal_metabolic_rate || 0);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const loadStats = async () => {
    try {
      const [mealsResult, exercisesResult, summariesResult] = await Promise.all([
        supabase.from("meal_records").select("*", { count: "exact", head: true }).eq("user_id", user?.id),
        supabase.from("exercise_records").select("calories_burned").eq("user_id", user?.id),
        supabase.from("weekly_summaries").select("date", { count: "exact", head: true }).eq("user_id", user?.id),
      ]);

      const totalCaloriesBurned = exercisesResult.data?.reduce((sum, record) => sum + Number(record.calories_burned), 0) || 0;

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

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_goals")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setGoals(data);
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
    } finally {
      setLoading(false);
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
      // Get user's BMR
      const { data: profileData } = await supabase
        .from("profiles")
        .select("basal_metabolic_rate")
        .eq("id", user?.id)
        .single();

      const basalMetabolicRate = profileData?.basal_metabolic_rate || 0;

      // Get the last 7 days
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      // Fetch meals from last 7 days
      const { data: mealsData, error: mealsError } = await supabase
        .from("meal_records")
        .select("calories, created_at")
        .eq("user_id", user?.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .lte("created_at", today.toISOString());

      if (mealsError) throw mealsError;

      // Fetch exercises from last 7 days
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercise_records")
        .select("calories_burned, date")
        .eq("user_id", user?.id)
        .gte("date", sevenDaysAgo.toISOString().split('T')[0])
        .lte("date", today.toISOString().split('T')[0]);

      if (exercisesError) throw exercisesError;

      // Group data by day
      const balanceMap = new Map<string, { consumed: number; burned: number }>();

      // Initialize all 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        balanceMap.set(dateKey, { consumed: 0, burned: 0 });
      }

      // Sum consumed calories by day
      mealsData?.forEach((meal) => {
        const dateKey = new Date(meal.created_at).toISOString().split('T')[0];
        if (balanceMap.has(dateKey)) {
          const current = balanceMap.get(dateKey)!;
          current.consumed += Number(meal.calories);
        }
      });

      // Sum burned calories by day (exercises + BMR)
      exercisesData?.forEach((exercise) => {
        const dateKey = exercise.date;
        if (balanceMap.has(dateKey)) {
          const current = balanceMap.get(dateKey)!;
          current.burned += Number(exercise.calories_burned);
        }
      });

      // Add BMR to all days
      balanceMap.forEach((data) => {
        data.burned += basalMetabolicRate;
      });

      // Convert to chart data
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

  const handleUpdateName = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: editName })
        .eq("id", user?.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, name: editName } : null);
      toast({ title: "Nome atualizado com sucesso!" });
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
      toast({ title: "Erro ao atualizar nome", variant: "destructive" });
    }
  };

  const handleUpdateBMR = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ basal_metabolic_rate: editBMR })
        .eq("id", user?.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, basal_metabolic_rate: editBMR } : null);
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast({ title: "Foto de perfil atualizada!" });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({ title: "Erro ao atualizar foto", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center space-y-6">
              <h1 className="text-3xl font-bold text-gray-800">Acesso Restrito</h1>
              <p className="text-gray-600">
                Você precisa estar logado para acessar o seu perfil, retorne a página Inicial e faça seu login.
              </p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Retornar à Página Inicial
              </Button>
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

  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header do Perfil */}
        <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                    {profile?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-6 h-6 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <CardTitle className="text-3xl mb-2">{profile?.name}</CardTitle>
                <CardDescription className="text-base">{user?.email}</CardDescription>
                <p className="text-sm text-muted-foreground mt-1">Membro desde {memberSince}</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Perfil</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleUpdateName} className="w-full">
                        Salvar Alterações
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          </Card>

          {/* Ações Rápidas */}
          <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold">🚀 Ações Rápidas</CardTitle>
              <CardDescription>Acesse suas ferramentas de acompanhamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-6"
                  onClick={() => navigate("/profile/workout")}
                >
                  <Dumbbell className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="font-semibold">Ficha de Treino</p>
                    <p className="text-xs text-muted-foreground">Monte seu treino semanal</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-6"
                  onClick={() => navigate("/profile/assessment")}
                >
                  <ClipboardList className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="font-semibold">Avaliação Física</p>
                    <p className="text-xs text-muted-foreground">Registre suas medidas</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-6"
                  onClick={() => navigate("/profile/diets")}
                >
                  <Salad className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="font-semibold">Minhas Dietas</p>
                    <p className="text-xs text-muted-foreground">Monte sua dieta</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Gerais */}
        <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Estatísticas Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                <Utensils className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold text-foreground">{stats.totalMeals}</p>
                <p className="text-sm text-muted-foreground">Refeições</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="text-3xl font-bold text-foreground">{stats.totalCaloriesBurned.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Calorias</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5">
                <Dumbbell className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-3xl font-bold text-foreground">{stats.totalExercises}</p>
                <p className="text-sm text-muted-foreground">Exercícios</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-3xl font-bold text-foreground">{stats.activeDays}</p>
                <p className="text-sm text-muted-foreground">Dias Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Balanço Calórico */}
        {calorieBalanceData.length > 0 && (
          <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Balanço Calórico
              </CardTitle>
              <CardDescription>Últimos 7 dias - Calorias consumidas vs gastas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calorieBalanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="day" 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
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
                  <Bar 
                    dataKey="consumed" 
                    fill="hsl(142, 76%, 36%)" 
                    radius={[8, 8, 0, 0]}
                    name="consumed"
                  />
                  <Bar 
                    dataKey="burned" 
                    fill="hsl(24, 95%, 53%)" 
                    radius={[8, 8, 0, 0]}
                    name="burned"
                  />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Summary */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Card TMB */}
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleUpdateBMR}
                        className="flex-1 h-7 text-xs"
                      >
                        Salvar
                      </Button>
                      <Dialog open={showBMRCalculator} onOpenChange={setShowBMRCalculator}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-7 px-2">
                            <Calculator className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Calculadora de TMB</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Sexo</Label>
                              <div className="flex gap-2">
                                <Button
                                  variant={bmrForm.sex === "male" ? "default" : "outline"}
                                  onClick={() => setBmrForm({ ...bmrForm, sex: "male" })}
                                  className="flex-1"
                                >
                                  Masculino
                                </Button>
                                <Button
                                  variant={bmrForm.sex === "female" ? "default" : "outline"}
                                  onClick={() => setBmrForm({ ...bmrForm, sex: "female" })}
                                  className="flex-1"
                                >
                                  Feminino
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="age">Idade (anos)</Label>
                              <Input
                                id="age"
                                type="number"
                                value={bmrForm.age}
                                onChange={(e) => setBmrForm({ ...bmrForm, age: Number(e.target.value) })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="weight">Peso (kg)</Label>
                              <Input
                                id="weight"
                                type="number"
                                value={bmrForm.weight}
                                onChange={(e) => setBmrForm({ ...bmrForm, weight: Number(e.target.value) })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="height">Altura (cm)</Label>
                              <Input
                                id="height"
                                type="number"
                                value={bmrForm.height}
                                onChange={(e) => setBmrForm({ ...bmrForm, height: Number(e.target.value) })}
                              />
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground mb-2">TMB Calculada:</p>
                              <p className="text-2xl font-bold text-primary">{calculateBMR()} kcal/dia</p>
                            </div>
                            <Button onClick={handleUseBMR} className="w-full">
                              Usar este valor
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                {/* Card Total Consumido */}
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5">
                  <p className="text-sm text-muted-foreground mb-1">Total Consumido</p>
                  <p className="text-xl font-bold text-green-600">
                    {calorieBalanceData.reduce((sum, day) => sum + day.consumed, 0).toLocaleString()} kcal
                  </p>
                </div>

                {/* Card Total Gasto */}
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                  <p className="text-sm text-muted-foreground mb-1">Total Gasto</p>
                  <p className="text-sm text-muted-foreground">
                    TMB: {(editBMR * 7).toLocaleString()} kcal
                  </p>
                  <p className="text-xl font-bold text-orange-600">
                    {calorieBalanceData.reduce((sum, day) => sum + day.burned, 0).toLocaleString()} kcal
                  </p>
                </div>

                {/* Card Saldo */}
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

        {/* Gráfico de Evolução Física */}
        <PhysicalEvolutionChart />

        {/* Metas Atuais */}
        {goals && (
          <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle>Metas Atuais</CardTitle>
              <CardDescription>Objetivo: {goals.diet_objective}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Calorias</span>
                  <span className="text-lg font-bold text-primary">{goals.calories} kcal</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Carboidratos</span>
                  <span className="text-lg font-bold text-orange-500">{goals.carbohydrates}g</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Proteínas</span>
                  <span className="text-lg font-bold text-green-500">{goals.proteins}g</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Gorduras</span>
                  <span className="text-lg font-bold text-blue-500">{goals.fats}g</span>
                </div>
              </div>
              <Button onClick={() => navigate("/daily-control")} className="w-full mt-4" variant="outline">
                <Edit2 className="w-4 h-4 mr-2" />
                Editar Metas
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Progresso */}
        {weeklyData.length > 0 && (
          <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle>Gráfico de Progresso</CardTitle>
              <CardDescription>Evolução das últimas 4 semanas</CardDescription>
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

        {/* Configurações */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => navigate("/whatsapp-settings")} variant="outline" className="w-full justify-start">
              Configurações do WhatsApp
            </Button>
            <Button onClick={signOut} variant="destructive" className="w-full">
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
}
