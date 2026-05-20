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
      <div className="min-h-screen bg-[#F7FAFB]">
        <MFHeader title="Produto" />
        <main className="pt-[calc(env(safe-area-inset-top)+4rem)] px-4">Carregando...</main>
      </div>
    );
  }

  const preco = produto.preco_promo_centavos ?? produto.preco_centavos;

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
    <div className="min-h-screen bg-[#F7FAFB]">
      <MFHeader title={produto.nome} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-xl mx-auto space-y-4">
        <div className="aspect-square bg-[#FFD1E7] rounded-3xl overflow-hidden">
          {produto.foto_url ? (
            <img src={produto.foto_url} alt={produto.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🛒</div>
          )}
        </div>
        <h2 className="text-base font-semibold">{produto.nome}</h2>
        <p className="text-2xl font-bold text-[#FD46A1]">{formatBRL(preco)}</p>
        <p className="text-sm text-foreground/60">por {produto.unidade}</p>
        {produto.descricao && <p className="text-sm text-foreground/80">{produto.descricao}</p>}
        {loja && (
          <p className="text-sm">
            Vendido por <span className="font-semibold">{loja.nome}</span>
          </p>
        )}
        <Button onClick={handleAdd} className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl h-12 text-base">
          Adicionar ao carrinho
        </Button>
      </main>
    </div>
  );
};

export default Produto;
