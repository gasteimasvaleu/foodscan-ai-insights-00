import React from "react"

/**
 * SVG filter that creates a "liquid glass" refraction effect (iOS 26 style).
 * Render ONCE near the root of the tree. Reference it via `filter: url(#liquid-glass)`.
 *
 * Heavy on GPU — only mount on iOS native (see useNativePlatform).
 */
export const LiquidGlassFilter: React.FC = () => (
  <svg
    aria-hidden
    style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
  >
    <defs>
      <filter
        id="liquid-glass"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.012"
          numOctaves="1"
          seed="9"
          result="turbulence"
        />
        <feGaussianBlur in="turbulence" stdDeviation="2" result="softMap" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale="40"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
)
