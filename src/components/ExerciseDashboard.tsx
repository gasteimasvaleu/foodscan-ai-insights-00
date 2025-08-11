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

export function ExerciseDashboard() {
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
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hoje</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats.todayCalories}</p>
                <Badge variant="secondary" className="text-xs">cal</Badge>
              </div>
            </div>
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats.weeklyCalories}</p>
                <Badge variant="secondary" className="text-xs">cal</Badge>
              </div>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sequência</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <Badge variant="secondary" className="text-xs">dias</Badge>
              </div>
            </div>
            <Trophy className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Atividade Favorita</p>
              <p className="text-lg font-bold truncate">{stats.favoriteActivity}</p>
              <Badge variant="secondary" className="text-xs mt-1">
                {stats.totalExercises} exercícios
              </Badge>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}