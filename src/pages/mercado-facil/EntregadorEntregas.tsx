import { Loader2, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { openExternalUrl } from "@/lib/openExternal";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { MFEntregaProgress } from "@/components/mercado-facil/MFEntregaProgress";
import { Button } from "@/components/ui/button";
import { useMFEntregador } from "@/hooks/mercado-facil/useMFEntregador";
import { useMFEntregas } from "@/hooks/mercado-facil/useMFEntregas";
import { cleanPhone, formatBRL } from "@/lib/mercado-facil/formatters";

const EntregadorEntregas = () => {
  const { entregador, loading } = useMFEntregador();

  const { entregas: ativas, marcarColetada, marcarEntregue, aceitar } = useMFEntregas({
    scope: "entregador-ativa",
    entregadorId: entregador?.id,
  });

  const { entregas: disponiveis } = useMFEntregas({
    scope: "entregador-disponivel",
    cidade: entregador?.status === "aprovado" && entregador.disponivel ? entregador.cidade : undefined,
  });

  if (loading || !entregador) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FD46A1]" />
      </div>
    );
  }

  const openWA = (phone: string | null) => {
    if (!phone) return;
    openExternalUrl(`https://wa.me/${cleanPhone(phone)}`);
  };

  const tempoRelativo = (iso: string) => {
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const min = Math.floor(diff / 60000);
    if (min < 1) return "agora";
    if (min < 60) return `há ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `há ${h} h`;
    const d = Math.floor(h / 24);
    return `há ${d} d`;
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title="Minhas Entregas" backTo="/mercado-facil/entregador" showCart={false} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-xl mx-auto space-y-4">
        <section>
          <div className="bg-[#FFD1E7] rounded-2xl px-3 py-2 mb-2">
            <h3 className="text-base text-[#FD46A1]">Em andamento</h3>
          </div>
          {ativas.length === 0 ? (
            <div className="bg-white border border-[#FD46A1]/30 rounded-3xl p-6 text-center text-sm text-foreground/60">
              Você não tem entregas em andamento.
            </div>
          ) : (
            <div className="space-y-3">
              {ativas.map((e) => (
                <div key={e.id} className="bg-white border border-[#FD46A1]/30 rounded-3xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm flex-1 pr-2">{e.endereco_entrega}</p>
                    <span className="text-[#FD46A1] font-bold whitespace-nowrap">{e.taxa_centavos > 0 ? formatBRL(e.taxa_centavos) : "A combinar"}</span>
                  </div>
                  {(e.status === "aceita" || e.status === "coletada" || e.status === "entregue") && (
                    <MFEntregaProgress status={e.status as "aceita" | "coletada" | "entregue"} />
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-2xl"
                      onClick={() => openWA(e.telefone_lojista)}
                    >
                      <MessageCircle size={14} className="mr-1" /> Loja
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-2xl"
                      onClick={() => openWA(e.telefone_cliente)}
                    >
                      <MessageCircle size={14} className="mr-1" /> Cliente
                    </Button>
                  </div>
                  {e.status === "aceita" && (
                    <Button
                      onClick={() => marcarColetada(e.id)}
                      className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl"
                    >
                      Marcar como coletada
                    </Button>
                  )}
                  {e.status === "coletada" && (
                    <Button
                      onClick={() => marcarEntregue(e.id)}
                      className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl"
                    >
                      Marcar como entregue
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {entregador.status === "aprovado" && entregador.disponivel && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base">Disponíveis para aceitar</h3>
              {disponiveis.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD1E7] text-[#FD46A1]">
                  {disponiveis.length}
                </span>
              )}
            </div>
            {disponiveis.length === 0 ? (
              <div className="bg-white border border-[#FD46A1]/30 rounded-3xl p-6 text-center text-sm text-foreground/60">
                Nenhuma entrega disponível agora. Assim que aparecer, ela cai aqui.
              </div>
            ) : (
              <div className="space-y-3">
                {disponiveis.map((e) => {
                  const isNova = Date.now() - new Date(e.created_at).getTime() < 2 * 60 * 1000;
                  return (
                    <div
                      key={e.id}
                      className="bg-white border border-[#FD46A1]/30 rounded-3xl p-4 space-y-3 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isNova && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFD1E7] text-[#FD46A1] flex items-center gap-1">
                              <Sparkles size={10} /> Nova
                            </span>
                          )}
                          <span className="text-xs text-foreground/60">{tempoRelativo(e.created_at)}</span>
                        </div>
                        <span className="text-lg font-bold text-[#FD46A1] whitespace-nowrap">
                          {e.taxa_centavos > 0 ? formatBRL(e.taxa_centavos) : "A combinar"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-[#FD46A1] mt-0.5 shrink-0" />
                          <p className="text-sm">{e.endereco_entrega}</p>
                        </div>
                        <p className="text-xs text-foreground/60 pl-6">{e.cidade}</p>
                      </div>
                      <Button
                        onClick={() => aceitar(e.id, entregador.id)}
                        className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl"
                      >
                        Aceitar entrega
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default EntregadorEntregas;
