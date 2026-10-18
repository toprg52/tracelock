import React from 'react';

/**
 * HeroArt: Single pure inline SVG hero graphic.
 * Fine contour/trace lines in low-contrast mint (accent at 15-35% opacity),
 * forming one connected forensic path leading to a keyhole/lock shape on the right.
 * Subtle 1.2s path-drawing animation on load (disabled on prefers-reduced-motion).
 */
export const HeroArt: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`relative select-none pointer-events-none ${className}`.trim()}
      aria-hidden="true"
    >
      <style>{`
        @keyframes heroTraceDraw {
          0% {
            stroke-dashoffset: 1200;
            opacity: 0.3;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        .hero-trace-primary {
          stroke-dasharray: 1200;
          stroke-dashoffset: 0;
          animation: heroTraceDraw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-trace-primary {
            animation: none !important;
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 520 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[520px] text-accent overflow-visible"
      >
        {/* Subtle Background Circuit & Elevation Grid Contour Lines (15-20% opacity) */}
        <g stroke="currentColor" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="3 3">
          <line x1="40" y1="60" x2="480" y2="60" />
          <line x1="40" y1="120" x2="480" y2="120" />
          <line x1="40" y1="180" x2="480" y2="180" />
          <line x1="40" y1="240" x2="480" y2="240" />
          <line x1="40" y1="300" x2="480" y2="300" />
          <line x1="120" y1="30" x2="120" y2="330" />
          <line x1="220" y1="30" x2="220" y2="330" />
          <line x1="320" y1="30" x2="320" y2="330" />
          <line x1="420" y1="30" x2="420" y2="330" />
        </g>

        {/* Secondary Contour Waves (20% opacity) */}
        <g stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.25" strokeLinecap="round">
          <path d="M 50 100 Q 140 70 220 110 T 380 100" />
          <path d="M 60 270 Q 180 290 280 250 T 450 280" />
          <path d="M 90 200 Q 180 160 250 210 T 360 220" strokeDasharray="4 4" />
        </g>

        {/* Orthogonal Telemetry Lines (25% opacity) */}
        <g stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round">
          <path d="M 60 80 H 140 L 170 110 H 250" />
          <path d="M 80 290 H 160 L 190 260 H 310" />
          <path d="M 280 80 H 350 L 380 110 H 420" />
        </g>

        {/* Subtle Telemetry Nodes */}
        <g fill="currentColor" fillOpacity="0.28">
          <circle cx="140" cy="80" r="2.5" />
          <circle cx="250" cy="110" r="2.5" />
          <circle cx="160" cy="290" r="2.5" />
          <circle cx="310" cy="260" r="2.5" />
          <circle cx="380" cy="110" r="2.5" />
        </g>

        {/* MAIN CONNECTED TRACE PATH: Winds from left edge across coordinates to Lock Keyhole (35% opacity) */}
        <path
          d="M 30 180 H 100 L 130 150 H 200 L 230 210 H 310 L 350 170 H 410"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="hero-trace-primary"
        />

        {/* Active Trace Nodes along the main connected path */}
        <g fill="currentColor">
          <circle cx="100" cy="180" r="3" fillOpacity="0.4" />
          <circle cx="130" cy="150" r="3.5" fillOpacity="0.6" />
          <circle cx="200" cy="150" r="3" fillOpacity="0.4" />
          <circle cx="230" cy="210" r="3.5" fillOpacity="0.6" />
          <circle cx="310" cy="210" r="3" fillOpacity="0.4" />
          <circle cx="350" cy="170" r="3.5" fillOpacity="0.6" />
        </g>

        {/* Target Lock Body & Keyhole Geometry on the Right (Accent 35% and solid lines) */}
        <g className="hero-lock-target" transform="translate(410, 130)">
          {/* Lock Shackle */}
          <path
            d="M 18 40 V 22 A 18 18 0 0 1 54 22 V 40"
            stroke="currentColor"
            strokeOpacity="0.55"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Lock Body Rect */}
          <rect
            x="8"
            y="40"
            width="56"
            height="46"
            rx="8"
            stroke="currentColor"
            strokeOpacity="0.6"
            strokeWidth="2"
            fill="currentColor"
            fillOpacity="0.08"
          />

          {/* Keyhole Silhouette */}
          <circle cx="36" cy="58" r="4.5" fill="currentColor" fillOpacity="0.85" />
          <path
            d="M 34 60 L 32 72 H 40 L 38 60 Z"
            fill="currentColor"
            fillOpacity="0.85"
          />

          {/* Glowing Terminal Node inside Keyhole */}
          <circle cx="36" cy="58" r="1.75" fill="var(--color-bg, #0B0F14)" />
        </g>
      </svg>
    </div>
  );
};

export default HeroArt;
