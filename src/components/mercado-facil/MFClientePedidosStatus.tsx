import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, MapPin, Package, Star } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useMFEntregas } from "@/hooks/mercado-facil/useMFEntregas";
import { MFEntregaProgress } from "./MFEntregaProgress";
import { formatBRL } from "@/lib/mercado-facil/formatters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function MFClientePedidosStatus() {
  const { user } = useAuthContext();
  const { entregas } = useMFEntregas({
    scope: "cliente-ativas",
    userId: user?.id,
  });
  const [open, setOpen] = useState(false);
  const [avaliadas, setAvaliadas] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Busca quais entregas já foram avaliadas
  useEffect(() => {
    const entreguesIds = entregas.filter((e) => e.status === "entregue").map((e) => e.id);
    if (entreguesIds.length === 0) {
      setAvaliadas(new Set());
      return;
    }
    supabase
      .from("mf_entregador_avaliacoes")
      .select("entrega_id")
      .in("entrega_id", entreguesIds)
      .then(({ data }) => {
        setAvaliadas(new Set((data ?? []).map((r: any) => r.entrega_id)));
      });
  }, [entregas.map((e) => `${e.id}:${e.status}`).join(",")]);

  const visiveis = useMemo(
    () => entregas.filter((e) => e.status !== "entregue" || !avaliadas.has(e.id)),
    [entregas, avaliadas]
  );

  if (!user || visiveis.length === 0) return null;

  const enviarAvaliacao = async (entregaId: string, entregadorId: string | null) => {
    if (!entregadorId) return;
    const nota = ratings[entregaId];
    if (!nota || nota < 1) {
      toast({ title: "Escolha uma nota de 1 a 5 estrelas", variant: "destructive" });
      return;
    }
    setSubmitting(entregaId);
    const { error } = await supabase.from("mf_entregador_avaliacoes").insert({
      entrega_id: entregaId,
      entregador_id: entregadorId,
      autor_id: user.id,
      nota,
      comentario: (comments[entregaId] ?? "").trim() || null,
    });
    setSubmitting(null);
    if (error) {
      toast({ title: "Não foi possível enviar a avaliação", description: error.message, variant: "destructive" });
      return;
    }
    setAvaliadas((prev) => new Set(prev).add(entregaId));
    toast({ title: "Obrigado pela avaliação!" });
  };

  return (
    <div className="bg-white border border-[#FD46A1]/30 rounded-3xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mf-status-pedidos"
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-base text-foreground">
          <Package size={16} className="text-[#FD46A1]" />
          Ver status do pedido
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD1E7] text-[#FD46A1]">
            {visiveis.length}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`text-[#FD46A1] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id="mf-status-pedidos"
        className={`transition-all duration-300 ease-out overflow-hidden ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-3 border-t border-[#FD46A1]/15 pt-3">
          {visiveis.map((e) => {
            const nota = ratings[e.id] ?? 0;
            const isEntregue = e.status === "entregue";
            return (
              <div key={e.id} className="bg-[#FFD1E7]/40 rounded-2xl p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-[#FD46A1] mt-0.5 shrink-0" />
                  <p className="text-sm flex-1">{e.endereco_entrega}</p>
                  <span className="text-sm font-bold text-[#FD46A1] whitespace-nowrap">
                    {e.taxa_centavos > 0 ? formatBRL(e.taxa_centavos) : "A combinar"}
                  </span>
                </div>
                {e.tipo === "propria" && (
                  <p className="text-[11px] pl-6 text-[#FD46A1]">Entrega feita pela loja</p>
                )}

                {e.status === "disponivel" ? (
                  <div className="flex items-center gap-2 text-xs text-foreground/70 pl-6">
                    <Loader2 size={12} className="animate-spin text-[#FD46A1]" />
                    Buscando entregador…
                  </div>
                ) : isEntregue ? (
                  <div className="pl-6 space-y-2">
                    <p className="text-sm text-foreground">Pedido entregue! Avalie seu entregador:</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRatings((r) => ({ ...r, [e.id]: n }))}
                          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                          className="p-1"
                        >
                          <Star
                            size={26}
                            className={
                              n <= nota
                                ? "fill-[#FD46A1] text-[#FD46A1]"
                                : "text-[#FD46A1]/40"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comments[e.id] ?? ""}
                      onChange={(ev) =>
                        setComments((c) => ({ ...c, [e.id]: ev.target.value }))
                      }
                      placeholder="Comentário (opcional)"
                      rows={2}
                      className="w-full rounded-2xl bg-white border border-[#FD46A1]/30 px-3 py-2 text-base outline-none resize-none"
                    />
                    <button
                      type="button"
                      disabled={submitting === e.id || nota < 1}
                      onClick={() => enviarAvaliacao(e.id, e.entregador_id)}
                      className="w-full h-11 rounded-2xl bg-[#FD46A1] text-white text-base disabled:opacity-50"
                    >
                      {submitting === e.id ? "Enviando…" : "Enviar avaliação"}
                    </button>
                  </div>
                ) : (
                  <MFEntregaProgress status={e.status as "aceita" | "coletada" | "entregue"} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
