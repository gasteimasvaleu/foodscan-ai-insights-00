import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface Props {
  senderAlias: string;
  receiverAlias: string;
  fireConfetti?: boolean;
}

export default function MatchRevealBanner({ senderAlias, receiverAlias, fireConfetti }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (!fireConfetti || fired.current) return;
    fired.current = true;
    const end = Date.now() + 1500;
    const colors = ["#FD46A1", "#FFD1E7", "#ffffff"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [fireConfetti]);

  return (
    <div className="my-3 mx-auto max-w-xs">
      <div className="rounded-2xl bg-gradient-to-br from-[#FD46A1] to-[#FF8AC4] text-white p-4 shadow-lg text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-white/30 ring-4 ring-white/80 animate-pulse flex items-center justify-center font-bold text-lg">
            {senderAlias.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-2xl">💞</span>
          <div className="w-12 h-12 rounded-full bg-white/30 ring-4 ring-white/80 animate-pulse flex items-center justify-center font-bold text-lg">
            {receiverAlias.slice(0, 1).toUpperCase()}
          </div>
        </div>
        <p className="text-sm font-medium">
          <strong>{senderAlias}</strong> descobriu <strong>{receiverAlias}</strong>!
        </p>
        <p className="text-xs opacity-90 mt-1">Uma conversa privada foi aberta entre vocês ✨</p>
      </div>
    </div>
  );
}
