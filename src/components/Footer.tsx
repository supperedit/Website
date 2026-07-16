import { Link } from "react-router-dom";
import { navItems, legalItems } from "../data/navigation";
import Logo from "../assets/logos/logo_neu.svg?react";

export default function Footer() {
  const footerNavItems = navItems;

  return (
    <footer style={{ backgroundColor: "var(--color-maroon)", color: "var(--color-cream)", paddingBlock: 56 }}>
      <div className="wrap" style={{ display: "grid", gap: 40, gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
        <div>
          <Logo
            aria-label="Supper Edit"
            style={{ width: 160, height: "auto", fill: "var(--color-cream)" }}
          />
          <p style={{ marginTop: 16, maxWidth: 320, fontSize: 14, opacity: 0.8 }}>
            Einfache Rezepte und kleine Dinnerideen für den Alltag.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {footerNavItems.map((item) => (
            <Link key={item.path} to={item.path} style={{ fontSize: 14, opacity: 0.85 }}>
              {item.label}
            </Link>
          ))}
          <a href="https://de.pinterest.com/supperedit/" target="_blank" rel="noopener" style={{ fontSize: 14, opacity: 0.85 }}>
            Pinterest
          </a>
        </div>
      </div>

      <div className="wrap" style={{ marginTop: 40, paddingTop: 24, borderTop: "0px solid rgba(247,243,231,0.2)", display: "flex", gap: 20, flexWrap: "wrap" }}>
        {legalItems.map((item) => (
          <Link key={item.path} to={item.path} style={{ fontSize: 12, opacity: 0.65 }}>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="wrap" style={{ marginTop: 40 }}>
        <p
          className="font-display"
          style={{
            margin: 0,
            fontWeight: 900,
            fontStyle: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            fontSize: "clamp(49px, 15vw, 100px)",
            lineHeight: 0.8,
            color: "var(--color-lavender)"
          }}
        >
          Recipes worth making twice.
        </p>
      </div>
    </footer>
  );
}