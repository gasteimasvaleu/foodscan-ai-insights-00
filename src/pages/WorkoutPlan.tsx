import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Dumbbell, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { AddExerciseModal } from "@/components/AddExerciseModal";

interface Exercise {
  name: string;
  muscleGroup?: string;
  sets: number;
  reps: string;
  notes?: string;
  executionTip?: string;
}

interface WorkoutPlanData {
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
  const [workouts, setWorkouts] = useState<WorkoutPlanData[]>([]);
  const [selectedDay, setSelectedDay] = useState("segunda");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

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

  const addExercise = async (exercise: Exercise) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      if (currentWorkout) {
        const updatedExercises = [...currentWorkout.exercises, exercise];
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
          exercises: [exercise] as any,
        });

        if (error) throw error;
      }

      await loadWorkouts();
      toast.success("Exercício adicionado!");
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
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 pt-[calc(env(safe-area-inset-top)+3.5rem)]">
          <div className="max-w-6xl mx-auto">Carregando...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 pt-[calc(env(safe-area-inset-top)+3.5rem)] pb-40">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#FD46A1]">Ficha de Treino</h1>
            </div>
            <Button className="w-full" onClick={() => navigate("/profile")}>
              Voltar
            </Button>
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
                <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]">
                  <CardHeader className="pl-5">
                    <CardTitle>{day.label.toUpperCase()}</CardTitle>
                    <CardDescription>
                      {currentWorkout ? currentWorkout.name : "Nenhum treino configurado"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pl-5">
                    {currentWorkout?.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{exercise.name}</span>
                              {exercise.muscleGroup && (
                                <Badge className="text-[10px] px-1.5 py-0 bg-[#FFD1E7]/60 text-[#FD46A1] border border-[#FD46A1]/20 hover:bg-[#FFD1E7]/60">
                                  {exercise.muscleGroup}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{exercise.sets} séries</span>
                              <span>×</span>
                              <span>{exercise.reps} reps</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteExercise(index)}
                            className="shrink-0 h-8 w-8 text-[#FD46A1]/70 hover:text-[#FD46A1] hover:bg-[#FFD1E7]/40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {exercise.executionTip && (
                          <div className="flex gap-2 rounded-lg bg-primary/5 border border-primary/10 p-2">
                            <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {exercise.executionTip}
                            </p>
                          </div>
                        )}

                        {exercise.notes && (
                          <p className="text-xs text-muted-foreground italic">
                            📝 {exercise.notes}
                          </p>
                        )}
                      </div>
                    ))}

                    <Button onClick={() => setModalOpen(true)} className="w-full">
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

      <AddExerciseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAdd={addExercise}
      />
    </>
  );
}
