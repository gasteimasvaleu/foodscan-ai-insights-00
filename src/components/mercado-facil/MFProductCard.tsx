import { Link } from "react-router-dom";
import { Plus, Store } from "lucide-react";
import { formatBRL } from "@/lib/mercado-facil/formatters";
import { useMFCart } from "@/hooks/mercado-facil/useMFCart";
import { toast } from "@/components/ui/use-toast";
import type { MFProduto } from "@/lib/mercado-facil/types";

interface Props {
  produto: MFProduto;
  lojaId?: string;
  lojaNome?: string;
}

export const MFProductCard = ({ produto, lojaId, lojaNome }: Props) => {
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
      className="block bg-[#FFD1E7] rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {lojaNome && (
        <div className="bg-white/60 backdrop-blur-sm px-2 py-1 flex items-center gap-1">
          <Store size={10} className="text-[#FD46A1] shrink-0" />
          <span className="text-[10px] font-medium text-foreground/80 truncate">{lojaNome}</span>
        </div>
      )}
      <div className="aspect-square bg-white/40 overflow-hidden">
        {produto.foto_url ? (
          <img src={produto.foto_url} alt={produto.nome} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🛒</div>
        )}
      </div>
      <div className="p-2 space-y-0.5">
        <p className="text-xs text-foreground line-clamp-2 leading-tight">{produto.nome}</p>
        <div className="flex items-center justify-between gap-1">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#FD46A1] leading-tight">{formatBRL(preco)}</p>
            <p className="text-[10px] text-foreground/60">por {produto.unidade}</p>
          </div>
          <button
            onClick={handleAdd}
            className="w-8 h-8 rounded-full bg-[#FD46A1] text-white flex items-center justify-center shrink-0 hover:opacity-90"
            aria-label="Adicionar"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </Link>
  );

};
