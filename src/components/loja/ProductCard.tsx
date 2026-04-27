import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openExternalUrl } from "@/lib/openExternal";

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
  const handleBuy = () => openExternalUrl(product.affiliate_url);

  return (
    <div
      className={`bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full ${className}`}
    >
      <div className="aspect-square bg-muted overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2 flex flex-col flex-1 gap-1.5">
        <h3 className="text-xs font-semibold text-foreground line-clamp-2 leading-tight min-h-[2rem]">
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
  );
};
