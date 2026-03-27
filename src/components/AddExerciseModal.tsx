import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Info, Plus } from "lucide-react";
import { EXERCISE_CATALOG } from "@/data/exerciseCatalog";

interface Exercise {
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  notes?: string;
  executionTip?: string;
}

interface AddExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (exercise: Exercise) => void;
}

export function AddExerciseModal({ open, onOpenChange, onAdd }: AddExerciseModalProps) {
  const [muscleGroup, setMuscleGroup] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState("10-12");
  const [notes, setNotes] = useState("");

  const selectedGroup = muscleGroup ? EXERCISE_CATALOG[muscleGroup] : null;
  const selectedExercise = selectedGroup?.exercises.find((e) => e.name === exerciseName);

  const handleAdd = () => {
    if (!exerciseName || !muscleGroup) return;
    onAdd({
      name: exerciseName,
      muscleGroup: selectedGroup?.label || muscleGroup,
      sets,
      reps,
      notes,
      executionTip: selectedExercise?.executionTip,
    });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setMuscleGroup("");
    setExerciseName("");
    setSets(3);
    setReps("10-12");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl border-2 border-primary/30 shadow-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Exercício
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Grupo Muscular */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Grupo Muscular</Label>
            <Select
              value={muscleGroup}
              onValueChange={(val) => {
                setMuscleGroup(val);
                setExerciseName("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o grupo muscular" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXERCISE_CATALOG).map(([key, group]) => (
                  <SelectItem key={key} value={key}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exercício */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Exercício</Label>
            <Select
              value={exerciseName}
              onValueChange={setExerciseName}
              disabled={!muscleGroup}
            >
              <SelectTrigger>
                <SelectValue placeholder={muscleGroup ? "Selecione o exercício" : "Selecione o grupo primeiro"} />
              </SelectTrigger>
              <SelectContent>
                {selectedGroup?.exercises.map((ex) => (
                  <SelectItem key={ex.name} value={ex.name}>
                    {ex.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dica de execução */}
          {selectedExercise && (
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedExercise.executionTip}
              </p>
            </div>
          )}

          {/* Séries e Repetições */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Séries</Label>
              <Input
                type="number"
                min={1}
                value={sets}
                onChange={(e) => setSets(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Repetições</Label>
              <Input
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="Ex: 10-12"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dicas pessoais, carga, etc."
              className="min-h-[60px] resize-none"
            />
          </div>

          <Button
            onClick={handleAdd}
            disabled={!exerciseName || !muscleGroup}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Exercício
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
