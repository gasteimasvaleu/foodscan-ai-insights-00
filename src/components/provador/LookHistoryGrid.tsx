import { useState } from "react";
import { Download, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ProvadorGeneration } from "@/hooks/useProvadorHistory";

interface Props {
  history: ProvadorGeneration[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export default function LookHistoryGrid({ history, loading, onDelete }: Props) {
  const [selected, setSelected] = useState<ProvadorGeneration | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDownload = async (url: string) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `wediet-provador-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error("Não foi possível baixar a imagem.");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await onDelete(selected.id);
      toast.success("Look excluído.");
      setSelected(null);
    } catch {
      toast.error("Não foi possível excluir.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading && history.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-[#FFD1E7]/40 border border-primary/10 rounded-2xl p-6 text-center text-sm text-muted-foreground">
        Seus looks gerados aparecerão aqui.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className="aspect-square rounded-xl overflow-hidden bg-white border border-primary/10 shadow-sm hover:shadow-md transition active:scale-95"
          >
            <img
              src={item.result_url}
              alt="Look gerado"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="bg-white/70 backdrop-blur-md border-primary/20 max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-normal">Seu look</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden bg-white border border-primary/10">
                <img
                  src={selected.result_url}
                  alt="Look gerado"
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleDownload(selected.result_url)}
                  variant="outline"
                  className="h-11 rounded-2xl border-primary/30 text-primary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  variant="outline"
                  className="h-11 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
