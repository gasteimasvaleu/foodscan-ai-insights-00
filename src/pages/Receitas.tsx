import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { AuthCard } from "@/components/AuthCard";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeDetails } from "@/components/RecipeDetails";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { WheelPicker } from "@/components/ui/wheel-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Search, X, ChevronDown, BookMarked } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MyRecipesTab } from "@/components/MyRecipesTab";

const DIETS = [
  { value: "", label: "Todas" },
  { value: "vegetarian", label: "Vegetariana" },
  { value: "vegan", label: "Vegana" },
  { value: "gluten free", label: "Sem Glúten" },
  { value: "ketogenic", label: "Cetogênica" },
  { value: "paleo", label: "Paleo" },
];

const CUISINES = [
  { value: "", label: "Todas" },
  { value: "brazilian", label: "Brasileira" },
  { value: "italian", label: "Italiana" },
  { value: "japanese", label: "Japonesa" },
  { value: "mexican", label: "Mexicana" },
  { value: "mediterranean", label: "Mediterrânea" },
  { value: "chinese", label: "Chinesa" },
];

const Receitas = () => {
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [pendingDiet, setPendingDiet] = useState("");
  const [pendingCuisine, setPendingCuisine] = useState("");
  const [isDietDrawerOpen, setIsDietDrawerOpen] = useState(false);
  const [isCuisineDrawerOpen, setIsCuisineDrawerOpen] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [offset, setOffset] = useState(0);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const searchRecipes = async (newSearch = true) => {
    if (!query.trim()) {
      toast.error("Digite algo para buscar");
      return;
    }
    setLoading(true);
    const currentOffset = newSearch ? 0 : offset;
    try {
      const { data, error } = await supabase.functions.invoke('spoonacular-recipes', {
        body: {
          action: 'search',
          query: query.trim(),
          diet: diet || undefined,
          cuisine: cuisine || undefined,
          number: 12,
          offset: currentOffset,
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const results = data.results || [];
      if (newSearch) {
        setRecipes(results);
        setOffset(12);
      } else {
        setRecipes(prev => [...prev, ...results]);
        setOffset(prev => prev + 12);
      }
      setTotalResults(data.totalResults || 0);
      setHasSearched(true);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao buscar receitas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') searchRecipes(true);
  };

  const clearSearch = () => {
    setQuery("");
    setDiet("");
    setCuisine("");
    setPendingDiet("");
    setPendingCuisine("");
    setRecipes([]);
    setHasSearched(false);
    setTotalResults(0);
    setOffset(0);
  };

  const getSelectedLabel = (options: { value: string; label: string }[], currentValue: string, placeholder: string) => {
    return options.find((option) => option.value === currentValue)?.label ?? placeholder;
  };

  const openDietDrawer = () => {
    setPendingDiet(diet);
    setIsDietDrawerOpen(true);
  };

  const openCuisineDrawer = () => {
    setPendingCuisine(cuisine);
    setIsCuisineDrawerOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <AuthCard />;

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)]">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary">Receitas</h1>
          </div>
        </div>

        <Tabs defaultValue="buscar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="buscar">
              <Search className="w-4 h-4 mr-2" /> Buscar
            </TabsTrigger>
            <TabsTrigger value="minhas">
              <BookMarked className="w-4 h-4 mr-2" /> Minhas receitas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buscar">
            {/* Search */}
            <div className="space-y-3 mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar receitas..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-9 pr-8"
                  />
                  {query && (
                    <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <Button onClick={() => searchRecipes(true)} disabled={loading || !query.trim()} size="default">
                  Buscar
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-9 justify-between text-xs font-normal"
                  onClick={openDietDrawer}
                >
                  <span>{getSelectedLabel(DIETS, diet, "Dieta")}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-9 justify-between text-xs font-normal"
                  onClick={openCuisineDrawer}
                >
                  <span>{getSelectedLabel(CUISINES, cuisine, "Culinária")}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Results */}
            {loading && recipes.length === 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-video rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : recipes.length > 0 ? (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  {totalResults} receitas encontradas
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {recipes.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={(id) => {
                        setSelectedRecipeId(id);
                        setDetailsOpen(true);
                      }}
                    />
                  ))}
                </div>
                {recipes.length < totalResults && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => searchRecipes(false)}
                    disabled={loading}
                  >
                    {loading ? "Carregando..." : "Carregar mais"}
                  </Button>
                )}
              </>
            ) : hasSearched ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                  <UtensilsCrossed size={36} className="text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma receita encontrada
                </h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Tente buscar por outro termo ou ajuste os filtros.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Search size={36} className="text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Busque receitas saudáveis
                </h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Pesquise por nome, ingrediente ou tipo de prato e veja os dados nutricionais completos.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="minhas">
            <MyRecipesTab />
          </TabsContent>
        </Tabs>
      </div>

      <RecipeDetails
        recipeId={selectedRecipeId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <Drawer open={isDietDrawerOpen} onOpenChange={setIsDietDrawerOpen}>
        <DrawerContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl px-4 pb-4 max-h-[75vh]">
          <DrawerHeader className="px-0 pt-3 pb-2 text-center">
            <DrawerTitle className="text-base font-semibold">Selecionar Dieta</DrawerTitle>
          </DrawerHeader>

          <WheelPicker
            value={pendingDiet}
            onChange={setPendingDiet}
            options={DIETS}
            visibleItems={5}
            itemHeight={44}
          />

          <DrawerFooter className="px-0 pt-4 flex-row gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setIsDietDrawerOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                setDiet(pendingDiet);
                setIsDietDrawerOpen(false);
              }}
            >
              Confirmar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={isCuisineDrawerOpen} onOpenChange={setIsCuisineDrawerOpen}>
        <DrawerContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl px-4 pb-4 max-h-[75vh]">
          <DrawerHeader className="px-0 pt-3 pb-2 text-center">
            <DrawerTitle className="text-base font-semibold">Selecionar Culinária</DrawerTitle>
          </DrawerHeader>

          <WheelPicker
            value={pendingCuisine}
            onChange={setPendingCuisine}
            options={CUISINES}
            visibleItems={5}
            itemHeight={44}
          />

          <DrawerFooter className="px-0 pt-4 flex-row gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setIsCuisineDrawerOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                setCuisine(pendingCuisine);
                setIsCuisineDrawerOpen(false);
              }}
            >
              Confirmar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Receitas;
