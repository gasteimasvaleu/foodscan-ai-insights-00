export interface FoodElement {
  name: string;
  description?: string;
  nutrition: {
    calories: number;
    carbohydrates: number;
    proteins: number;
    fats: number;
    fiber: number;
    sodium: number;
  };
}

export interface NutritionData {
  foodName: string;
  description: string;
  quantity: string;
  elements?: FoodElement[]; // Array de elementos quando há múltiplos
  nutrition: {
    calories: number;
    carbohydrates: number;
    proteins: number;
    fats: number;
    fiber: number;
    sodium: number;
  };
}

export interface ElementPortion {
  elementName: string;
  portion: string;
  grams: number;
}