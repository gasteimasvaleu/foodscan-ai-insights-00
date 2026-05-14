import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play } from "lucide-react";

interface Props {
  src: string;
  poster?: string | null;
  alt?: string;
  onDoubleClick?: () => void;
}

/**
 * Reels-style autoplay video for the community feed.
 * - Muted autoplay when ≥60% visible; pauses when scrolled away.
 * - Tap toggles mute. Double-tap forwarded to parent (e.g. like).
 */
export function FeedVideo({ src, poster, alt, onDoubleClick }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
          } else {
            video.pause();
            setPlaying(false);
          }
        });
      },
      { threshold: [0, 0.6, 1] }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted((m) => {
      const next = !m;
      if (ref.current) ref.current.muted = next;
      return next;
    });
  };

  return (
    <div
      className="relative w-full bg-black"
      onDoubleClick={onDoubleClick}
    >
      <video
        ref={ref}
        src={src}
        poster={poster || undefined}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
        className="w-full max-h-[520px] object-contain bg-black"
      />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 rounded-full p-3">
            <Play size={26} className="text-white" fill="currentColor" />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Ativar som" : "Silenciar"}
        className="absolute bottom-2 right-2 bg-black/55 text-white rounded-full p-2"
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  );
}
