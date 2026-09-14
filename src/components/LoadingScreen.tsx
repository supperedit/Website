import { useEffect } from "react";
import Logo from "../assets/logos/logo_neu.svg?react";

interface LoadingScreenProps { visible: boolean; }

export default function LoadingScreen({ visible }: LoadingScreenProps) {
  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [visible]);

  return (
    <div className={`loading-screen ${!visible ? "loading-screen-hidden" : ""}`}
      role="status" aria-label="Seite wird geladen" aria-hidden={!visible}>
      <Logo className="loading-logo" aria-hidden="true" />
      <p className="loading-message" lang="en">Gathering the good stuff.</p>
      <div className="loading-progress" aria-hidden="true">
        <span>Loading</span>
        <i /><i /><i />
      </div>
      <style>{`
        .loading-screen {
          position: fixed; inset: 0; z-index: 1000;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: var(--color-lavender); color: var(--color-cream);
          transition: opacity .4s ease, visibility .4s ease;
          opacity: 1; visibility: visible; touch-action: none;
        }
        .loading-screen-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
        .loading-logo { width: min(420px, 76vw); height: auto; aspect-ratio: 132.21 / 53.77; }
        .loading-logo, .loading-logo path { fill: var(--color-cream) !important; }
        .loading-message { margin: 28px 20px 16px; text-align: center; font: 400 clamp(22px, 5vw, 30px)/1.3 var(--font-display); }
        .loading-progress { display: flex; align-items: center; gap: 6px; font: 400 12px/1.5 var(--font-body); }
        .loading-progress span { margin-right: 6px; }
        .loading-progress i { width: 4px; height: 4px; border-radius: 50%; background: currentColor; animation: loadingDot 1.2s ease-in-out infinite; }
        .loading-progress i:nth-of-type(2) { animation-delay: .15s; }
        .loading-progress i:nth-of-type(3) { animation-delay: .3s; }
        .loading-screen-hidden i { animation: none; }
        @keyframes loadingDot { 0%, 60%, 100% { opacity: .35; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-4px); } }
        @media (prefers-reduced-motion: reduce) { .loading-screen { transition: none; } .loading-progress i { animation: none; } }
      `}</style>
    </div>
  );
}
