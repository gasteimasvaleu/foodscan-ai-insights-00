import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Music, SkipBack, SkipForward, Loader2 } from "lucide-react";
import { PlaylistMusica, MusicaFaixa } from "./PlaylistCard";
import { getMusicCategory } from "@/data/musicCategories";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";

interface VinylPlayerProps {
  playlist: PlaylistMusica;
}

const BAR_COUNT = 36;

const formatTime = (s: number) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export const VinylPlayer = ({ playlist }: VinylPlayerProps) => {
  const [faixas, setFaixas] = useState<MusicaFaixa[]>([]);
  const [loadingFaixas, setLoadingFaixas] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cover = playlist.thumbnail_url;
  const cat = getMusicCategory(playlist.categoria);

  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }).map((_, i) => ({
        delay: (i % 9) * 0.07 + (i % 3) * 0.03,
        duration: 0.7 + ((i * 37) % 7) * 0.06,
      })),
    []
  );

  useEffect(() => {
    (async () => {
      setLoadingFaixas(true);
      const { data } = await supabase
        .from("musicas_faixas")
        .select("*")
        .eq("playlist_id", playlist.id)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: true });
      setFaixas((data as MusicaFaixa[]) || []);
      setLoadingFaixas(false);
    })();
  }, [playlist.id]);

  const currentFaixa = faixas[currentIndex];

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentFaixa) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch (e) {
        console.error("Audio play error:", e);
      }
    } else {
      audio.pause();
    }
  };

  const handleNext = () => {
    if (currentIndex < faixas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Autoplay quando troca faixa (após iniciar pela primeira vez)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentFaixa) return;
    audio.load();
    if (isPlaying) {
      audio.play().catch((e) => console.error(e));
    }
  }, [currentIndex, currentFaixa?.audio_url]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full rounded-3xl bg-black/70 backdrop-blur-md border border-white/10 shadow-2xl p-6 flex flex-col items-center gap-5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(253,70,161,0.25) 0%, rgba(253,70,161,0) 60%)",
          }}
        />

        {/* Disco */}
        <button
          onClick={togglePlay}
          disabled={!currentFaixa}
          aria-label={isPlaying ? "Pausar" : "Tocar"}
          className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden shadow-2xl ring-4 ring-black/80 group disabled:opacity-60"
          style={{
            background:
              "radial-gradient(circle, #1a1a1a 0%, #0a0a0a 65%, #000 100%)",
          }}
        >
          <div
            className="absolute inset-2 rounded-full overflow-hidden"
            style={{
              animation: "vinyl-spin 18s linear infinite",
              animationPlayState: isPlaying ? "running" : "paused",
            }}
          >
            {cover ? (
              <img
                src={cover}
                alt={playlist.titulo}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                <Music className="w-16 h-16 text-white" />
              </div>
            )}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "repeating-radial-gradient(circle at center, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 6px)",
              }}
            />
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-[#FD46A1] shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-black/80" />
            </div>
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors ${
              isPlaying ? "" : "bg-black/20"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full bg-white/95 shadow-xl flex items-center justify-center transition-all ${
                isPlaying
                  ? "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                  : "opacity-100 scale-100"
              }`}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-primary" fill="currentColor" />
              ) : (
                <Play className="w-6 h-6 text-primary ml-0.5" fill="currentColor" />
              )}
            </div>
          </div>
        </button>

        {/* Equalizer */}
        <div className="relative z-10 w-full h-16 flex items-end justify-between gap-[2px]">
          {bars.map((b, i) => (
            <span
              key={i}
              className="flex-1 rounded-full bg-gradient-to-t from-primary via-primary to-primary/40 shadow-[0_0_8px_rgba(253,70,161,0.5)]"
              style={{
                height: "10%",
                animation: `eq-bar ${b.duration}s ease-in-out infinite`,
                animationDelay: `${b.delay}s`,
                animationPlayState: isPlaying ? "running" : "paused",
              }}
            />
          ))}
        </div>

        {/* Controles */}
        <div className="relative z-10 w-full flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[11px] text-white/70 font-mono">
            <span>{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 1}
              step={1}
              onValueChange={(v) => {
                const audio = audioRef.current;
                if (audio) {
                  audio.currentTime = v[0];
                  setCurrentTime(v[0]);
                }
              }}
              className="flex-1"
              disabled={!currentFaixa}
            />
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="text-white/90 disabled:opacity-30 active:scale-95 transition"
              aria-label="Anterior"
            >
              <SkipBack className="w-6 h-6" fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              disabled={!currentFaixa}
              className="w-12 h-12 rounded-full bg-[#FD46A1] text-white flex items-center justify-center shadow-lg active:scale-95 transition disabled:opacity-40"
              aria-label={isPlaying ? "Pausar" : "Tocar"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
              )}
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= faixas.length - 1}
              className="text-white/90 disabled:opacity-30 active:scale-95 transition"
              aria-label="Próxima"
            >
              <SkipForward className="w-6 h-6" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {/* Track info */}
      <div className="text-center px-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
          {cat?.label || playlist.categoria}
        </p>
        <h3 className="text-base font-semibold text-foreground leading-tight">
          {currentFaixa?.titulo || playlist.titulo}
        </h3>
      </div>

      {/* Lista de faixas */}
      <div className="w-full">
        {loadingFaixas ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : faixas.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            Nenhuma faixa nessa playlist ainda.
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-2 max-h-60 overflow-y-auto space-y-1">
            {faixas.map((f, i) => {
              const active = i === currentIndex;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setCurrentIndex(i);
                    setIsPlaying(true);
                  }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                    active ? "bg-[#FD46A1] text-white" : "hover:bg-white/70"
                  }`}
                >
                  <span className={`text-xs font-mono w-6 ${active ? "text-white/80" : "text-muted-foreground"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-sm line-clamp-1">{f.titulo}</span>
                  {f.duracao_segundos != null && (
                    <span className={`text-[11px] font-mono ${active ? "text-white/80" : "text-muted-foreground"}`}>
                      {formatTime(f.duracao_segundos)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Audio element */}
      {currentFaixa && (
        <audio
          ref={audioRef}
          src={currentFaixa.audio_url}
          preload="metadata"
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => {
            if (currentIndex < faixas.length - 1) {
              setCurrentIndex(currentIndex + 1);
            } else {
              setIsPlaying(false);
            }
          }}
        />
      )}

      <style>{`
        @keyframes vinyl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes eq-bar {
          0%, 100% { height: 10%; opacity: 0.55; }
          50% { height: 100%; opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="vinyl-spin"], [style*="eq-bar"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
