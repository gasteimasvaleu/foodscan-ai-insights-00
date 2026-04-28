import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ShoppingListItem } from "@/hooks/useShoppingLists";

interface ShoppingItemRowProps {
  item: ShoppingListItem;
  onToggle: (value: boolean) => void;
  onDelete: () => void;
}

const formatQty = (q: number) => {
  if (Number.isInteger(q)) return String(q);
  return q.toFixed(2).replace(/\.?0+$/, "");
};

export const ShoppingItemRow = ({ item, onToggle, onDelete }: ShoppingItemRowProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/70 transition-colors",
        item.is_purchased && "bg-white/40"
      )}
    >
      <Checkbox
        checked={item.is_purchased}
        onCheckedChange={(v) => onToggle(Boolean(v))}
        className="w-6 h-6 rounded-md border-[#FD46A1] data-[state=checked]:bg-[#FD46A1] data-[state=checked]:border-[#FD46A1]"
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-base text-foreground truncate",
            item.is_purchased && "line-through text-foreground/50"
          )}
        >
          {item.name}
        </p>
        <p className="text-xs text-foreground/60">
          {formatQty(item.quantity)} {item.unit}
        </p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Remover item"
        className="w-8 h-8 rounded-full flex items-center justify-center text-[#FD46A1] hover:bg-[#FD46A1]/10 transition-colors flex-shrink-0"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};
