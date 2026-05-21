import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Store, ListOrdered, Camera, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import type { MFLoja } from "@/lib/mercado-facil/types";

const LojistaDashboard = () => {
  const { user } = useAuthContext();
  const [loja, setLoja] = useState<MFLoja | null>(null);
  const [pedidosCount, setPedidosCount] = useState(0);
  const [produtosCount, setProdutosCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: l } = await supabase
        .from("mf_lojas")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at")
        .limit(1)
        .maybeSingle();
      setLoja((l as MFLoja) ?? null);
      if (l) {
        const [pe, pr] = await Promise.all([
          supabase.from("mf_order_log").select("id", { count: "exact", head: true }).eq("loja_id", (l as MFLoja).id),
          supabase.from("mf_produtos").select("id", { count: "exact", head: true }).eq("loja_id", (l as MFLoja).id),
        ]);
        setPedidosCount(pe.count ?? 0);
        setProdutosCount(pr.count ?? 0);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title="Painel do Lojista" backTo="/mercado-facil" showCart={false} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-xl mx-auto space-y-4">
        {loading ? (
          <p className="text-sm text-foreground/60">Carregando...</p>
        ) : !loja ? (
          <div className="bg-[#FFD1E7] rounded-3xl p-6 text-center space-y-3">
            <Store size={36} className="mx-auto text-[#FD46A1]" />
            <h2 className="text-base font-semibold">Cadastre sua loja</h2>
            <p className="text-sm text-foreground/70">
              Para receber pedidos pelo WhatsApp, primeiro configure os dados da sua loja.
            </p>
            <Button asChild className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl">
              <Link to="/mercado-facil/lojista/loja">Cadastrar loja</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white border border-[#FD46A1]/30 rounded-3xl p-4 space-y-1">
              <p className="text-xs text-foreground/60">Sua loja</p>
              <h2 className="text-base font-semibold">{loja.nome}</h2>
              <p className="text-xs text-foreground/60">WhatsApp: {loja.telefone_whatsapp}</p>
              <Link to="/mercado-facil/lojista/loja" className="text-xs text-[#FD46A1] font-semibold">
                Editar dados da loja
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#FFD1E7] rounded-3xl p-4">
                <p className="text-xs text-foreground/60">Produtos</p>
                <p className="text-2xl font-bold text-[#FD46A1]">{produtosCount}</p>
              </div>
              <div className="bg-[#FFD1E7] rounded-3xl p-4">
                <p className="text-xs text-foreground/60">Pedidos via WA</p>
                <p className="text-2xl font-bold text-[#FD46A1]">{pedidosCount}</p>
              </div>
            </div>

            <Link
              to="/mercado-facil/lojista/produtos"
              className="flex items-center gap-3 bg-white border border-[#FD46A1]/30 rounded-3xl p-4 hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-[#FD46A1]/15 flex items-center justify-center">
                <Package size={22} className="text-[#FD46A1]" />
              </div>
              <div className="flex-1">
                <p className="text-base">Gerenciar produtos</p>
                <p className="text-xs text-foreground/60">Adicionar, editar e remover itens</p>
              </div>
            </Link>

            <Link
              to="/mercado-facil/lojista/pedidos"
              className="flex items-center gap-3 bg-white border border-[#FD46A1]/30 rounded-3xl p-4 hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-[#FD46A1]/15 flex items-center justify-center">
                <ListOrdered size={22} className="text-[#FD46A1]" />
              </div>
              <div className="flex-1">
                <p className="text-base">Pedidos recebidos</p>
                <p className="text-xs text-foreground/60">Histórico e acionamento de entregadores</p>
              </div>
            </Link>
          </>
        )}
      </main>
    </div>
  );
};

export default LojistaDashboard;
