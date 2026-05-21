import { useMemo, useState } from "react";
import { Play, Pause, Music } from "lucide-react";
import { PlaylistMusica, getYouTubeThumb } from "./PlaylistCard";
import { YouTubePlayer } from "./YouTubePlayer";
import { getMusicCategory } from "@/data/musicCategories";

interface VinylPlayerProps {
  playlist: PlaylistMusica;
}

const BAR_COUNT = 36;

export const VinylPlayer = ({ playlist }: VinylPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const cover = getYouTubeThumb(playlist);
  const cat = getMusicCategory(playlist.categoria);

  // Variações para um efeito mais orgânico, estáveis entre renders
  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }).map((_, i) => ({
        delay: (i % 9) * 0.07 + (i % 3) * 0.03,
        duration: 0.7 + ((i * 37) % 7) * 0.06,
      })),
    []
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Card preto translúcido com disco + ondas */}
      <div
        className="relative w-full rounded-3xl bg-black/70 backdrop-blur-md border border-white/10 shadow-2xl p-6 flex flex-col items-center gap-5 overflow-hidden"
      >
        {/* Brilho radial rosa de fundo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(253,70,161,0.25) 0%, rgba(253,70,161,0) 60%)",
          }}
        />

        {/* Disco */}
        <button
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? "Pausar" : "Tocar"}
          className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden shadow-2xl ring-4 ring-black/80 group"
          style={{
            background:
              "radial-gradient(circle, #1a1a1a 0%, #0a0a0a 65%, #000 100%)",
          }}
        >
          {/* Capa girando */}
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
            {/* Ranhuras de vinil */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "repeating-radial-gradient(circle at center, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 6px)",
              }}
            />
          </div>

          {/* Furo central */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-[#FD46A1] shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-black/80" />
            </div>
          </div>

          {/* Play/Pause overlay */}
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

        {/* Equalizer full-width */}
        <div className="relative z-10 w-full h-20 flex items-end justify-between gap-[2px]">
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
      </div>

      {/* Track info */}
      <div className="text-center px-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
          {cat?.label || playlist.categoria}
        </p>
        <h3 className="text-lg font-semibold text-foreground leading-tight">
          {playlist.titulo}
        </h3>
      </div>

      {/* Iframe expandido quando tocando */}
      {isPlaying && (
        <div className="w-full animate-fade-in">
          <YouTubePlayer
            youtubeId={playlist.youtube_id}
            type={playlist.youtube_type}
            title={playlist.titulo}
          />
        </div>
      )}

      {/* Keyframes locais */}
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
