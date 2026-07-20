import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import LogoFull from "../assets/logos/logo_neu.svg?react";
import LogoSmall from "../assets/logos/logo_neu.svg?react";

const END_TOP = 28;
// Ziel-Breite in Pixel für den eingeschrumpften Zustand, muss zur Logo-Breite
// in Navbar.tsx passen (dort aktuell 96), damit Homepage und Unterseiten
// exakt gleich groß wirken.
const END_WIDTH = 96;
const FADE_START = 0.4;
const FADE_END = 0.6;

export default function AnimatedLogo() {
  const spacerRef = useRef<HTMLSpanElement>(null);
  const [start, setStart] = useState<{ top: number; left: number; width: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const tickingRef = useRef(false);

  const measure = () => {
    const rect = spacerRef.current?.getBoundingClientRect();
    if (rect && rect.width > 0) {
      const centerTop = (window.innerHeight - rect.height) / 2;
      const centerLeft = window.innerWidth / 2;
      setStart({ top: centerTop, left: centerLeft, width: rect.width });
    }
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);

    const update = () => {
      const threshold = window.innerHeight * 0.5;
      const value = Math.min(window.scrollY / threshold, 1);
      setProgress(value);
      tickingRef.current = false;
    };
    const handleScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const endScale = start ? END_WIDTH / start.width : 0.23;
  const top = start ? start.top + (END_TOP - start.top) * progress : END_TOP;
  const left = start ? start.left : undefined;
  const scale = 1 + (endScale - 1) * progress;

  const smallOpacity = Math.min(Math.max((progress - FADE_START) / (FADE_END - FADE_START), 0), 1);
  const fullOpacity = 1 - smallOpacity;

  return (
    <>
      {/* unsichtbarer Platzhalter, reserviert die Stelle im Hero und liefert die Startposition */}
      <span
        ref={spacerRef}
        style={{ width: "min(420px, 80vw)", aspectRatio: "132.21 / 53.77", display: "block", opacity: 0 }}
      />

      {start &&
        createPortal(
          <Link
            to="/"
            aria-label="Supper Edit, zur Startseite"
            className="logo-link"
            style={{
              position: "fixed",
              top: 0,
              left,
              width: start.width,
              zIndex: 300,
              transform: `translate3d(-50%, ${top}px, 0) scale(${scale})`,
              transformOrigin: "top center",
              willChange: "transform",
              cursor: "pointer",
              display: "block",
            }}
          >
            <div style={{ position: "relative", width: "100%" }}>
              {/* Über dem Hero Foto: hell, damit es sich vom dunklen Bild abhebt */}
              <LogoFull className="logo-light" style={{ width: "100%", height: "auto", display: "block", opacity: fullOpacity }} />
              {/* Sobald über dem hellen Seiteninhalt: dunkel, genau wie in der Navbar auf den Unterseiten */}
              <LogoSmall
                className="logo-dark"
                aria-hidden="true"
                style={{ position: "absolute", inset: 0, width: "100%", height: "auto", display: "block", opacity: smallOpacity }}
              />
            </div>
          </Link>,
          document.body,
        )}

      <style>{`
        .logo-light, .logo-light path {
          fill: var(--color-cream) !important;
        }
        .logo-dark, .logo-dark path {
          fill: var(--color-maroon) !important;
        }
      `}</style>
    </>
  );
}