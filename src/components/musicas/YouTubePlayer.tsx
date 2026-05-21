interface YouTubePlayerProps {
  youtubeId: string;
  type: "playlist" | "video";
  title?: string;
}

export const YouTubePlayer = ({ youtubeId, type, title }: YouTubePlayerProps) => {
  const src =
    type === "playlist"
      ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(youtubeId)}&autoplay=1&playsinline=1&rel=0`
      : `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&playsinline=1&rel=0`;

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
