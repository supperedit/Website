import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import MenuPopup from "./MenuPopup";
import { useFavorites } from "../data/useFavorites";
import Logo from "../assets/logos/logo_neu.svg?react";

const BACKGROUND_THRESHOLD = 40;

export default function Navbar() {
  const [menuPopupOpen, setMenuPopupOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { favorites } = useFavorites();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > BACKGROUND_THRESHOLD);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          paddingInline: 16,
          paddingTop: 16,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            pointerEvents: "auto",
            position: "relative",
            maxWidth: 1180,
            marginInline: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: 24,
            paddingBlock: 16,
            borderRadius: 999,
            backgroundColor: scrolled ? "rgba(247, 246, 236, 0.35)" : "transparent",
            backdropFilter: scrolled ? "blur(14px)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(10px)" : "none",

            boxShadow: scrolled ? "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)" : "none",
  
            transition: "background-color 0.25s ease, backdrop-filter 0.25s ease, box-shadow 0.25s ease",
  }}
          
        >
          {!isHome && (
            <Link
              to="/"
              aria-label="Supper Edit, zur Startseite"
              style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 96 }}
            >
              <Logo style={{ width: "100%", height: "auto", display: "block" }} />
            </Link>
          )}

          <button
            onClick={() => setMenuPopupOpen(true)}
            className="font-display"
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              color: "var(--color-maroon)",
              cursor: "pointer",
            }}
          >
            Menü
          </button>

          <Link
            to="/merkliste"
            aria-label={favorites.length > 0 ? `Merkliste, ${favorites.length} gemerkt` : "Merkliste"}
            style={{ display: "flex", alignItems: "center", color: "var(--color-maroon)" }}
          >
            <Heart size={20} fill={favorites.length > 0 ? "var(--color-maroon)" : "none"} aria-hidden="true" />
          </Link>
        </div>
      </header>

      {menuPopupOpen && <MenuPopup onClose={() => setMenuPopupOpen(false)} />}
    </>
  );
}