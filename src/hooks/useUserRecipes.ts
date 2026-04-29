import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

export interface UserRecipe {
  id: string;
  name: string;
  description: string | null;
  ingredients: RecipeIngredient[];
  servings: number;
  calories_per_serving: number;
  proteins_per_serving: number;
  carbs_per_serving: number;
  fats_per_serving: number;
  image_url: string | null;
  use_count: number;
  last_used_at: string | null;
  created_at: string;
}

export function useUserRecipes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-recipes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_recipes")
        .select("*")
        .eq("user_id", user!.id)
        .order("last_used_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(r => ({
        ...r,
        ingredients: (r.ingredients as any) ?? [],
      })) as UserRecipe[];
    },
  });
}

export function useSaveUserRecipe() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recipe: Omit<UserRecipe, "id" | "use_count" | "last_used_at" | "created_at">) => {
      const { data, error } = await supabase.from("user_recipes").insert({
        user_id: user!.id,
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients as any,
        servings: recipe.servings,
        calories_per_serving: recipe.calories_per_serving,
        proteins_per_serving: recipe.proteins_per_serving,
        carbs_per_serving: recipe.carbs_per_serving,
        fats_per_serving: recipe.fats_per_serving,
        image_url: recipe.image_url,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Receita salva!");
      qc.invalidateQueries({ queryKey: ["user-recipes"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar receita"),
  });
}

export function useDeleteUserRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Receita removida");
      qc.invalidateQueries({ queryKey: ["user-recipes"] });
    },
  });
}

export function useTouchUserRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: cur } = await supabase
        .from("user_recipes")
        .select("use_count")
        .eq("id", id)
        .maybeSingle();
      const newCount = (cur?.use_count ?? 0) + 1;
      const { error } = await supabase
        .from("user_recipes")
        .update({ use_count: newCount, last_used_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-recipes"] }),
  });
}
