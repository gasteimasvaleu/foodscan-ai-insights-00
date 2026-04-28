import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => Promise<void> | void;
  initialName?: string;
  title?: string;
  ctaLabel?: string;
}

export const CreateListModal = ({
  open,
  onOpenChange,
  onCreate,
  initialName = "",
  title = "Nova lista",
  ctaLabel = "Criar lista",
}: CreateListModalProps) => {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onCreate(name.trim());
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md mx-auto p-0 gap-0 rounded-3xl bg-white/70 backdrop-blur-md border-2 border-[#FD46A1] shadow-xl [&>button]:hidden"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Fechar"
          className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-[#FD46A1] flex items-center justify-center text-white hover:bg-[#FD46A1]/90 transition-colors z-10"
        >
          <X size={16} />
        </button>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-foreground pr-8">{title}</h2>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/70">Nome da lista</label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Compras da semana"
              className="text-base bg-white"
              maxLength={60}
            />
          </div>

          <Button
            type="submit"
            disabled={!name.trim() || saving}
            className="w-full rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white h-11 text-sm font-semibold"
          >
            {saving ? "Salvando..." : ctaLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
