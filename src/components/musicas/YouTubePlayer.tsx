import { useNativePlatform } from "@/hooks/useNativePlatform";

interface YouTubePlayerProps {
  youtubeId: string;
  type: "playlist" | "video";
  title?: string;
}

// Domínio público publicado. O iframe é carregado a partir desse origin HTTPS
// para que o player do YouTube funcione no WKWebView do iOS nativo (que roda
// em capacitor://localhost e é bloqueado pelo YouTube — erro 153).
const EMBED_PROXY_ORIGIN = "https://app.dietainteligente.app";

export const YouTubePlayer = ({ youtubeId, type, title }: YouTubePlayerProps) => {
  const { isIOS, isNative } = useNativePlatform();
  const useProxy = isIOS && isNative;

  const directSrc =
    type === "playlist"
      ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(youtubeId)}&autoplay=1&playsinline=1&rel=0`
      : `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&playsinline=1&rel=0`;

  const proxySrc = `${EMBED_PROXY_ORIGIN}/youtube-embed.html?id=${encodeURIComponent(
    youtubeId
  )}&type=${type}&autoplay=1`;

  const src = useProxy ? proxySrc : directSrc;

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black">
      <iframe
        src={src}
        title={title ?? "YouTube Player"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
};
