import { useEffect, useRef } from "react";
import SEO from "../components/SEO";

export default function About() {
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.15 }
    );
    sectionsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const fadeIn = (i: number) => ({
    ref: (el: HTMLDivElement) => { sectionsRef.current[i] = el; },
    style: {
      opacity: 0,
      transform: "translateY(28px)",
      transition: `opacity 0.7s ease ${i * 0.08}s, transform 0.7s ease ${i * 0.08}s`,
    } as React.CSSProperties,
  });

  const marqueeWords = ["Zusammensein · ", "Abendbrot · ", "Saison · ", "Wildkräuter · ", "Dinnerparty · ", "Kein Stress · ", "Gute Gesellschaft · "];

  return (
    <>
      <SEO title="Was ist Supper Edit" description="Über Abende, die man nicht vergisst." />

      <section style={{ backgroundColor: "var(--color-lavender)", padding: "80px 0 64px" }}>
        <div className="wrap" style={{ maxWidth: 780 }}>
          <p className="font-body" style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-maroon)", opacity: 0.6, marginBottom: 24 }}>
            Was ist Supper Edit
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(3rem, 10vw, 7rem)", lineHeight: 0.95, fontWeight: 400, color: "var(--color-maroon)", margin: 0 }}>
            Gutes Essen<br />ist kein<br />Selbstzweck.
          </h1>
        </div>
      </section>

      <div style={{ backgroundColor: "var(--color-maroon)", overflow: "hidden", padding: "14px 0" }}>
        <div style={{ display: "flex", gap: 0, animation: "marqueeLeft 18s linear infinite", whiteSpace: "nowrap" }}>
          {[...marqueeWords, ...marqueeWords].map((w, i) => (
            <span key={i} className="font-display" style={{ fontSize: 15, color: "var(--color-cream)", paddingRight: 0 }}>{w}</span>
          ))}
        </div>
        <style>{`@keyframes marqueeLeft { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </div>

      <section className="wrap" style={{ maxWidth: 780, paddingBlock: 80 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px 48px", alignItems: "start" }}>
          <div {...fadeIn(0)}>
            <p className="font-display" style={{ fontSize: "clamp(3.5rem, 8vw, 5.5rem)", lineHeight: 1, fontWeight: 400, color: "var(--color-terracotta)", margin: "0 0 16px" }}>
              Supper
            </p>
            <p style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-muted)", marginBottom: 8 }}>
              /ˈsʌpər/ · Englisch
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-ink)" }}>
              Das Abendessen — aber nicht das schnelle. Das, bei dem man bleibt. Bei dem Gläser nachgefüllt werden und niemand auf die Uhr schaut.
            </p>
          </div>

          <div {...fadeIn(1)} style={{ ...(fadeIn(1).style), paddingTop: 8 }}>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "var(--color-ink)", marginBottom: 20 }}>
              Es geht um den Abend. Darum, dass alle am Tisch sitzen und niemand gestresst aus der Küche kommt. Um das Zelebrieren — mit Familie, mit Freunden, mit wem auch immer man gerade zusammen ist.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "var(--color-ink)" }}>
              Nicht: oh Gott, was koche ich bloß? Sondern: hier sind Ideen. Einfach umsetzbar. Und trotzdem besonders.
            </p>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: "var(--color-cream)", borderTop: "1px solid var(--color-line)", borderBottom: "1px solid var(--color-line)" }}>
        <div className="wrap" style={{ maxWidth: 780, paddingBlock: 64 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
            {[
              { label: "Rezepte", text: "Die hier funktionieren. Immer wieder. Auch am Dienstagabend." },
              { label: "Saison & Natur", text: "Was gerade wächst — im Garten, auf der Wiese, im Wald. Und was man damit machen kann." },
              { label: "Mehr als Essen", text: "Gerichte mit Geschichte. Zutaten, die einem guttun. Das ganze Drumherum." },
            ].map((item, i) => (
              <div key={i} {...fadeIn(i + 2)}>
                <p className="font-display" style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", color: "var(--color-maroon)", marginBottom: 10 }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.8, color: "var(--color-muted)" }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap" style={{ maxWidth: 780, paddingBlock: 80 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 48, alignItems: "center" }}>
          <div {...fadeIn(5)}>
            <p className="font-display" style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", lineHeight: 1.25, fontWeight: 400, color: "var(--color-ink)", margin: "0 0 24px" }}>
              „Mir macht das Freude.<br />Diese Freude will ich weitergeben."
            </p>
            <p style={{ fontSize: 14, color: "var(--color-muted)" }}>Amy, Gründerin von Supper Edit</p>
          </div>

          <div {...fadeIn(6)} style={{ ...(fadeIn(6).style), aspectRatio: "3/4", backgroundColor: "var(--color-lavender)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p className="font-display" style={{ fontSize: 12, color: "var(--color-maroon)", opacity: 0.4, textAlign: "center", padding: 16 }}>Foto<br />kommt noch</p>
          </div>
        </div>
      </section>
    </>
  );
}
