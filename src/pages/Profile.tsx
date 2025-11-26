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
import { User, Upload, Utensils, Flame, Dumbbell, Calendar, Edit2, Settings } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
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

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<Stats>({ totalMeals: 0, totalCaloriesBurned: 0, totalExercises: 0, activeDays: 0 });
  const [goals, setGoals] = useState<Goals | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadStats();
      loadGoals();
      loadWeeklyData();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28">
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
  );
}
