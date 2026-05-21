import { Music } from "lucide-react";

export interface PlaylistMusica {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  youtube_id: string | null;
  youtube_type: "playlist" | "video" | null;
  thumbnail_url: string | null;
  ordem: number;
  is_active: boolean;
  created_at: string;
}

export interface MusicaFaixa {
  id: string;
  playlist_id: string;
  titulo: string;
  audio_url: string;
  duracao_segundos: number | null;
  ordem: number;
  created_at: string;
}

interface PlaylistCardProps {
  playlist: PlaylistMusica;
  onClick: () => void;
}

export const PlaylistCard = ({ playlist, onClick }: PlaylistCardProps) => {
  const thumb = playlist.thumbnail_url;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#FFD1E7] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] transition-transform"
    >
      <div className="aspect-video w-full bg-primary/10 relative">
        {thumb ? (
          <img
            src={thumb}
            alt={playlist.titulo}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/40 to-primary/20">
            <Music className="w-10 h-10 text-white" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        <div className="absolute inset-x-0 bottom-0 bg-black/55 backdrop-blur-sm px-3 py-2">
          <p className="text-sm text-white line-clamp-1 leading-tight">
            {playlist.titulo}
          </p>
          {playlist.descricao && (
            <p className="text-[11px] text-white/75 line-clamp-1 mt-0.5">
              {playlist.descricao}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};
