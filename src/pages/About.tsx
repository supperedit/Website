import SEO from "../components/SEO";

export default function About() {
  return (
    <>
      <SEO title="Was ist Supper Edit" description="Über Abende, die man nicht vergisst." />

      <section className="wrap" style={{ paddingTop: 80, paddingBottom: 0, maxWidth: 780 }}>
        <p className="font-body" style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-muted)", marginBottom: 20 }}>
          Was ist Supper Edit
        </p>
        <h1 className="font-display" style={{ fontSize: "clamp(2.4rem, 7vw, 5rem)", lineHeight: 1.1, fontWeight: 400, maxWidth: 640, margin: 0 }}>
          Es geht ums Beisammensein. Das Essen ist der Anlass.
        </h1>
      </section>

      <section className="wrap" style={{ maxWidth: 780, paddingTop: 64, paddingBottom: 64 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 64px", alignItems: "start" }}>
          <div>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "var(--color-ink)", marginBottom: 20 }}>
              Supper — das englische Wort fürs Abendessen. Aber nicht das schnelle unter der Woche. Das andere. Wenn alle am Tisch sitzen, die Gläser voll sind und keiner mehr auf die Uhr schaut.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "var(--color-ink)" }}>
              Genau das will ich feiern. Mit Familie, mit Freunden, mit wem auch immer. Und ich will, dass das ohne dieses Gefühl passiert: oh Gott, was koche ich bloß? Was muss ich alles vorbereiten?
            </p>
          </div>
          <div>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "var(--color-ink)", marginBottom: 20 }}>
              Hier findest du Rezepte, die sich wirklich umsetzen lassen. Ideen für Drinks, für kleine Gänge, für den ganzen Abend. Irgendwann auch: was gerade auf der Wiese wächst, was Saison hat, was einem gut tut.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "var(--color-ink)" }}>
              Mir macht das Freude. Und diese Freude will ich weitergeben.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ maxWidth: 780, paddingBottom: 96 }}>
        <div style={{ borderTop: "1px solid var(--color-line)", paddingTop: 48, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 48, alignItems: "center" }}>
          <p className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.15, fontWeight: 400, color: "var(--color-maroon)", margin: 0 }}>
            Hey, hier sind Ideen. Einfach umzusetzen. Und trotzdem besonders.
          </p>
          <div style={{ aspectRatio: "4/5", borderRadius: 12, backgroundColor: "var(--color-sky)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p className="font-display" style={{ fontSize: 11, color: "var(--color-muted)", textAlign: "center", padding: 16, margin: 0 }}>Bild<br/>kommt noch</p>
          </div>
        </div>
      </section>
    </>
  );
}
