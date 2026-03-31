import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { WheelPicker } from "@/components/ui/wheel-picker";
import { Calculator, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const ACTIVITY_TYPES = [
  'Corrida', 'Caminhada', 'Natação', 'Ciclismo', 'Musculação', 'Yoga', 'Pilates',
  'Futebol', 'Basquete', 'Tênis', 'Vôlei', 'Dança', 'Boxe', 'Escalada', 'Remo',
  'Alongamento', 'Crossfit', 'Spinning', 'Aeróbica', 'Zumba'
];

const DURATION_OPTIONS = Array.from({ length: 48 }, (_, index) => `${(index + 1) * 5}`);
const WEIGHT_OPTIONS = Array.from({ length: 441 }, (_, index) => (30 + index * 0.5).toFixed(1));
const AGE_OPTIONS = Array.from({ length: 91 }, (_, index) => `${index + 10}`);
const INTENSITY_OPTIONS = ['Leve', 'Moderada', 'Intensa'];

interface ExerciseFormProps {
  onExerciseAdded: () => void;
}

export function ExerciseForm({ onExerciseAdded }: ExerciseFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [isDurationDrawerOpen, setIsDurationDrawerOpen] = useState(false);
  const [isWeightDrawerOpen, setIsWeightDrawerOpen] = useState(false);
  const [isAgeDrawerOpen, setIsAgeDrawerOpen] = useState(false);
  const [isIntensityDrawerOpen, setIsIntensityDrawerOpen] = useState(false);
  const [pendingActivityType, setPendingActivityType] = useState("");
  const [pendingDuration, setPendingDuration] = useState("");
  const [pendingWeight, setPendingWeight] = useState("");
  const [pendingAge, setPendingAge] = useState("");
  const [pendingIntensity, setPendingIntensity] = useState("");
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
    if (!formData.activityType) {
      toast({
        title: "Selecione uma atividade",
        description: "Escolha o tipo de atividade para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.durationMinutes || !formData.weight || !formData.age || !formData.intensity) {
      toast({
        title: "Preencha todos os campos",
        description: "Duração, peso, idade e intensidade são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

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

  const handleActivityDrawerOpenChange = (open: boolean) => {
    if (open) {
      setPendingActivityType(formData.activityType || ACTIVITY_TYPES[0]);
    }
    setIsActivityDrawerOpen(open);
  };

  const confirmActivitySelection = () => {
    if (pendingActivityType) {
      setFormData((prev) => ({ ...prev, activityType: pendingActivityType }));
    }
    setIsActivityDrawerOpen(false);
  };

  const handleDurationDrawerOpenChange = (open: boolean) => {
    if (open) {
      setPendingDuration(formData.durationMinutes || DURATION_OPTIONS[0]);
    }
    setIsDurationDrawerOpen(open);
  };

  const confirmDurationSelection = () => {
    if (pendingDuration) {
      setFormData((prev) => ({ ...prev, durationMinutes: pendingDuration }));
    }
    setIsDurationDrawerOpen(false);
  };

  const handleWeightDrawerOpenChange = (open: boolean) => {
    if (open) {
      setPendingWeight(formData.weight || WEIGHT_OPTIONS[0]);
    }
    setIsWeightDrawerOpen(open);
  };

  const confirmWeightSelection = () => {
    if (pendingWeight) {
      setFormData((prev) => ({ ...prev, weight: pendingWeight }));
    }
    setIsWeightDrawerOpen(false);
  };

  const handleAgeDrawerOpenChange = (open: boolean) => {
    if (open) {
      setPendingAge(formData.age || AGE_OPTIONS[0]);
    }
    setIsAgeDrawerOpen(open);
  };

  const confirmAgeSelection = () => {
    if (pendingAge) {
      setFormData((prev) => ({ ...prev, age: pendingAge }));
    }
    setIsAgeDrawerOpen(false);
  };

  const handleIntensityDrawerOpenChange = (open: boolean) => {
    if (open) {
      setPendingIntensity(formData.intensity || INTENSITY_OPTIONS[0]);
    }
    setIsIntensityDrawerOpen(open);
  };

  const confirmIntensitySelection = () => {
    if (pendingIntensity) {
      setFormData((prev) => ({ ...prev, intensity: pendingIntensity }));
    }
    setIsIntensityDrawerOpen(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Registrar Exercício
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activityType" className="font-medium">Tipo de Atividade</Label>
              <Button
                id="activityType"
                type="button"
                variant="outline"
                onClick={() => handleActivityDrawerOpenChange(true)}
                className="w-full justify-between hover:bg-accent/50 transition-colors duration-200 hover:shadow-md"
                aria-haspopup="dialog"
                aria-expanded={isActivityDrawerOpen}
                aria-label="Selecionar tipo de atividade"
              >
                <span className={formData.activityType ? "text-foreground" : "text-muted-foreground"}>
                  {formData.activityType || "Selecione a atividade"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="font-medium">Duração (minutos)</Label>
              <Button
                id="duration"
                type="button"
                variant="outline"
                onClick={() => handleDurationDrawerOpenChange(true)}
                className="w-full justify-between hover:bg-accent/50 transition-colors duration-200 hover:shadow-md"
                aria-haspopup="dialog"
                aria-expanded={isDurationDrawerOpen}
                aria-label="Selecionar duração"
              >
                <span className={formData.durationMinutes ? "text-foreground" : "text-muted-foreground"}>
                  {formData.durationMinutes ? `${formData.durationMinutes} min` : "Selecionar duração"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="font-medium">Peso (kg)</Label>
              <Button
                id="weight"
                type="button"
                variant="outline"
                onClick={() => handleWeightDrawerOpenChange(true)}
                className="w-full justify-between hover:bg-accent/50 transition-colors duration-200 hover:shadow-md"
                aria-haspopup="dialog"
                aria-expanded={isWeightDrawerOpen}
                aria-label="Selecionar peso"
              >
                <span className={formData.weight ? "text-foreground" : "text-muted-foreground"}>
                  {formData.weight ? `${formData.weight} kg` : "Selecionar peso"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="font-medium">Idade</Label>
              <Button
                id="age"
                type="button"
                variant="outline"
                onClick={() => handleAgeDrawerOpenChange(true)}
                className="w-full justify-between hover:bg-accent/50 transition-colors duration-200 hover:shadow-md"
                aria-haspopup="dialog"
                aria-expanded={isAgeDrawerOpen}
                aria-label="Selecionar idade"
              >
                <span className={formData.age ? "text-foreground" : "text-muted-foreground"}>
                  {formData.age ? `${formData.age} anos` : "Selecionar idade"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-lg bg-[#F9FAFB] border border-accent/50">
            <Label className="font-medium text-lg text-center block">Intensidade do Exercício</Label>
            <Button
              type="button"
              onClick={() => handleIntensityDrawerOpenChange(true)}
              className="w-full justify-between rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              aria-haspopup="dialog"
              aria-expanded={isIntensityDrawerOpen}
              aria-label="Selecionar intensidade"
            >
              <span>{formData.intensity || "Selecionar Intensidade"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 py-6 text-lg font-semibold" 
            disabled={isLoading}
          >
            <Calculator className="w-5 h-5 mr-2" />
            {isLoading ? "Calculando..." : "Calcular e Registrar"}
          </Button>
        </form>

        <Drawer open={isActivityDrawerOpen} onOpenChange={handleActivityDrawerOpenChange}>
          <DrawerContent className="max-h-[78vh] w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
            <DrawerHeader className="border-b border-border/60">
              <DrawerTitle className="text-foreground">Tipo de Atividade</DrawerTitle>
            </DrawerHeader>

            <div className="px-4 pb-2">
              <div className="rounded-xl border border-border/60 bg-background/70 p-2">
                <WheelPicker
                  value={pendingActivityType}
                  onChange={setPendingActivityType}
                  options={ACTIVITY_TYPES}
                  visibleItems={5}
                  itemHeight={44}
                />
              </div>
            </div>

            <DrawerFooter className="border-t border-border/60">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsActivityDrawerOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground" onClick={confirmActivitySelection}>
                  Confirmar
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer open={isDurationDrawerOpen} onOpenChange={handleDurationDrawerOpenChange}>
          <DrawerContent className="max-h-[78vh] w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
            <DrawerHeader className="border-b border-border/60">
              <DrawerTitle className="text-foreground">Duração (minutos)</DrawerTitle>
            </DrawerHeader>

            <div className="px-4 pb-2">
              <div className="rounded-xl border border-border/60 bg-background/70 p-2">
                <WheelPicker
                  value={pendingDuration}
                  onChange={setPendingDuration}
                  options={DURATION_OPTIONS}
                  visibleItems={5}
                  itemHeight={44}
                />
              </div>
            </div>

            <DrawerFooter className="border-t border-border/60">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsDurationDrawerOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground" onClick={confirmDurationSelection}>
                  Confirmar
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer open={isWeightDrawerOpen} onOpenChange={handleWeightDrawerOpenChange}>
          <DrawerContent className="max-h-[78vh] w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
            <DrawerHeader className="border-b border-border/60">
              <DrawerTitle className="text-foreground">Peso (kg)</DrawerTitle>
            </DrawerHeader>

            <div className="px-4 pb-2">
              <div className="rounded-xl border border-border/60 bg-background/70 p-2">
                <WheelPicker
                  value={pendingWeight}
                  onChange={setPendingWeight}
                  options={WEIGHT_OPTIONS}
                  visibleItems={5}
                  itemHeight={44}
                />
              </div>
            </div>

            <DrawerFooter className="border-t border-border/60">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsWeightDrawerOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground" onClick={confirmWeightSelection}>
                  Confirmar
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer open={isAgeDrawerOpen} onOpenChange={handleAgeDrawerOpenChange}>
          <DrawerContent className="max-h-[78vh] w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
            <DrawerHeader className="border-b border-border/60">
              <DrawerTitle className="text-foreground">Idade</DrawerTitle>
            </DrawerHeader>

            <div className="px-4 pb-2">
              <div className="rounded-xl border border-border/60 bg-background/70 p-2">
                <WheelPicker
                  value={pendingAge}
                  onChange={setPendingAge}
                  options={AGE_OPTIONS}
                  visibleItems={5}
                  itemHeight={44}
                />
              </div>
            </div>

            <DrawerFooter className="border-t border-border/60">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsAgeDrawerOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground" onClick={confirmAgeSelection}>
                  Confirmar
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer open={isIntensityDrawerOpen} onOpenChange={handleIntensityDrawerOpenChange}>
          <DrawerContent className="max-h-[78vh] w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
            <DrawerHeader className="border-b border-border/60">
              <DrawerTitle className="text-foreground">Intensidade do Exercício</DrawerTitle>
            </DrawerHeader>

            <div className="px-4 pb-2">
              <div className="rounded-xl border border-border/60 bg-background/70 p-2">
                <WheelPicker
                  value={pendingIntensity}
                  onChange={setPendingIntensity}
                  options={INTENSITY_OPTIONS}
                  visibleItems={5}
                  itemHeight={44}
                />
              </div>
            </div>

            <DrawerFooter className="border-t border-border/60">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsIntensityDrawerOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground" onClick={confirmIntensitySelection}>
                  Confirmar
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>
  );
}