import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExerciseRecord {
  id: string;
  activity_type: string;
  duration_minutes: number;
  intensity: string;
  calories_burned: number;
  date: string;
  created_at: string;
}

export function ExerciseHistory() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchExercises();
    }
  }, [user]);

  const fetchExercises = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('exercise_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exercise_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExercises(exercises.filter(ex => ex.id !== id));
      toast({
        title: "Exercício removido",
        description: "O exercício foi removido do seu histórico.",
      });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast({
        title: "Erro ao remover exercício",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'Leve': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Moderada': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Intensa': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            Histórico de Exercícios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-white/20 rounded-xl animate-pulse backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted/50 rounded"></div>
                  <div className="h-3 w-24 bg-muted/50 rounded"></div>
                </div>
                <div className="h-8 w-16 bg-muted/50 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (exercises.length === 0) {
    return (
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-white/20 shadow-xl">
      <CardHeader className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-pink-500/5"></div>
        <CardTitle className="text-xl font-bold relative z-10 text-center">
          Histórico de Exercícios
        </CardTitle>
      </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/10 to-pink-500/10 w-fit mx-auto mb-6">
              <Clock className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">Nenhum exercício registrado ainda.</p>
            <p className="text-sm text-muted-foreground mt-2">Comece registrando sua primeira atividade!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-white/20 shadow-xl">
      <CardHeader className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-pink-500/5"></div>
        <CardTitle className="text-xl font-bold relative z-10 text-center">
          Histórico de Exercícios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <div 
              key={exercise.id} 
              className="flex items-center justify-between p-4 border border-white/20 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-pink-50/50 dark:hover:from-blue-900/20 dark:hover:to-pink-900/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm group animate-fade-in"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{exercise.activity_type}</h3>
                  <Badge className={getIntensityColor(exercise.intensity)} variant="secondary">
                    {exercise.intensity}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 group-hover:text-foreground transition-colors">
                    <div className="p-1 rounded-full bg-blue-500/10">
                      <Clock className="h-3 w-3" />
                    </div>
                    <span className="font-medium">{exercise.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-2 group-hover:text-foreground transition-colors">
                    <div className="p-1 rounded-full bg-orange-500/10">
                      <Flame className="h-3 w-3" />
                    </div>
                    <span className="font-medium">{exercise.calories_burned} cal</span>
                  </div>
                  <span className="font-medium">
                    {format(new Date(exercise.date + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteExercise(exercise.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}