import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { MFProductCard } from "@/components/mercado-facil/MFProductCard";
import type { MFLoja, MFProduto } from "@/lib/mercado-facil/types";

type MFCategoria = { id: string; name: string; icon_emoji: string | null; order: number | null };

const Loja = () => {
  const { id } = useParams<{ id: string }>();
  const [loja, setLoja] = useState<MFLoja | null>(null);
  const [produtos, setProdutos] = useState<MFProduto[]>([]);
  const [categorias, setCategorias] = useState<MFCategoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [l, p, c] = await Promise.all([
        supabase.from("mf_lojas").select("*").eq("id", id).maybeSingle(),
        supabase.from("mf_produtos").select("*").eq("loja_id", id).eq("ativo", true).order("nome"),
        supabase.from("mf_categorias").select("id,name,icon_emoji,order").eq("ativo", true).order("order"),
      ]);
      setLoja((l.data as MFLoja) ?? null);
      setProdutos((p.data ?? []) as MFProduto[]);
      setCategorias((c.data ?? []) as MFCategoria[]);
      setLoading(false);
    })();
  }, [id]);

  const grupos = useMemo(() => {
    const byCat = new Map<string | null, MFProduto[]>();
    for (const prod of produtos) {
      const key = prod.categoria_id ?? null;
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key)!.push(prod);
    }
    const ordered: { id: string | null; name: string; emoji: string | null; items: MFProduto[] }[] = [];
    for (const cat of categorias) {
      const items = byCat.get(cat.id);
      if (items?.length) ordered.push({ id: cat.id, name: cat.name, emoji: cat.icon_emoji, items });
    }
    const outros = byCat.get(null);
    if (outros?.length) ordered.push({ id: null, name: "Outros", emoji: "🛒", items: outros });
    return ordered;
  }, [produtos, categorias]);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title={loja?.nome ?? "Loja"} backTo="/mercado-facil" />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto space-y-4">
        {loading ? (
          <p className="text-sm text-foreground/60">Carregando...</p>
        ) : !loja ? (
          <p className="text-sm text-foreground/60">Loja não encontrada.</p>
        ) : (
          <>
            <div className="bg-white border border-[#FD46A1]/30 rounded-3xl overflow-hidden shadow-sm">
              <div className="relative h-28 bg-gradient-to-r from-[#FD46A1] to-[#FF8FC4] overflow-hidden">
                {(loja.banner_url || loja.foto_url) && (
                  <img
                    src={loja.banner_url || loja.foto_url!}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="px-4 pb-4 -mt-12 relative z-10">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-[#FFD1E7] overflow-hidden shadow-md">
                  {loja.foto_url ? (
                    <img src={loja.foto_url} alt={loja.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-[#FD46A1] font-semibold">
                      {loja.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold mt-3 text-foreground">{loja.nome}</h2>
                {loja.descricao && <p className="text-sm text-foreground/60 mt-1">{loja.descricao}</p>}
                {loja.endereco?.bairro && (
                  <p className="text-xs text-foreground/50 mt-1">
                    {[loja.endereco.bairro, loja.endereco.cidade].filter(Boolean).join(" — ")}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-[#FFD1E7] rounded-2xl py-3 flex flex-col items-center">
                    <span className="text-lg font-bold text-foreground">{produtos.length}</span>
                    <span className="text-[10px] tracking-wider text-foreground/60 mt-0.5">PRODUTOS</span>
                  </div>
                  <div className="bg-[#FFD1E7] rounded-2xl py-3 flex flex-col items-center">
                    <span className="text-lg font-bold text-foreground">
                      {new Set(produtos.map((p) => p.categoria_id).filter(Boolean)).size}
                    </span>
                    <span className="text-[10px] tracking-wider text-foreground/60 mt-0.5">CATEGORIAS</span>
                  </div>
                  <div className="bg-[#FFD1E7] rounded-2xl py-3 flex flex-col items-center">
                    <span className="text-lg font-bold text-foreground">
                      {produtos.filter((p) => p.preco_promo_centavos).length}
                    </span>
                    <span className="text-[10px] tracking-wider text-foreground/60 mt-0.5">PROMOÇÕES</span>
                  </div>
                </div>
              </div>
            </div>

            {produtos.length === 0 ? (
              <p className="text-sm text-foreground/60">Esta loja ainda não cadastrou produtos.</p>
            ) : (
              <div className="space-y-5">
                {grupos.map((g) => (
                  <section key={g.id ?? "outros"}>
                    <h3 className="text-base font-semibold mb-2 px-1">
                      {g.emoji && <span className="mr-1">{g.emoji}</span>}
                      {g.name} <span className="text-foreground/40 text-sm">({g.items.length})</span>
                    </h3>
                    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 scrollbar-hide">
                      {g.items.map((p) => (
                        <div key={p.id} className="snap-start shrink-0 w-40">
                          <MFProductCard produto={p} lojaId={loja.id} />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Loja;
