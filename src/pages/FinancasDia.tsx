import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { TransactionModal } from "@/components/financas/TransactionModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useFinanceTransactions, type FinanceTx } from "@/hooks/useFinanceTransactions";
import { formatBRL, fromDateKey } from "@/lib/financas/formatters";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DOW = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default function FinancasDia() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const dateKey = date ?? "";
  const dateObj = useMemo(() => (dateKey ? fromDateKey(dateKey) : new Date()), [dateKey]);
  const { data, loading, create, update, remove } = useFinanceTransactions({ date: dateKey });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceTx | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FinanceTx | null>(null);

  const totals = useMemo(() => {
    let r = 0,
      d = 0;
    data.forEach((t) => {
      if (t.kind === "receita") r += t.amount_cents;
      else d += t.amount_cents;
    });
    return { receita: r, despesa: d, saldo: r - d };
  }, [data]);

  const receitas = data.filter((t) => t.kind === "receita");
  const despesas = data.filter((t) => t.kind === "despesa");

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  const handleSave = async (input: Parameters<typeof create>[0]) => {
    if (editing) {
      await update(editing.id, input);
      toast.success("Lançamento atualizado");
    } else {
      await create(input);
      toast.success("Lançamento adicionado");
    }
    setEditing(null);
  };

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (t: FinanceTx) => {
    setEditing(t);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)] space-y-4">
        {/* Header */}
        <div className="mb-2">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-primary leading-tight capitalize">
                {DOW[dateObj.getDay()]}
              </h1>
              <p className="text-xs text-foreground/70">
                {dateObj.getDate()} de {MONTHS[dateObj.getMonth()]} de {dateObj.getFullYear()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/financas")}
              className="h-9 w-9 rounded-full hover:bg-white/30 ml-auto shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>

        {/* Totais do dia */}
        <div className="grid grid-cols-3 gap-2">
          <Mini label="Receita" value={formatBRL(totals.receita)} tone="green" />
          <Mini label="Despesa" value={formatBRL(totals.despesa)} tone="pink" />
          <Mini
            label="Saldo"
            value={formatBRL(totals.saldo)}
            tone={totals.saldo >= 0 ? "purple" : "red"}
          />
        </div>

        {/* Add button */}
        <Button
          onClick={openNew}
          className="w-full h-12 rounded-2xl bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white text-base font-semibold shadow-md shadow-pink-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar lançamento
        </Button>

        {/* Lista */}
        {loading ? (
          <p className="text-center text-xs text-muted-foreground py-4">Carregando…</p>
        ) : data.length === 0 ? (
          <div className="rounded-3xl bg-[#FFD1E7]/30 border border-[#FFD1E7] p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum lançamento neste dia.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {receitas.length > 0 && (
              <Section title="Receitas">
                {receitas.map((t) => (
                  <TxRow key={t.id} tx={t} onEdit={() => openEdit(t)} onDelete={() => setConfirmDelete(t)} />
                ))}
              </Section>
            )}
            {despesas.length > 0 && (
              <Section title="Despesas">
                {despesas.map((t) => (
                  <TxRow key={t.id} tx={t} onEdit={() => openEdit(t)} onDelete={() => setConfirmDelete(t)} />
                ))}
              </Section>
            )}
          </div>
        )}
      </div>

      <TransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        dateKey={dateKey}
        initial={editing}
        onSave={handleSave}
      />

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
      >
        <AlertDialogContent className="bg-white/80 backdrop-blur-xl border-[#FFD1E7] rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDelete) {
                  try {
                    await remove(confirmDelete.id);
                    toast.success("Removido");
                  } catch {
                    toast.error("Erro ao remover");
                  }
                  setConfirmDelete(null);
                }
              }}
              className="bg-[#FD46A1] hover:bg-[#FD46A1]/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone: "green" | "pink" | "purple" | "red" }) {
  const c = {
    green: "text-emerald-600",
    pink: "text-[#FD46A1]",
    purple: "text-violet-600",
    red: "text-red-600",
  }[tone];
  return (
    <div className="rounded-2xl bg-white border border-[#FFD1E7] shadow-sm p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className={cn("text-sm font-semibold", c)}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-base text-foreground mb-2 px-1">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function TxRow({ tx, onEdit, onDelete }: { tx: FinanceTx; onEdit: () => void; onDelete: () => void }) {
  const isReceita = tx.kind === "receita";
  return (
    <div className="rounded-2xl bg-white border border-[#FFD1E7] p-3 flex items-center gap-3">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          isReceita ? "bg-emerald-100" : "bg-[#FFD1E7]"
        )}
      >
        <span className={cn("text-lg font-bold", isReceita ? "text-emerald-600" : "text-[#FD46A1]")}>
          {isReceita ? "+" : "−"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground truncate">{tx.category}</div>
        {tx.description && (
          <div className="text-xs text-muted-foreground truncate">{tx.description}</div>
        )}
      </div>
      <div className={cn("text-sm font-semibold whitespace-nowrap", isReceita ? "text-emerald-600" : "text-[#FD46A1]")}>
        {formatBRL(tx.amount_cents)}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}
