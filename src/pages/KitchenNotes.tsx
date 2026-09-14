import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";

const topics = [
  { title: "Einmachen & Vorrat", description: "Die Saison im Glas: Methoden, Vorbereitung und was beim Haltbarmachen wichtig ist." },
  { title: "Fermentieren", description: "Zeit, Salz und kleine Veränderungen. Grundlagen zum Verstehen und Ausprobieren." },
  { title: "Küchenlexikon", description: "Zutaten, Begriffe und Techniken, die in der Küche immer wieder auftauchen." },
];

export default function KitchenNotes() {
  return (
    <>
      <SEO title="Kitchen Notes" description="Das kommende Küchenwissen von Supper Edit: Einmachen, Fermentieren und kleine Grundlagen für die Küche." />
      <section className="wrap kitchen-notes">
        <header>
          <p className="kitchen-notes-kicker">Aus der Küche, fürs nächste Mal.</p>
          <h1>Kitchen Notes</h1>
          <p className="kitchen-notes-intro">Einmachen, fermentieren und besser verstehen.
            Hier entsteht eine Sammlung für alles, was über ein Rezept hinausgeht.</p>
        </header>
        <p className="kitchen-notes-status">Die ersten Beiträge sind in Vorbereitung. Diese Themen erwarten dich:</p>
        <ol className="kitchen-notes-topics">
          {topics.map((topic, index) => (
            <li key={topic.title}>
              <span aria-hidden="true">0{index + 1}</span>
              <div><h2>{topic.title}</h2><p>{topic.description}</p></div>
            </li>
          ))}
        </ol>
        <Link className="kitchen-notes-link" to="/rezepte?kategorie=pickle">
          Bis dahin: Pickle &amp; Ferment entdecken <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
      <style>{`
        .kitchen-notes { max-width: 940px; padding-top: 140px; padding-bottom: 88px; color: var(--color-maroon); }
        .kitchen-notes-kicker { font-size: 12px; letter-spacing: .06em; margin-bottom: 20px; }
        .kitchen-notes h1 { font: 400 clamp(48px, 8vw, 88px)/1.1 var(--font-display); margin: 0 0 24px; }
        .kitchen-notes-intro { max-width: 580px; font-size: 17px; line-height: 1.8; }
        .kitchen-notes-status { margin: 40px 0 20px; font-size: 13px; line-height: 1.7; }
        .kitchen-notes-topics { margin: 0; padding: 0; list-style: none; border-bottom: 1px solid var(--color-line); }
        .kitchen-notes-topics li { display: grid; grid-template-columns: 32px 1fr; gap: 20px; padding: 24px 0; border-top: 1px solid var(--color-line); }
        .kitchen-notes-topics li > span { padding-top: 8px; font-size: 11px; }
        .kitchen-notes h2 { font: 400 clamp(25px, 4vw, 34px)/1.2 var(--font-display); margin: 0 0 8px; }
        .kitchen-notes-topics p { font-size: 14px; line-height: 1.8; margin: 0; max-width: 560px; }
        .kitchen-notes-link { display: inline-flex; align-items: center; gap: 14px; margin-top: 32px; padding-bottom: 8px; border-bottom: 1px solid currentColor; font-size: 14px; }
      `}</style>
    </>
  );
}
