import SEO from "../components/SEO";

export default function About() {
  return (
    <>
      <SEO title="Über uns" description="Warum es Supper Edit gibt." />

      <section className="wrap" style={{ paddingBlock: 80, maxWidth: 680 }}>
        <h1 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: 24 }}>
          Rezepte für Leute mit wenig Zeit und viel Hunger
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: 15, lineHeight: 1.8 }}>
          Supper Edit sammelt Gerichte, die sich im echten Alltag bewähren. Nicht die
          aufwendigsten Rezepte, sondern die, die man tatsächlich wieder kocht. Alles
          vegetarisch, vieles vegan oder mit veganer Option.
        </p>
        <p style={{ color: "var(--color-muted)", fontSize: 15, lineHeight: 1.8, marginTop: 16 }}>
          Die Rezepte entstehen aus dem eigenen Alltag, werden mehrfach getestet und erst
          dann geteilt, wenn sie wirklich funktionieren. Kein Foodstyling um jeden Preis,
          keine Zutatenlisten mit zwanzig Positionen, kein Drama.
        </p>
      </section>
    </>
  );
}
