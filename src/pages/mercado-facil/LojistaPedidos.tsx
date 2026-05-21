import { useEffect, useMemo, useState } from "react";
import { Loader2, Truck, MessageCircle, ChevronDown, Package, MapPin, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";
import { openExternalUrl } from "@/lib/openExternal";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { MFEntregadoresDisponiveis } from "@/components/mercado-facil/MFEntregadoresDisponiveis";
import { MFEntregaProgress } from "@/components/mercado-facil/MFEntregaProgress";
import { useMFEntregas } from "@/hooks/mercado-facil/useMFEntregas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import { toast } from "@/components/ui/use-toast";
import { cleanPhone, formatBRL } from "@/lib/mercado-facil/formatters";
import { ENTREGA_STATUS_LABEL } from "@/lib/mercado-facil/entregador-types";
import type { MFLoja } from "@/lib/mercado-facil/types";

interface OrderLog {
  id: string;
  cliente_id: string;
  loja_id: string;
  itens: Array<{ nome: string; quantidade: number; preco_centavos: number }>;
  total_estimado_centavos: number;
  sent_at: string;
  cliente_nome: string | null;
  cliente_endereco: string | null;
  cliente_cidade: string | null;
  cliente_telefone: string | null;
}

const LojistaPedidos = () => {
  const { user } = useAuthContext();
  const [loja, setLoja] = useState<MFLoja | null>(null);
  const [pedidos, setPedidos] = useState<OrderLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [openEntrega, setOpenEntrega] = useState<OrderLog | null>(null);
  const [endereco, setEndereco] = useState("");
  const [cidadeEntrega, setCidadeEntrega] = useState("");
  const [taxaReais, setTaxaReais] = useState("");
  const [telCliente, setTelCliente] = useState("");
  const [creating, setCreating] = useState(false);
  const [modoEntrega, setModoEntrega] = useState<"app" | "propria">("app");
  const [updatingEntrega, setUpdatingEntrega] = useState<string | null>(null);
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { entregas } = useMFEntregas({ scope: "lojista", userId: user?.id });
  const entregasPorPedido = useMemo(() => {
    const m = new Map<string, typeof entregas[number]>();
    for (const e of entregas) {
      if (e.order_log_id) {
        const existing = m.get(e.order_log_id);
        if (!existing || new Date(e.created_at) > new Date(existing.created_at)) {
          m.set(e.order_log_id, e);
        }
      }
    }
    return m;
  }, [entregas]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data: l } = await supabase
        .from("mf_lojas")
        .select("*")
        .eq("owner_id", user.id)
        .limit(1)
        .maybeSingle();
      setLoja((l as MFLoja) ?? null);
      if (l) {
        const { data: p } = await supabase
          .from("mf_order_log")
          .select("*")
          .eq("loja_id", (l as MFLoja).id)
          .order("sent_at", { ascending: false })
          .limit(50);
        setPedidos((p as unknown as OrderLog[]) ?? []);
        setCidadeEntrega((l as MFLoja).endereco?.cidade ?? "");
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const criarEntrega = async () => {
    if (!user || !loja || !openEntrega) return;
    if (!endereco.trim() || !cidadeEntrega.trim()) {
      toast({ title: "Informe endereço e cidade", variant: "destructive" });
      return;
    }
    setCreating(true);
    const taxa = Math.round((Number(taxaReais.replace(",", ".")) || 0) * 100);
    const ehPropria = modoEntrega === "propria";
    const { error } = await supabase.from("mf_entregas").insert({
      order_log_id: openEntrega.id,
      loja_id: loja.id,
      lojista_id: user.id,
      cliente_id: openEntrega.cliente_id,
      endereco_entrega: endereco.trim(),
      cidade: cidadeEntrega.trim(),
      taxa_centavos: taxa,
      telefone_cliente: telCliente.trim() || null,
      telefone_lojista: loja.telefone_whatsapp,
      tipo: ehPropria ? "propria" : "app",
      status: ehPropria ? "aceita" : "disponivel",
      aceita_em: ehPropria ? new Date().toISOString() : null,
    });
    setCreating(false);
    if (error) {
      toast({ title: "Erro ao criar entrega", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: ehPropria ? "Entrega registrada" : "Entrega criada",
      description: ehPropria
        ? "Agora atualize o status conforme a entrega avança."
        : "Entregadores próximos foram notificados.",
    });
    setOpenEntrega(null);
    setEndereco("");
    setTelCliente("");
    setTaxaReais("");
    setModoEntrega("app");
  };

  const avancarEntrega = async (entregaId: string, novoStatus: "coletada" | "entregue" | "cancelada") => {
    setUpdatingEntrega(entregaId);
    const patch: Record<string, unknown> = { status: novoStatus };
    if (novoStatus === "coletada") patch.coletada_em = new Date().toISOString();
    if (novoStatus === "entregue") patch.entregue_em = new Date().toISOString();
    const { error } = await supabase.from("mf_entregas").update(patch).eq("id", entregaId);
    setUpdatingEntrega(null);
    if (error) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    }
  };

  const excluirPedido = async (pedidoId: string) => {
    setDeletingId(pedidoId);
    const { error } = await supabase.from("mf_order_log").delete().eq("id", pedidoId);
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (error) {
      toast({ title: "Erro ao excluir pedido", description: error.message, variant: "destructive" });
      return;
    }
    setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
    toast({ title: "Pedido excluído" });
  };




  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FD46A1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title="Pedidos" backTo="/mercado-facil/lojista" showCart={false} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-xl mx-auto space-y-3">
        {!loja ? (
          <div className="bg-[#FFD1E7] rounded-3xl p-6 text-center text-sm">
            Cadastre sua loja primeiro para começar a receber pedidos.
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white border border-[#FD46A1]/30 rounded-3xl p-6 text-center text-sm text-foreground/60">
            Nenhum pedido registrado ainda.
          </div>
        ) : (
          pedidos.map((p) => {
            const entrega = entregasPorPedido.get(p.id);
            const entregaAtiva = entrega && ["disponivel", "aceita", "coletada"].includes(entrega.status);
            return (
            <div key={p.id} className="bg-white border border-[#FD46A1]/30 rounded-3xl p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-foreground/60">
                    {new Date(p.sent_at).toLocaleString("pt-BR", {
                      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                  <p className="text-base font-semibold">{p.itens.length} itens</p>
                </div>
                <p className="text-[#FD46A1] font-bold">{formatBRL(p.total_estimado_centavos)}</p>
              </div>
              <ul className="text-xs text-foreground/70 space-y-0.5">
                {p.itens.slice(0, 3).map((i, idx) => (
                  <li key={idx}>• {i.quantidade}x {i.nome}</li>
                ))}
                {p.itens.length > 3 && <li>+ {p.itens.length - 3} outros itens</li>}
              </ul>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-2xl"
                  onClick={() => openExternalUrl(`https://wa.me/${cleanPhone(loja.telefone_whatsapp)}`)}
                >
                  <MessageCircle size={14} className="mr-1" /> WhatsApp
                </Button>
                {!entregaAtiva && (
                  <Button
                    size="sm"
                    className="flex-1 bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl"
                    onClick={() => {
                      setOpenEntrega(p);
                      const lojaUsaApp =
                        loja.aceita_entregador && loja.quem_aciona_entregador !== "cliente";
                      setModoEntrega(lojaUsaApp ? "app" : "propria");
                      setTaxaReais(((loja.taxa_entrega_padrao_centavos || 0) / 100).toFixed(2));
                      setEndereco(p.cliente_endereco ?? "");
                      setCidadeEntrega(p.cliente_cidade ?? loja.endereco?.cidade ?? "");
                      setTelCliente(p.cliente_telefone ?? "");
                    }}
                  >
                    <Truck size={14} className="mr-1" /> Entrega
                  </Button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setOpenStatusId(openStatusId === p.id ? null : p.id)}
                aria-expanded={openStatusId === p.id}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-[#FD46A1]/30 bg-white text-left"
              >
                <span className="flex items-center gap-2 text-base text-foreground">
                  <Package size={16} className="text-[#FD46A1]" />
                  Ver status do pedido
                  {entrega && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD1E7] text-[#FD46A1]">
                      {ENTREGA_STATUS_LABEL[entrega.status]}
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-[#FD46A1] transition-transform duration-300 ${openStatusId === p.id ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-out overflow-hidden ${
                  openStatusId === p.id ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="pt-3">
                  {!entrega ? (
                    <p className="text-sm text-foreground/60 px-1">
                      Nenhuma entrega registrada ainda. Use o botão "Entrega" acima para registrar.
                    </p>
                  ) : (
                    <div className="bg-[#FFD1E7]/40 rounded-2xl p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-[#FD46A1] mt-0.5 shrink-0" />
                        <p className="text-sm flex-1">{entrega.endereco_entrega}</p>
                        <span className="text-sm font-bold text-[#FD46A1] whitespace-nowrap">
                          {entrega.taxa_centavos > 0 ? formatBRL(entrega.taxa_centavos) : "A combinar"}
                        </span>
                      </div>
                      {entrega.tipo === "propria" && (
                        <p className="text-[11px] pl-6 text-[#FD46A1]">Entrega feita pela loja</p>
                      )}

                      {entrega.status === "disponivel" ? (
                        <div className="flex items-center gap-2 text-xs text-foreground/70 pl-6">
                          <Loader2 size={12} className="animate-spin text-[#FD46A1]" />
                          Buscando entregador…
                        </div>
                      ) : entrega.status === "cancelada" ? (
                        <p className="text-xs text-foreground/60 pl-6">Entrega cancelada.</p>
                      ) : (
                        <MFEntregaProgress status={entrega.status as "aceita" | "coletada" | "entregue"} />
                      )}

                      {entrega.tipo === "propria" && ["aceita", "coletada"].includes(entrega.status) && (
                        <div className="flex gap-2 pt-1">
                          {entrega.status === "aceita" && (
                            <Button
                              size="sm"
                              disabled={updatingEntrega === entrega.id}
                              className="flex-1 bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl"
                              onClick={() => avancarEntrega(entrega.id, "coletada")}
                            >
                              {updatingEntrega === entrega.id ? <Loader2 size={14} className="animate-spin" /> : "Saiu para entrega"}
                            </Button>
                          )}
                          {entrega.status === "coletada" && (
                            <Button
                              size="sm"
                              disabled={updatingEntrega === entrega.id}
                              className="flex-1 bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl"
                              onClick={() => avancarEntrega(entrega.id, "entregue")}
                            >
                              {updatingEntrega === entrega.id ? <Loader2 size={14} className="animate-spin" /> : "Marcar entregue"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingEntrega === entrega.id}
                            className="rounded-2xl"
                            onClick={() => avancarEntrega(entrega.id, "cancelada")}
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
            );
          })
        )}
      </main>

      <Dialog open={!!openEntrega} onOpenChange={(o) => !o && setOpenEntrega(null)}>
        <DialogContent className="bg-white/70 backdrop-blur-md rounded-3xl border-2 border-[#FD46A1] max-w-md w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Acionar entrega</DialogTitle>
            <DialogDescription>Escolha quem fará a entrega deste pedido.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#FFD1E7]/40">
              <button
                type="button"
                onClick={() => setModoEntrega("app")}
                disabled={!loja?.aceita_entregador || loja?.quem_aciona_entregador === "cliente"}
                className={`h-10 rounded-xl text-sm transition-colors ${
                  modoEntrega === "app"
                    ? "bg-[#FD46A1] text-white"
                    : "text-foreground/70 disabled:opacity-40"
                }`}
              >
                Entregador do app
              </button>
              <button
                type="button"
                onClick={() => setModoEntrega("propria")}
                className={`h-10 rounded-xl text-sm transition-colors ${
                  modoEntrega === "propria" ? "bg-[#FD46A1] text-white" : "text-foreground/70"
                }`}
              >
                Entrega própria
              </button>
            </div>

            <p className="text-xs text-foreground/60 leading-snug">
              {loja?.quem_aciona_entregador === "cliente"
                ? 'O entregador é chamado pelo cliente no carrinho. Use "Entrega própria" para registrar o status aqui.'
                : modoEntrega === "app"
                ? "Confirme os dados abaixo e escolha um entregador disponível para enviar via WhatsApp."
                : "Você fará a entrega por conta própria. Atualize o status no card do pedido conforme avança."}
            </p>

            <div className="bg-[#FFD1E7]/40 rounded-2xl p-3 space-y-2">
              {openEntrega?.cliente_nome && (
                <p className="text-xs text-foreground/70">
                  Pedido de <span className="font-medium text-foreground">{openEntrega.cliente_nome}</span>
                </p>
              )}
              <div>
                <Label>Endereço completo</Label>
                <Input
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, nº, bairro"
                  className="text-base"
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={cidadeEntrega} onChange={(e) => setCidadeEntrega(e.target.value)} className="text-base" />
              </div>
              <div>
                <Label>{modoEntrega === "app" ? "Taxa sugerida ao entregador (R$)" : "Taxa cobrada do cliente (R$)"}</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={taxaReais}
                  onChange={(e) => setTaxaReais(e.target.value)}
                  placeholder="0,00"
                  className="text-base"
                />
              </div>
              {modoEntrega === "app" && (
                <div>
                  <Label>WhatsApp do cliente (opcional)</Label>
                  <Input
                    value={telCliente}
                    onChange={(e) => setTelCliente(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="text-base"
                  />
                </div>
              )}
            </div>

            {modoEntrega === "app" && loja && openEntrega ? (
              <div className="space-y-2">
                <p className="text-xs text-foreground/60 leading-snug">
                  1. Confirme endereço e taxa acima • 2. Escolha um entregador e toque em <strong>Chamar</strong>.
                </p>
                <MFEntregadoresDisponiveis
                  loja={loja}
                  cidade={cidadeEntrega}
                  endereco={endereco}
                  clienteId={openEntrega.cliente_id}
                  telefoneCliente={telCliente.trim() || undefined}
                  itens={openEntrega.itens.map((i) => ({
                    produto_id: "",
                    nome: i.nome,
                    quantidade: i.quantidade,
                    preco_centavos: i.preco_centavos,
                  })) as any}
                  totalCentavos={openEntrega.total_estimado_centavos}
                  orderLogId={openEntrega.id}
                  taxaOverrideCentavos={Math.round((Number(taxaReais.replace(",", ".")) || 0) * 100)}
                  onCalled={() => setOpenEntrega(null)}
                />
              </div>
            ) : (
              <Button
                onClick={criarEntrega}
                disabled={creating}
                className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl h-12"
              >
                {creating ? <Loader2 className="animate-spin" /> : "Registrar entrega própria"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LojistaPedidos;
