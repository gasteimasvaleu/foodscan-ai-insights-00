import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { MFProductCard } from "@/components/mercado-facil/MFProductCard";
import type { MFCategoria, MFProduto } from "@/lib/mercado-facil/types";

const Categoria = () => {
  const { slug } = useParams<{ slug: string }>();
  const [cat, setCat] = useState<MFCategoria | null>(null);
  const [produtos, setProdutos] = useState<MFProduto[]>([]);
  const [loading, setLoading] = useState(true);

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
        setProdutos((p ?? []) as MFProduto[]);
      }
      setLoading(false);
    })();
  }, [slug]);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title={cat?.name ?? "Categoria"} backTo="/mercado-facil" />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto">
        {loading ? (
          <p className="text-sm text-foreground/60">Carregando...</p>
        ) : produtos.length === 0 ? (
          <p className="text-sm text-foreground/60">Nenhum produto nessa categoria ainda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {produtos.map((p) => <MFProductCard key={p.id} produto={p} />)}
          </div>
        )}
      </main>
    </div>
  );
};

export default Categoria;
