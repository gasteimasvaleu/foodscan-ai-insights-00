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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

const MENU_MEALS = [
  { key: "breakfast", label: "☕ Café da Manhã" },
  { key: "morningSnack", label: "🍎 Lanche da Manhã" },
  { key: "lunch", label: "🍽️ Almoço" },
  { key: "afternoonSnack", label: "🥤 Lanche da Tarde" },
  { key: "dinner", label: "🌙 Jantar" },
];

export default function MyDiets() {
  const navigate = useNavigate();
  const [diets, setDiets] = useState<CustomDiet[]>([]);
  const [selectedDay, setSelectedDay] = useState("segunda");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuPreferences, setMenuPreferences] = useState<any>(null);
  const [menuPlans, setMenuPlans] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    meal_type: "cafe_manha",
    meal_name: "",
    description: "",
  });

  useEffect(() => {
    loadDiets();
    loadMenuData();
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

  const loadMenuData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: prefs } = await supabase
        .from("user_menu_preferences")
        .select("*")
        .eq("user_id", user.user.id)
        .single();

      const { data: plans } = await supabase
        .from("user_menu_plans")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false });

      setMenuPreferences(prefs);
      setMenuPlans(plans || []);
    } catch (error) {
      console.error("Error loading menu data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase.from("user_custom_diets").insert({
        user_id: user.user.id,
        day_of_week: selectedDay,
        meal_type: formData.meal_type,
        meal_name: formData.meal_name,
        description: formData.description,
        foods: [],
        total_calories: 0,
      });

      if (error) throw error;

      toast.success("Refeição adicionada");
      setDialogOpen(false);
      setFormData({ meal_type: "cafe_manha", meal_name: "", description: "" });
      loadDiets();
    } catch (error) {
      console.error("Error saving diet:", error);
      toast.error("Erro ao salvar refeição");
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">Carregando...</div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 pb-24">
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

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Dietas Manuais</TabsTrigger>
            <TabsTrigger value="ai">Menus Gerados por IA</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
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
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Nova Refeição</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                  <div>
                                    <Label>Nome da Refeição</Label>
                                    <Input
                                      value={formData.meal_name}
                                      onChange={(e) =>
                                        setFormData({ ...formData, meal_name: e.target.value })
                                      }
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label>Descrição</Label>
                                    <Input
                                      value={formData.description}
                                      onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                      }
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
                                <div>
                                  <p className="font-medium">{meal.meal_name}</p>
                                  {meal.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {meal.description}
                                    </p>
                                  )}
                                  <p className="text-sm text-primary">
                                    {meal.total_calories} kcal
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
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Preferências de Menu</CardTitle>
                <CardDescription>Configuradas para geração de menus pela IA</CardDescription>
              </CardHeader>
              <CardContent>
                {menuPreferences ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Calorias Máximas:</strong> {menuPreferences.max_calories} kcal
                    </p>
                    <p>
                      <strong>Ingredientes Favoritos:</strong>{" "}
                      {menuPreferences.favorite_ingredients}
                    </p>
                    {menuPreferences.specific_requirements && (
                      <p>
                        <strong>Requisitos:</strong> {menuPreferences.specific_requirements}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma preferência configurada</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Menus Gerados</CardTitle>
                <CardDescription>Histórico de menus gerados pela IA</CardDescription>
              </CardHeader>
              <CardContent>
                {menuPlans.length > 0 ? (
                  <div className="space-y-6">
                    {menuPlans.map((plan) => (
                      <div key={plan.id} className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-border/50">
                          <p className="text-sm font-medium">
                            Gerado em {new Date(plan.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        
                        <Accordion type="single" collapsible className="w-full">
                          {MENU_MEALS.map((mealType) => {
                            const meal = (plan.menu_data as any)?.[mealType.key];
                            if (!meal) return null;
                            
                            return (
                              <AccordionItem key={mealType.key} value={mealType.key}>
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex flex-col items-start gap-1 text-left">
                                    <span className="font-semibold">{mealType.label}</span>
                                    <span className="text-sm font-normal text-foreground">
                                      {meal.recipeName}
                                    </span>
                                    <div className="flex gap-3 text-xs text-muted-foreground">
                                      <span>🔥 {meal.calories} kcal</span>
                                      <span>⏱️ {meal.prepTime} min</span>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3 pt-2">
                                  <div>
                                    <p className="font-semibold mb-2 text-sm">Ingredientes:</p>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                      {meal.ingredients?.map((ingredient: string, idx: number) => (
                                        <li key={idx}>{ingredient}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <p className="font-semibold mb-2 text-sm">Modo de Preparo:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                      {meal.instructions?.map((instruction: string, idx: number) => (
                                        <li key={idx} className="pl-2">{instruction}</li>
                                      ))}
                                    </ol>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum menu gerado ainda</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
