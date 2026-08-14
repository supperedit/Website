import SEO from "../components/SEO";

export default function About() {
  return (
    <>
      <SEO title="Was ist Supper Edit" description="Worum es bei Supper Edit geht." />

      <section className="wrap" style={{ paddingBlock: "80px 48px", maxWidth: 680 }}>
        <p className="font-display" style={{ fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-muted)", marginBottom: 16 }}>
          Was ist Supper Edit
        </p>
        <h1 className="font-display" style={{ fontSize: "clamp(2.2rem, 6vw, 3.6rem)", lineHeight: 1.15, fontWeight: 400, marginBottom: 0 }}>
          Eine Sammlung von Gerichten, die man wirklich kocht.
        </h1>
      </section>

      <section className="wrap" style={{ maxWidth: 680, paddingBottom: 80 }}>
        <div style={{ borderTop: "1px solid var(--color-line)", paddingTop: 32 }}>
          <p style={{ fontSize: 15, lineHeight: 1.9, color: "var(--color-ink)", maxWidth: 540 }}>
            Nicht die aufwendigsten Rezepte. Nicht die fotogensten. Die, die abends um halb acht noch funktionieren, wenn man eigentlich keine Lust mehr hat. Die, die man in zwei Wochen wieder kocht, weil sie gut waren.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.9, color: "var(--color-ink)", maxWidth: 540, marginTop: 20 }}>
            Supper Edit ist vegetarisch — nicht als Statement, sondern weil das hier einfach so ist. Vieles ist vegan oder wird es mit einer kleinen Änderung. Keine Zutatenlisten mit zwanzig Positionen. Kein Drama.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.9, color: "var(--color-ink)", maxWidth: 540, marginTop: 20 }}>
            Jedes Rezept wird mehrfach gekocht, bevor es hier landet. Was nicht überzeugt, kommt nicht rein.
          </p>
        </div>
      </section>
    </>
  );
}
