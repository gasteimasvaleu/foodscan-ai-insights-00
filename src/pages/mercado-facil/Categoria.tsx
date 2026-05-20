import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { MFProductCard } from "@/components/mercado-facil/MFProductCard";
import { MFCategoryHero } from "@/components/mercado-facil/MFCategoryHero";
import type { MFCategoria, MFProduto } from "@/lib/mercado-facil/types";

const Categoria = () => {
  const { slug } = useParams<{ slug: string }>();
  const [cat, setCat] = useState<MFCategoria | null>(null);
  const [produtos, setProdutos] = useState<MFProduto[]>([]);
  const [lojaNomeById, setLojaNomeById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

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
          const { data: ls } = await supabase.from("mf_lojas").select("id,nome").in("id", ids);
          setLojaNomeById(Object.fromEntries((ls ?? []).map((l: any) => [l.id, l.nome])));
        }
      }
      setLoading(false);
    })();
  }, [slug]);

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return produtos;
    return produtos.filter((p) => p.nome?.toLowerCase().includes(term));
  }, [produtos, q]);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title={cat?.name ?? "Categoria"} backTo="/mercado-facil" />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto">
        {cat && <MFCategoryHero slug={cat.slug} name={cat.name} emoji={cat.icon_emoji} />}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar nesta categoria..."
            className="w-full h-10 pl-9 pr-3 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-base outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {loading ? (
          <p className="text-sm text-foreground/60">Carregando...</p>
        ) : filtrados.length === 0 ? (
          <p className="text-sm text-foreground/60">
            {produtos.length === 0 ? "Nenhum produto nessa categoria ainda." : "Nenhum produto encontrado."}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filtrados.map((p) => <MFProductCard key={p.id} produto={p} />)}
          </div>
        )}
      </main>
    </div>
  );
};

export default Categoria;
