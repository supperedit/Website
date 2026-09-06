import { useState } from "react";
import { Link } from "react-router-dom";
import { useJournal } from "../data/useJournal";
import SEO from "../components/SEO";

const CATEGORIES = ["Alle", "Saisonal", "Zutaten", "Kräuter", "Reise & Food"];

const herbariumStyles = `
  .journal-page {
    background: var(--color-cream, #faf8f2);
    min-height: 100vh;
  }
  .journal-page-inner {
    max-width: 1200px;
    margin-inline: auto;
    padding-inline: 28px;
    padding-top: 120px;
    padding-bottom: 100px;
  }
  .journal-header {
    margin-bottom: 56px;
    padding-bottom: 40px;
    border-bottom: 1px solid var(--color-maroon, #5c2d1e);
    position: relative;
  }
  .journal-header::before {
    content: "MATERIA HERBARIA";
    position: absolute;
    top: 0;
    right: 0;
    font-size: 0.6rem;
    letter-spacing: 0.18em;
    color: var(--color-muted, #9a8a7a);
    font-style: italic;
  }
  .journal-title {
    font-size: clamp(3rem, 7vw, 5.5rem);
    color: var(--color-maroon, #5c2d1e);
    line-height: 1;
    margin-bottom: 12px;
    letter-spacing: -0.01em;
  }
  .journal-subtitle {
    font-size: 0.8rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-muted, #9a8a7a);
    font-style: italic;
    margin-bottom: 16px;
  }
  .journal-desc {
    font-size: 0.95rem;
    color: var(--color-muted, #9a8a7a);
    max-width: 420px;
    line-height: 1.6;
    font-style: italic;
  }
  .journal-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 52px;
  }
  .journal-filter-btn {
    padding: 5px 18px;
    border-radius: 0;
    border: 1px solid;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s ease;
    font-style: italic;
  }
  .journal-filter-btn[aria-pressed="true"] {
    border-color: var(--color-maroon, #5c2d1e);
    background: var(--color-maroon, #5c2d1e);
    color: var(--color-cream, #faf8f2);
  }
  .journal-filter-btn[aria-pressed="false"] {
    border-color: var(--color-maroon, #5c2d1e);
    background: transparent;
    color: var(--color-maroon, #5c2d1e);
  }
  .journal-filter-btn[aria-pressed="false"]:hover {
    background: color-mix(in srgb, var(--color-maroon, #5c2d1e) 8%, transparent);
  }
  .journal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 0;
  }
  .journal-card-link {
    text-decoration: none;
    display: block;
    border: 1px solid var(--color-maroon, #5c2d1e);
    margin-right: -1px;
    margin-bottom: -1px;
    transition: background 0.2s ease;
    position: relative;
  }
  .journal-card-link:hover {
    background: color-mix(in srgb, var(--color-maroon, #5c2d1e) 4%, transparent);
    z-index: 1;
  }
  .journal-card-image-wrap {
    aspect-ratio: 3/2;
    overflow: hidden;
    background: color-mix(in srgb, var(--color-maroon, #5c2d1e) 6%, var(--color-cream, #faf8f2));
    border-bottom: 1px solid var(--color-maroon, #5c2d1e);
    position: relative;
  }
  .journal-card-image-wrap::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 60%, rgba(92,45,30,0.15) 100%);
    pointer-events: none;
  }
  .journal-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: sepia(12%) saturate(85%);
    transition: filter 0.3s ease, transform 0.4s ease;
  }
  .journal-card-link:hover .journal-card-img {
    filter: sepia(0%) saturate(100%);
    transform: scale(1.02);
  }
  .journal-card-body {
    padding: 20px 22px 26px;
  }
  .journal-card-meta {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
    align-items: baseline;
  }
  .journal-card-category {
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-terracotta, #c0604a);
    font-style: italic;
  }
  .journal-card-season {
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-muted, #9a8a7a);
  }
  .journal-card-title {
    font-size: 1.45rem;
    color: var(--color-maroon, #5c2d1e);
    margin-bottom: 8px;
    line-height: 1.15;
    letter-spacing: -0.01em;
  }
  .journal-card-intro {
    font-size: 0.85rem;
    color: var(--color-muted, #9a8a7a);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-style: italic;
  }
  .journal-card-foot {
    margin-top: 14px;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-terracotta, #c0604a);
    font-style: italic;
  }
`;

export default function Journal() {
  const { entries, loading } = useJournal();
  const [activeCategory, setActiveCategory] = useState("Alle");

  const filtered =
    activeCategory === "Alle"
      ? entries
      : entries.filter((e) => e.category === activeCategory);

  return (
    <>
      <style>{herbariumStyles}</style>
      <SEO
        title="Journal – Supper Edit"
        description="Wissen rund ums Kochen: Zutaten, Saison, Geschmack und Hintergruende."
      />

      <div className="journal-page" role="main">
        <div className="journal-page-inner">

          <header className="journal-header">
            <h1 className="journal-title font-display" aria-label="Journal">
              Journal
            </h1>
            <p className="journal-subtitle">Culinaria · Materia · Saison</p>
            <p className="journal-desc">
              Hintergruende, Geschmacksprofile und alles, was gut zu kochen wissen gehoert.
            </p>
          </header>

          <nav aria-label="Kategorien filtern" className="journal-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className="journal-filter-btn"
              >
                {cat}
              </button>
            ))}
          </nav>

          {loading && (
            <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>
              Wird geladen …
            </p>
          )}

          {!loading && filtered.length === 0 && (
            <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>
              Noch keine Eintraege in dieser Kategorie.
            </p>
          )}

          <ul
            className="journal-grid"
            style={{ listStyle: "none", padding: 0, margin: 0 }}
            aria-label="Journal-Eintraege"
          >
            {filtered.map((entry) => (
              <li key={entry.slug}>
                <Link
                  to={`/journal/${entry.slug}`}
                  className="journal-card-link"
                  aria-label={`${entry.title}${entry.season ? `, ${entry.season}` : ""}`}
                >
                  {entry.image && (
                    <div className="journal-card-image-wrap">
                      <img
                        src={entry.image}
                        alt={entry.title}
                        loading="lazy"
                        className="journal-card-img"
                      />
                    </div>
                  )}

                  <div className="journal-card-body">
                    <div className="journal-card-meta">
                      {entry.category && (
                        <span className="journal-card-category" aria-label={`Kategorie: ${entry.category}`}>
                          {entry.category}
                        </span>
                      )}
                      {entry.season && (
                        <span className="journal-card-season" aria-label={`Saison: ${entry.season}`}>
                          {entry.season}
                        </span>
                      )}
                    </div>

                    <h2 className="journal-card-title font-display">
                      {entry.title}
                    </h2>

                    {entry.intro && (
                      <p className="journal-card-intro">{entry.intro}</p>
                    )}

                    <p className="journal-card-foot" aria-hidden="true">Eintrag lesen →</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
