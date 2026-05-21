import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { categoriesForKind, type FinanceKind } from "@/lib/financas/categories";
import { parseBRLToCents } from "@/lib/financas/formatters";
import type { FinanceTx } from "@/hooks/useFinanceTransactions";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dateKey: string;
  initial?: FinanceTx | null;
  onSave: (input: {
    kind: FinanceKind;
    amount_cents: number;
    category: string;
    description: string | null;
    occurred_on: string;
  }) => Promise<void>;
}

export function TransactionModal({ open, onOpenChange, dateKey, initial, onSave }: Props) {
  const [kind, setKind] = useState<FinanceKind>("despesa");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Outros");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (initial) {
        setKind(initial.kind);
        setAmount((initial.amount_cents / 100).toFixed(2).replace(".", ","));
        setCategory(initial.category);
        setDescription(initial.description ?? "");
      } else {
        setKind("despesa");
        setAmount("");
        setCategory("Outros");
        setDescription("");
      }
    }
  }, [open, initial]);

  useEffect(() => {
    const list = categoriesForKind(kind);
    if (!list.includes(category)) setCategory(list[list.length - 1]);
  }, [kind, category]);

  const handleSave = async () => {
    const cents = parseBRLToCents(amount);
    if (!cents) {
      toast.error("Informe um valor válido");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        kind,
        amount_cents: cents,
        category,
        description: description.trim() || null,
        occurred_on: dateKey,
      });
      onOpenChange(false);
    } catch (e) {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/80 backdrop-blur-xl border-[#FFD1E7] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {initial ? "Editar lançamento" : "Novo lançamento"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#FFD1E7]/30 rounded-2xl">
            <button
              onClick={() => setKind("receita")}
              className={cn(
                "py-2.5 rounded-xl text-sm font-semibold transition-all",
                kind === "receita"
                  ? "bg-emerald-500 text-white shadow"
                  : "text-foreground/70"
              )}
            >
              Receita
            </button>
            <button
              onClick={() => setKind("despesa")}
              className={cn(
                "py-2.5 rounded-xl text-sm font-semibold transition-all",
                kind === "despesa"
                  ? "bg-[#FD46A1] text-white shadow"
                  : "text-foreground/70"
              )}
            >
              Despesa
            </button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-base h-12 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="text-base h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {categoriesForKind(kind).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Descrição (opcional)</Label>
            <Textarea
              placeholder="Ex: Mercado da semana"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-base rounded-xl min-h-[72px]"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 rounded-xl bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white text-base font-semibold"
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
