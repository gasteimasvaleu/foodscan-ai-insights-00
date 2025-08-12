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
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Exercícios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded"></div>
                  <div className="h-3 w-24 bg-muted rounded"></div>
                </div>
                <div className="h-8 w-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (exercises.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Exercícios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum exercício registrado ainda.</p>
            <p className="text-sm text-muted-foreground mt-2">Comece registrando sua primeira atividade!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Exercícios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{exercise.activity_type}</h3>
                  <Badge className={getIntensityColor(exercise.intensity)} variant="secondary">
                    {exercise.intensity}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {exercise.duration_minutes} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {exercise.calories_burned} cal
                  </div>
                  <span>
                    {format(new Date(exercise.date + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteExercise(exercise.id)}
                className="text-destructive hover:text-destructive"
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