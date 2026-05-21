import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-xl mx-auto space-y-4">
        <div className="aspect-square bg-[#FFD1E7] rounded-3xl overflow-hidden">
          {produto.foto_url ? (
            <img src={produto.foto_url} alt={produto.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🛒</div>
          )}
        </div>

        <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]">
          <div className="pl-5 pr-4 py-4 space-y-3">
            <div className="space-y-1">
              <h2 className="text-base font-semibold leading-snug">{produto.nome}</h2>
              {(loja || produto.unidade) && (
                <p className="text-xs text-muted-foreground">
                  {loja && <>Vendido por <span className="text-foreground/80">{loja.nome}</span></>}
                  {loja && produto.unidade && <span className="mx-1.5">·</span>}
                  {produto.unidade && <>por {produto.unidade}</>}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-4">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-bold text-[#FD46A1]">{formatBRL(preco)}</span>
                {hasPromo && (
                  <>
                    <span className="text-sm line-through text-foreground/50">
                      {formatBRL(produto.preco_centavos)}
                    </span>
                    <Badge className="text-[10px] px-1.5 py-0 bg-[#FD46A1] text-white border-0 hover:bg-[#FD46A1]">
                      Promo
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">por {produto.unidade}</p>
            </div>

            {produto.descricao && (
              <div className="flex gap-2 rounded-lg bg-[#FD46A1]/5 border border-[#FD46A1]/15 p-3">
                <Info className="w-3.5 h-3.5 text-[#FD46A1] mt-0.5 shrink-0" />
                <p className="text-xs text-foreground/80 leading-relaxed">{produto.descricao}</p>
              </div>
            )}

            <Button
              onClick={handleAdd}
              className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl h-12 text-base text-white"
            >
              Adicionar ao carrinho
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Produto;
