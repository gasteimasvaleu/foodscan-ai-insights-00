import { useState } from "react";
import type { Recipe } from "@/types/recipe";
import { Clock, Users, ChefHat, Flame, Sparkles, Lightbulb, Shuffle, Plus, Loader2 } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MealTypeSelector } from "@/components/MealTypeSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  recipe: Recipe;
}

const Section = ({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="bg-white/80 rounded-2xl p-4 shadow border border-primary/10">
    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
      {icon}
      {title}
    </h4>
    {children}
  </div>
);

const parseNum = (s?: string): number => {
  if (!s) return 0;
  const m = String(s).replace(",", ".").match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
};

export const HomeRecipeCard = ({ recipe }: Props) => {
  const nutri = recipe.informacoesNutricionais;
  const comp = recipe.comparativoNutricional;
  const versao = recipe.versaoCaseira;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [mealType, setMealType] = useState("almoco");
  const [isSaving, setIsSaving] = useState(false);

  const porcoes = Math.max(1, parseNum(recipe.porcoes) || 1);
  const perPortion = {
    calories: Math.round(parseNum(nutri.calorias) / porcoes),
    proteins: +(parseNum(nutri.proteinas) / porcoes).toFixed(1),
    carbohydrates: +(parseNum(nutri.carboidratos) / porcoes).toFixed(1),
    fats: +(parseNum(nutri.gorduras) / porcoes).toFixed(1),
  };

  const handleAdd = async () => {
    if (!user) {
      toast.error("Faça login para adicionar ao Controle Diário");
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.from("meal_records").insert({
        user_id: user.id,
        food_name: `${recipe.nome} (caseiro)`,
        calories: perPortion.calories,
        proteins: perPortion.proteins,
        carbohydrates: perPortion.carbohydrates,
        fats: perPortion.fats,
        portion: "1 porção",
        meal_time: new Date().toISOString(),
        meal_type: mealType,
      });
      if (error) throw error;
      setShowAddDrawer(false);
      toast.success("Adicionado ao Controle Diário!", {
        action: {
          label: "Ver",
          onClick: () => navigate("/controle-diario"),
        },
      });
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao adicionar", { description: e?.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Hero */}
      <div className="bg-[#FFD1E7]/50 border border-primary/20 rounded-3xl p-5 shadow-xl">
        <h2 className="text-xl font-bold text-foreground mb-1">{recipe.nome}</h2>
        <p className="text-sm text-muted-foreground mb-4">{recipe.descricao}</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/70 rounded-xl py-2 px-1">
            <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-[10px] text-muted-foreground">Tempo</p>
            <p className="text-xs font-bold">{recipe.tempoPreparo}</p>
          </div>
          <div className="bg-white/70 rounded-xl py-2 px-1">
            <ChefHat className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-[10px] text-muted-foreground">Dificuldade</p>
            <p className="text-xs font-bold">{recipe.dificuldade}</p>
          </div>
          <div className="bg-white/70 rounded-xl py-2 px-1">
            <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-[10px] text-muted-foreground">Porções</p>
            <p className="text-xs font-bold">{recipe.porcoes}</p>
          </div>
        </div>
      </div>

      {/* Ingredientes */}
      <Section title="Ingredientes" icon={<Sparkles className="w-4 h-4 text-primary" />}>
        <ul className="space-y-1.5">
          {recipe.ingredientes.map((ing, i) => (
            <li key={i} className="text-sm flex justify-between gap-3 border-b border-primary/5 pb-1.5 last:border-0">
              <span className="text-foreground">{ing.nome}</span>
              <span className="text-muted-foreground font-medium text-right">{ing.quantidade}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Modo de Preparo */}
      <Section title="Modo de preparo" icon={<ChefHat className="w-4 h-4 text-primary" />}>
        <ol className="space-y-2">
          {recipe.modoPreparo.map((p, i) => (
            <li key={i} className="text-sm flex gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-foreground pt-0.5">{p}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Nutrição */}
      <Section title="Informações nutricionais" icon={<Flame className="w-4 h-4 text-primary" />}>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-primary/5 rounded-lg p-2">
            <p className="text-muted-foreground">Calorias</p>
            <p className="font-bold text-foreground">{nutri.calorias}</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-2">
            <p className="text-muted-foreground">Proteínas</p>
            <p className="font-bold text-foreground">{nutri.proteinas}</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-2">
            <p className="text-muted-foreground">Carboidratos</p>
            <p className="font-bold text-foreground">{nutri.carboidratos}</p>
          </div>
          {nutri.gorduras && (
            <div className="bg-primary/5 rounded-lg p-2">
              <p className="text-muted-foreground">Gorduras</p>
              <p className="font-bold text-foreground">{nutri.gorduras}</p>
            </div>
          )}
        </div>
      </Section>

      {/* Comparativo (fast-food) */}
      {comp && (
        <Section title="Original vs Caseiro" icon={<Shuffle className="w-4 h-4 text-primary" />}>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-destructive/10 rounded-lg p-2">
              <p className="font-bold text-destructive mb-1">Original</p>
              <p>🔥 {comp.original.calorias}</p>
              <p>💪 {comp.original.proteinas}</p>
              <p>🍞 {comp.original.carboidratos}</p>
              {comp.original.gorduras && <p>🧈 {comp.original.gorduras}</p>}
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-2">
              <p className="font-bold text-emerald-600 mb-1">Caseiro</p>
              <p>🔥 {comp.caseiro.calorias}</p>
              <p>💪 {comp.caseiro.proteinas}</p>
              <p>🍞 {comp.caseiro.carboidratos}</p>
              {comp.caseiro.gorduras && <p>🧈 {comp.caseiro.gorduras}</p>}
            </div>
          </div>
        </Section>
      )}

      {versao && (
        <Section title="Por que vale a pena fazer em casa" icon={<Sparkles className="w-4 h-4 text-primary" />}>
          <ul className="space-y-1 mb-2">
            {versao.beneficios.map((b, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-primary">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          {versao.economiaEstimada && (
            <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg p-2 font-medium">
              💰 {versao.economiaEstimada}
            </p>
          )}
        </Section>
      )}

      {recipe.dicas?.length > 0 && (
        <Section title="Dicas" icon={<Lightbulb className="w-4 h-4 text-primary" />}>
          <ul className="space-y-1">
            {recipe.dicas.map((d, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-primary">•</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {recipe.variacoes?.length > 0 && (
        <Section title="Variações" icon={<Shuffle className="w-4 h-4 text-primary" />}>
          <ul className="space-y-1">
            {recipe.variacoes.map((v, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-primary">•</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* CTA: Adicionar ao Controle Diário */}
      <Button
        onClick={() => setShowAddDrawer(true)}
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-2xl py-6 text-base font-semibold shadow-lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        Adicionar ao Controle Diário
      </Button>

      <Drawer open={showAddDrawer} onOpenChange={setShowAddDrawer}>
        <DrawerContent className="bg-white/95 backdrop-blur-xl border-t border-primary/20">
          <DrawerHeader>
            <DrawerTitle className="text-foreground">Adicionar ao Controle Diário</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-4">
            <div className="bg-[#FFD1E7]/40 rounded-2xl p-3 border border-primary/15">
              <p className="text-sm font-semibold text-foreground">{recipe.nome}</p>
              <p className="text-xs text-muted-foreground mb-2">Valores por 1 porção</p>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white/70 rounded-lg py-1">
                  <p className="text-muted-foreground">Kcal</p>
                  <p className="font-bold">{perPortion.calories}</p>
                </div>
                <div className="bg-white/70 rounded-lg py-1">
                  <p className="text-muted-foreground">Prot</p>
                  <p className="font-bold">{perPortion.proteins}g</p>
                </div>
                <div className="bg-white/70 rounded-lg py-1">
                  <p className="text-muted-foreground">Carb</p>
                  <p className="font-bold">{perPortion.carbohydrates}g</p>
                </div>
                <div className="bg-white/70 rounded-lg py-1">
                  <p className="text-muted-foreground">Gord</p>
                  <p className="font-bold">{perPortion.fats}g</p>
                </div>
              </div>
            </div>

            <MealTypeSelector value={mealType} onChange={setMealType} />

            <Button
              onClick={handleAdd}
              disabled={isSaving}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 text-base font-semibold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
