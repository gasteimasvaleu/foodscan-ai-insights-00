import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 60;

export interface CatalogFood {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  proteins_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  common_portion_g: number;
  common_portion_label: string;
  source?: "official" | "community";
}

export function useFoodCatalogSearch(query: string, category?: string) {
  return useQuery({
    queryKey: ["food-catalog", query, category],
    queryFn: async () => {
      let q = supabase
        .from("food_catalog")
        .select("id,name,category,calories_per_100g,proteins_per_100g,carbs_per_100g,fats_per_100g,common_portion_g,common_portion_label,source")
        .eq("is_active", true);

      if (query.trim()) {
        q = q.ilike("name", `%${query.trim()}%`);
      }
      if (category) {
        q = q.eq("category", category);
      }

      q = q.order("name").limit(60);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CatalogFood[];
    },
  });
}

export const FOOD_CATEGORIES = [
  { value: "", label: "Todas" },
  { value: "cereais", label: "Cereais e grãos" },
  { value: "paes", label: "Pães" },
  { value: "biscoitos", label: "Biscoitos" },
  { value: "carnes", label: "Carnes" },
  { value: "peixes", label: "Peixes" },
  { value: "ovos", label: "Ovos" },
  { value: "laticinios", label: "Laticínios" },
  { value: "frutas", label: "Frutas" },
  { value: "legumes", label: "Legumes" },
  { value: "vegetais", label: "Vegetais" },
  { value: "leguminosas", label: "Leguminosas" },
  { value: "oleaginosas", label: "Oleaginosas" },
  { value: "oleos", label: "Óleos" },
  { value: "sementes", label: "Sementes" },
  { value: "salgados", label: "Salgados" },
  { value: "lanches", label: "Lanches" },
  { value: "preparacoes", label: "Pratos prontos" },
  { value: "doces", label: "Doces" },
  { value: "bebidas", label: "Bebidas" },
  { value: "suplementos", label: "Suplementos" },
];
