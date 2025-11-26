import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

interface WorkoutPlan {
  id: string;
  day_of_week: string;
  name: string;
  exercises: Exercise[];
}

const DAYS = [
  { value: "segunda", label: "Segunda" },
  { value: "terca", label: "Terça" },
  { value: "quarta", label: "Quarta" },
  { value: "quinta", label: "Quinta" },
  { value: "sexta", label: "Sexta" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

export default function WorkoutPlan() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [selectedDay, setSelectedDay] = useState("segunda");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from("workout_plans")
        .select("*")
        .eq("user_id", user.user.id)
        .eq("is_active", true);

      if (error) throw error;
      setWorkouts((data || []).map(w => ({
        ...w,
        exercises: (w.exercises as any) || []
      })));
    } catch (error) {
      console.error("Error loading workouts:", error);
      toast.error("Erro ao carregar treinos");
    } finally {
      setLoading(false);
    }
  };

  const currentWorkout = workouts.find((w) => w.day_of_week === selectedDay);

  const addExercise = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const newExercise: Exercise = {
        name: "Novo Exercício",
        sets: 3,
        reps: "10-12",
        notes: "",
      };

      if (currentWorkout) {
        const updatedExercises = [...currentWorkout.exercises, newExercise];
        const { error } = await supabase
          .from("workout_plans")
          .update({ exercises: updatedExercises as any })
          .eq("id", currentWorkout.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("workout_plans").insert({
          user_id: user.user.id,
          day_of_week: selectedDay,
          name: `Treino ${DAYS.find((d) => d.value === selectedDay)?.label}`,
          exercises: [newExercise] as any,
        });

        if (error) throw error;
      }

      await loadWorkouts();
      toast.success("Exercício adicionado");
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast.error("Erro ao adicionar exercício");
    }
  };

  const updateExercise = async (index: number, field: keyof Exercise, value: string | number) => {
    if (!currentWorkout) return;

    try {
      const updatedExercises = [...currentWorkout.exercises];
      updatedExercises[index] = { ...updatedExercises[index], [field]: value };

      const { error } = await supabase
        .from("workout_plans")
        .update({ exercises: updatedExercises as any })
        .eq("id", currentWorkout.id);

      if (error) throw error;
      await loadWorkouts();
    } catch (error) {
      console.error("Error updating exercise:", error);
      toast.error("Erro ao atualizar exercício");
    }
  };

  const deleteExercise = async (index: number) => {
    if (!currentWorkout) return;

    try {
      const updatedExercises = currentWorkout.exercises.filter((_, i) => i !== index);

      if (updatedExercises.length === 0) {
        const { error } = await supabase
          .from("workout_plans")
          .delete()
          .eq("id", currentWorkout.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("workout_plans")
          .update({ exercises: updatedExercises as any })
          .eq("id", currentWorkout.id);

        if (error) throw error;
      }

      await loadWorkouts();
      toast.success("Exercício removido");
    } catch (error) {
      console.error("Error deleting exercise:", error);
      toast.error("Erro ao remover exercício");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">🏋️ Ficha de Treino</h1>
            <p className="text-muted-foreground">Monte seu treino semanal</p>
          </div>
        </div>

        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full h-auto gap-1">
            {DAYS.map((day) => (
              <TabsTrigger key={day.value} value={day.value}>
                {day.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {DAYS.map((day) => (
            <TabsContent key={day.value} value={day.value}>
              <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle>{day.label.toUpperCase()}</CardTitle>
                  <CardDescription>
                    {currentWorkout ? currentWorkout.name : "Nenhum treino configurado"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentWorkout?.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg bg-muted/50"
                    >
                      <Input
                        placeholder="Nome do exercício"
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, "name", e.target.value)}
                        className="md:col-span-5"
                      />
                      <Input
                        type="number"
                        placeholder="Séries"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, "sets", parseInt(e.target.value))}
                        className="md:col-span-2"
                      />
                      <Input
                        placeholder="Reps"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, "reps", e.target.value)}
                        className="md:col-span-2"
                      />
                      <Input
                        placeholder="Observações"
                        value={exercise.notes || ""}
                        onChange={(e) => updateExercise(index, "notes", e.target.value)}
                        className="md:col-span-2"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteExercise(index)}
                        className="md:col-span-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button onClick={addExercise} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Exercício
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
