import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Users, Settings, Crown, ChevronRight, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { WheelPicker } from "@/components/ui/wheel-picker";
import { useVenues, VENUE_CATEGORIES, type VenueCategory } from "@/hooks/useVenues";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ALL_VALUE = "__all__";

const ToAqui = () => {
  const navigate = useNavigate();
  const { user, subscriptionStatus } = useAuth();
  const isPro = subscriptionStatus?.subscribed;
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user?.id]);
  const canManage = isPro || isAdmin;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<VenueCategory | null>(null);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string>(ALL_VALUE);
  const { data: venues = [], isLoading } = useVenues({ search, category });


  const currentCat = VENUE_CATEGORIES.find((c) => c.value === category);
  const currentLabel = currentCat ? `${currentCat.emoji} ${currentCat.label}` : "Todas as categorias";

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-[calc(env(safe-area-inset-top)+4rem)] px-4 pb-4 space-y-5">
        {/* Card header padrão */}
        <div className="animate-fade-in">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary">Tô Aqui</h1>
          </div>
        </div>



        <button
          onClick={() =>
            navigate(canManage ? '/to-aqui/owner' : '/assinar?reason=to_aqui_owner_upsell')
          }
          className="w-full text-left rounded-3xl shadow-xl border border-white/20 overflow-hidden bg-gradient-to-br from-[#FD46A1] to-[#FF6FB5] active:scale-[0.99] transition-all animate-fade-in"
        >
          <div className="flex items-center gap-4 py-4 px-5">
            <div className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-white">
              {canManage ? (
                <>
                  <p className="text-base">Meus venues</p>
                  <p className="text-sm text-white/85">Cadastre e administre seus locais</p>
                </>
              ) : (
                <>
                  <p className="text-base">Adicione seu bar, restaurante ou festa</p>
                  <p className="text-sm text-white/85">Seja Pro para divulgar seu local no Tô Aqui</p>
                </>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-white flex-shrink-0" />
          </div>
        </button>




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

        {/* Seletor de categoria */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 justify-between text-base font-normal bg-white mb-2"
          onClick={() => {
            setPendingCategory(category ?? ALL_VALUE);
            setIsCategoryDrawerOpen(true);
          }}
        >
          <span className="truncate">{currentLabel}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </Button>

        <Drawer open={isCategoryDrawerOpen} onOpenChange={setIsCategoryDrawerOpen}>
          <DrawerContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl px-4 pb-4 max-h-[75vh]">
            <DrawerHeader className="px-0 pt-3 pb-2 text-center">
              <DrawerTitle className="text-base font-semibold">
                Selecionar Categoria
              </DrawerTitle>
            </DrawerHeader>

            <WheelPicker
              value={pendingCategory}
              onChange={setPendingCategory}
              options={[
                { value: ALL_VALUE, label: "Todas as categorias" },
                ...VENUE_CATEGORIES.map((c) => ({
                  value: c.value,
                  label: `${c.emoji} ${c.label}`,
                })),
              ]}
              visibleItems={5}
              itemHeight={44}
            />

            <DrawerFooter className="px-0 pt-4 flex-row gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setIsCategoryDrawerOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  setCategory(
                    pendingCategory === ALL_VALUE
                      ? null
                      : (pendingCategory as VenueCategory)
                  );
                  setIsCategoryDrawerOpen(false);
                }}
              >
                Confirmar
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>


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
