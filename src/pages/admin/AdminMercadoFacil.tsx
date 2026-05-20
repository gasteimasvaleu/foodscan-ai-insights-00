import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import type { MFLoja } from "@/lib/mercado-facil/types";

const AdminMercadoFacil = () => {
  const [lojas, setLojas] = useState<MFLoja[]>([]);

  const load = async () => {
    const { data } = await supabase.from("mf_lojas").select("*").order("created_at", { ascending: false });
    setLojas((data ?? []) as MFLoja[]);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (l: MFLoja) => {
    const { error } = await supabase.from("mf_lojas").update({ ativa: !l.ativa }).eq("id", l.id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    await load();
  };

  return (
    <div className="min-h-screen bg-[#F7FAFB]">
      <MFHeader title="Admin · Mercado Fácil" backTo="/admin" showCart={false} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto space-y-3">
        <h2 className="text-base font-semibold">Lojas</h2>
        {lojas.length === 0 ? (
          <p className="text-sm text-foreground/60">Nenhuma loja cadastrada.</p>
        ) : (
          <ul className="space-y-2">
            {lojas.map((l) => (
              <li key={l.id} className="bg-white rounded-3xl p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{l.nome}</p>
                  <p className="text-xs text-foreground/60">{l.telefone_whatsapp}</p>
                  <p className="text-xs text-foreground/60">{l.ativa ? "Ativa" : "Inativa"}</p>
                </div>
                <Button
                  onClick={() => toggle(l)}
                  variant={l.ativa ? "outline" : "default"}
                  className="rounded-2xl"
                >
                  {l.ativa ? "Desativar" : "Ativar"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default AdminMercadoFacil;
