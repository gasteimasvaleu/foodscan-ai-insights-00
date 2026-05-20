import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ListChecks, Clock, Pencil } from "lucide-react";

import { useAuthContext } from "@/contexts/AuthProvider";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Switch } from "@/components/ui/switch";
import { useMFEntregador } from "@/hooks/mercado-facil/useMFEntregador";
import { useMFEntregas } from "@/hooks/mercado-facil/useMFEntregas";
import { formatBRL } from "@/lib/mercado-facil/formatters";

const EntregadorDashboard = () => {
  const { user } = useAuthContext();
  const { entregador, loading, setDisponivel } = useMFEntregador();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !entregador && user) {
      navigate("/mercado-facil/entregador/cadastro", { replace: true });
    }
  }, [loading, entregador, user, navigate]);

  const { entregas: disponiveis } = useMFEntregas({
    scope: "entregador-disponivel",
    cidade: entregador?.status === "aprovado" && entregador.disponivel ? entregador.cidade : undefined,
  });

  const { entregas: ativas } = useMFEntregas({
    scope: "entregador-ativa",
    entregadorId: entregador?.id,
  });

  if (loading || !entregador) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FD46A1]" />
      </div>
    );
  }

  const statusBadge =
    entregador.status === "aprovado"
      ? "bg-green-100 text-green-700"
      : entregador.status === "pendente"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-700";

  const statusLabel =
    entregador.status === "aprovado"
      ? "Aprovado"
      : entregador.status === "pendente"
      ? "Em análise"
      : entregador.status === "recusado"
      ? "Recusado"
      : "Suspenso";

  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title="Painel do Entregador" backTo="/mercado-facil" showCart={false} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-xl mx-auto space-y-4">
        <div className="bg-white border border-[#FD46A1]/30 rounded-3xl overflow-hidden shadow-sm">
          <div className="relative h-28 bg-gradient-to-r from-[#FD46A1] to-[#FF8FC4] overflow-hidden">
            {entregador.foto_url && (
              <img src={entregador.foto_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs ${statusBadge}`}>
              {statusLabel}
            </span>
            <button
              onClick={() => navigate("/mercado-facil/entregador/cadastro")}
              className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 text-[#FD46A1] flex items-center justify-center hover:bg-white"
              aria-label="Editar dados"
            >
              <Pencil size={16} />
            </button>
          </div>
          <div className="px-4 pb-4 -mt-12 relative z-10">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-[#FFD1E7] overflow-hidden shadow-md">
              {entregador.foto_url ? (
                <img src={entregador.foto_url} alt={entregador.nome_completo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl text-[#FD46A1] font-semibold">
                  {entregador.nome_completo.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-xs text-foreground/60 mt-3">Olá,</p>
            <h2 className="text-2xl font-bold text-foreground">{entregador.nome_completo}</h2>
            <p className="text-xs text-foreground/60 mt-1">
              {entregador.cidade} / {entregador.estado}
            </p>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-[#FFD1E7] rounded-2xl py-3 flex flex-col items-center">
                <span className="text-lg font-bold text-foreground">{entregador.total_entregas}</span>
                <span className="text-[10px] tracking-wider text-foreground/60 mt-0.5">ENTREGAS</span>
              </div>
              <div className="bg-[#FFD1E7] rounded-2xl py-3 flex flex-col items-center">
                <span className="text-lg font-bold text-foreground">
                  {entregador.avaliacao_media > 0 ? entregador.avaliacao_media.toFixed(1) : "—"}
                </span>
                <span className="text-[10px] tracking-wider text-foreground/60 mt-0.5">AVALIAÇÃO</span>
              </div>
              <div className="bg-[#FFD1E7] rounded-2xl py-3 flex flex-col items-center">
                <span className="text-lg font-bold text-foreground">{entregador.raio_atendimento_km}km</span>
                <span className="text-[10px] tracking-wider text-foreground/60 mt-0.5">RAIO</span>
              </div>
            </div>

            {entregador.status === "aprovado" && (
              <div className="flex items-center justify-between border-t mt-4 pt-3">
                <div>
                  <p className="text-base">Disponível para entregas</p>
                  <p className="text-xs text-foreground/60">
                    {entregador.disponivel ? "Você está visível agora" : "Você está offline"}
                  </p>
                </div>
                <Switch checked={entregador.disponivel} onCheckedChange={setDisponivel} />
              </div>
            )}
          </div>
        </div>

        {entregador.status === "pendente" && (
          <div className="bg-[#FFD1E7] rounded-3xl p-4 text-sm">
            Seu cadastro está em análise. Assim que aprovado, você poderá ativar a disponibilidade e receber entregas.
          </div>
        )}


        <Link
          to="/mercado-facil/entregador/entregas"
          className="flex items-center gap-3 bg-white border border-[#FD46A1]/30 rounded-3xl p-4 hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-full bg-[#FD46A1]/15 flex items-center justify-center">
            <ListChecks size={22} className="text-[#FD46A1]" />
          </div>
          <div className="flex-1">
            <p className="text-base">Minhas entregas ativas</p>
            <p className="text-xs text-foreground/60">{ativas.length} em andamento</p>
          </div>
        </Link>

        {entregador.status === "aprovado" && entregador.disponivel && (
          <section>
            <h3 className="text-base mb-2">Entregas disponíveis</h3>
            {disponiveis.length === 0 ? (
              <div className="bg-white border border-[#FD46A1]/30 rounded-3xl p-6 text-center text-sm text-foreground/60">
                Nenhuma entrega disponível na sua cidade no momento.
              </div>
            ) : (
              <div className="space-y-2">
                {disponiveis.map((e) => (
                  <Link
                    key={e.id}
                    to="/mercado-facil/entregador/entregas"
                    className="block bg-white border border-[#FD46A1]/30 rounded-3xl p-4 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base">{e.endereco_entrega}</p>
                        <p className="text-xs text-foreground/60 flex items-center gap-1">
                          <Clock size={12} /> {new Date(e.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <p className="text-[#FD46A1] font-bold">{formatBRL(e.taxa_centavos)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default EntregadorDashboard;
