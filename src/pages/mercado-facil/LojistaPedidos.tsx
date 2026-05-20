import { useEffect, useState } from "react";
import { Loader2, Truck, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";
import { openExternalUrl } from "@/lib/openExternal";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { cleanPhone, formatBRL } from "@/lib/mercado-facil/formatters";
import type { MFLoja } from "@/lib/mercado-facil/types";

interface OrderLog {
  id: string;
  cliente_id: string;
  loja_id: string;
  itens: Array<{ nome: string; quantidade: number; preco_centavos: number }>;
  total_estimado_centavos: number;
  sent_at: string;
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
    });
    setCreating(false);
    if (error) {
      toast({ title: "Erro ao criar entrega", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Entrega criada", description: "Entregadores próximos foram notificados." });
    setOpenEntrega(null);
    setEndereco("");
    setTelCliente("");
    setTaxaReais("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFB] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FD46A1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFB]">
      <MFHeader title="Pedidos" backTo="/mercado-facil/lojista" showCart={false} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-xl mx-auto space-y-3">
        {!loja ? (
          <div className="bg-[#FFD1E7] rounded-3xl p-6 text-center text-sm">
            Cadastre sua loja primeiro para começar a receber pedidos.
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center text-sm text-foreground/60">
            Nenhum pedido registrado ainda.
          </div>
        ) : (
          pedidos.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl p-4 space-y-2">
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
                {loja.aceita_entregador && (
                  <Button
                    size="sm"
                    className="flex-1 bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl"
                    onClick={() => {
                      setOpenEntrega(p);
                      setTaxaReais(((loja.taxa_entrega_padrao_centavos || 0) / 100).toFixed(2));
                    }}
                  >
                    <Truck size={14} className="mr-1" /> Entregador
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </main>

      <Dialog open={!!openEntrega} onOpenChange={(o) => !o && setOpenEntrega(null)}>
        <DialogContent className="bg-white/70 backdrop-blur-md rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Acionar entregador</DialogTitle>
            <DialogDescription>Informe o endereço e a taxa de entrega.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
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
              <Label>Taxa (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={taxaReais}
                onChange={(e) => setTaxaReais(e.target.value)}
                placeholder="0,00"
                className="text-base"
              />
            </div>
            <div>
              <Label>WhatsApp do cliente (opcional)</Label>
              <Input
                value={telCliente}
                onChange={(e) => setTelCliente(e.target.value)}
                placeholder="+55 11 99999-9999"
                className="text-base"
              />
            </div>
            <Button
              onClick={criarEntrega}
              disabled={creating}
              className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl h-12"
            >
              {creating ? <Loader2 className="animate-spin" /> : "Publicar entrega"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LojistaPedidos;
