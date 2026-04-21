export interface Ingredient {
  nome: string;
  quantidade: string;
}

export interface NutritionalInfo {
  calorias: string;
  proteinas: string;
  carboidratos: string;
  gorduras?: string;
}

export interface ComparativoNutricional {
  original: NutritionalInfo;
  caseiro: NutritionalInfo;
}

export interface VersaoCaseira {
  beneficios: string[];
  economiaEstimada: string;
}

export interface Recipe {
  nome: string;
  descricao: string;
  ingredientes: Ingredient[];
  modoPreparo: string[];
  tempoPreparo: string;
  dificuldade: 'Fácil' | 'Médio' | 'Difícil';
  porcoes: string;
  dicas: string[];
  variacoes: string[];
  informacoesNutricionais: NutritionalInfo;
  origemFastFood?: string | null;
  produtoOriginal?: string | null;
  versaoCaseira?: VersaoCaseira | null;
  comparativoNutricional?: ComparativoNutricional | null;
}

export interface FastFoodOption {
  id: string;
  nome: string;
  rede: string | null;
  confianca: number;
  descricao: string;
}

export interface MultipleOptionsResponse {
  type: 'multiple_options';
  message: string;
  options: FastFoodOption[];
}

export interface RecipeError {
  error: string;
  message: string;
}

export type RecipeResponse = Recipe | RecipeError | MultipleOptionsResponse;

export const isRecipeError = (r: any): r is RecipeError =>
  r && typeof r === 'object' && 'error' in r && typeof r.error === 'string';

export const isMultipleOptions = (r: any): r is MultipleOptionsResponse =>
  r && typeof r === 'object' && r.type === 'multiple_options' && Array.isArray(r.options);

export const isRecipe = (r: any): r is Recipe =>
  r && typeof r === 'object' && typeof r.nome === 'string' && Array.isArray(r.ingredientes);
