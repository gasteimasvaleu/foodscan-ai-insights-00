import { useEffect, useRef, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ImagePlus, X, Loader2, Sparkles } from "lucide-react";
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
    receipt_url: string | null;
  }) => Promise<void>;
}

const MAX_BYTES = 5 * 1024 * 1024;

function extractStoragePath(url: string) {
  const marker = "/finance-receipts/";
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export function TransactionModal({ open, onOpenChange, dateKey, initial, onSave }: Props) {
  const { user } = useAuth();
  const [kind, setKind] = useState<FinanceKind>("despesa");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Outros");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Receipt state
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null); // já salvo
  const [receiptFile, setReceiptFile] = useState<File | null>(null); // novo selecionado
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // objectURL local
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (initial) {
        setKind(initial.kind);
        setAmount((initial.amount_cents / 100).toFixed(2).replace(".", ","));
        setCategory(initial.category);
        setDescription(initial.description ?? "");
        setReceiptUrl(initial.receipt_url ?? null);
      } else {
        setKind("despesa");
        setAmount("");
        setCategory("Outros");
        setDescription("");
        setReceiptUrl(null);
      }
      setReceiptFile(null);
      setPreviewUrl(null);
    }
  }, [open, initial]);

  useEffect(() => {
    const list = categoriesForKind(kind);
    if (!list.includes(category)) setCategory(list[list.length - 1]);
  }, [kind, category]);

  // Cleanup objectURL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePickFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo precisa ser uma imagem");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Imagem muito grande (máx 5 MB)");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setReceiptFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveReceipt = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setReceiptFile(null);
    setPreviewUrl(null);
    setReceiptUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    const cents = parseBRLToCents(amount);
    if (!cents) {
      toast.error("Informe um valor válido");
      return;
    }
    setSaving(true);
    try {
      let finalReceiptUrl: string | null = receiptUrl;

      // Upload novo arquivo
      if (receiptFile && user) {
        const ext = (receiptFile.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("finance-receipts")
          .upload(path, receiptFile, { upsert: false, contentType: receiptFile.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("finance-receipts").getPublicUrl(path);
        finalReceiptUrl = pub.publicUrl;

        // Se substituiu, remove o antigo
        if (initial?.receipt_url && initial.receipt_url !== finalReceiptUrl) {
          const oldPath = extractStoragePath(initial.receipt_url);
          if (oldPath) {
            await supabase.storage.from("finance-receipts").remove([oldPath]);
          }
        }
      } else if (initial?.receipt_url && !receiptUrl) {
        // Removeu manualmente
        const oldPath = extractStoragePath(initial.receipt_url);
        if (oldPath) {
          await supabase.storage.from("finance-receipts").remove([oldPath]);
        }
        finalReceiptUrl = null;
      }

      await onSave({
        kind,
        amount_cents: cents,
        category,
        description: description.trim() || null,
        occurred_on: dateKey,
        receipt_url: kind === "despesa" ? finalReceiptUrl : null,
      });
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const displayedReceipt = previewUrl || receiptUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm bg-white/70 backdrop-blur-md border-2 border-[#FD46A1]/30 rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
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

          {/* Comprovante — só despesas */}
          {kind === "despesa" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Comprovante (opcional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
              />
              {displayedReceipt ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#FFD1E7] bg-white">
                  <img
                    src={displayedReceipt}
                    alt="Comprovante"
                    className="w-full aspect-video object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-[#FD46A1] text-white flex items-center justify-center shadow-md hover:bg-[#FD46A1]/90"
                    aria-label="Remover comprovante"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-2xl border-2 border-dashed border-[#FD46A1]/40 bg-white/40 hover:bg-white/70 transition flex flex-col items-center justify-center gap-1.5 py-6 text-foreground/70"
                >
                  <ImagePlus className="h-6 w-6 text-[#FD46A1]" />
                  <span className="text-sm font-medium">Toque para adicionar foto</span>
                  <span className="text-[11px] text-muted-foreground">JPG/PNG até 5 MB</span>
                </button>
              )}
            </div>
          )}

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
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
