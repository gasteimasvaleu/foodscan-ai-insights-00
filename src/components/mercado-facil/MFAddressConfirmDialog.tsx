import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cidade: string;
  estado: string;
  endereco: string;
  telefone?: string;
  title?: string;
  contextLabel?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function MFAddressConfirmDialog({
  open,
  onOpenChange,
  cidade,
  estado,
  endereco,
  telefone,
  title = "Confirmar endereço de entrega",
  contextLabel,
  confirmLabel = "Confirmar e enviar",
  onConfirm,
}: Props) {
  const missing = !cidade.trim() || !estado.trim() || !endereco.trim();
  const cidadeUf = [cidade.trim(), estado.trim()].filter(Boolean).join(" - ");

  const handleConfirm = () => {
    if (missing) return;
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] w-[calc(100vw-2rem)] rounded-3xl border-2 border-[#FD46A1]/60 bg-white/70 backdrop-blur-md p-5 gap-3">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base text-foreground">{title}</DialogTitle>
          {contextLabel && (
            <p className="text-xs text-foreground/60">{contextLabel}</p>
          )}
        </DialogHeader>

        <div className="rounded-2xl bg-[#FFD1E7]/40 border border-[#FD46A1]/30 p-3 space-y-2">
          <Row label="Cidade" value={cidadeUf || "—"} />
          <Row label="Endereço" value={endereco.trim() || "—"} />
          {telefone && <Row label="Telefone" value={telefone} />}
        </div>

        {missing && (
          <p className="text-[11px] text-red-600">
            Preencha cidade, UF e endereço antes de continuar.
          </p>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <Button
            onClick={handleConfirm}
            disabled={missing}
            className="w-full bg-[#25D366] hover:bg-[#25D366]/90 rounded-2xl h-11 text-sm text-white"
          >
            {confirmLabel}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-2xl h-11 text-sm border-[#FD46A1]/50 text-[#FD46A1] hover:bg-[#FFD1E7]/40 hover:text-[#FD46A1]"
          >
            Editar endereço
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide text-foreground/50">{label}</span>
      <span className="text-sm text-foreground break-words">{value}</span>
    </div>
  );
}
