import Logo from "../assets/logos/logo_neu.svg?react";

interface LoadingScreenProps {
  visible: boolean;
}

export default function LoadingScreen({ visible }: LoadingScreenProps) {
  return (
    <div
      className={`loading-screen ${!visible ? "loading-screen-hidden" : ""}`}
      role="status"
      aria-label="Seite wird geladen"
      aria-hidden={!visible}
    >
      <Logo className="loading-logo" aria-hidden="true" />

      <style>{`
        .loading-screen {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-lavender);
          transition: opacity 0.4s ease, visibility 0.4s ease;
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
          animation: loadingLogoIn 0.5s ease-out forwards;
          will-change: opacity, transform;
          backface-visibility: hidden;
        }
        .loading-logo, .loading-logo path {
          fill: var(--color-cream) !important;
        }
        @keyframes loadingLogoIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .loading-screen { transition: none; }
          .loading-logo { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
