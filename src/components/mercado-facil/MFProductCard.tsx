import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { formatBRL } from "@/lib/mercado-facil/formatters";
import { useMFCart } from "@/hooks/mercado-facil/useMFCart";
import { toast } from "@/components/ui/use-toast";
import type { MFProduto } from "@/lib/mercado-facil/types";

interface Props {
  produto: MFProduto;
  lojaId?: string;
}

export const MFProductCard = ({ produto, lojaId }: Props) => {
  const { add } = useMFCart();
  const preco = produto.preco_promo_centavos ?? produto.preco_centavos;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      produto_id: produto.id,
      loja_id: lojaId ?? produto.loja_id,
      nome: produto.nome,
      preco_centavos: preco,
      unidade: produto.unidade,
      foto_url: produto.foto_url,
    });
    toast({ title: "Adicionado ao carrinho", description: produto.nome });
  };

  return (
    <Link
      to={`/mercado-facil/produto/${produto.id}`}
      className="block bg-[#FFD1E7] rounded-3xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-white/40 overflow-hidden">
        {produto.foto_url ? (
          <img src={produto.foto_url} alt={produto.nome} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🛒</div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-base text-foreground line-clamp-2">{produto.nome}</p>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-base font-semibold text-[#FD46A1]">{formatBRL(preco)}</p>
            <p className="text-xs text-foreground/60">por {produto.unidade}</p>
          </div>
          <button
            onClick={handleAdd}
            className="w-10 h-10 rounded-full bg-[#FD46A1] text-white flex items-center justify-center shrink-0 hover:opacity-90"
            aria-label="Adicionar"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </Link>
  );
};
