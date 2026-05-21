import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/financas/formatters";
import type { FinanceTx } from "@/hooks/useFinanceTransactions";

interface Props {
  items: FinanceTx[];
  showDate?: boolean;
  onItemClick?: (tx: FinanceTx) => void;
  onEdit?: (tx: FinanceTx) => void;
  onDelete?: (tx: FinanceTx) => void;
  emptyLabel?: string;
}

function formatShortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return dt
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "");
}

export function FinanceTimeline({
  items,
  showDate = true,
  onItemClick,
  onEdit,
  onDelete,
  emptyLabel = "Nenhum lançamento.",
}: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-[#FFD1E7]/30 border border-[#FFD1E7] p-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8">
      {/* Linha vertical */}
      <div
        aria-hidden
        className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-[#FD46A1]/40 via-[#FD46A1]/20 to-transparent"
      />

      <ul className="space-y-3">
        {items.map((tx) => {
          const isReceita = tx.kind === "receita";
          const nodeColor = isReceita ? "bg-emerald-500" : "bg-[#FD46A1]";
          const glow = isReceita
            ? "shadow-[0_0_12px_rgba(16,185,129,0.6)]"
            : "shadow-[0_0_12px_rgba(253,70,161,0.6)]";
          const valueColor = isReceita ? "text-emerald-600" : "text-[#FD46A1]";

          const clickable = !!onItemClick;

          return (
            <li key={tx.id} className="relative">
              {/* Nó */}
              <span
                aria-hidden
                className={cn(
                  "absolute -left-[1.4rem] top-4 w-3 h-3 rounded-full ring-2 ring-white",
                  nodeColor,
                  glow
                )}
              />

              <div
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={clickable ? () => onItemClick!(tx) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onItemClick!(tx);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm p-3 flex items-center gap-3 transition",
                  clickable && "cursor-pointer hover:bg-white/90 hover:shadow-md active:scale-[0.99]"
                )}
              >
                {tx.receipt_url && (
                  <img
                    src={tx.receipt_url}
                    alt="Comprovante"
                    loading="lazy"
                    className="w-10 h-10 rounded-lg object-cover border border-[#FFD1E7] shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  {showDate && (
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      {formatShortDate(tx.occurred_on)}
                    </div>
                  )}
                  <div className="text-base text-foreground truncate">{tx.category}</div>
                  {tx.description && (
                    <div className="text-xs text-foreground/60 truncate">{tx.description}</div>
                  )}
                </div>

                <div className={cn("text-sm font-semibold whitespace-nowrap", valueColor)}>
                  {isReceita ? "+ " : "− "}
                  {formatBRL(tx.amount_cents)}
                </div>

                {(onEdit || onDelete) && (
                  <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(tx)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDelete(tx)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
