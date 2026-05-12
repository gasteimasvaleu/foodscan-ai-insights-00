import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Apple, Search, Plus, X, ChevronDown } from "lucide-react";
import { useFoodCatalogSearch, FOOD_CATEGORIES, CatalogFood } from "@/hooks/useFoodCatalog";
import { logMeal } from "@/lib/logMeal";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Alimentos = () => {
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<CatalogFood | null>(null);
  const [grams, setGrams] = useState<number>(100);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [logging, setLogging] = useState(false);

  const { data: foods, isLoading } = useFoodCatalogSearch(query, category || undefined);

  const macros = useMemo(() => {
    if (!selected) return { kcal: 0, p: 0, c: 0, f: 0 };
    const factor = grams / 100;
    return {
      kcal: Math.round(selected.calories_per_100g * factor),
      p: +(selected.proteins_per_100g * factor).toFixed(1),
      c: +(selected.carbs_per_100g * factor).toFixed(1),
      f: +(selected.fats_per_100g * factor).toFixed(1),
    };
  }, [selected, grams]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (!user) return <AuthCard />;

  const openFood = (f: CatalogFood) => {
    setSelected(f);
    setGrams(f.common_portion_g);
  };

  const handleLog = async () => {
    if (!selected) return;
    setLogging(true);
    try {
      await logMeal({
        user_id: user.id,
        food_name: `${selected.name} (${grams}g)`,
        portion: `${grams}g`,
        calories: macros.kcal,
        proteins: macros.p,
        carbohydrates: macros.c,
        fats: macros.f,
      });
      toast.success(`${selected.name} registrado!`);
      qc.invalidateQueries({ queryKey: ["recent-meals"] });
      qc.invalidateQueries({ queryKey: ["meal-records"] });
      setSelected(null);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao registrar");
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)]">
        {/* Header */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary">Alimentos brasileiros</h1>
          </div>
        </div>

        {/* Busca */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alimento (ex: arroz, feijão, açaí...)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-9 text-base"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsCategoryDrawerOpen(true)}
            className="w-full bg-[#FFD1E7] rounded-full px-4 py-2.5 flex items-center justify-between text-sm text-foreground"
          >
            <span className="truncate">
              Categoria: {FOOD_CATEGORIES.find(c => c.value === category)?.label ?? "Todas"}
            </span>
            <ChevronDown className="w-4 h-4 text-[#FD46A1] flex-shrink-0 ml-2" />
          </button>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          </div>
        ) : (foods?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Nenhum alimento encontrado.
          </p>
        ) : (
          <div className="space-y-2">
            {foods!.map(f => (
              <Card
                key={f.id}
                className="bg-[#FFD1E7] border-0 rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-[#FFC1DE] transition-colors"
                onClick={() => openFood(f)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-base text-foreground truncate">{f.name}</p>
                    {f.source === "community" && (
                      <span className="flex-shrink-0 text-[10px] uppercase tracking-wide font-semibold text-[#FD46A1] bg-white/70 rounded-full px-2 py-0.5 border border-white">
                        Comunidade
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {f.common_portion_label} • {Math.round(f.calories_per_100g * f.common_portion_g / 100)} kcal
                  </p>
                </div>
                <Plus className="w-5 h-5 text-[#FD46A1] flex-shrink-0" />
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de detalhes */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm mx-auto rounded-3xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold pr-8">{selected?.name}</DialogTitle>
            <DialogClose className="absolute right-3 top-3 rounded-full bg-[#FD46A1] text-white p-1.5 hover:bg-[#FD46A1]/90">
              <X className="w-4 h-4" />
            </DialogClose>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Quantidade (g)</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={grams}
                  onChange={e => setGrams(Math.max(1, Number(e.target.value) || 0))}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Sugestão: {selected.common_portion_label}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-[#FFD1E7] rounded-2xl p-2">
                  <p className="text-xs text-muted-foreground">kcal</p>
                  <p className="text-base text-foreground">{macros.kcal}</p>
                </div>
                <div className="bg-[#FFD1E7] rounded-2xl p-2">
                  <p className="text-xs text-muted-foreground">P</p>
                  <p className="text-base text-foreground">{macros.p}g</p>
                </div>
                <div className="bg-[#FFD1E7] rounded-2xl p-2">
                  <p className="text-xs text-muted-foreground">C</p>
                  <p className="text-base text-foreground">{macros.c}g</p>
                </div>
                <div className="bg-[#FFD1E7] rounded-2xl p-2">
                  <p className="text-xs text-muted-foreground">G</p>
                  <p className="text-base text-foreground">{macros.f}g</p>
                </div>
              </div>
              <Button
                className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full"
                onClick={handleLog}
                disabled={logging}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar à refeição
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Drawer Categoria */}
      <Drawer open={isCategoryDrawerOpen} onOpenChange={setIsCategoryDrawerOpen}>
        <DrawerContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl px-4 pb-4 max-h-[75vh]">
          <DrawerHeader className="px-0 pt-3 pb-2 text-center">
            <DrawerTitle className="text-base font-semibold">Escolha a categoria</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto space-y-2 px-1">
            {FOOD_CATEGORIES.map((c) => (
              <button
                key={c.value || "todas"}
                type="button"
                onClick={() => {
                  setCategory(c.value);
                  setIsCategoryDrawerOpen(false);
                }}
                className={`w-full rounded-2xl px-4 py-3 text-sm text-left transition-colors ${
                  category === c.value
                    ? "bg-[#FD46A1] text-white"
                    : "bg-[#FFD1E7] text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <DrawerFooter className="px-0 pt-4">
            <Button
              type="button"
              onClick={() => setIsCategoryDrawerOpen(false)}
              className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full"
            >
              Fechar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Alimentos;
