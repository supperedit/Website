import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useJournal } from "../data/useJournal";
import SpecimenCard from "./SpecimenCard";
import "../styles/herbarium.css";
import "../styles/home-herbarium.css";

export default function HomeHerbarium() {
  const { entries, loading, error } = useJournal();

  const month = new Date().toLocaleString("de-DE", {
    month: "long",
  });

  const featured = useMemo(() => {
    const illustrated = entries.filter(
      (entry) => entry.image,
    );

    const seasonal = (entry: typeof entries[number]) =>
      entry.seasonMonths?.some((value) =>
        value
          .toLowerCase()
          .startsWith(month.toLowerCase().slice(0, 3)),
      ) ?? false;

    const sorted = [...illustrated].sort(
      (a, b) =>
        Number(seasonal(b)) - Number(seasonal(a)) ||
        a.title.localeCompare(b.title, "de"),
    );

    const selected: typeof entries = [];

    for (const entry of sorted) {
      if (
        !selected.some(
          (item) => item.category === entry.category,
        )
      ) {
        selected.push(entry);
      }

      if (selected.length === 3) break;
    }

    for (const entry of sorted) {
      if (selected.length === 3) break;

      if (
        !selected.some(
          (item) => item.slug === entry.slug,
        )
      ) {
        selected.push(entry);
      }
    }

    return selected;
  }, [entries, month]);

  return (
    <section
      className="home-herbarium"
      aria-labelledby="home-herbarium-title"
    >
      <div className="wrap">
        <header className="home-herbarium-heading">
          <div>
            <p className="home-herbarium-kicker">
              Aus dem Herbarium
            </p>
            <h2 id="home-herbarium-title">
              Was draußen wächst.
            </h2>
          </div>

          <p>
            Früchte, Kräuter und kleine Entdeckungen.
            Eine Sammlung zum Kennenlernen, Nachschlagen
            und Mitnehmen in die Küche.
          </p>
        </header>

        {loading ? (
          <div
            className="home-herbarium-loading"
            role="status"
          >
            <span className="sr-only">
              Die Pflanzensammlung wird geladen.
            </span>

            {[0, 1, 2].map((item) => (
              <div key={item} aria-hidden="true" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <ul
            className="home-herbarium-grid"
            aria-label="Einblicke ins Herbarium"
          >
            {featured.map((entry) => (
              <li key={entry.slug}>
                <Link
                  to={`/journal/${entry.slug}`}
                  className="specimen"
                  aria-label={`${entry.title} im Herbarium entdecken`}
                >
                  <SpecimenCard entry={entry} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="home-herbarium-empty">
            {error
              ? "Die Pflanzenkarten konnten gerade nicht geladen werden."
              : "Die Sammlung wächst. Entdecke das Herbarium."}
          </p>
        )}

        <div className="home-herbarium-footer">
          <span>Von der Pflanze zum Teller.</span>

          <Link to="/journal">
            Das Herbarium entdecken
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
