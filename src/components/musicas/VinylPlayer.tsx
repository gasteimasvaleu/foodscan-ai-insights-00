import { useState } from "react";
import { Play, Pause, Music } from "lucide-react";
import { PlaylistMusica, getYouTubeThumb } from "./PlaylistCard";
import { YouTubePlayer } from "./YouTubePlayer";
import { getMusicCategory } from "@/data/musicCategories";

interface VinylPlayerProps {
  playlist: PlaylistMusica;
}

export const VinylPlayer = ({ playlist }: VinylPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const cover = getYouTubeThumb(playlist);
  const cat = getMusicCategory(playlist.categoria);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Disco */}
      <button
        onClick={() => setIsPlaying((p) => !p)}
        aria-label={isPlaying ? "Pausar" : "Tocar"}
        className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden shadow-2xl ring-4 ring-black/80 group"
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

        {/* Play/Pause hover overlay */}
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

      {/* Equalizer decorativo */}
      <div className="flex items-end justify-center gap-1 h-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="w-1 rounded-full bg-primary/70"
            style={{
              height: "8px",
              animation: `eq-bar 0.9s ease-in-out infinite`,
              animationDelay: `${i * 0.08}s`,
              animationPlayState: isPlaying ? "running" : "paused",
            }}
          />
        ))}
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
          0%, 100% { height: 6px; opacity: 0.5; }
          50% { height: 28px; opacity: 1; }
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
