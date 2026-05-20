import { Loader2, MessageCircle } from "lucide-react";
import { openExternalUrl } from "@/lib/openExternal";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import { useMFEntregador } from "@/hooks/mercado-facil/useMFEntregador";
import { useMFEntregas } from "@/hooks/mercado-facil/useMFEntregas";
import { cleanPhone, formatBRL } from "@/lib/mercado-facil/formatters";
import { ENTREGA_STATUS_LABEL } from "@/lib/mercado-facil/entregador-types";

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

  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title="Minhas Entregas" backTo="/mercado-facil/entregador" showCart={false} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-xl mx-auto space-y-4">
        <section>
          <h3 className="text-base mb-2">Em andamento</h3>
          {ativas.length === 0 ? (
            <div className="bg-white border border-[#FD46A1]/30 rounded-3xl p-6 text-center text-sm text-foreground/60">
              Você não tem entregas em andamento.
            </div>
          ) : (
            <div className="space-y-3">
              {ativas.map((e) => (
                <div key={e.id} className="bg-white border border-[#FD46A1]/30 rounded-3xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD1E7] text-[#FD46A1]">
                      {ENTREGA_STATUS_LABEL[e.status]}
                    </span>
                    <span className="text-[#FD46A1] font-bold">{formatBRL(e.taxa_centavos)}</span>
                  </div>
                  <p className="text-sm">{e.endereco_entrega}</p>
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
            <h3 className="text-base mb-2">Disponíveis para aceitar</h3>
            {disponiveis.length === 0 ? (
              <div className="bg-white border border-[#FD46A1]/30 rounded-3xl p-6 text-center text-sm text-foreground/60">
                Nenhuma entrega disponível.
              </div>
            ) : (
              <div className="space-y-3">
                {disponiveis.map((e) => (
                  <div key={e.id} className="bg-white border border-[#FD46A1]/30 rounded-3xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{e.endereco_entrega}</p>
                      <span className="text-[#FD46A1] font-bold">{formatBRL(e.taxa_centavos)}</span>
                    </div>
                    <Button
                      onClick={() => aceitar(e.id, entregador.id)}
                      className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl"
                    >
                      Aceitar entrega
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default EntregadorEntregas;
