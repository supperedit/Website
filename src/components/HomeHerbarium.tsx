import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useJournal } from "../data/useJournal";
import SpecimenCard from "./SpecimenCard";
import "../styles/herbarium.css";
import "../styles/home-herbarium.css";

export default function HomeHerbarium() {
  const { entries, loading, error } = useJournal();
  const rail = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const move = (direction: number) => {
    const list = rail.current;
    if (!list) return;
    const index = Math.max(0, Math.min(list.children.length - 1, active + direction));
    const card = list.children[index] as HTMLElement;
    const first = list.children[0] as HTMLElement;
    list.scrollTo({
      left: card.offsetLeft - first.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const updateActive = () => {
    const list = rail.current;
    if (!list || !list.children.length) return;
    const first = list.children[0] as HTMLElement;
    const distances = Array.from(list.children, (child) =>
      Math.abs((child as HTMLElement).offsetLeft - first.offsetLeft - list.scrollLeft),
    );
    setActive(distances.indexOf(Math.min(...distances)));
  };

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
            ref={rail}
            id="home-herbarium-cards"
            onScroll={updateActive}
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

        {!loading && featured.length > 1 && (
          <div className="home-herbarium-controls" aria-label="Pflanzenkarten durchblättern">
            <button type="button" onClick={() => move(-1)} disabled={active === 0}
              aria-label="Vorherige Pflanzenkarte" aria-controls="home-herbarium-cards">
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <span>{active + 1} / {featured.length}</span>
            <button type="button" onClick={() => move(1)} disabled={active === featured.length - 1}
              aria-label="Nächste Pflanzenkarte" aria-controls="home-herbarium-cards">
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </div>
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
