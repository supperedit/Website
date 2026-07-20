import { useState } from "react";
import SEO from "../components/SEO";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <SEO title="Kontakt" description="Fragen, Ideen oder Kooperationen, immer gern per Mail." />

      <section className="wrap" style={{ paddingBlock: 80, maxWidth: 480 }}>
        <h1 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: 12 }}>
          Kontakt
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: 14, marginBottom: 32 }}>
          Fragen, Ideen oder Kooperationen, immer gern per Mail.
        </p>

        {sent ? (
          <p style={{ fontSize: 16 }}>Danke, wir melden uns so schnell wie möglich.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            <label style={{ marginTop: 12, fontSize: 12, color: "var(--color-muted)" }}>Name</label>
            <input required style={{ border: "none", borderBottom: "1px solid var(--color-line)", background: "transparent", padding: "8px 0" }} />

            <label style={{ marginTop: 12, fontSize: 12, color: "var(--color-muted)" }}>E-Mail</label>
            <input type="email" required style={{ border: "none", borderBottom: "1px solid var(--color-line)", background: "transparent", padding: "8px 0" }} />

            <label style={{ marginTop: 12, fontSize: 12, color: "var(--color-muted)" }}>Nachricht</label>
            <textarea rows={5} required style={{ border: "none", borderBottom: "1px solid var(--color-line)", background: "transparent", padding: "8px 0", resize: "vertical" }} />

            <button
              type="submit"
              style={{ marginTop: 24, alignSelf: "flex-start", borderRadius: 999, border: "none", backgroundColor: "var(--color-terracotta)", color: "var(--color-cream)", padding: "12px 28px", fontSize: 14 }}
            >
              Absenden
            </button>
          </form>
        )}
      </section>
    </>
  );
}
