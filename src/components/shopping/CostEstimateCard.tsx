import { useEffect, useState } from "react";
import { Loader2, Wallet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ShoppingListItem } from "@/hooks/useShoppingLists";

interface CostEstimateCardProps {
  listId: string;
  items: ShoppingListItem[];
}

interface CachedEstimate {
  total: number;
  notes?: string;
  itemsHash: string;
  calculatedAt: string;
}

const hashItems = (items: ShoppingListItem[]): string => {
  return items
    .map((i) => `${i.name}|${i.quantity}|${i.unit}`)
    .sort()
    .join("::");
};

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const CostEstimateCard = ({ listId, items }: CostEstimateCardProps) => {
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<CachedEstimate | null>(null);
  const storageKey = `shopping-cost-${listId}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setEstimate(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [storageKey]);

  const currentHash = hashItems(items);
  const isStale = !!estimate && estimate.itemsHash !== currentHash;

  const calculate = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const payload = items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
      }));
      const { data, error } = await supabase.functions.invoke("shopping-estimate-cost", {
        body: { items: payload },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const cached: CachedEstimate = {
        total: Number(data.total_brl) || 0,
        notes: data.notes,
        itemsHash: currentHash,
        calculatedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(cached));
      setEstimate(cached);
    } catch (err: any) {
      console.error("[CostEstimateCard] error:", err);
      toast.error(err?.message || "Erro ao estimar custo");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl px-4 py-3 flex items-center gap-3">
      <div className="bg-[#FD46A1]/10 p-2 rounded-xl">
        <Wallet className="w-5 h-5 text-[#FD46A1]" />
      </div>
      <div className="flex-1 min-w-0">
        {estimate ? (
          <>
            <p className="text-sm font-semibold text-foreground">
              ~ {formatBRL(estimate.total)}
            </p>
            <p className="text-[11px] text-foreground/60 truncate">
              {isStale ? "Lista mudou — recalcular" : "Estimativa de mercado BR"}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground">Estimar custo</p>
            <p className="text-[11px] text-foreground/60">
              Preço médio de mercado (BR)
            </p>
          </>
        )}
      </div>
      <Button
        onClick={calculate}
        disabled={loading}
        size="sm"
        variant="outline"
        className="rounded-full border-[#FD46A1] text-[#FD46A1] bg-white text-xs h-8 px-3 gap-1"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : estimate ? (
          <>
            <RefreshCw size={14} />
            Recalcular
          </>
        ) : (
          "Estimar"
        )}
      </Button>
    </div>
  );
};
