import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { CelebrationPayload } from "@/contexts/CelebrationContext";

const CONFETTI_COLORS = ["#FD46A1", "#FFD1E7", "#FFFFFF", "#FFC107", "#7BD3F7"];

type Particle = {
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotate: number;
};

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }).map(() => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 2.2 + Math.random() * 1.6,
    size: 6 + Math.random() * 8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotate: Math.random() * 360,
  }));
}

interface Props {
  payload: CelebrationPayload;
  onClose: () => void;
}

export function CelebrationOverlay({ payload, onClose }: Props) {
  const particles = useMemo(() => generateParticles(60), [payload]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const timer = window.setTimeout(onClose, 7000);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [onClose]);

  const subtitle =
    payload.type === "streak"
      ? "Sequência mantida!"
      : "Conquista desbloqueada!";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-fade-in"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Confetes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute top-[-20px] block rounded-sm"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 1.6}px`,
              backgroundColor: p.color,
              transform: `rotate(${p.rotate}deg)`,
              animation: `confetti-fall ${p.duration}s ${p.delay}s linear infinite`,
              opacity: 0.95,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm rounded-3xl bg-white/90 backdrop-blur-md p-8 text-center shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ring */}
        <div className="relative mx-auto mb-5 h-32 w-32">
          <div
            className="absolute inset-0 rounded-full opacity-70"
            style={{
              background:
                "conic-gradient(from 0deg, #FD46A1, #FFD1E7, #FD46A1, #FFC107, #FD46A1)",
              animation: "spin 6s linear infinite",
              filter: "blur(8px)",
            }}
          />
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center text-6xl">
            {payload.icon || "🏆"}
          </div>
        </div>

        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          {subtitle}
        </p>
        <h2 className="text-2xl font-semibold text-primary mb-2">
          {payload.title}
        </h2>
        <p className="text-sm text-foreground/80 mb-6">
          {payload.description}
        </p>

        <Button
          autoFocus
          onClick={onClose}
          className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-2xl h-12 text-base"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
