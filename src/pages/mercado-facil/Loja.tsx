import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { MFProductCard } from "@/components/mercado-facil/MFProductCard";
import type { MFLoja, MFProduto } from "@/lib/mercado-facil/types";

const Loja = () => {
  const { id } = useParams<{ id: string }>();
  const [loja, setLoja] = useState<MFLoja | null>(null);
  const [produtos, setProdutos] = useState<MFProduto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [l, p] = await Promise.all([
        supabase.from("mf_lojas").select("*").eq("id", id).maybeSingle(),
        supabase.from("mf_produtos").select("*").eq("loja_id", id).eq("ativo", true).order("nome"),
      ]);
      setLoja((l.data as MFLoja) ?? null);
      setProdutos((p.data ?? []) as MFProduto[]);
      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title={loja?.nome ?? "Loja"} backTo="/mercado-facil" />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto space-y-4">
        {loading ? (
          <p className="text-sm text-foreground/60">Carregando...</p>
        ) : !loja ? (
          <p className="text-sm text-foreground/60">Loja não encontrada.</p>
        ) : (
          <>
            <div className="bg-white border border-[#FD46A1]/30 rounded-3xl overflow-hidden shadow-sm">
              <div className="relative h-28 bg-gradient-to-r from-[#FD46A1] to-[#FF8FC4]">
                {loja.banner_url && (
                  <img src={loja.banner_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="px-4 pb-4 -mt-12 relative z-10">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-[#FFD1E7] overflow-hidden shadow-md">
                  {loja.foto_url ? (
                    <img src={loja.foto_url} alt={loja.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-[#FD46A1] font-semibold">
                      {loja.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold mt-3 text-foreground">{loja.nome}</h2>
                {loja.descricao && <p className="text-sm text-foreground/60 mt-1">{loja.descricao}</p>}
                {loja.endereco?.bairro && (
                  <p className="text-xs text-foreground/50 mt-1">
                    {[loja.endereco.bairro, loja.endereco.cidade].filter(Boolean).join(" — ")}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-[#FFD1E7] rounded-2xl py-3 flex flex-col items-center">
                    <span className="text-lg font-bold text-foreground">{produtos.length}</span>
                    <span className="text-[10px] tracking-wider text-foreground/60 mt-0.5">PRODUTOS</span>
                  </div>
                  <div className="bg-[#FFD1E7] rounded-2xl py-3 flex flex-col items-center">
                    <span className="text-lg font-bold text-foreground">
                      {new Set(produtos.map((p) => p.categoria_id).filter(Boolean)).size}
                    </span>
                    <span className="text-[10px] tracking-wider text-foreground/60 mt-0.5">CATEGORIAS</span>
                  </div>
                  <div className="bg-[#FFD1E7] rounded-2xl py-3 flex flex-col items-center">
                    <span className="text-lg font-bold text-foreground">
                      {produtos.filter((p) => p.preco_promo_centavos).length}
                    </span>
                    <span className="text-[10px] tracking-wider text-foreground/60 mt-0.5">PROMOÇÕES</span>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-base font-semibold pt-2">Produtos</h3>
            {produtos.length === 0 ? (
              <p className="text-sm text-foreground/60">Esta loja ainda não cadastrou produtos.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {produtos.map((p) => <MFProductCard key={p.id} produto={p} lojaId={loja.id} />)}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Loja;
