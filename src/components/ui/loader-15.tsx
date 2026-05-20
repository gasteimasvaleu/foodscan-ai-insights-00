import React from 'react';

interface LoaderProps {
  className?: string;
  size?: number;
}

const Loader: React.FC<LoaderProps> = ({ className = '', size = 64 }) => {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
      <style>{`
        @keyframes loader15-snurra {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -403px; }
        }
        .loader15-halvan {
          animation: loader15-snurra 10s infinite linear;
          stroke-dasharray: 180 800;
          fill: none;
          stroke: url(#loader15-gradient);
          stroke-width: 23;
          stroke-linecap: round;
        }
        .loader15-strecken {
          animation: loader15-snurra 3s infinite linear;
          stroke-dasharray: 26 54;
          fill: none;
          stroke: url(#loader15-gradient);
          stroke-width: 23;
          stroke-linecap: round;
        }
        .loader15-skugga {
          filter: blur(5px);
          opacity: 0.3;
          position: absolute;
          inset: 0;
          transform: translate(3px, 3px);
        }
        .loader15-snurra {
          filter: url(#loader15-gegga);
        }
      `}</style>

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="loader15-gegga">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="inreGegga" />
            <feComposite in="SourceGraphic" in2="inreGegga" operator="atop" />
          </filter>
          <linearGradient id="loader15-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f700a8" />
            <stop offset="100%" stopColor="#ff8000" />
          </linearGradient>
        </defs>
      </svg>

      <svg className="loader15-skugga" width="100%" height="100%" viewBox="0 0 200 200">
        <circle className="loader15-halvan" cx="100" cy="100" r="64" />
        <circle className="loader15-strecken" cx="100" cy="100" r="64" />
      </svg>
      <svg className="loader15-snurra" width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
        <circle className="loader15-halvan" cx="100" cy="100" r="64" />
        <circle className="loader15-strecken" cx="100" cy="100" r="64" />
      </svg>
    </div>
  );
};

export default Loader;
