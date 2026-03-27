import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { AuthCard } from "@/components/AuthCard";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeDetails } from "@/components/RecipeDetails";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UtensilsCrossed, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    setRecipes([]);
    setHasSearched(false);
    setTotalResults(0);
    setOffset(0);
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
      <div className="container max-w-lg mx-auto px-4 pt-20">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary">Receitas</h1>
          </div>
        </div>

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
            <Button onClick={() => searchRecipes(true)} disabled={loading} size="default">
              Buscar
            </Button>
          </div>

          <div className="flex gap-2">
            <Select value={diet} onValueChange={setDiet}>
              <SelectTrigger className="flex-1 h-9 text-xs">
                <SelectValue placeholder="Dieta" />
              </SelectTrigger>
              <SelectContent>
                {DIETS.map(d => (
                  <SelectItem key={d.value} value={d.value || "all"}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={cuisine} onValueChange={setCuisine}>
              <SelectTrigger className="flex-1 h-9 text-xs">
                <SelectValue placeholder="Culinária" />
              </SelectTrigger>
              <SelectContent>
                {CUISINES.map(c => (
                  <SelectItem key={c.value} value={c.value || "all"}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
      </div>

      <RecipeDetails
        recipeId={selectedRecipeId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
};

export default Receitas;
