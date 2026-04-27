import { ShoppingBag } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { openExternalUrl } from "@/lib/openExternal";
import { getCategory } from "@/data/storeCategories";
import { AffiliateProduct } from "./ProductCard";

interface ProductDetailsModalProps {
  product: AffiliateProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);

export const ProductDetailsModal = ({
  product,
  open,
  onOpenChange,
}: ProductDetailsModalProps) => {
  const handleBuy = () => {
    openExternalUrl(product.affiliate_url);
  };

  const category = getCategory(product.category);
  const subcategoryLabel =
    product.subcategory && category
      ? category.subcategories.find((s) => s.key === product.subcategory)?.label
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md mx-auto p-0 gap-0 rounded-3xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-hidden"
      >
        <div className="overflow-y-auto max-h-[85vh] flex flex-col">
          {/* Imagem */}
          <div className="aspect-square bg-muted overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Conteúdo */}
          <div className="p-5 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground leading-tight pr-8">
              {product.name}
            </h2>

            {product.price != null && (
              <p className="text-2xl font-bold text-primary">
                {formatPrice(Number(product.price))}
              </p>
            )}

            {(category || subcategoryLabel) && (
              <div className="flex flex-wrap gap-2">
                {category && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {category.label}
                  </span>
                )}
                {subcategoryLabel && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                    {subcategoryLabel}
                  </span>
                )}
              </div>
            )}

            {product.description && (
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            <Button
              onClick={handleBuy}
              className="mt-2 w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-11 text-sm font-semibold"
            >
              <ShoppingBag className="w-4 h-4" />
              Comprar agora
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
