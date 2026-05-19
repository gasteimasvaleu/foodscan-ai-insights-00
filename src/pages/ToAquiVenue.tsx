import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Users, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useVenue, VENUE_CATEGORIES } from "@/hooks/useVenues";

const ToAquiVenue = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: venue, isLoading } = useVenue(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7FAFB]">
        <Navbar />
        <p className="text-center pt-32 text-gray-500">Carregando…</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-[#F7FAFB]">
        <Navbar />
        <div className="pt-[calc(env(safe-area-inset-top)+5rem)] text-center">
          <p className="text-gray-600">Venue não encontrado.</p>
          <Button onClick={() => navigate("/to-aqui")} className="mt-3">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const cat = VENUE_CATEGORIES.find((c) => c.value === venue.category);

  return (
    <div className="min-h-screen bg-[#F7FAFB]">
      <Navbar />
      <div className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28">
        <div className="px-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-4">
            <div className="relative h-32 bg-gradient-to-br from-[#FD46A1] to-[#FFD1E7]">
              {venue.photo_url && (
                <img
                  src={venue.photo_url}
                  alt={venue.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <button
                onClick={() => navigate("/to-aqui")}
                className="absolute top-3 left-3 h-8 w-8 rounded-lg bg-white/80 backdrop-blur-md text-[#FD46A1] flex items-center justify-center shadow-sm"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              {cat && (
                <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full bg-white/80 backdrop-blur-md text-[#FD46A1] font-medium flex items-center gap-1">
                  <span>{cat.emoji}</span>
                  {cat.label}
                </span>
              )}
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-end justify-between gap-3 -mt-16 relative z-10">
                <div className="w-28 h-28 rounded-full bg-[#FFD1E7] border-4 border-white flex items-center justify-center text-5xl shadow-md">
                  {cat?.emoji ?? venue.name?.[0]?.toUpperCase() ?? "📍"}
                </div>
                <Button
                  onClick={() => navigate(`/to-aqui/venue/${venue.id}/chat`)}
                  className="rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 h-10"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mt-3">{venue.name}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {venue.address ? `${venue.address} · ${venue.city}` : venue.city}
              </p>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-[#FFD1E7] rounded-2xl p-3 text-center">
                  <MessageCircle className="w-5 h-5 text-[#FD46A1] mx-auto mb-1" />
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide">Chat</p>
                </div>
                <div className="bg-[#FFD1E7] rounded-2xl p-3 text-center">
                  <MapPin className="w-5 h-5 text-[#FD46A1] mx-auto mb-1" />
                  <p className="text-xs font-semibold text-gray-800 truncate">{venue.city}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide">Local</p>
                </div>
                <div className="bg-[#FFD1E7] rounded-2xl p-3 text-center">
                  <div className="text-xl leading-none mb-1">{cat?.emoji ?? "📍"}</div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide">Tipo</p>
                </div>
              </div>
            </div>
          </div>

          {venue.description && (
            <div className="bg-white rounded-3xl p-4 mb-3 shadow-sm">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {venue.description}
              </p>
            </div>
          )}

          {venue.rules && (
            <div className="bg-[#FFD1E7] rounded-3xl p-4 mb-4">
              <p className="text-xs text-[#FD46A1] uppercase tracking-wide mb-1">
                Regras do chat
              </p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{venue.rules}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToAquiVenue;
