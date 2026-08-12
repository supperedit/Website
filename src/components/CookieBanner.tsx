import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const decide = (value: "accepted" | "declined") => {
    localStorage.setItem("cookie-consent", value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 20,
        right: 20,
        bottom: 20,
        zIndex: 200,
        maxWidth: 480,
        marginInline: "auto",
        backgroundColor: "var(--color-ink)",
        color: "var(--color-cream)",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
      }}
    >
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
        Diese Seite verwendet Cookies, um dir ein besseres Erlebnis zu bieten. Mehr dazu in unserer{" "}
        <a href="/datenschutz" style={{ textDecoration: "underline" }}>Datenschutzerklärung</a>.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => decide("accepted")}
          style={{ background: "var(--color-terracotta)", color: "var(--color-cream)", border: "none", borderRadius: 999, padding: "8px 18px", fontSize: 13 }}
        >
          Akzeptieren
        </button>
        <button
          onClick={() => decide("declined")}
          style={{ background: "transparent", color: "var(--color-cream)", border: "1px solid rgba(247,243,231,0.4)", borderRadius: 999, padding: "8px 18px", fontSize: 13 }}
        >
          Ablehnen
        </button>
      </div>
    </div>
  );
}
