import type { ShoppingListItem } from "@/hooks/useShoppingLists";
import { SHOPPING_CATEGORIES, getCategoryByKey } from "@/data/shoppingCategories";

const formatQty = (q: number) => {
  if (Number.isInteger(q)) return String(q);
  return q.toFixed(2).replace(/\.?0+$/, "");
};

export const buildShoppingListMessage = (
  listName: string,
  items: ShoppingListItem[]
): string => {
  const lines: string[] = [];
  lines.push(`🛒 Lista: ${listName}`);
  lines.push("");

  const remaining = items.filter((i) => !i.is_purchased);

  if (remaining.length === 0) {
    lines.push("Todos os itens já foram comprados! ✅");
  } else {
    const grouped = new Map<string, ShoppingListItem[]>();
    for (const item of remaining) {
      const key = item.category || "outros";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(item);
    }

    const orderedKeys = SHOPPING_CATEGORIES.map((c) => c.key).filter((k) =>
      grouped.has(k)
    );

    for (const key of orderedKeys) {
      const cat = getCategoryByKey(key);
      lines.push(`— ${cat.emoji} ${cat.label} —`);
      for (const item of grouped.get(key)!) {
        lines.push(`• ${formatQty(item.quantity)}${item.unit} de ${item.name}`);
      }
      lines.push("");
    }
  }

  const total = items.length;
  const purchased = items.filter((i) => i.is_purchased).length;
  lines.push(`(${total} ${total === 1 ? "item" : "itens"} · ${purchased} já comprados)`);
  lines.push("Enviado pelo We Diet 💗");

  return lines.join("\n");
};

export const buildWhatsAppShareUrl = (message: string): string => {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
};
