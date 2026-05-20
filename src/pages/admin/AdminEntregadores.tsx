import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Shield } from "lucide-react";
import type { MFEntregador, MFEntregadorStatus } from "@/lib/mercado-facil/entregador-types";
import { VEICULO_LABEL } from "@/lib/mercado-facil/entregador-types";

const STATUS_TABS: { key: MFEntregadorStatus; label: string }[] = [
  { key: "pendente", label: "Pendentes" },
  { key: "aprovado", label: "Aprovados" },
  { key: "recusado", label: "Recusados" },
  { key: "suspenso", label: "Suspensos" },
];

const AdminEntregadores = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [filter, setFilter] = useState<MFEntregadorStatus>("pendente");
  const [items, setItems] = useState<MFEntregador[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, { cnh?: string; foto?: string }>>({});

  useEffect(() => {
    const check = async () => {
      if (!user) return;
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
      setChecking(false);
    };
    if (!loading) {
      if (!user) navigate("/auth");
      else check();
    }
  }, [user, loading, navigate]);

  const load = async () => {
    const { data, error } = await supabase
      .from("mf_entregadores")
      .select("*")
      .eq("status", filter)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    const list = (data ?? []) as MFEntregador[];
    setItems(list);

    // Sign URLs
    const urls: Record<string, { cnh?: string; foto?: string }> = {};
    await Promise.all(
      list.map(async (e) => {
        const entry: { cnh?: string; foto?: string } = {};
        if (e.cnh_url) {
          const { data: s } = await supabase.storage
            .from("mercado-facil-entregadores")
            .createSignedUrl(e.cnh_url, 3600);
          if (s?.signedUrl) entry.cnh = s.signedUrl;
        }
        if (e.foto_url) {
          const { data: s } = await supabase.storage
            .from("mercado-facil-entregadores")
            .createSignedUrl(e.foto_url, 3600);
          if (s?.signedUrl) entry.foto = s.signedUrl;
        }
        urls[e.id] = entry;
      })
    );
    setSignedUrls(urls);
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, filter]);

  const updateStatus = async (id: string, status: MFEntregadorStatus) => {
    const { error } = await supabase.from("mf_entregadores").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Atualizado", description: `Status alterado para ${status}.` });
    load();
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFB]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD46A1]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFB] p-4">
        <div className="bg-white rounded-3xl p-6 text-center max-w-md">
          <Shield className="mx-auto h-12 w-12 text-destructive mb-2" />
          <h2 className="text-lg font-semibold">Acesso negado</h2>
          <Button onClick={() => navigate("/")} variant="outline" className="mt-4 rounded-2xl">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFB]">
      <MFHeader title="Admin · Entregadores" backTo="/admin" showCart={false} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                filter === t.key
                  ? "bg-[#FD46A1] text-white"
                  : "bg-white text-foreground/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-foreground/60 text-center py-8">
            Nenhum entregador {STATUS_TABS.find((s) => s.key === filter)?.label.toLowerCase()}.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((e) => {
              const urls = signedUrls[e.id] ?? {};
              return (
                <li key={e.id} className="bg-white rounded-3xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {urls.foto ? (
                      <img
                        src={urls.foto}
                        alt={e.nome_completo}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-[#FFD1E7]" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold">{e.nome_completo}</p>
                      <p className="text-xs text-foreground/60">{e.telefone_whatsapp}</p>
                      <p className="text-xs text-foreground/60">
                        {e.cidade}/{e.estado} · {VEICULO_LABEL[e.veiculo]}
                      </p>
                      {e.documento && (
                        <p className="text-xs text-foreground/60">Doc: {e.documento}</p>
                      )}
                      <p className="text-xs text-foreground/60">
                        Raio {e.raio_atendimento_km} km · {e.total_entregas} entregas · ⭐ {Number(e.avaliacao_media).toFixed(1)}
                      </p>
                    </div>
                  </div>

                  {urls.cnh && (
                    <a
                      href={urls.cnh}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#FD46A1] underline"
                    >
                      Ver CNH/documento
                    </a>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {filter !== "aprovado" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(e.id, "aprovado")}
                        className="rounded-2xl bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white"
                      >
                        Aprovar
                      </Button>
                    )}
                    {filter !== "recusado" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(e.id, "recusado")}
                        className="rounded-2xl"
                      >
                        Recusar
                      </Button>
                    )}
                    {filter !== "suspenso" && filter !== "pendente" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(e.id, "suspenso")}
                        className="rounded-2xl"
                      >
                        Suspender
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
};

export default AdminEntregadores;
