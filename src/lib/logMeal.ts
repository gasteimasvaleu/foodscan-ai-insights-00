import { supabase } from "@/integrations/supabase/client";
import { inferMealType } from "@/lib/mealType";

export interface LogMealInput {
  user_id: string;
  food_name: string;
  portion: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  meal_type?: string | null;
  image_url?: string | null;
  meal_time?: Date;
}

/**
 * Insere uma refeição em meal_records com meal_type inferido pela hora atual
 * caso não seja fornecido.
 */
export async function logMeal(input: LogMealInput) {
  const meal_time = input.meal_time ?? new Date();
  const meal_type = input.meal_type ?? inferMealType(meal_time);

  const { data, error } = await supabase.from("meal_records").insert({
    user_id: input.user_id,
    food_name: input.food_name,
    portion: input.portion,
    calories: Math.round(input.calories),
    proteins: input.proteins,
    carbohydrates: input.carbohydrates,
    fats: input.fats,
    meal_type,
    image_url: input.image_url ?? null,
    meal_time: meal_time.toISOString(),
  }).select().single();

  if (error) throw error;
  return data;
}
