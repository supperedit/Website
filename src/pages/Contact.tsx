import SEO from "../components/SEO";

export default function Contact() {
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
        <a
          href="mailto:suppereditclub@gmail.com"
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "var(--color-terracotta)",
            color: "var(--color-cream)",
            borderColor: "var(--color-terracotta)",
          }}
        >
          E-Mail schreiben
        </a>
      </section>
    </>
  );
}
