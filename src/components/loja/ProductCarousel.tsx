import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ProductCard, AffiliateProduct } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface ProductCarouselProps {
  title: string;
  products: AffiliateProduct[];
  onSeeAll?: () => void;
  emptyMessage?: string;
}

export const ProductCarousel = ({
  title,
  products,
  onSeeAll,
  emptyMessage = "Nenhum produto disponível ainda.",
}: ProductCarouselProps) => {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold text-primary">{title}</h2>
        {onSeeAll && products.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSeeAll}
            className="text-primary hover:text-primary h-auto py-1 px-2 gap-0.5"
          >
            Ver tudo
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="bg-white/60 rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <Carousel
          opts={{ align: "start", dragFree: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 py-2">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-3 basis-[38%] sm:basis-[28%]"
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  );
};
