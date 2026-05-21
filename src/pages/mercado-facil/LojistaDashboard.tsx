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
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
              {/* Banner */}
              <div
                className="relative h-28 bg-gradient-to-r from-[#FD46A1] to-[#FF7AB8]"
                style={
                  loja.banner_url
                    ? { backgroundImage: `url(${loja.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : undefined
                }
              >
                <Link
                  to="/mercado-facil/lojista/loja"
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
                  aria-label="Editar banner"
                >
                  <Camera size={18} />
                </Link>
              </div>

              {/* Avatar + Editar */}
              <div className="flex items-end justify-between px-4">
                <div className="relative -mt-10">
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-[#FFD1E7] overflow-hidden flex items-center justify-center">
                    {loja.foto_url ? (
                      <img src={loja.foto_url} alt={loja.nome} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-[#FD46A1]">
                        {loja.nome.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <Link
                    to="/mercado-facil/lojista/loja"
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#FD46A1] border-2 border-white flex items-center justify-center text-white"
                    aria-label="Editar foto"
                  >
                    <Camera size={12} />
                  </Link>
                </div>
                <Link
                  to="/mercado-facil/lojista/loja"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#FD46A1] text-[#FD46A1] text-sm font-semibold"
                >
                  <Pencil size={14} />
                  Editar
                </Link>
              </div>

              {/* Nome + WhatsApp */}
              <div className="px-4 mt-2">
                <h2 className="text-2xl font-bold text-foreground">{loja.nome}</h2>
                <p className="text-sm text-foreground/60">WhatsApp: {loja.telefone_whatsapp}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 px-4 py-4 mt-2">
                <div className="bg-[#FFD1E7] rounded-2xl py-3 flex flex-col items-center">
                  <Package size={18} className="text-[#FD46A1]" />
                  <p className="text-lg font-bold mt-1">{produtosCount}</p>
                  <p className="text-[10px] tracking-wider text-foreground/60 uppercase">Produtos</p>
                </div>
                <div className="bg-[#FFD1E7] rounded-2xl py-3 flex flex-col items-center">
                  <ListOrdered size={18} className="text-[#FD46A1]" />
                  <p className="text-lg font-bold mt-1">{pedidosCount}</p>
                  <p className="text-[10px] tracking-wider text-foreground/60 uppercase">Pedidos</p>
                </div>
                <div className="bg-[#FFD1E7] rounded-2xl py-3 flex flex-col items-center">
                  <Store size={18} className="text-[#FD46A1]" />
                  <p className="text-sm font-bold mt-1">{loja.ativa ? "Ativa" : "Inativa"}</p>
                  <p className="text-[10px] tracking-wider text-foreground/60 uppercase">Status</p>
                </div>
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
