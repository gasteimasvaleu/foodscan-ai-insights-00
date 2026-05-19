import { Link, useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Clock, CheckCircle2, XCircle, Store } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMyVenues, VENUE_CATEGORIES } from "@/hooks/useVenues";

const STATUS_LABEL: Record<string, { label: string; color: string; Icon: any }> = {
  pending: { label: "Em análise", color: "bg-yellow-100 text-yellow-800", Icon: Clock },
  approved: { label: "Aprovado", color: "bg-green-100 text-green-800", Icon: CheckCircle2 },
  rejected: { label: "Rejeitado", color: "bg-red-100 text-red-800", Icon: XCircle },
};

const ToAquiOwner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: venues = [], isLoading } = useMyVenues(user?.id);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-[calc(env(safe-area-inset-top)+4rem)] px-4 text-center">
          <p>Faça login para cadastrar seus venues.</p>
          <Button onClick={() => navigate("/auth")} className="mt-3">
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto space-y-5">
        <div className="animate-fade-in mb-4">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary">Meus venues</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/to-aqui")}
              aria-label="Voltar"
              className="ml-auto text-primary hover:bg-white/40 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-600">
          {venues.length}/3 venues cadastrados
        </div>

        {venues.length >= 3 ? (
          <Button disabled className="w-full rounded-full mb-6">
            Limite de 3 venues atingido
          </Button>
        ) : (
          <Link to="/to-aqui/owner/venue/new">
            <Button className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-full mb-6">
              <Plus className="h-4 w-4 mr-1" />
              Cadastrar novo venue
            </Button>
          </Link>
        )}

        {isLoading ? (
          <p className="text-center text-gray-500">Carregando…</p>
        ) : venues.length === 0 ? (
          <div className="text-center py-10 px-6 bg-[#FFD1E7] rounded-3xl">
            <p className="text-base text-gray-800">
              Você ainda não tem venues cadastrados.
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Cadastre o seu bar, restaurante ou festa para começar a receber clientes no chat.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {venues.map((v) => {
              const cat = VENUE_CATEGORIES.find((c) => c.value === v.category);
              const st = STATUS_LABEL[v.status];
              return (
                <li key={v.id}>
                  <Link
                    to={`/to-aqui/owner/venue/${v.id}/edit`}
                    className="bg-white rounded-3xl p-4 shadow-sm flex items-center gap-3 hover:bg-[#FFD1E7]/30 transition"
                  >
                  <div className="h-14 w-14 rounded-2xl bg-[#FFD1E7] flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {v.photo_url ? (
                      <img src={v.photo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      cat?.emoji ?? "📍"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-gray-900 truncate">{v.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {cat?.label} · {v.city}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full ${st.color}`}
                    >
                      <st.Icon className="h-3 w-3" /> {st.label}
                    </span>
                  </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ToAquiOwner;
