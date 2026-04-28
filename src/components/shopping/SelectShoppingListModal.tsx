import { useState } from "react";
import { X, Plus, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { CreateListModal } from "./CreateListModal";

interface SelectShoppingListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (listId: string, listName: string) => Promise<void> | void;
  title?: string;
}

export const SelectShoppingListModal = ({
  open,
  onOpenChange,
  onSelect,
  title = "Adicionar à lista",
}: SelectShoppingListModalProps) => {
  const { lists, loading, createList } = useShoppingLists();
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const handlePick = async (id: string, name: string) => {
    setSubmitting(id);
    try {
      await onSelect(id, name);
      onOpenChange(false);
    } finally {
      setSubmitting(null);
    }
  };

  const handleCreate = async (name: string) => {
    const created = await createList(name);
    if (created) {
      await handlePick(created.id, created.name);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto p-0 gap-0 rounded-3xl bg-white/70 backdrop-blur-md border-2 border-[#FD46A1] shadow-xl max-h-[80vh] overflow-hidden [&>button]:hidden">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar"
            className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-[#FD46A1] flex items-center justify-center text-white hover:bg-[#FD46A1]/90 transition-colors z-10"
          >
            <X size={16} />
          </button>

          <div className="p-5 flex flex-col gap-3 overflow-y-auto max-h-[80vh]">
            <h2 className="text-lg font-bold text-foreground pr-8">{title}</h2>

            <Button
              onClick={() => setCreateOpen(true)}
              variant="outline"
              className="w-full rounded-full border-[#FD46A1] text-[#FD46A1] bg-white h-10 text-sm font-semibold gap-2 justify-start"
            >
              <Plus size={16} />
              Criar nova lista
            </Button>

            {loading ? (
              <p className="text-sm text-foreground/60 text-center py-4">Carregando...</p>
            ) : lists.length === 0 ? (
              <p className="text-sm text-foreground/60 text-center py-4">
                Você ainda não tem listas. Crie uma acima.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {lists.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handlePick(l.id, l.name)}
                    disabled={submitting !== null}
                    className="w-full flex items-center gap-3 bg-[#FFD1E7] hover:bg-[#FFD1E7]/80 disabled:opacity-50 rounded-2xl px-4 py-3 text-left transition-colors"
                  >
                    <div className="bg-white/70 p-2 rounded-xl">
                      <ShoppingBag size={16} className="text-[#FD46A1]" />
                    </div>
                    <span className="text-sm font-semibold text-foreground truncate">
                      {l.name}
                    </span>
                    {submitting === l.id && (
                      <span className="ml-auto text-xs text-foreground/60">Adicionando...</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreateListModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />
    </>
  );
};
