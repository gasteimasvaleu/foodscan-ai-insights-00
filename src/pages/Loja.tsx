import { useEffect, useMemo, useState } from "react";
import { Search, X, ShoppingBag, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { WheelPicker } from "@/components/ui/wheel-picker";
import { ProductCard, AffiliateProduct } from "@/components/loja/ProductCard";
import { ProductCarousel } from "@/components/loja/ProductCarousel";
import { STORE_CATEGORIES, getCategory } from "@/data/storeCategories";

const ALL_VALUE = "__all__";

const Loja = () => {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isSubcategoryDrawerOpen, setIsSubcategoryDrawerOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string>(ALL_VALUE);
  const [pendingSubcategory, setPendingSubcategory] = useState<string>(ALL_VALUE);

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
        {/* Card título da seção */}
        <div
          className="rounded-3xl shadow-xl p-5 flex items-center gap-4"
          style={{ backgroundColor: "#FFD1E7" }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground leading-tight">
              Nossa Loja
            </h2>
            <p className="text-sm text-foreground/70 leading-snug">
              Roupas, beleza, vitaminas e suplementos escolhidos a dedo.
            </p>
          </div>
        </div>

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

          {/* Seletores Categoria / Subcategoria */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-10 justify-between text-sm font-normal bg-white"
              onClick={() => {
                setPendingCategory(activeCategory ?? ALL_VALUE);
                setIsCategoryDrawerOpen(true);
              }}
            >
              <span className="truncate">
                {activeCategory
                  ? getCategory(activeCategory)?.label ?? "Categoria"
                  : "Categoria"}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </Button>

            {showSubcategories && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 justify-between text-sm font-normal bg-white"
                onClick={() => {
                  setPendingSubcategory(activeSubcategory ?? ALL_VALUE);
                  setIsSubcategoryDrawerOpen(true);
                }}
              >
                <span className="truncate">
                  {activeSubcategory
                    ? currentCategory!.subcategories.find(
                        (s) => s.key === activeSubcategory
                      )?.label ?? "Subcategoria"
                    : "Subcategoria"}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Button>
            )}
          </div>
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
