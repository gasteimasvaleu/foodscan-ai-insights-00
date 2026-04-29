import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChefHat, X, Repeat } from "lucide-react";
import {
  useUserRecipes,
  useSaveUserRecipe,
  useDeleteUserRecipe,
  useTouchUserRecipe,
  type RecipeIngredient,
  type UserRecipe,
} from "@/hooks/useUserRecipes";
import { useAuth } from "@/hooks/useAuth";
import { logMeal } from "@/lib/logMeal";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const emptyIngredient = (): RecipeIngredient => ({
  name: "",
  quantity: 1,
  unit: "porção",
  calories: 0,
  proteins: 0,
  carbs: 0,
  fats: 0,
});

export const MyRecipesTab = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: recipes, isLoading } = useUserRecipes();
  const saveRecipe = useSaveUserRecipe();
  const deleteRecipe = useDeleteUserRecipe();
  const touchRecipe = useTouchUserRecipe();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([emptyIngredient()]);
  const [logging, setLogging] = useState<string | null>(null);

  const totals = useMemo(() => {
    const t = ingredients.reduce(
      (acc, ing) => ({
        kcal: acc.kcal + Number(ing.calories || 0),
        p: acc.p + Number(ing.proteins || 0),
        c: acc.c + Number(ing.carbs || 0),
        f: acc.f + Number(ing.fats || 0),
      }),
      { kcal: 0, p: 0, c: 0, f: 0 }
    );
    const s = Math.max(1, servings);
    return {
      total: t,
      perServing: {
        kcal: Math.round(t.kcal / s),
        p: +(t.p / s).toFixed(1),
        c: +(t.c / s).toFixed(1),
        f: +(t.f / s).toFixed(1),
      },
    };
  }, [ingredients, servings]);

  const updateIng = (i: number, patch: Partial<RecipeIngredient>) => {
    setIngredients(prev => prev.map((ing, idx) => (idx === i ? { ...ing, ...patch } : ing)));
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setServings(1);
    setIngredients([emptyIngredient()]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Dê um nome à receita");
      return;
    }
    const validIngredients = ingredients.filter(i => i.name.trim());
    if (validIngredients.length === 0) {
      toast.error("Adicione ao menos 1 ingrediente");
      return;
    }
    await saveRecipe.mutateAsync({
      name: name.trim(),
      description: description.trim() || null,
      servings: Math.max(1, servings),
      ingredients: validIngredients,
      calories_per_serving: totals.perServing.kcal,
      proteins_per_serving: totals.perServing.p,
      carbs_per_serving: totals.perServing.c,
      fats_per_serving: totals.perServing.f,
      image_url: null,
    });
    setCreateOpen(false);
    resetForm();
  };

  const handleLogRecipe = async (r: UserRecipe) => {
    if (!user) return;
    setLogging(r.id);
    try {
      await logMeal({
        user_id: user.id,
        food_name: r.name,
        portion: "1 porção",
        calories: r.calories_per_serving,
        proteins: Number(r.proteins_per_serving),
        carbohydrates: Number(r.carbs_per_serving),
        fats: Number(r.fats_per_serving),
        image_url: r.image_url ?? null,
      });
      touchRecipe.mutate(r.id);
      toast.success(`${r.name} registrado!`);
      qc.invalidateQueries({ queryKey: ["meal-records"] });
      qc.invalidateQueries({ queryKey: ["recent-meals"] });
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao registrar");
    } finally {
      setLogging(null);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full"
        onClick={() => setCreateOpen(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Criar nova receita
      </Button>

      {isLoading ? (
        [...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 rounded-3xl" />)
      ) : (recipes?.length ?? 0) === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
            <ChefHat size={36} className="text-primary" />
          </div>
          <p className="text-base text-foreground mb-1">Nenhuma receita salva</p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Cadastre uma vez (ex: "meu shake de proteína") e logue em 1 toque sempre que repetir.
          </p>
        </div>
      ) : (
        recipes!.map(r => (
          <Card key={r.id} className="bg-[#FFD1E7] border-0 rounded-3xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-base text-foreground truncate">{r.name}</p>
                {r.description && <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {r.servings} porç{r.servings === 1 ? "ão" : "ões"} • {r.calories_per_serving} kcal/porção
                  {" "}• P {Number(r.proteins_per_serving).toFixed(0)}g
                  {" "}C {Number(r.carbs_per_serving).toFixed(0)}g
                  {" "}G {Number(r.fats_per_serving).toFixed(0)}g
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-[#FD46A1] hover:bg-white/40 flex-shrink-0"
                onClick={() => deleteRecipe.mutate(r.id)}
                aria-label="Remover"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
            <Button
              size="sm"
              className="w-full mt-3 bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full"
              onClick={() => handleLogRecipe(r)}
              disabled={logging === r.id}
            >
              <Repeat className="w-4 h-4 mr-1" />
              Logar 1 porção
            </Button>
          </Card>
        ))
      )}

      {/* Modal de criação */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="bg-white/70 backdrop-blur-md border-2 border-primary rounded-3xl max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold pr-8">Nova receita</DialogTitle>
            <DialogClose className="absolute right-3 top-3 rounded-full bg-[#FD46A1] text-white p-1.5 hover:bg-[#FD46A1]/90">
              <X className="w-4 h-4" />
            </DialogClose>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Nome</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Meu shake de proteína" className="text-base" />
            </div>
            <div>
              <Label className="text-sm">Descrição (opcional)</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Banana + whey + leite" className="text-base" />
            </div>
            <div>
              <Label className="text-sm">Porções que rende</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={servings}
                onChange={e => setServings(Math.max(1, Number(e.target.value) || 1))}
                className="text-base"
              />
            </div>

            <div>
              <p className="text-sm mb-2">Ingredientes</p>
              <div className="space-y-2">
                {ingredients.map((ing, i) => (
                  <Card key={i} className="bg-[#FFD1E7]/60 border-0 rounded-2xl p-3 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={ing.name}
                        onChange={e => updateIng(i, { name: e.target.value })}
                        placeholder="Nome do ingrediente"
                        className="text-base flex-1"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive flex-shrink-0"
                        onClick={() => setIngredients(prev => prev.filter((_, idx) => idx !== i))}
                        disabled={ingredients.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <Input type="number" inputMode="decimal" placeholder="kcal" value={ing.calories || ""} onChange={e => updateIng(i, { calories: Number(e.target.value) || 0 })} className="text-base" />
                      <Input type="number" inputMode="decimal" placeholder="P" value={ing.proteins || ""} onChange={e => updateIng(i, { proteins: Number(e.target.value) || 0 })} className="text-base" />
                      <Input type="number" inputMode="decimal" placeholder="C" value={ing.carbs || ""} onChange={e => updateIng(i, { carbs: Number(e.target.value) || 0 })} className="text-base" />
                      <Input type="number" inputMode="decimal" placeholder="G" value={ing.fats || ""} onChange={e => updateIng(i, { fats: Number(e.target.value) || 0 })} className="text-base" />
                    </div>
                  </Card>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 rounded-full"
                onClick={() => setIngredients(prev => [...prev, emptyIngredient()])}
              >
                <Plus className="w-4 h-4 mr-1" /> Adicionar ingrediente
              </Button>
            </div>

            <div className="bg-[#FFD1E7] rounded-2xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Por porção:</p>
              <p className="text-base text-foreground">
                {totals.perServing.kcal} kcal • P {totals.perServing.p}g • C {totals.perServing.c}g • G {totals.perServing.f}g
              </p>
            </div>

            <Button
              className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full"
              onClick={handleSave}
              disabled={saveRecipe.isPending}
            >
              Salvar receita
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
