import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Star, Trash2, Plus, Repeat } from "lucide-react";
import { useRecentMeals, useYesterdayMeals, RecentMeal } from "@/hooks/useRecentMeals";
import { useFavoriteMeals, useAddFavoriteMeal, useRemoveFavoriteMeal, useTouchFavoriteMeal, FavoriteMeal } from "@/hooks/useFavoriteMeals";
import { logMeal } from "@/lib/logMeal";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const AdicionarRefeicao = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [tab, setTab] = useState("recentes");
  const [logging, setLogging] = useState<string | null>(null);

  const { data: recents, isLoading: loadingRecents } = useRecentMeals(40);
  const { data: yesterday, isLoading: loadingYesterday } = useYesterdayMeals();
  const { data: favorites, isLoading: loadingFavs } = useFavoriteMeals();
  const addFav = useAddFavoriteMeal();
  const removeFav = useRemoveFavoriteMeal();
  const touchFav = useTouchFavoriteMeal();

  const favoriteKeys = useMemo(
    () => new Set((favorites ?? []).map(f => `${f.food_name.toLowerCase()}|${f.portion.toLowerCase()}`)),
    [favorites]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (!user) return <AuthCard />;

  const handleLogMeal = async (m: RecentMeal | FavoriteMeal, favId?: string) => {
    setLogging(m.id);
    try {
      await logMeal({
        user_id: user.id,
        food_name: m.food_name,
        portion: m.portion,
        calories: m.calories,
        proteins: Number(m.proteins),
        carbohydrates: Number(m.carbohydrates),
        fats: Number(m.fats),
        meal_type: null, // infer
        image_url: m.image_url ?? null,
      });
      if (favId) touchFav.mutate(favId);
      toast.success(`${m.food_name} adicionado!`);
      qc.invalidateQueries({ queryKey: ["recent-meals"] });
      qc.invalidateQueries({ queryKey: ["meal-records"] });
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao registrar");
    } finally {
      setLogging(null);
    }
  };

  const handleLogYesterday = async () => {
    if (!yesterday || yesterday.length === 0) return;
    setLogging("__all__");
    try {
      const now = new Date();
      for (const m of yesterday) {
        await logMeal({
          user_id: user.id,
          food_name: m.food_name,
          portion: m.portion,
          calories: m.calories,
          proteins: Number(m.proteins),
          carbohydrates: Number(m.carbohydrates),
          fats: Number(m.fats),
          meal_type: m.meal_type ?? undefined,
          image_url: m.image_url ?? null,
          meal_time: now,
        });
      }
      toast.success(`${yesterday.length} refeições de ontem registradas!`);
      qc.invalidateQueries({ queryKey: ["recent-meals"] });
      qc.invalidateQueries({ queryKey: ["meal-records"] });
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao replicar");
    } finally {
      setLogging(null);
    }
  };

  const toggleFavorite = (m: RecentMeal) => {
    const key = `${m.food_name.toLowerCase()}|${m.portion.toLowerCase()}`;
    if (favoriteKeys.has(key)) {
      const fav = favorites?.find(f => `${f.food_name.toLowerCase()}|${f.portion.toLowerCase()}` === key);
      if (fav) removeFav.mutate(fav.id);
    } else {
      addFav.mutate({
        food_name: m.food_name,
        portion: m.portion,
        calories: m.calories,
        proteins: Number(m.proteins),
        carbohydrates: Number(m.carbohydrates),
        fats: Number(m.fats),
        meal_type: m.meal_type ?? null,
        image_url: m.image_url ?? null,
      });
    }
  };

  const renderMealCard = (m: RecentMeal | FavoriteMeal, isFavorite: boolean, favId?: string) => {
    const key = `${m.food_name.toLowerCase()}|${m.portion.toLowerCase()}`;
    const isFav = favoriteKeys.has(key);
    return (
      <Card key={m.id} className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] p-4 pl-5 flex items-center gap-3 before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]">
        {m.image_url ? (
          <img src={m.image_url} alt={m.food_name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-[#FFD1E7]/50 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🍽️</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-base text-foreground truncate">{m.food_name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {m.portion} • {m.calories} kcal • P {Number(m.proteins).toFixed(0)}g C {Number(m.carbohydrates).toFixed(0)}g G {Number(m.fats).toFixed(0)}g
          </p>
        </div>
        {isFavorite ? (
          <Button
            size="icon"
            variant="ghost"
            className="text-[#FD46A1] hover:bg-white/40 flex-shrink-0"
            onClick={() => removeFav.mutate(favId!)}
            aria-label="Remover dos favoritos"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className="text-[#FD46A1] hover:bg-white/40 flex-shrink-0"
            onClick={() => toggleFavorite(m as RecentMeal)}
            aria-label={isFav ? "Remover dos favoritos" : "Favoritar"}
          >
            <Star className={`w-5 h-5 ${isFav ? "fill-[#FD46A1]" : ""}`} />
          </Button>
        )}
        <Button
          size="sm"
          className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full flex-shrink-0"
          onClick={() => handleLogMeal(m, favId)}
          disabled={logging === m.id}
        >
          <Plus className="w-4 h-4 mr-1" />
          Logar
        </Button>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)]">
        {/* Header */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <Repeat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary">Registrar refeição</h1>
          </div>
        </div>

        {/* Repetir ontem */}
        {(yesterday?.length ?? 0) > 0 && (
          <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] p-4 pl-5 mb-4 before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]">
            <p className="text-base text-foreground mb-1">Repetir refeições de ontem</p>
            <p className="text-xs text-muted-foreground mb-3">
              {yesterday!.length} refeição{yesterday!.length === 1 ? "" : "es"} registrada{yesterday!.length === 1 ? "" : "s"} ontem
            </p>
            <Button
              className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full"
              onClick={handleLogYesterday}
              disabled={logging === "__all__"}
            >
              <Repeat className="w-4 h-4 mr-2" />
              Replicar tudo de ontem
            </Button>
          </Card>
        )}

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="recentes">
              <History className="w-4 h-4 mr-2" /> Recentes
            </TabsTrigger>
            <TabsTrigger value="favoritos">
              <Star className="w-4 h-4 mr-2" /> Favoritos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recentes" className="space-y-3">
            {loadingRecents ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-3xl" />)
            ) : (recents?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                Você ainda não registrou nenhuma refeição.
              </p>
            ) : (
              recents!.map(m => renderMealCard(m, false))
            )}
          </TabsContent>

          <TabsContent value="favoritos" className="space-y-3">
            {loadingFavs ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-3xl" />)
            ) : (favorites?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                Toque na estrela em uma refeição recente pra adicionar aqui.
              </p>
            ) : (
              favorites!.map(f => renderMealCard(f, true, f.id))
            )}
          </TabsContent>
        </Tabs>

        <Button
          variant="outline"
          className="w-full mt-6 rounded-full"
          onClick={() => navigate("/alimentos")}
        >
          Buscar em alimentos brasileiros
        </Button>
      </div>
    </div>
  );
};

export default AdicionarRefeicao;
