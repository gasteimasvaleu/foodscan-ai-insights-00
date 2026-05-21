import { Music } from "lucide-react";

export interface PlaylistMusica {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  youtube_id: string;
  youtube_type: "playlist" | "video";
  thumbnail_url: string | null;
  ordem: number;
  is_active: boolean;
  created_at: string;
}

interface PlaylistCardProps {
  playlist: PlaylistMusica;
  onClick: () => void;
}

export const getYouTubeThumb = (p: PlaylistMusica): string => {
  if (p.thumbnail_url) return p.thumbnail_url;
  if (p.youtube_type === "video") {
    return `https://i.ytimg.com/vi/${p.youtube_id}/hqdefault.jpg`;
  }
  // Para playlist, sem id de vídeo conhecido, usamos placeholder estilizado
  return "";
};

export const PlaylistCard = ({ playlist, onClick }: PlaylistCardProps) => {
  const thumb = getYouTubeThumb(playlist);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#FFD1E7] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] transition-transform"
    >
      <div className="aspect-square w-full bg-primary/10 relative">
        {thumb ? (
          <img
            src={thumb}
            alt={playlist.titulo}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/40 to-primary/20">
            <Music className="w-12 h-12 text-white" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-base text-foreground line-clamp-2 leading-tight">
          {playlist.titulo}
        </p>
      </div>
    </button>
  );
};
