import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import { useMFCart } from "@/hooks/mercado-facil/useMFCart";
import { useAuthContext } from "@/contexts/AuthProvider";
import { formatBRL } from "@/lib/mercado-facil/formatters";
import { sendOrderToWhatsApp } from "@/lib/mercado-facil/whatsapp";
import { toast } from "@/components/ui/use-toast";
import { MFEntregadoresDisponiveis } from "@/components/mercado-facil/MFEntregadoresDisponiveis";
import type { MFLoja } from "@/lib/mercado-facil/types";

const ADDRESS_KEY = "mf_delivery_address_v1";

const Carrinho = () => {
  const { byLoja, setQty, clearLoja, totalItens } = useMFCart();
  const { user } = useAuthContext();
  const [lojas, setLojas] = useState<Record<string, MFLoja>>({});
  const [profileName, setProfileName] = useState<string | undefined>();
  const [profilePhone, setProfilePhone] = useState<string | undefined>();
  const [cidade, setCidade] = useState("");
  const [endereco, setEndereco] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADDRESS_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        if (v.cidade) setCidade(v.cidade);
        if (v.endereco) setEndereco(v.endereco);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(ADDRESS_KEY, JSON.stringify({ cidade, endereco }));
  }, [cidade, endereco]);


  const lojaIds = Object.keys(byLoja);

  useEffect(() => {
    if (lojaIds.length === 0) {
      setLojas({});
      return;
    }
    supabase
      .from("mf_lojas")
      .select("*")
      .in("id", lojaIds)
      .then(({ data }) => {
        const map: Record<string, MFLoja> = {};
        ((data ?? []) as MFLoja[]).forEach((l) => (map[l.id] = l));
        setLojas(map);
      });
  }, [lojaIds.join(",")]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("name, whatsapp_phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const d = data as { name?: string; whatsapp_phone?: string } | null;
        setProfileName(d?.name);
        setProfilePhone(d?.whatsapp_phone);
      });
  }, [user?.id]);


  const handleSend = async (lojaId: string) => {
    if (!user) {
      toast({ title: "Faça login para enviar o pedido", variant: "destructive" });
      return;
    }
    const loja = lojas[lojaId];
    const itens = byLoja[lojaId];
    if (!loja || !itens?.length) return;

    try {
      await sendOrderToWhatsApp({
        loja,
        itens,
        clienteId: user.id,
        clienteNome: profileName,
      });
      clearLoja(lojaId);
      toast({
        title: "Pedido enviado",
        description: `Continue a conversa no WhatsApp da ${loja.nome}.`,
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Não foi possível abrir o WhatsApp", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFB]">
      <MFHeader title="Carrinho" showCart={false} backTo="/mercado-facil" />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto space-y-4">
        {totalItens === 0 ? (
          <p className="text-sm text-foreground/60 text-center pt-12">
            Seu carrinho está vazio. Adicione produtos para enviar o pedido pelo WhatsApp do lojista.
          </p>
        ) : (
          lojaIds.map((lojaId) => {
            const loja = lojas[lojaId];
            const itens = byLoja[lojaId];
            const total = itens.reduce((s, i) => s + i.preco_centavos * i.quantidade, 0);
            return (
              <div key={lojaId} className="bg-white rounded-3xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">{loja?.nome ?? "Loja"}</h2>
                  <button
                    onClick={() => clearLoja(lojaId)}
                    className="text-xs text-foreground/60 flex items-center gap-1"
                  >
                    <Trash2 size={14} /> esvaziar
                  </button>
                </div>
                <ul className="space-y-3">
                  {itens.map((i) => (
                    <li key={i.produto_id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FFD1E7] overflow-hidden shrink-0">
                        {i.foto_url && <img src={i.foto_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{i.nome}</p>
                        <p className="text-xs text-foreground/60">{formatBRL(i.preco_centavos)} / {i.unidade}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQty(i.produto_id, i.quantidade - 1)}
                          className="w-8 h-8 rounded-full bg-[#FFD1E7] flex items-center justify-center"
                          aria-label="Diminuir"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{i.quantidade}</span>
                        <button
                          onClick={() => setQty(i.produto_id, i.quantidade + 1)}
                          className="w-8 h-8 rounded-full bg-[#FD46A1] text-white flex items-center justify-center"
                          aria-label="Aumentar"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-foreground/70">Total estimado</span>
                  <span className="text-base font-bold text-[#FD46A1]">{formatBRL(total)}</span>
                </div>
                <Button
                  onClick={() => handleSend(lojaId)}
                  disabled={!loja}
                  className="w-full bg-[#25D366] hover:bg-[#25D366]/90 rounded-2xl h-12 text-base text-white"
                >
                  Enviar pedido pelo WhatsApp
                </Button>
                <p className="text-[11px] text-center text-foreground/60">
                  Você combina disponibilidade, frete e pagamento direto com a loja.
                </p>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default Carrinho;
