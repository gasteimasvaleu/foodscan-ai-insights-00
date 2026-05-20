import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OfertaDestaque {
  id: string;
  nome: string;
  foto_url: string | null;
  preco_centavos: number;
  preco_promo_centavos: number;
  desconto_pct: number;
  loja: {
    id: string;
    nome: string;
    foto_url: string | null;
  } | null;
}

export function useOfertasDestaque() {
  return useQuery({
    queryKey: ["mf-ofertas-destaque"],
    staleTime: 30 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<OfertaDestaque[]> => {
      const { data, error } = await supabase
        .from("mf_produtos")
        .select(
          "id, nome, foto_url, preco_centavos, preco_promo_centavos, loja:mf_lojas!inner(id, nome, foto_url, ativa)"
        )
        .eq("ativo", true)
        .not("preco_promo_centavos", "is", null)
        .limit(60);

      if (error) throw error;

      const rows = (data ?? []) as any[];
      const mapped: OfertaDestaque[] = rows
        .filter(
          (r) =>
            r.loja?.ativa === true &&
            typeof r.preco_promo_centavos === "number" &&
            r.preco_promo_centavos < r.preco_centavos
        )
        .map((r) => {
          const desconto_pct = Math.round(
            ((r.preco_centavos - r.preco_promo_centavos) / r.preco_centavos) * 100
          );
          return {
            id: r.id,
            nome: r.nome,
            foto_url: r.foto_url,
            preco_centavos: r.preco_centavos,
            preco_promo_centavos: r.preco_promo_centavos,
            desconto_pct,
            loja: r.loja
              ? { id: r.loja.id, nome: r.loja.nome, foto_url: r.loja.foto_url }
              : null,
          };
        })
        .sort((a, b) => b.desconto_pct - a.desconto_pct)
        .slice(0, 12);

      return mapped;
    },
  });
}
