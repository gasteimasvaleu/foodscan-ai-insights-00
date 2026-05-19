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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full mb-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-[#FFD1E7] mb-4">
            {venue.photo_url ? (
              <img
                src={venue.photo_url}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">
                {cat?.emoji ?? "📍"}
              </div>
            )}
          </div>

          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
            <span className="text-xs px-2 py-1 rounded-full bg-[#FFD1E7] text-[#FD46A1] shrink-0">
              {cat?.label}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {venue.city}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> chat ao vivo
            </span>
          </div>

          {venue.address && (
            <p className="text-sm text-gray-600 mb-3">{venue.address}</p>
          )}

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

          <div className="bg-white rounded-3xl p-5 text-center shadow-sm">
            <p className="text-sm text-gray-600 mb-3">
              O chat ao vivo deste venue será habilitado em breve.
            </p>
            <Button
              disabled
              className="rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 opacity-60"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Entrar no chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToAquiVenue;
