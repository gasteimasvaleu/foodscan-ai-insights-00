import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dumbbell, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const ACTIVITY_TYPES = [
  'Corrida', 'Caminhada', 'Natação', 'Ciclismo', 'Musculação', 'Yoga', 'Pilates',
  'Futebol', 'Basquete', 'Tênis', 'Vôlei', 'Dança', 'Boxe', 'Escalada', 'Remo',
  'Alongamento', 'Crossfit', 'Spinning', 'Aeróbica', 'Zumba'
];

interface ExerciseFormProps {
  onExerciseAdded: () => void;
}

export function ExerciseForm({ onExerciseAdded }: ExerciseFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    activityType: '',
    weight: '',
    age: '',
    durationMinutes: '',
    intensity: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      // Get current local date for consistency
      const currentLocalDate = new Date().toISOString().split('T')[0];
      console.log('Using local date:', currentLocalDate, 'Timezone offset:', new Date().getTimezoneOffset());

      // Calculate calories using edge function
      const { data: calculationResult, error: calcError } = await supabase.functions.invoke('calculate-exercise-calories', {
        body: {
          activityType: formData.activityType,
          weight: parseFloat(formData.weight),
          age: parseInt(formData.age),
          durationMinutes: parseInt(formData.durationMinutes),
          intensity: formData.intensity
        }
      });

      if (calcError) throw calcError;

      // Save exercise record with explicit local date
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercise_records')
        .insert({
          user_id: user.id,
          activity_type: formData.activityType,
          weight: parseFloat(formData.weight),
          age: parseInt(formData.age),
          duration_minutes: parseInt(formData.durationMinutes),
          intensity: formData.intensity,
          calories_burned: calculationResult.caloriesBurned,
          date: currentLocalDate
        })
        .select()
        .single();

      if (exerciseError) throw exerciseError;

      console.log('Exercise record created:', exerciseData);

      // Create calorie adjustment with correct exercise_record_id
      const { error: adjustmentError } = await supabase
        .from('calorie_adjustments')
        .insert({
          user_id: user.id,
          exercise_record_id: exerciseData.id,
          adjustment_amount: Math.round(calculationResult.caloriesBurned * 0.8),
          date: currentLocalDate
        });

      if (adjustmentError) console.log('Adjustment error (non-critical):', adjustmentError);

      toast({
        title: "Exercício registrado!",
        description: `Você queimou ${calculationResult.caloriesBurned} calorias. ${calculationResult.adjustmentSuggestion}`,
      });

      // Reset form
      setFormData({
        activityType: '',
        weight: '',
        age: '',
        durationMinutes: '',
        intensity: ''
      });

      onExerciseAdded();
    } catch (error) {
      console.error('Error registering exercise:', error);
      toast({
        title: "Erro ao registrar exercício",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Registrar Exercício
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activityType">Tipo de Atividade</Label>
              <Select 
                value={formData.activityType} 
                onValueChange={(value) => setFormData({...formData, activityType: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a atividade" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((activity) => (
                    <SelectItem key={activity} value={activity}>
                      {activity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="Ex: 30"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({...formData, durationMinutes: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="Ex: 70.5"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                placeholder="Ex: 25"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Intensidade do Exercício</Label>
            <RadioGroup 
              value={formData.intensity} 
              onValueChange={(value) => setFormData({...formData, intensity: value})}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Leve" id="leve" />
                <Label htmlFor="leve">Leve - Respiração normal, conversa fácil</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Moderada" id="moderada" />
                <Label htmlFor="moderada">Moderada - Respiração acelerada, conversa possível</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Intensa" id="intensa" />
                <Label htmlFor="intensa">Intensa - Respiração difícil, conversa limitada</Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {isLoading ? "Calculando..." : "Calcular e Registrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}