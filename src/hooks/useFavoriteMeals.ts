import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface FavoriteMeal {
  id: string;
  food_name: string;
  portion: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  meal_type: string | null;
  image_url: string | null;
  use_count: number;
  last_used_at: string | null;
}

export function useFavoriteMeals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["favorite-meals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorite_meals")
        .select("*")
        .eq("user_id", user!.id)
        .order("last_used_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FavoriteMeal[];
    },
  });
}

export function useAddFavoriteMeal() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (meal: Omit<FavoriteMeal, "id" | "use_count" | "last_used_at">) => {
      const { data, error } = await supabase.from("favorite_meals").insert({
        user_id: user!.id,
        ...meal,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Adicionado aos favoritos!");
      qc.invalidateQueries({ queryKey: ["favorite-meals"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao favoritar"),
  });
}

export function useRemoveFavoriteMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("favorite_meals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Favorito removido");
      qc.invalidateQueries({ queryKey: ["favorite-meals"] });
    },
  });
}

export function useTouchFavoriteMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Buscar use_count atual
      const { data: cur } = await supabase
        .from("favorite_meals")
        .select("use_count")
        .eq("id", id)
        .maybeSingle();
      const newCount = (cur?.use_count ?? 0) + 1;
      const { error } = await supabase
        .from("favorite_meals")
        .update({ use_count: newCount, last_used_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorite-meals"] }),
  });
}
