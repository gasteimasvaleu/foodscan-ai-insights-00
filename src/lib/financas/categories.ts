export const FINANCE_CATEGORIES_DESPESA = [
  "Mercado",
  "Transporte",
  "Lazer",
  "Saúde",
  "Casa",
  "Contas",
  "Educação",
  "Restaurante",
  "Outros",
] as const;

export const FINANCE_CATEGORIES_RECEITA = [
  "Salário",
  "Freelance",
  "Vendas",
  "Investimentos",
  "Presente",
  "Outros",
] as const;

export type FinanceKind = "receita" | "despesa";

export const categoriesForKind = (kind: FinanceKind): readonly string[] =>
  kind === "receita" ? FINANCE_CATEGORIES_RECEITA : FINANCE_CATEGORIES_DESPESA;
