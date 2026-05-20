import React from "react";

interface KineticDotsLoaderProps {
  color?: string;
  size?: number; // dot diameter in px
  gap?: number; // gap between scenes in px
}

const DOTS = 4;
const DURATION = 1.2; // seconds
const STAGGER = 0.15; // seconds between dots

const KineticDotsLoader: React.FC<KineticDotsLoaderProps> = ({
  color = "#FFFFFF",
  size = 18,
  gap = 14,
}) => {
  const sceneHeight = size * 4; // room for bounce
  const sceneWidth = size * 2;

  return (
    <div
      className="flex items-end justify-center"
      style={{ gap, height: sceneHeight }}
      role="status"
      aria-label="Carregando"
    >
      {Array.from({ length: DOTS }).map((_, i) => {
        const delay = `${(i * STAGGER).toFixed(2)}s`;
        return (
          <div
            key={i}
            className="relative flex items-end justify-center"
            style={{ width: sceneWidth, height: sceneHeight }}
          >
            {/* Reflective shadow on the ground */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: 0,
                width: size * 1.2,
                height: size * 0.25,
                borderRadius: "50%",
                background: `radial-gradient(ellipse at center, ${color}66 0%, ${color}00 70%)`,
                animation: `kdl-shadow-breathe ${DURATION}s infinite ease-in-out`,
                animationDelay: delay,
                transformOrigin: "center",
              }}
            />

            {/* Floor ripple (shockwave on impact) */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: size * 0.05,
                width: size * 1.1,
                height: size * 0.3,
                borderRadius: "50%",
                border: `2px solid ${color}`,
                opacity: 0,
                animation: `kdl-ripple-expand ${DURATION}s infinite ease-out`,
                animationDelay: delay,
                transformOrigin: "center",
              }}
            />

            {/* Bouncing dot (translation wrapper) */}
            <div
              className="absolute"
              style={{
                bottom: size * 0.1,
                width: size,
                height: size,
                animation: `kdl-gravity-bounce ${DURATION}s infinite`,
                animationDelay: delay,
              }}
            >
              {/* Squash & stretch wrapper */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: color,
                  boxShadow: `0 0 12px ${color}55`,
                  animation: `kdl-rubber-morph ${DURATION}s infinite`,
                  animationDelay: delay,
                  transformOrigin: "center bottom",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Specular highlight for liquid look */}
                <div
                  style={{
                    position: "absolute",
                    top: "12%",
                    left: "22%",
                    width: "40%",
                    height: "30%",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes kdl-gravity-bounce {
          0%   { transform: translateY(0); animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1); }
          50%  { transform: translateY(-${size * 2.2}px); animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0); }
          100% { transform: translateY(0); }
        }
        @keyframes kdl-rubber-morph {
          0%   { transform: scale(1.4, 0.6); }
          5%   { transform: scale(0.9, 1.1); }
          15%  { transform: scale(1, 1); }
          50%  { transform: scale(1, 1); }
          85%  { transform: scale(0.9, 1.1); }
          100% { transform: scale(1.4, 0.6); }
        }
        @keyframes kdl-shadow-breathe {
          0%   { transform: translateX(-50%) scale(1.4); opacity: 0.6; }
          50%  { transform: translateX(-50%) scale(0.5); opacity: 0.1; }
          100% { transform: translateX(-50%) scale(1.4); opacity: 0.6; }
        }
        @keyframes kdl-ripple-expand {
          0%   { transform: translateX(-50%) scale(0.5); opacity: 0; border-width: 3px; }
          5%   { opacity: 0.8; }
          30%  { transform: translateX(-50%) scale(1.6); opacity: 0; border-width: 0px; }
          100% { transform: translateX(-50%) scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default KineticDotsLoader;
