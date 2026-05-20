import { Link } from "react-router-dom";
import { ArrowRight, Tag } from "lucide-react";
import { useOfertasDestaque, type OfertaDestaque } from "@/hooks/mercado-facil/useOfertasDestaque";
import { formatCentavos } from "@/lib/mercado-facil/formatters";

const OfertaCard = ({ oferta }: { oferta: OfertaDestaque }) => (
  <Link
    to={`/mercado-facil/produto/${oferta.id}`}
    className="relative shrink-0 w-[240px] h-[320px] rounded-3xl overflow-hidden snap-center bg-[#FFD1E7] shadow-sm hover:shadow-md transition-shadow"
  >
    {oferta.foto_url ? (
      <img
        src={oferta.foto_url}
        alt={oferta.nome}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center text-6xl">🛒</div>
    )}

    {/* overlay gradiente embaixo */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

    {/* tag desconto */}
    <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-[#FD46A1] text-white text-xs font-semibold rounded-full px-2.5 py-1 shadow-sm">
      <Tag className="w-3 h-3" />
      -{oferta.desconto_pct}%
    </div>

    {/* conteúdo */}
    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
      <p className="text-base leading-tight line-clamp-2">{oferta.nome}</p>
      {oferta.loja && (
        <p className="text-xs text-white/70 mt-1 truncate">{oferta.loja.nome}</p>
      )}

      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-white/60 line-through">
            {formatCentavos(oferta.preco_centavos)}
          </p>
          <p className="text-lg font-semibold text-[#FFD1E7] leading-tight">
            {formatCentavos(oferta.preco_promo_centavos)}
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FD46A1] text-white shadow-sm">
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  </Link>
);

export const OfertasDestaqueCarousel = () => {
  const { data, isLoading } = useOfertasDestaque();

  if (isLoading) {
    return (
      <section>
        <h2 className="text-base mb-3">Ofertas em destaque</h2>
        <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="shrink-0 w-[240px] h-[320px] rounded-3xl bg-[#FFD1E7]/60 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-base">Ofertas em destaque</h2>
        <span className="text-xs text-foreground/60">{data.length} produtos</span>
      </div>
      <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 snap-x snap-mandatory scrollbar-hide">
        {data.map((oferta) => (
          <OfertaCard key={oferta.id} oferta={oferta} />
        ))}
      </div>
    </section>
  );
};
