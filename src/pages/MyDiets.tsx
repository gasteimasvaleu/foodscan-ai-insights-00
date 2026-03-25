import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Food {
  name: string;
  portion: string;
  calories: number;
}

interface CustomDiet {
  id: string;
  day_of_week: string;
  meal_type: string;
  meal_name: string;
  description: string | null;
  foods: Food[];
  total_calories: number;
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

const MEAL_TYPES = [
  { value: "cafe_manha", label: "☕ Café da Manhã" },
  { value: "lanche_manha", label: "🍎 Lanche da Manhã" },
  { value: "almoco", label: "🍽️ Almoço" },
  { value: "lanche_tarde", label: "🥤 Lanche da Tarde" },
  { value: "jantar", label: "🌙 Jantar" },
  { value: "ceia", label: "🌜 Ceia" },
];

export default function MyDiets() {
  const navigate = useNavigate();
  const [diets, setDiets] = useState<CustomDiet[]>([]);
  const [selectedDay, setSelectedDay] = useState("segunda");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    meal_type: "cafe_manha",
    food_name: "",
    description: "",
    portion: "",
    calories: 0,
  });

  useEffect(() => {
    loadDiets();
  }, []);

  const loadDiets = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from("user_custom_diets")
        .select("*")
        .eq("user_id", user.user.id)
        .eq("is_active", true);

      if (error) throw error;
      setDiets((data || []).map(d => ({
        ...d,
        foods: (d.foods as any) || []
      })));
    } catch (error) {
      console.error("Error loading diets:", error);
      toast.error("Erro ao carregar dietas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const food: Food = {
        name: formData.food_name,
        portion: formData.portion,
        calories: formData.calories,
      };

      const { error } = await supabase.from("user_custom_diets").insert([{
        user_id: user.user.id,
        day_of_week: selectedDay,
        meal_type: formData.meal_type,
        meal_name: formData.food_name,
        description: formData.description || null,
        foods: [food] as any,
        total_calories: formData.calories,
      }]);

      if (error) throw error;

      toast.success("Alimento adicionado");
      setDialogOpen(false);
      setFormData({ meal_type: "cafe_manha", food_name: "", description: "", portion: "", calories: 0 });
      loadDiets();
    } catch (error) {
      console.error("Error saving diet:", error);
      toast.error("Erro ao salvar alimento");
    }
  };

  const deleteDiet = async (id: string) => {
    try {
      const { error } = await supabase.from("user_custom_diets").delete().eq("id", id);

      if (error) throw error;
      toast.success("Refeição excluída");
      loadDiets();
    } catch (error) {
      console.error("Error deleting diet:", error);
      toast.error("Erro ao excluir refeição");
    }
  };

  const currentDayDiets = diets.filter((d) => d.day_of_week === selectedDay);
  const groupedByMealType = MEAL_TYPES.map((mealType) => ({
    ...mealType,
    meals: currentDayDiets.filter((d) => d.meal_type === mealType.value),
  }));

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 pt-[calc(env(safe-area-inset-top)+5rem)]">
          <div className="max-w-6xl mx-auto">Carregando...</div>
        </div>
      </>
    );
  }

  return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 pt-[calc(env(safe-area-inset-top)+5rem)] pb-40">
          <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Minhas Dietas</h1>
            <p className="text-muted-foreground">Monte sua dieta semanal</p>
          </div>
          <Button className="w-full" onClick={() => navigate("/profile")}>
            Voltar
          </Button>
        </div>

        <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full space-y-4">
          <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full h-auto gap-1">
            {DAYS.map((day) => (
              <TabsTrigger key={day.value} value={day.value}>
                {day.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {DAYS.map((day) => (
            <TabsContent key={day.value} value={day.value}>
              <div className="space-y-4">
                {groupedByMealType.map((group) => (
                  <Card key={group.value} className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{group.label}</CardTitle>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() =>
                                setFormData({ ...formData, meal_type: group.value })
                              }
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
                            <DialogHeader>
                              <DialogTitle>Adicionar Alimento</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                              <div>
                                <Label>Nome do Alimento</Label>
                                <Input
                                  value={formData.food_name}
                                  onChange={(e) =>
                                    setFormData({ ...formData, food_name: e.target.value })
                                  }
                                  required
                                  placeholder="Ex: Arroz integral"
                                />
                              </div>
                              <div>
                                <Label>Quantidade/Porção</Label>
                                <Input
                                  value={formData.portion}
                                  onChange={(e) =>
                                    setFormData({ ...formData, portion: e.target.value })
                                  }
                                  required
                                  placeholder="Ex: 100g, 1 unidade, 200ml"
                                />
                              </div>
                              <div>
                                <Label>Calorias (kcal)</Label>
                                <Input
                                  type="number"
                                  value={formData.calories}
                                  onChange={(e) =>
                                    setFormData({ ...formData, calories: Number(e.target.value) })
                                  }
                                  required
                                  min="0"
                                />
                              </div>
                              <div>
                                <Label>Descrição (opcional)</Label>
                                <Input
                                  value={formData.description}
                                  onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                  }
                                  placeholder="Ex: Grelhado, cozido no vapor"
                                />
                              </div>
                              <Button type="submit" className="w-full">
                                Salvar
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    {group.meals.length > 0 && (
                      <CardContent className="space-y-2">
                        {group.meals.map((meal) => (
                          <div
                            key={meal.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{meal.meal_name}</p>
                              {meal.foods && meal.foods.length > 0 && (
                                <div className="mt-1 space-y-1">
                                  {meal.foods.map((food, idx) => (
                                    <p key={idx} className="text-sm text-muted-foreground">
                                      {food.name} - {food.portion} - {food.calories} kcal
                                    </p>
                                  ))}
                                </div>
                              )}
                              {meal.description && (
                                <p className="text-xs text-muted-foreground italic mt-1">
                                  {meal.description}
                                </p>
                              )}
                              <p className="text-sm font-medium text-primary mt-1">
                                Total: {meal.total_calories} kcal
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteDiet(meal.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
          </div>
        </div>
      </>
  );
}
