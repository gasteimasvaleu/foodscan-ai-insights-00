import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard, AffiliateProduct } from "@/components/loja/ProductCard";
import { ProductCarousel } from "@/components/loja/ProductCarousel";
import { STORE_CATEGORIES, getCategory } from "@/data/storeCategories";
import { cn } from "@/lib/utils";

const Loja = () => {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("affiliate_products")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) setProducts(data as AffiliateProduct[]);
    setLoading(false);
  };

  const isFiltering = search.trim().length > 0 || activeCategory !== null;

  const newest = useMemo(
    () =>
      [...products]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 10),
    [products]
  );

  const filteredResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeSubcategory && p.subcategory !== activeSubcategory) return false;
      if (term && !p.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [products, search, activeCategory, activeSubcategory]);

  const productsByCategory = (catKey: string) =>
    products.filter((p) => p.category === catKey);

  const handleSelectCategory = (catKey: string | null) => {
    setActiveCategory(catKey);
    setActiveSubcategory(null);
  };

  const clearFilters = () => {
    setSearch("");
    setActiveCategory(null);
    setActiveSubcategory(null);
  };

  const currentCategory = activeCategory ? getCategory(activeCategory) : null;
  const showSubcategories =
    currentCategory && currentCategory.subcategories.length > 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-[calc(env(safe-area-inset-top)+5rem)] px-4 pb-4 space-y-5">
        {/* Buscador + categorias */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              className="pl-9 pr-9 rounded-full bg-white border-0 shadow-sm h-11"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Chips de categoria */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <CategoryChip
              label="Todas"
              active={activeCategory === null}
              onClick={() => handleSelectCategory(null)}
            />
            {STORE_CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.key}
                label={cat.shortLabel}
                active={activeCategory === cat.key}
                onClick={() => handleSelectCategory(cat.key)}
              />
            ))}
          </div>

          {/* Chips de subcategoria */}
          {showSubcategories && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              <CategoryChip
                label="Todas"
                active={activeSubcategory === null}
                onClick={() => setActiveSubcategory(null)}
                variant="sub"
              />
              {currentCategory!.subcategories.map((sub) => (
                <CategoryChip
                  key={sub.key}
                  label={sub.label}
                  active={activeSubcategory === sub.key}
                  onClick={() => setActiveSubcategory(sub.key)}
                  variant="sub"
                />
              ))}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : isFiltering ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-semibold text-foreground">
                {filteredResults.length}{" "}
                {filteredResults.length === 1 ? "resultado" : "resultados"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-primary hover:text-primary h-auto py-1 px-2"
              >
                Limpar
              </Button>
            </div>
            {filteredResults.length === 0 ? (
              <div className="bg-white/60 rounded-2xl p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum produto encontrado.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredResults.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <ProductCarousel
              title="Novidades"
              products={newest}
              emptyMessage="Em breve novidades por aqui!"
            />
            <ProductCarousel
              title="Vitaminas e Suplementos"
              products={productsByCategory("vitaminas")}
              onSeeAll={() => handleSelectCategory("vitaminas")}
            />
            <ProductCarousel
              title="Beleza"
              products={productsByCategory("beleza")}
              onSeeAll={() => handleSelectCategory("beleza")}
            />
            <ProductCarousel
              title="Roupas e Acessórios"
              products={productsByCategory("roupas")}
              onSeeAll={() => handleSelectCategory("roupas")}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface CategoryChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "main" | "sub";
}

const CategoryChip = ({
  label,
  active,
  onClick,
  variant = "main",
}: CategoryChipProps) => (
  <button
    onClick={onClick}
    className={cn(
      "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors flex-shrink-0",
      variant === "sub" ? "py-1.5 text-xs" : "",
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "bg-white text-foreground/80 hover:bg-white/80"
    )}
  >
    {label}
  </button>
);

export default Loja;
