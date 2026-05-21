import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/mercado-facil/formatters";
import { useMFCart } from "@/hooks/mercado-facil/useMFCart";
import { toast } from "@/components/ui/use-toast";
import type { MFLoja, MFProduto } from "@/lib/mercado-facil/types";

const Produto = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { add } = useMFCart();
  const [produto, setProduto] = useState<MFProduto | null>(null);
  const [loja, setLoja] = useState<MFLoja | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: p } = await supabase.from("mf_produtos").select("*").eq("id", id).maybeSingle();
      setProduto((p as MFProduto) ?? null);
      if (p) {
        const { data: l } = await supabase.from("mf_lojas").select("*").eq("id", (p as MFProduto).loja_id).maybeSingle();
        setLoja((l as MFLoja) ?? null);
      }
    })();
  }, [id]);

  if (!produto) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <MFHeader title="Produto" />
        <main className="pt-[calc(env(safe-area-inset-top)+4rem)] px-4">Carregando...</main>
      </div>
    );
  }

  const preco = produto.preco_promo_centavos ?? produto.preco_centavos;
  const hasPromo = produto.preco_promo_centavos != null && produto.preco_promo_centavos < produto.preco_centavos;

  const handleAdd = () => {
    add({
      produto_id: produto.id,
      loja_id: produto.loja_id,
      nome: produto.nome,
      preco_centavos: preco,
      unidade: produto.unidade,
      foto_url: produto.foto_url,
    });
    toast({ title: "Adicionado ao carrinho", description: produto.nome });
    navigate("/mercado-facil/carrinho");
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title={produto.nome} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-40 px-4 max-w-xl mx-auto space-y-4">
        {/* Hero image */}
        <div className="aspect-square bg-[#FFD1E7] rounded-[2rem] overflow-hidden">
          {produto.foto_url ? (
            <img src={produto.foto_url} alt={produto.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🛒</div>
          )}
        </div>

        {/* Main info card */}
        <div className="bg-[#FFD1E7]/40 backdrop-blur-md rounded-3xl p-6 border border-[#FFD1E7]">
          <h1 className="text-2xl font-bold text-foreground leading-tight">{produto.nome}</h1>
          <div className="flex items-baseline gap-2 mt-2 flex-wrap">
            <span className="text-3xl font-extrabold text-[#FD46A1]">{formatBRL(preco)}</span>
            <span className="text-foreground/50 text-sm font-medium">/ por {produto.unidade}</span>
            {hasPromo && (
              <span className="text-foreground/40 text-sm line-through ml-1">
                {formatBRL(produto.preco_centavos)}
              </span>
            )}
          </div>
        </div>

        {/* Description card */}
        {produto.descricao && (
          <div className="bg-[#FFD1E7]/20 rounded-3xl p-6 border border-[#FFD1E7]/40">
            <h2 className="text-xs font-bold text-[#FD46A1] uppercase tracking-[0.15em] mb-3">
              Descrição
            </h2>
            <p className="text-foreground/80 leading-relaxed font-medium whitespace-pre-line">
              {produto.descricao}
            </p>
          </div>
        )}

        {/* Seller badge */}
        {loja && (
          <button
            type="button"
            onClick={() => navigate(`/mercado-facil/loja/${loja.id}`)}
            className="w-full flex items-center gap-4 px-2 py-2 rounded-2xl active:bg-[#FFD1E7]/30 transition-colors"
          >
            <div className="w-12 h-12 bg-[#FFD1E7] rounded-2xl flex items-center justify-center font-bold text-[#FD46A1] border border-[#FFD1E7] overflow-hidden shrink-0">
              {loja.foto_url ? (
                <img src={loja.foto_url} alt={loja.nome} className="w-full h-full object-cover" />
              ) : (
                loja.nome.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                Vendido por
              </span>
              <span className="text-foreground font-bold truncate">{loja.nome}</span>
            </div>
          </button>
        )}
      </main>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 inset-x-0 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] bg-gradient-to-t from-background via-background/95 to-transparent z-40">
        <div className="max-w-xl mx-auto">
          <Button
            onClick={handleAdd}
            className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl h-14 text-base font-bold shadow-lg shadow-[#FD46A1]/30"
          >
            Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Produto;
