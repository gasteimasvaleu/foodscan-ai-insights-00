import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Store, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { MFProductCard } from "@/components/mercado-facil/MFProductCard";
import type { MFCategoria, MFLoja, MFProduto } from "@/lib/mercado-facil/types";

const MercadoFacilIndex = () => {
  const [categorias, setCategorias] = useState<MFCategoria[]>([]);
  const [lojas, setLojas] = useState<MFLoja[]>([]);
  const [produtos, setProdutos] = useState<MFProduto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAllCats, setShowAllCats] = useState(false);

  useEffect(() => {
    (async () => {
      const [c, l, p] = await Promise.all([
        supabase.from("mf_categorias").select("*").eq("ativo", true).order("order"),
        supabase.from("mf_lojas").select("*").eq("ativa", true).order("nome").limit(20),
        supabase.from("mf_produtos").select("*").eq("ativo", true).order("created_at", { ascending: false }).limit(20),
      ]);
      setCategorias((c.data ?? []) as MFCategoria[]);
      setLojas((l.data ?? []) as MFLoja[]);
      setProdutos((p.data ?? []) as MFProduto[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return produtos.filter((p) => p.nome.toLowerCase().includes(q));
  }, [search, produtos]);

  return (
    <div className="min-h-screen bg-[#F7FAFB]">
      <MFHeader title="Mercado Fácil" backTo="/" />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto space-y-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-2xl bg-white text-base"
          />
        </div>

        {search ? (
          <section>
            <h2 className="text-base font-semibold mb-3">Resultados</h2>
            {filtered.length === 0 ? (
              <p className="text-sm text-foreground/60">Nenhum produto encontrado.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((p) => <MFProductCard key={p.id} produto={p} />)}
              </div>
            )}
          </section>
        ) : (
          <>
            <section>
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">Explore Categorias</h2>
                <p className="text-sm text-foreground/60 mt-1">
                  Encontre exatamente o que precisa navegando pelas nossas categorias organizadas
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(showAllCats ? categorias : categorias.slice(0, 12)).map((c) => (
                  <Link
                    key={c.id}
                    to={`/mercado-facil/categoria/${c.slug}`}
                    className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 hover:shadow-md transition-shadow"
                  >
                    <span className="text-xl shrink-0">{c.icon_emoji ?? "🛒"}</span>
                    <span className="text-base text-foreground truncate">{c.name}</span>
                  </Link>
                ))}
              </div>
              {categorias.length > 12 && (
                <button
                  onClick={() => setShowAllCats((v) => !v)}
                  className="mt-3 w-full bg-[#FD46A1] text-white rounded-2xl py-3 text-base hover:opacity-90 transition-opacity"
                >
                  {showAllCats ? "Ver menos" : "Ver mais"}
                </button>
              )}
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3">Lojas</h2>
              {loading ? (
                <p className="text-sm text-foreground/60">Carregando...</p>
              ) : lojas.length === 0 ? (
                <p className="text-sm text-foreground/60">Nenhuma loja disponível ainda.</p>
              ) : (
                <div className="space-y-3">
                  {lojas.map((l) => (
                    <Link
                      key={l.id}
                      to={`/mercado-facil/loja/${l.id}`}
                      className="flex items-center gap-3 bg-white rounded-3xl p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#FFD1E7] overflow-hidden shrink-0">
                        {l.foto_url ? (
                          <img src={l.foto_url} alt={l.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base text-foreground truncate">{l.nome}</p>
                        {l.descricao && (
                          <p className="text-xs text-foreground/60 line-clamp-2">{l.descricao}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {produtos.length > 0 && (
              <section>
                <h2 className="text-base font-semibold mb-3">Novidades</h2>
                <div className="grid grid-cols-2 gap-3">
                  {produtos.slice(0, 8).map((p) => <MFProductCard key={p.id} produto={p} />)}
                </div>
              </section>
            )}

            <section className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/mercado-facil/lojista"
                className="bg-[#FD46A1] text-white rounded-3xl p-4 flex flex-col items-start gap-2 hover:opacity-90 transition-opacity"
              >
                <Store size={22} />
                <span className="text-base">Sou Lojista</span>
                <span className="text-xs opacity-90">Cadastre sua loja e venda pelo WhatsApp</span>
              </Link>
              <Link
                to="/mercado-facil/entregador"
                className="bg-white border-2 border-[#FD46A1] text-[#FD46A1] rounded-3xl p-4 flex flex-col items-start gap-2 hover:bg-[#FFD1E7]/40 transition-colors"
              >
                <Truck size={22} />
                <span className="text-base">Sou Entregador</span>
                <span className="text-xs opacity-90">Faça entregas na sua cidade</span>
              </Link>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default MercadoFacilIndex;
