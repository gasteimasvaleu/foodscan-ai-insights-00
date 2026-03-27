import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Target, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ExerciseStats {
  todayCalories: number;
  weeklyCalories: number;
  monthlyCalories: number;
  totalExercises: number;
  favoriteActivity: string;
  currentStreak: number;
}

interface ExerciseDashboardProps {
  healthKitCalories?: number;
}

export function ExerciseDashboard({ healthKitCalories = 0 }: ExerciseDashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<ExerciseStats>({
    todayCalories: 0,
    weeklyCalories: 0,
    monthlyCalories: 0,
    totalExercises: 0,
    favoriteActivity: 'Nenhum',
    currentStreak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch all exercise records
      const { data: exercises, error } = await supabase
        .from('exercise_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      if (!exercises) {
        setLoading(false);
        return;
      }

      // Calculate stats
      const todayExercises = exercises.filter(ex => ex.date === today);
      const weeklyExercises = exercises.filter(ex => ex.date >= weekAgo);
      const monthlyExercises = exercises.filter(ex => ex.date >= monthAgo);

      const todayCalories = todayExercises.reduce((sum, ex) => sum + Number(ex.calories_burned), 0);
      const weeklyCalories = weeklyExercises.reduce((sum, ex) => sum + Number(ex.calories_burned), 0);
      const monthlyCalories = monthlyExercises.reduce((sum, ex) => sum + Number(ex.calories_burned), 0);

      // Find favorite activity
      const activityCount = exercises.reduce((acc, ex) => {
        acc[ex.activity_type] = (acc[ex.activity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const favoriteActivity = Object.keys(activityCount).length > 0 
        ? Object.entries(activityCount).sort(([,a], [,b]) => b - a)[0][0]
        : 'Nenhum';

      // Calculate streak (consecutive days with exercise)
      let currentStreak = 0;
      const uniqueDates = [...new Set(exercises.map(ex => ex.date))].sort().reverse();
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const date = new Date(uniqueDates[i]);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
          currentStreak++;
        } else {
          break;
        }
      }

      setStats({
        todayCalories,
        weeklyCalories,
        monthlyCalories,
        totalExercises: exercises.length,
        favoriteActivity,
        currentStreak
      });
    } catch (error) {
      console.error('Error fetching exercise stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-[#FFD1E7] rounded-3xl animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 animate-fade-in group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Hoje</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-[#FD46A1]">{stats.todayCalories}</p>
                <Badge variant="secondary" className="text-xs font-semibold bg-pink-100 text-pink-800">cal</Badge>
              </div>
            </div>
            <div className="p-3 rounded-full bg-pink-500/20 backdrop-blur-sm group-hover:bg-pink-500/30 transition-colors">
              <Flame className="h-8 w-8 text-pink-500 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 animate-fade-in group" style={{animationDelay: '0.1s'}}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Últimos 7 Dias</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-[#FD46A1]">{stats.weeklyCalories}</p>
                <Badge variant="secondary" className="text-xs font-semibold bg-pink-100 text-pink-800">cal</Badge>
              </div>
            </div>
            <div className="p-3 rounded-full bg-pink-500/20 backdrop-blur-sm group-hover:bg-pink-500/30 transition-colors">
              <Calendar className="h-8 w-8 text-pink-500 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 animate-fade-in group" style={{animationDelay: '0.2s'}}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Sequência</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-[#FD46A1]">{stats.currentStreak}</p>
                <Badge variant="secondary" className="text-xs font-semibold bg-pink-100 text-pink-800">dias</Badge>
              </div>
            </div>
            <div className="p-3 rounded-full bg-pink-500/20 backdrop-blur-sm group-hover:bg-pink-500/30 transition-colors">
              <Trophy className="h-8 w-8 text-pink-500 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 animate-fade-in group" style={{animationDelay: '0.3s'}}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Atividade Favorita</p>
              <p className="text-lg font-bold text-[#FD46A1] truncate">{stats.favoriteActivity}</p>
              <Badge variant="secondary" className="text-xs mt-2 font-semibold bg-pink-100 text-pink-800">
                {stats.totalExercises} exercícios
              </Badge>
            </div>
            <div className="p-3 rounded-full bg-pink-500/20 backdrop-blur-sm group-hover:bg-pink-500/30 transition-colors">
              <Target className="h-8 w-8 text-pink-500 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}