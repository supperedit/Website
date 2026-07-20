import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="Seite nicht gefunden" description="Diese Seite gibt es nicht oder nicht mehr." />

      <section className="wrap" style={{ paddingBlock: 120, textAlign: "center" }}>
        <p style={{ fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-terracotta)", marginBottom: 12 }}>
          404
        </p>
        <h1 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", marginBottom: 16 }}>
          Diese Seite gibt es nicht.
        </h1>
        <p style={{ fontSize: 15, color: "var(--color-muted)", marginBottom: 32 }}>
          Vielleicht wurde das Rezept umbenannt oder der Link ist veraltet.
        </p>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "var(--color-terracotta)",
            color: "var(--color-cream)",
            borderRadius: 999,
            padding: "10px 24px",
            fontSize: 14,
          }}
        >
          Zur Startseite
        </Link>
      </section>
    </>
  );
}