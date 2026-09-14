import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import MenuFrame from "../assets/icons/menu-frame.svg?react";

interface MenuPopupProps { onClose: () => void; }

const links = [
  { to: "/", label: "Start" },
  { to: "/rezepte", label: "Rezepte" },
  { to: "/journal", label: "Herbarium" },
  { to: "/kitchen-notes", label: "Kitchen Notes" },
];

export default function MenuPopup({ onClose }: MenuPopupProps) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const callback = useRef(onClose);
  callback.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); callback.current(); }
      if (event.key !== "Tab") return;
      const controls = panel.current?.querySelectorAll<HTMLElement>("button, a[href]");
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <div className="menu-popup-overlay" onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div ref={panel} className="menu-popup-card" role="dialog" aria-modal="true" aria-label="Navigation">
        <MenuFrame className="menu-popup-frame" aria-hidden="true" />
        <button ref={close} type="button" onClick={onClose} className="menu-popup-close" aria-label="Menü schließen">
          <X size={22} aria-hidden="true" />
        </button>
        <div className="menu-popup-content">
          <p className="menu-popup-eyebrow">Supper Edit · Das Menü</p>
          <nav aria-label="Hauptnavigation">
            <ol className="menu-nav-list">
              {links.map(({ to, label }, index) => (
                <li key={to}>
                  <NavLink to={to} end={to === "/"} onClick={onClose} className="menu-nav-link">
                    <span aria-hidden="true">0{index + 1}</span>{label}
                  </NavLink>
                </li>
              ))}
            </ol>
          </nav>
          <p className="menu-tagline">Good food. Good company.</p>
        </div>
      </div>
      <style>{`
        .menu-popup-overlay {
          position: fixed; inset: 0; z-index: 400;
          display: flex; align-items: flex-start; justify-content: flex-start;
          overflow-y: auto; padding: 80px 20px 20px max(20px, calc((100vw - 1180px) / 2));
          background: rgba(43, 18, 16, .24);
        }
        .menu-popup-card {
          position: relative; flex: 0 0 auto; width: min(400px, 88vw);
          aspect-ratio: 1325 / 2020; color: var(--color-maroon);
          animation: menuCardIn .25s ease both;
        }
        .menu-popup-frame { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
        .menu-popup-frame path { fill: var(--color-blush); stroke: var(--color-maroon); stroke-width: 3px; }
        .menu-popup-close {
          position: absolute; top: 12%; right: 11%; width: 44px; height: 44px;
          display: grid; place-items: center; border: 0; background: transparent; color: inherit; cursor: pointer;
        }
        .menu-popup-content { position: absolute; inset: 23% 13% 20%; display: flex; flex-direction: column; justify-content: space-between; }
        .menu-popup-eyebrow { margin: 0 0 20px; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
        .menu-nav-list { list-style: none; padding: 0; margin: 0; }
        .menu-nav-list li + li { border-top: 1px solid color-mix(in srgb, var(--color-maroon) 25%, transparent); }
        .menu-nav-link { display: flex; align-items: baseline; gap: 12px; padding-block: 12px; font: 400 clamp(25px, 6.5vw, 34px)/1.2 var(--font-display); color: inherit; }
        .menu-nav-link span { font: 400 10px/1 var(--font-body); opacity: .6; }
        .menu-nav-link:hover, .menu-nav-link.active { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 5px; }
        .menu-popup-close:focus-visible, .menu-nav-link:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
        .menu-tagline { margin: 20px 0 0; font-size: 11px; }
        @keyframes menuCardIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @media (max-width: 640px) { .menu-popup-overlay { padding: 24px 12px; justify-content: center; } }
        @media (prefers-reduced-motion: reduce) { .menu-popup-card { animation: none; } }
      `}</style>
    </div>
  );
}
