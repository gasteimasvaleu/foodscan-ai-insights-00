import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface RecentMeal {
  id: string;
  food_name: string;
  portion: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  meal_type: string | null;
  image_url: string | null;
  meal_time: string;
}

/**
 * Retorna refeições recentes únicas (deduplicadas por food_name+portion),
 * ordenadas pela última vez que foram registradas.
 */
export function useRecentMeals(limit = 30) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recent-meals", user?.id, limit],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_records")
        .select("id, food_name, portion, calories, proteins, carbohydrates, fats, meal_type, image_url, meal_time")
        .eq("user_id", user!.id)
        .order("meal_time", { ascending: false })
        .limit(150);

      if (error) throw error;

      // Deduplicar por nome+porção, mantendo o mais recente
      const seen = new Set<string>();
      const unique: RecentMeal[] = [];
      for (const m of data ?? []) {
        const key = `${m.food_name.toLowerCase()}|${m.portion.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(m as RecentMeal);
        if (unique.length >= limit) break;
      }
      return unique;
    },
  });
}

/**
 * Retorna refeições registradas ontem (entre 00:00 e 23:59 de ontem).
 */
export function useYesterdayMeals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["yesterday-meals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const { data, error } = await supabase
        .from("meal_records")
        .select("id, food_name, portion, calories, proteins, carbohydrates, fats, meal_type, image_url, meal_time")
        .eq("user_id", user!.id)
        .gte("meal_time", yesterday.toISOString())
        .lt("meal_time", today.toISOString())
        .order("meal_time", { ascending: true });

      if (error) throw error;
      return (data ?? []) as RecentMeal[];
    },
  });
}
