import Logo from "../assets/logos/logo_neu.svg?react";

interface LoadingScreenProps {
  visible: boolean;
}

export default function LoadingScreen({ visible }: LoadingScreenProps) {
  return (
    <div
      className={`loading-screen ${!visible ? "loading-screen-hidden" : ""}`}
      aria-hidden={!visible}
    >
      <Logo className="loading-logo" />

      <style>{`
        .loading-screen {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-lavender);
          transition: opacity 0.5s ease, visibility 0.5s ease;
          opacity: 1;
          visibility: visible;
        }
        .loading-screen-hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .loading-logo {
          width: min(420px, 80vw);
          height: auto;
          aspect-ratio: 132.21 / 53.77;
          animation: loadingLogoIn 1.4s ease-in-out infinite;
          will-change: transform, opacity;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        /* Gleiche Farbe wie der Anfangszustand der Logoanimation im Hero,
           damit der Übergang beim Ausblenden nicht hart wirkt. */
        .loading-logo, .loading-logo path {
          fill: var(--color-cream) !important;
        }
        @keyframes loadingLogoIn {
          0%, 100% { opacity: 0.5; transform: translateZ(0) scale(0.96); }
          50% { opacity: 1; transform: translateZ(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .loading-screen { transition: none; }
          .loading-logo { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}