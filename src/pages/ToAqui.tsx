import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Users, Settings } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVenues, VENUE_CATEGORIES, type VenueCategory } from "@/hooks/useVenues";

const ToAqui = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<VenueCategory | null>(null);
  const { data: venues = [], isLoading } = useVenues({ search, category });

  return (
    <div className="min-h-screen bg-[#F7FAFB]">
      <Navbar />
      <div className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#FD46A1]">Tô Aqui</h1>
            <p className="text-sm text-gray-600">
              Bares, restaurantes e festas com chat ao vivo
            </p>
          </div>
          <Link to="/to-aqui/owner">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-[#FD46A1] text-[#FD46A1] hover:bg-[#FFD1E7]"
            >
              <Settings className="h-4 w-4 mr-1" />
              Meus venues
            </Button>
          </Link>
        </div>

        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou cidade…"
            className="pl-9 text-base bg-white rounded-full"
          />
        </div>

        {/* Chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 mb-4 [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setCategory(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
              category === null
                ? "bg-[#FD46A1] text-white"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            Todos
          </button>
          {VENUE_CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                category === c.value
                  ? "bg-[#FD46A1] text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {isLoading ? (
          <p className="text-center text-gray-500 py-12">Carregando…</p>
        ) : venues.length === 0 ? (
          <div className="text-center py-12 px-6 bg-[#FFD1E7] rounded-3xl">
            <p className="text-base text-gray-800 mb-2">
              Nenhum lugar encontrado por aqui ainda.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              É dono de um bar, restaurante ou festa? Cadastre o seu.
            </p>
            <Link to="/to-aqui/owner/venue/new">
              <Button className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-full">
                Cadastrar venue
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {venues.map((v) => {
              const cat = VENUE_CATEGORIES.find((c) => c.value === v.category);
              return (
                <li key={v.id}>
                  <Link
                    to={`/to-aqui/venue/${v.id}`}
                    className="block bg-white rounded-3xl overflow-hidden shadow-sm active:scale-[0.98] transition"
                  >
                    <div className="aspect-[16/9] bg-[#FFD1E7] overflow-hidden">
                      {v.photo_url ? (
                        <img
                          src={v.photo_url}
                          alt={v.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          {cat?.emoji ?? "📍"}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base text-gray-900">{v.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD1E7] text-[#FD46A1]">
                          {cat?.label}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {v.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {v.online_count ?? 0} online
                        </span>
                      </div>
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

export default ToAqui;
