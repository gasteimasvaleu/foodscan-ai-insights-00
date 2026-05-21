import { useEffect, useMemo, useState } from "react";
import { Music, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { PlaylistCard, PlaylistMusica } from "@/components/musicas/PlaylistCard";
import { VinylPlayer } from "@/components/musicas/VinylPlayer";
import { MUSIC_CATEGORIES } from "@/data/musicCategories";

const Musicas = () => {
  const [playlists, setPlaylists] = useState<PlaylistMusica[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<PlaylistMusica | null>(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("playlists_musicas")
      .select("*")
      .eq("is_active", true)
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });
    if (!error && data) setPlaylists(data as PlaylistMusica[]);
    setLoading(false);
  };

  const byCategory = useMemo(() => {
    const map: Record<string, PlaylistMusica[]> = {};
    for (const p of playlists) {
      (map[p.categoria] = map[p.categoria] || []).push(p);
    }
    return map;
  }, [playlists]);

  return (
    <div className="min-h-screen bg-background pb-28">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-[calc(env(safe-area-inset-top)+4rem)] px-4 pb-4 space-y-5">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-primary">Músicas</h1>
              <p className="text-xs text-muted-foreground">
                Playlists curadas pra cada momento do seu dia
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : playlists.length === 0 ? (
          <div className="bg-white/60 rounded-2xl p-8 text-center">
            <Music className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              Em breve playlists por aqui!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {MUSIC_CATEGORIES.map((cat) => {
              const items = byCategory[cat.key] || [];
              if (items.length === 0) return null;
              const Icon = cat.icon;
              return (
                <section key={cat.key} className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Icon className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-semibold text-primary">
                      {cat.label}
                    </h2>
                  </div>
                  <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                    <CarouselContent className="-ml-3 py-2">
                      {items.map((p) => (
                        <CarouselItem key={p.id} className="pl-3 basis-[55%] sm:basis-[38%]">
                          <PlaylistCard playlist={p} onClick={() => setActive(p)} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Player Modal */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg w-[calc(100%-1.5rem)] mx-auto rounded-3xl bg-white/80 backdrop-blur-md border-2 border-primary shadow-2xl p-4 sm:p-5 max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base text-primary leading-tight">
                {active?.titulo}
              </DialogTitle>
              {active?.descricao && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {active.descricao}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActive(null)}
              className="rounded-full bg-primary hover:bg-primary/90 text-white h-8 w-8 shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {active && (
            <YouTubePlayer
              youtubeId={active.youtube_id}
              type={active.youtube_type}
              title={active.titulo}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Musicas;
