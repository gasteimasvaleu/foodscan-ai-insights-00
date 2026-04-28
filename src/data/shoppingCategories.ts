export interface ShoppingCategory {
  key: string;
  label: string;
  emoji: string;
  order: number;
}

export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  { key: "hortifruti", label: "Hortifrúti", emoji: "🥦", order: 1 },
  { key: "carnes", label: "Carnes e Aves", emoji: "🥩", order: 2 },
  { key: "laticinios", label: "Laticínios e Ovos", emoji: "🥛", order: 3 },
  { key: "padaria", label: "Padaria", emoji: "🥖", order: 4 },
  { key: "mercearia", label: "Mercearia", emoji: "🍝", order: 5 },
  { key: "congelados", label: "Congelados", emoji: "🧊", order: 6 },
  { key: "bebidas", label: "Bebidas", emoji: "🥤", order: 7 },
  { key: "limpeza", label: "Limpeza", emoji: "🧽", order: 8 },
  { key: "higiene", label: "Higiene", emoji: "🧴", order: 9 },
  { key: "outros", label: "Outros", emoji: "🛒", order: 99 },
];

export const SHOPPING_UNITS = [
  { key: "un", label: "un" },
  { key: "kg", label: "kg" },
  { key: "g", label: "g" },
  { key: "L", label: "L" },
  { key: "ml", label: "ml" },
  { key: "pct", label: "pct" },
  { key: "dz", label: "dz" },
  { key: "cx", label: "cx" },
];

export const getCategoryByKey = (key: string): ShoppingCategory =>
  SHOPPING_CATEGORIES.find((c) => c.key === key) ??
  SHOPPING_CATEGORIES[SHOPPING_CATEGORIES.length - 1];
