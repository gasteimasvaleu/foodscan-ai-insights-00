import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Store, Truck, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MFHeader } from "@/components/mercado-facil/MFHeader";

import { MFProductCard } from "@/components/mercado-facil/MFProductCard";
import type { MFCategoria, MFLoja, MFProduto } from "@/lib/mercado-facil/types";

type QuickFilter = "ofertas" | "menor_preco" | "promocoes" | "novidades" | null;
const ADDRESS_KEY = "mf_delivery_address_v1";


const MercadoFacilIndex = () => {
  const [categorias, setCategorias] = useState<MFCategoria[]>([]);
  const [lojas, setLojas] = useState<MFLoja[]>([]);
  const [produtos, setProdutos] = useState<MFProduto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAllCats, setShowAllCats] = useState(false);
  const [localizacao, setLocalizacao] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADDRESS_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        const parts = [v.cidade, v.endereco].filter(Boolean).join(" — ");
        if (parts) setLocalizacao(parts);
      }
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      const [c, l, p] = await Promise.all([
        supabase.from("mf_categorias").select("*").eq("ativo", true).order("order"),
        supabase.from("mf_lojas").select("*").eq("ativa", true).order("nome").limit(20),
        supabase.from("mf_produtos").select("*").eq("ativo", true).order("created_at", { ascending: false }).limit(500),
      ]);
      setCategorias((c.data ?? []) as MFCategoria[]);
      setLojas((l.data ?? []) as MFLoja[]);
      setProdutos((p.data ?? []) as MFProduto[]);
      setLoading(false);
    })();
  }, []);

  const lojaNomeById = useMemo(
    () => Object.fromEntries(lojas.map((l) => [l.id, l.nome])) as Record<string, string>,
    [lojas]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = produtos;
    if (q) arr = arr.filter((p) => p.nome.toLowerCase().includes(q));
    if (quickFilter === "ofertas") {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      arr = arr.filter((p) => p.created_at && new Date(p.created_at) >= today);
    } else if (quickFilter === "promocoes") {
      arr = arr.filter((p) => p.preco_promo_centavos != null);
    } else if (quickFilter === "menor_preco") {
      arr = [...arr].sort((a, b) => (a.preco_promo_centavos ?? a.preco_centavos) - (b.preco_promo_centavos ?? b.preco_centavos));
    } else if (quickFilter === "novidades") {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      arr = arr
        .filter((p) => p.created_at && new Date(p.created_at) >= seteDiasAtras)
        .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    }
    return arr;
  }, [search, produtos, quickFilter]);

  const quickButtons: { id: Exclude<QuickFilter, null>; label: string }[] = [
    { id: "ofertas", label: "Ofertas do Dia" },
    { id: "menor_preco", label: "Menor Preço" },
    { id: "promocoes", label: "Promoções" },
    { id: "novidades", label: "Novidades" },
  ];

  const handleSaveLocalizacao = (val: string) => {
    setLocalizacao(val);
    try {
      const raw = localStorage.getItem(ADDRESS_KEY);
      const cur = raw ? JSON.parse(raw) : {};
      const [cidade, ...rest] = val.split(" — ");
      localStorage.setItem(ADDRESS_KEY, JSON.stringify({ ...cur, cidade: cidade ?? val, endereco: rest.join(" — ") || cur.endereco || "" }));
    } catch {}
  };

  const showFiltered = !!search.trim() || quickFilter !== null;


  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title="Mercado Fácil" backTo="/" />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-40 px-4 max-w-2xl mx-auto space-y-6">
        <div className="bg-white border border-[#FD46A1]/30 rounded-3xl pr-4 py-0 pl-0 shadow-sm flex items-stretch gap-3 overflow-hidden">
          <img
            src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/galegacomsacola.png"
            alt=""
            className="w-32 h-32 object-contain object-bottom self-end shrink-0"
          />
          <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-[#FD46A1]/40 bg-gradient-to-br from-[#FFD1E7] via-white to-[#FFE9F3] p-3 my-3 shadow-sm">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shine"
            />
            <h2 className="relative text-base font-semibold text-[#FD46A1] leading-tight">
              Compare Preços e Economize
            </h2>
            <p className="relative text-xs text-foreground/70 mt-1">
              Encontre os melhores preços em supermercados próximos a você
            </p>
          </div>


        </div>

        <section className="grid grid-cols-2 gap-2">
          <Link
            to="/mercado-facil/lojista"
            className="bg-[#FD46A1] text-white rounded-2xl px-3 py-2 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Store size={16} />
            <span className="text-sm">Sou Lojista</span>
          </Link>
          <Link
            to="/mercado-facil/entregador"
            className="bg-white border border-[#FD46A1] text-[#FD46A1] rounded-2xl px-3 py-2 flex items-center gap-2 hover:bg-[#FFD1E7]/40 transition-colors"
          >
            <Truck size={16} />
            <span className="text-sm">Sou Entregador</span>
          </Link>
        </section>



        <div className="bg-white border border-[#FD46A1]/30 rounded-3xl p-3 space-y-2 shadow-sm">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="Buscar produtos, marcas ou lojas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-2xl bg-[#F4F6F8] text-base outline-none placeholder:text-foreground/40"
            />
          </div>
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="Sua localização..."
              value={localizacao}
              onChange={(e) => handleSaveLocalizacao(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-2xl bg-[#F4F6F8] text-base outline-none placeholder:text-foreground/40"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {quickButtons.map((b) => {
              const active = quickFilter === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setQuickFilter(active ? null : b.id)}
                  className={`h-11 rounded-2xl text-base transition-colors ${active ? "bg-[#FD46A1] text-white" : "bg-[#FD46A1]/90 text-white hover:bg-[#FD46A1]"}`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {showFiltered ? (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">
                {quickFilter ? quickButtons.find((q) => q.id === quickFilter)?.label : "Resultados"}
              </h2>
              {quickFilter && (
                <button onClick={() => setQuickFilter(null)} className="text-xs text-[#FD46A1]">limpar</button>
              )}
            </div>
            {filtered.length === 0 ? (
              <p className="text-sm text-foreground/60">Nenhum produto encontrado.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((p) => <MFProductCard key={p.id} produto={p} lojaNome={lojaNomeById[p.loja_id]} />)}
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
                    className="bg-white border border-[#FD46A1]/30 rounded-2xl px-4 py-3 flex items-center gap-3 hover:shadow-md transition-shadow"
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
                      className="flex items-center gap-3 bg-white border border-[#FD46A1]/30 rounded-3xl p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#FFD1E7] overflow-hidden shrink-0">
                        {l.foto_url ? (
                          <img src={l.foto_url} alt={l.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base text-foreground truncate">{l.nome}</p>
                        {l.descricao && (
                          <p className="text-xs text-foreground/60 line-clamp-2">{l.descricao}</p>
                        )}
                      </div>
                      {(() => {
                        const partes = [l.endereco?.bairro, l.endereco?.cidade].filter(Boolean);
                        if (partes.length === 0) return null;
                        return (
                          <p className="text-xs text-foreground/60 text-right shrink-0 max-w-[40%] line-clamp-2">
                            {partes.join(" · ")}
                          </p>
                        );
                      })()}
                    </Link>

                  ))}
                </div>
              )}
            </section>

            {produtos.length > 0 && (
              <section>
                <h2 className="text-base font-semibold mb-3">Novidades</h2>
                <div className="grid grid-cols-3 gap-2">
                  {produtos.slice(0, 12).map((p) => <MFProductCard key={p.id} produto={p} lojaNome={lojaNomeById[p.loja_id]} />)}

                </div>
              </section>
            )}



          </>
        )}
      </main>
      
    </div>
  );
};

export default MercadoFacilIndex;
