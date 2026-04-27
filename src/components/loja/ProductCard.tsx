import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openExternalUrl } from "@/lib/openExternal";
import { ProductDetailsModal } from "./ProductDetailsModal";

export interface AffiliateProduct {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  affiliate_url: string;
  price: number | null;
  category: string;
  subcategory: string | null;
  created_at: string;
}

interface ProductCardProps {
  product: AffiliateProduct;
  className?: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);

export const ProductCard = ({ product, className = "" }: ProductCardProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleBuy = () => openExternalUrl(product.affiliate_url);

  return (
    <>
      <div
        className={`bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full ${className}`}
      >
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          aria-label={`Ver detalhes de ${product.name}`}
          className="aspect-square bg-muted overflow-hidden block w-full focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105 active:scale-95"
          />
        </button>
        <div className="p-2 flex flex-col flex-1 gap-1.5">
          <h3
            onClick={() => setDetailsOpen(true)}
            className="text-xs font-semibold text-foreground line-clamp-2 leading-tight min-h-[2rem] cursor-pointer"
          >
            {product.name}
          </h3>
          {product.price != null && (
            <p className="text-sm font-bold text-primary">
              {formatPrice(Number(product.price))}
            </p>
          )}
          <Button
            onClick={handleBuy}
            size="sm"
            className="mt-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground gap-1 h-7 text-xs px-2"
          >
            <ShoppingBag className="w-3 h-3" />
            Comprar
          </Button>
        </div>
      </div>

      <ProductDetailsModal
        product={product}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
};
