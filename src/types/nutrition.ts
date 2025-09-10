export interface PreparationAnalysis {
  primary_method: string;
  secondary_methods: string[];
  cooking_tools: string[];
  cooking_indicators: string;
  estimated_cooking_time: string;
  cooking_level: string;
}

export interface QualityIndicators {
  freshness_signs: string;
  cooking_quality: string;
  visual_appeal: string;
}

export interface NutritionalPreview {
  macronutrient_profile: string;
  caloric_density: string;
  health_indicators: string;
}

export interface FoodElement {
  name: string;
  description?: string;
  detailed_description?: string;
  category?: string;
  preparation_analysis?: PreparationAnalysis;
  texture_analysis?: string;
  color_analysis?: string;
  size_reference?: string;
  confidence_level?: string;
  quality_indicators?: QualityIndicators;
  nutritional_preview?: NutritionalPreview;
  nutrition: {
    calories: number;
    carbohydrates: number;
    proteins: number;
    fats: number;
    fiber: number;
    sodium: number;
  };
}

export interface CuisineAnalysis {
  cooking_style?: string;
  complexity_level?: string;
  presentation_quality?: string;
  temperature_indicators?: string;
}

export interface ComprehensiveObservations {
  hidden_ingredients?: string;
  cooking_sequence?: string;
  flavor_harmony?: string;
  visual_composition?: string;
}

export interface DietaryCompatibility {
  dietary_restrictions?: string;
  allergen_analysis?: string;
  nutritional_balance?: string;
}

export interface ServingContext {
  meal_type?: string;
  serving_style?: string;
  cultural_context?: string;
}

export interface NutritionData {
  foodName: string;
  name?: string; // Para compatibilidade com Open Food Facts
  description: string;
  quantity: string;
  elements?: FoodElement[]; // Array de elementos quando há múltiplos
  analysis_summary?: string;
  overall_confidence?: string;
  total_estimated_weight?: string;
  cuisine_analysis?: CuisineAnalysis;
  foods_identified?: FoodElement[]; // Dados robustos da análise de imagem
  comprehensive_observations?: ComprehensiveObservations;
  dietary_compatibility?: DietaryCompatibility;
  serving_context?: ServingContext;
  source?: 'ai' | 'open-food-facts'; // Fonte dos dados
  nutriscore?: string; // Nutri-Score do Open Food Facts
  brands?: string; // Marcas do Open Food Facts
  barcode?: string; // Código de barras
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