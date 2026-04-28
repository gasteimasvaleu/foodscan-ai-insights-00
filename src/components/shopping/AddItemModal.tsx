import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SHOPPING_CATEGORIES,
  SHOPPING_UNITS,
} from "@/data/shoppingCategories";

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (input: {
    name: string;
    quantity: number;
    unit: string;
    category: string;
  }) => Promise<void> | void;
}

export const AddItemModal = ({ open, onOpenChange, onAdd }: AddItemModalProps) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("un");
  const [category, setCategory] = useState("outros");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setQuantity("1");
      setUnit("un");
      setCategory("outros");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const qty = parseFloat(quantity.replace(",", ".")) || 1;
    setSaving(true);
    await onAdd({
      name: name.trim(),
      quantity: qty,
      unit,
      category,
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md mx-auto p-0 gap-0 rounded-3xl bg-white/70 backdrop-blur-md border-2 border-[#FD46A1] shadow-xl max-h-[85vh] overflow-hidden [&>button]:hidden"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Fechar"
          className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-[#FD46A1] flex items-center justify-center text-white hover:bg-[#FD46A1]/90 transition-colors z-10"
        >
          <X size={16} />
        </button>

        <form
          onSubmit={handleSubmit}
          className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[85vh]"
        >
          <h2 className="text-lg font-bold text-foreground pr-8">Adicionar item</h2>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/70">Item</label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tomate"
              className="text-base bg-white"
              maxLength={80}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-foreground/70">Quantidade</label>
              <Input
                type="text"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="text-base bg-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-foreground/70">Unidade</label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="text-base bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHOPPING_UNITS.map((u) => (
                    <SelectItem key={u.key} value={u.key}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/70">Categoria</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="text-base bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHOPPING_CATEGORIES.map((c) => (
                  <SelectItem key={c.key} value={c.key}>
                    {c.emoji} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={!name.trim() || saving}
            className="w-full rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white h-11 text-sm font-semibold"
          >
            {saving ? "Adicionando..." : "Adicionar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
