/**
 * Infere o tipo de refeição baseado na hora do dia.
 * - 5h–9h → café da manhã
 * - 9h–11h → lanche (manhã)
 * - 11h–14h → almoço
 * - 14h–17h → lanche (tarde)
 * - 17h–22h → jantar
 * - 22h–5h → outro
 */
export function inferMealType(date: Date = new Date()): string {
  const h = date.getHours();
  if (h >= 5 && h < 9) return "cafe_da_manha";
  if (h >= 9 && h < 11) return "lanche";
  if (h >= 11 && h < 14) return "almoco";
  if (h >= 14 && h < 17) return "lanche";
  if (h >= 17 && h < 22) return "jantar";
  return "outro";
}

export const MEAL_TYPE_LABELS: Record<string, string> = {
  cafe_da_manha: "Café da manhã",
  lanche: "Lanche",
  almoco: "Almoço",
  jantar: "Jantar",
  outro: "Outro",
};
