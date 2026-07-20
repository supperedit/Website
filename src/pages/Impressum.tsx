import SEO from "../components/SEO";

export default function Impressum() {
  return (
    <>
      <SEO title="Impressum" description="Impressum von Supper Edit." />

      <section className="wrap" style={{ paddingBlock: 80, maxWidth: 640 }}>
        <h1 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", marginBottom: 24 }}>
          Impressum
        </h1>

        {/* Trag hier deine echten Angaben ein */}
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-muted)" }}>
          Angaben gemäß § 5 TMG
          <br />
          Amy Djuritschek
          <br />
          Schuberstr. 42
          <br />
          90530 Wendelstein
        </p>

        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-muted)", marginTop: 24 }}>
          Kontakt
          <br />
          suppereditclub@gmail.com
        </p>

        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-muted)", marginTop: 24 }}>
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
          <br />
          Amy Djuritschek
          <br />
          Schuberstr. 42
          <br />
          90530 Wendelstein
        </p>
      </section>
    </>
  );
}
