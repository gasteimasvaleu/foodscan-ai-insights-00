import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Clock, Users, Flame, Drumstick, Wheat, Droplets, ChefHat, ShoppingCart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SelectShoppingListModal } from "@/components/shopping/SelectShoppingListModal";
import { useShoppingListDetail } from "@/hooks/useShoppingLists";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface RecipeDetailsProps {
  recipeId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getNutrient = (nutrients: any[], name: string) => {
  return nutrients?.find((n: any) => n.name === name);
};

export const RecipeDetails = ({ recipeId, open, onOpenChange }: RecipeDetailsProps) => {
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectListOpen, setSelectListOpen] = useState(false);
  const [addingIngredients, setAddingIngredients] = useState(false);
  const navigate = useNavigate();
  // hook used only for its addItemsBulk fn (no listId)
  const { addItemsBulk } = useShoppingListDetail(undefined);

  useEffect(() => {
    if (recipeId && open) {
      fetchDetails();
    }
    if (!open) setRecipe(null);
  }, [recipeId, open]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('spoonacular-recipes', {
        body: { action: 'details', id: recipeId },
      });
      if (error) throw error;
      setRecipe(data);
    } catch (err) {
      console.error('Error fetching recipe details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredientsToList = async (listId: string, listName: string) => {
    if (!recipe?.extendedIngredients?.length) return;
    setAddingIngredients(true);
    try {
      const ingredients = recipe.extendedIngredients.map((ing: any) => ({
        original: ing.original,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
      }));
      const { data, error } = await supabase.functions.invoke("shopping-from-recipe", {
        body: { ingredients },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const items = data?.items ?? [];
      if (items.length === 0) {
        toast.info("Nenhum ingrediente pôde ser adicionado");
        return;
      }
      const count = await addItemsBulk(items, listId);
      if (count > 0) {
        toast.success(`${count} ${count === 1 ? "ingrediente adicionado" : "ingredientes adicionados"} a ${listName}`, {
          action: {
            label: "Ver lista",
            onClick: () => {
              onOpenChange(false);
              navigate(`/lista-de-compras/${listId}`);
            },
          },
        });
      }
    } catch (err: any) {
      console.error("[RecipeDetails] addIngredients error:", err);
      toast.error(err?.message || "Erro ao adicionar ingredientes");
    } finally {
      setAddingIngredients(false);
    }
  };

  const nutrients = recipe?.nutrition?.nutrients || [];
  const calories = getNutrient(nutrients, 'Calories');
  const protein = getNutrient(nutrients, 'Protein');
  const carbs = getNutrient(nutrients, 'Carbohydrates');
  const fat = getNutrient(nutrients, 'Fat');
  const fiber = getNutrient(nutrients, 'Fiber');
  const sodium = getNutrient(nutrients, 'Sodium');

  const instructions = recipe?.analyzedInstructions?.[0]?.steps || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto p-0" aria-describedby={undefined}>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 min-h-[300px] space-y-4">
            <DialogHeader>
              <DialogTitle className="sr-only">Carregando receita</DialogTitle>
            </DialogHeader>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="text-primary font-medium animate-pulse">Traduzindo receita...</p>
          </div>
        ) : recipe ? (
          <>
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="p-5 space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg leading-tight">{recipe.title}</DialogTitle>
              </DialogHeader>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {recipe.readyInMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {recipe.readyInMinutes} min
                  </span>
                )}
                {recipe.servings && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {recipe.servings} porções
                  </span>
                )}
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Calorias', value: calories, suffix: 'kcal' },
                  { icon: Drumstick, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Proteínas', value: protein, suffix: 'g' },
                  { icon: Wheat, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Carboidratos', value: carbs, suffix: 'g' },
                  { icon: Droplets, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Gorduras', value: fat, suffix: 'g' },
                ].filter(m => m.value).map((macro, i) => (
                  <div key={i} className={`${macro.bg} rounded-xl p-2.5 text-center`}>
                    <macro.icon className={`w-4 h-4 ${macro.color} mx-auto mb-1`} />
                    <div className="text-sm font-bold text-foreground">
                      {Math.round(macro.value.amount)}{macro.suffix}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{macro.label}</div>
                  </div>
                ))}
                {fiber && (
                  <div className="bg-green-500/10 rounded-xl p-2.5 text-center">
                    <span className="text-sm font-bold text-foreground">{Math.round(fiber.amount)}g</span>
                    <div className="text-[10px] text-muted-foreground">Fibras</div>
                  </div>
                )}
                {sodium && (
                  <div className="bg-blue-500/10 rounded-xl p-2.5 text-center">
                    <span className="text-sm font-bold text-foreground">{Math.round(sodium.amount)}mg</span>
                    <div className="text-[10px] text-muted-foreground">Sódio</div>
                  </div>
                )}
              </div>

              {/* Ingredientes */}
              {recipe.extendedIngredients?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4 text-primary" /> Ingredientes
                  </h3>
                  <ul className="space-y-1.5">
                    {recipe.extendedIngredients.map((ing: any, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {ing.original}
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    onClick={() => setSelectListOpen(true)}
                    disabled={addingIngredients}
                    variant="outline"
                    className="w-full mt-3 rounded-full border-primary text-primary bg-white h-10 text-sm font-semibold gap-2"
                  >
                    {addingIngredients ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        Adicionar à lista de compras
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Instruções */}
              {instructions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-2">Modo de Preparo</h3>
                  <ol className="space-y-3">
                    {instructions.map((step: any) => (
                      <li key={step.number} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {step.number}
                        </span>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
