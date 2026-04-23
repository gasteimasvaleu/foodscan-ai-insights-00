import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/ui/button";
import { ChefHat, RotateCcw, Save, Share2, History, Trash2 } from "lucide-react";
import { useDishRecipe } from "@/hooks/useDishRecipe";
import { DishImageUpload } from "@/components/faca-em-casa/DishImageUpload";
import { AnalysisProgress } from "@/components/faca-em-casa/AnalysisProgress";
import { FastFoodSelector } from "@/components/faca-em-casa/FastFoodSelector";
import { HomeRecipeCard } from "@/components/faca-em-casa/HomeRecipeCard";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Recipe } from "@/types/recipe";

interface SavedRecipe {
  id: string;
  nome: string;
  recipe_data: Recipe;
  created_at: string;
}

const FacaEmCasa = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    step,
    isLoading,
    recipe,
    options,
    analyzeImage,
    selectOption,
    saveRecipe,
    reset,
  } = useDishRecipe();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<SavedRecipe[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [recentRecipes, setRecentRecipes] = useState<SavedRecipe[]>([]);

  const fetchHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from("recipes")
      .select("id, nome, recipe_data, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error(error);
      toast.error("Não foi possível carregar o histórico.");
    } else {
      setHistory((data ?? []) as unknown as SavedRecipe[]);
    }
    setHistoryLoading(false);
  };

  const fetchRecent = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("recipes")
      .select("id, nome, recipe_data, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    if (!error) {
      setRecentRecipes((data ?? []) as unknown as SavedRecipe[]);
    }
  };

  useEffect(() => {
    if (historyOpen) fetchHistory();
  }, [historyOpen]);

  useEffect(() => {
    if (user) fetchRecent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleShare = async () => {
    if (!recipe) return;
    const text = [
      `🍽️ ${recipe.nome}`,
      "",
      recipe.descricao,
      "",
      "*Ingredientes:*",
      ...recipe.ingredientes.map((i) => `• ${i.nome} — ${i.quantidade}`),
      "",
      "*Modo de preparo:*",
      ...recipe.modoPreparo.map((p, i) => `${i + 1}. ${p}`),
      "",
      `⏱ ${recipe.tempoPreparo} • 👥 ${recipe.porcoes} • 👨‍🍳 ${recipe.dificuldade}`,
      "",
      "Receita gerada no We Diet 💖",
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: recipe.nome, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Receita copiada para a área de transferência!");
      }
    } catch (e) {
      // user canceled or fallback failed
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const ok = await saveRecipe(user.id);
    if (ok) fetchRecent();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir.");
      return;
    }
    setHistory((h) => h.filter((r) => r.id !== id));
    toast.success("Receita removida.");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (!user) return <AuthCard />;

  const showUpload = !isLoading && !recipe && !options;
  const showProgress = isLoading;
  const showOptions = !isLoading && !recipe && !!options;
  const showRecipe = !isLoading && !!recipe;

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)]">
        {/* Header */}
        <div className="mb-5 animate-fade-in">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-primary leading-tight">Faça em Casa</h1>
            </div>
            <button
              onClick={() => setHistoryOpen(true)}
              className="p-2 rounded-xl bg-white/60 hover:bg-white transition"
              aria-label="Histórico"
            >
              <History className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {showUpload && <DishImageUpload onSelect={analyzeImage} disabled={isLoading} />}

        {showProgress && <AnalysisProgress step={step} />}

        {showOptions && options && (
          <FastFoodSelector
            options={options}
            onSelect={selectOption}
            onCancel={reset}
          />
        )}

        {showRecipe && recipe && (
          <>
            <HomeRecipeCard recipe={recipe} />
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Button variant="outline" className="rounded-xl gap-1" onClick={reset}>
                <RotateCcw className="w-4 h-4" />
                Nova
              </Button>
              <Button variant="outline" className="rounded-xl gap-1" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
              <Button className="rounded-xl gap-1 bg-primary hover:bg-primary/90 text-white" onClick={handleSave}>
                <Save className="w-4 h-4" />
                Salvar
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Histórico */}
      <Drawer open={historyOpen} onOpenChange={setHistoryOpen}>
        <DrawerContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/80 backdrop-blur-md border-2 border-primary shadow-xl px-4 pb-6 max-h-[80vh]">
          <DrawerHeader className="px-0 pt-3 pb-2">
            <DrawerTitle className="text-base font-semibold">Suas receitas salvas</DrawerTitle>
          </DrawerHeader>

          {historyLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Carregando…</div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Você ainda não salvou nenhuma receita.
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFD1E7]/40 border border-primary/10"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{h.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10"
                    aria-label="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default FacaEmCasa;
