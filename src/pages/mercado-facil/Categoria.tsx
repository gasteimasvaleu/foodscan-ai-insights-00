import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { MFProductCard } from "@/components/mercado-facil/MFProductCard";
import { MFCategoryHero } from "@/components/mercado-facil/MFCategoryHero";
import type { MFCategoria, MFProduto } from "@/lib/mercado-facil/types";

const ADDRESS_KEY = "mf_delivery_address_v1";

type LojaMini = { id: string; nome: string; cidade: string | null };

const Categoria = () => {
  const { slug } = useParams<{ slug: string }>();
  const [cat, setCat] = useState<MFCategoria | null>(null);
  const [produtos, setProdutos] = useState<MFProduto[]>([]);
  const [lojaById, setLojaById] = useState<Record<string, LojaMini>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cidade, setCidade] = useState<string>("");

  // Pré-seleciona cidade salva
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADDRESS_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        if (v?.cidade) setCidade(String(v.cidade));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: c } = await supabase.from("mf_categorias").select("*").eq("slug", slug).maybeSingle();
      setCat((c as MFCategoria) ?? null);
      if (c) {
        const { data: p } = await supabase
          .from("mf_produtos")
          .select("*")
          .eq("categoria_id", (c as MFCategoria).id)
          .eq("ativo", true)
          .order("nome");
        const prods = (p ?? []) as MFProduto[];
        setProdutos(prods);
        const ids = Array.from(new Set(prods.map((x) => x.loja_id).filter(Boolean)));
        if (ids.length > 0) {
          const { data: ls } = await supabase.from("mf_lojas").select("id,nome,endereco").in("id", ids);
          const map: Record<string, LojaMini> = {};
          (ls ?? []).forEach((l: any) => {
            map[l.id] = { id: l.id, nome: l.nome, cidade: l.endereco?.cidade ?? null };
          });
          setLojaById(map);
        }
      }
      setLoading(false);
    })();
  }, [slug]);

  const cidadesDisponiveis = useMemo(() => {
    const set = new Set<string>();
    produtos.forEach((p) => {
      const c = lojaById[p.loja_id]?.cidade;
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [produtos, lojaById]);

  const cidadeAtiva = cidade && cidadesDisponiveis.includes(cidade) ? cidade : "";

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    return produtos.filter((p) => {
      if (term && !p.nome?.toLowerCase().includes(term)) return false;
      if (cidadeAtiva && lojaById[p.loja_id]?.cidade !== cidadeAtiva) return false;
      return true;
    });
  }, [produtos, q, cidadeAtiva, lojaById]);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title={cat?.name ?? "Categoria"} backTo="/mercado-facil" />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto">
        {cat && <MFCategoryHero slug={cat.slug} name={cat.name} emoji={cat.icon_emoji} />}
        <div className="space-y-2 mb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar nesta categoria..."
              className="w-full h-10 pl-9 pr-3 rounded-full bg-white/70 backdrop-blur-md border border-[#FD46A1]/40 text-base outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FD46A1] z-10 pointer-events-none" />
            <select
              value={cidadeAtiva}
              onChange={(e) => setCidade(e.target.value)}
              disabled={cidadesDisponiveis.length === 0}
              className="w-full h-10 pl-9 pr-8 rounded-full bg-white/70 backdrop-blur-md border border-[#FD46A1]/40 text-base outline-none focus:ring-2 focus:ring-primary/30 appearance-none disabled:opacity-60"
            >
              <option value="">Todas as cidades</option>
              {cidadesDisponiveis.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <p className="text-sm text-foreground/60">Carregando...</p>
        ) : filtrados.length === 0 ? (
          <p className="text-sm text-foreground/60">
            {produtos.length === 0
              ? "Nenhum produto nessa categoria ainda."
              : cidadeAtiva
                ? `Nenhum produto encontrado em ${cidadeAtiva}.`
                : "Nenhum produto encontrado."}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filtrados.map((p) => (
              <MFProductCard key={p.id} produto={p} lojaNome={lojaById[p.loja_id]?.nome} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Categoria;
