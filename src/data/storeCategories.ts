export type StoreCategoryKey = "roupas" | "beleza" | "vitaminas";

export interface StoreSubcategory {
  key: string;
  label: string;
}

export interface StoreCategory {
  key: StoreCategoryKey;
  label: string;
  shortLabel: string;
  subcategories: StoreSubcategory[];
}

export const STORE_CATEGORIES: StoreCategory[] = [
  {
    key: "roupas",
    label: "Roupas e Acessórios",
    shortLabel: "Roupas e Acessórios",
    subcategories: [
      { key: "feminino", label: "Feminino" },
      { key: "masculino", label: "Masculino" },
    ],
  },
  {
    key: "beleza",
    label: "Beleza",
    shortLabel: "Beleza",
    subcategories: [
      { key: "beleza-premium", label: "Beleza Premium" },
      { key: "dermocosmeticos", label: "Dermocosméticos" },
      { key: "maquiagem", label: "Maquiagem" },
      { key: "perfumes", label: "Perfumes" },
      { key: "cabelo", label: "Cabelo" },
      { key: "rosto-e-corpo", label: "Rosto e Corpo" },
    ],
  },
  {
    key: "vitaminas",
    label: "Vitaminas e Suplementos",
    shortLabel: "Vitaminas e Suplementos",
    subcategories: [],
  },
];

export const getCategory = (key: string) =>
  STORE_CATEGORIES.find((c) => c.key === key);

export const getSubcategoryLabel = (
  categoryKey: string,
  subcategoryKey: string | null | undefined
) => {
  if (!subcategoryKey) return null;
  const cat = getCategory(categoryKey);
  return cat?.subcategories.find((s) => s.key === subcategoryKey)?.label ?? null;
};
