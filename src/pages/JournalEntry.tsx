import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useJournal } from "../data/useJournal";
import { useRecipes } from "../data/useRecipes";
import RecipeCard from "../components/RecipeCard";
import SEO from "../components/SEO";

const herbariumEntryStyles = `
  .entry-page {
    background: var(--color-cream, #faf8f2);
    min-height: 100vh;
  }
  .entry-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-muted, #9a8a7a);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 4px 0;
    margin-bottom: 52px;
    font-style: italic;
    transition: color 0.15s ease;
  }
  .entry-back-btn:hover {
    color: var(--color-maroon, #5c2d1e);
  }
  .entry-back-btn:focus-visible {
    outline: 2px solid var(--color-terracotta, #c0604a);
    outline-offset: 3px;
    border-radius: 2px;
  }
  .entry-inner {
    max-width: 760px;
    margin-inline: auto;
    padding-inline: 28px;
    padding-top: 100px;
    padding-bottom: 80px;
  }
  .entry-classification {
    display: flex;
    gap: 16px;
    align-items: baseline;
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px solid color-mix(in srgb, var(--color-maroon, #5c2d1e) 25%, transparent);
  }
  .entry-class-category {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-terracotta, #c0604a);
    font-style: italic;
  }
  .entry-class-divider {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-maroon, #5c2d1e) 30%, transparent);
    align-self: center;
  }
  .entry-class-season {
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-muted, #9a8a7a);
    font-style: italic;
  }
  .entry-title {
    font-size: clamp(2.4rem, 6vw, 4.2rem);
    color: var(--color-maroon, #5c2d1e);
    line-height: 1.0;
    margin-bottom: 24px;
    letter-spacing: -0.02em;
  }
  .entry-intro {
    font-size: 1.1rem;
    color: var(--color-muted, #9a8a7a);
    line-height: 1.7;
    font-style: italic;
    margin-bottom: 0;
    padding-bottom: 36px;
    border-bottom: 1px solid color-mix(in srgb, var(--color-maroon, #5c2d1e) 15%, transparent);
  }
  .entry-figure {
    margin: 40px 0 48px;
    position: relative;
  }
  .entry-figure::before {
    content: "";
    position: absolute;
    inset: -8px;
    border: 1px solid color-mix(in srgb, var(--color-maroon, #5c2d1e) 20%, transparent);
    pointer-events: none;
    z-index: 1;
  }
  .entry-img {
    width: 100%;
    display: block;
    max-height: 500px;
    object-fit: cover;
    filter: sepia(8%) saturate(88%);
  }
  .entry-sections {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .entry-section {
    padding: 36px 0;
    border-bottom: 1px solid color-mix(in srgb, var(--color-maroon, #5c2d1e) 15%, transparent);
    position: relative;
  }
  .entry-section-label {
    font-size: 0.6rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-muted, #9a8a7a);
    font-style: italic;
    margin-bottom: 14px;
    display: block;
  }
  .entry-section-heading {
    font-size: 1.5rem;
    color: var(--color-maroon, #5c2d1e);
    margin-bottom: 14px;
    line-height: 1.1;
    letter-spacing: -0.01em;
  }
  .entry-section-text {
    font-size: 1rem;
    color: color-mix(in srgb, var(--color-maroon, #5c2d1e) 75%, var(--color-cream, #faf8f2));
    line-height: 1.75;
  }
  .entry-note {
    margin-top: 40px;
    padding: 28px 32px;
    border: 1px solid var(--color-terracotta, #c0604a);
    position: relative;
  }
  .entry-note::before {
    content: "Notiz";
    position: absolute;
    top: -9px;
    left: 20px;
    background: var(--color-cream, #faf8f2);
    padding: 0 8px;
    font-size: 0.6rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-terracotta, #c0604a);
    font-style: italic;
  }
  .entry-note-text {
    font-size: 1rem;
    color: var(--color-maroon, #5c2d1e);
    line-height: 1.7;
    font-style: italic;
    margin: 0;
  }
  .entry-recipes-section {
    max-width: 1180px;
    margin-inline: auto;
    padding-inline: 28px;
    padding-top: 0;
    padding-bottom: 100px;
  }
  .entry-recipes-divider {
    height: 1px;
    background: color-mix(in srgb, var(--color-maroon, #5c2d1e) 20%, transparent);
    margin-bottom: 48px;
  }
  .entry-recipes-label {
    font-size: 0.6rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-muted, #9a8a7a);
    font-style: italic;
    margin-bottom: 10px;
    display: block;
  }
  .entry-recipes-heading {
    font-size: 1.8rem;
    color: var(--color-maroon, #5c2d1e);
    margin-bottom: 36px;
    line-height: 1.05;
    letter-spacing: -0.01em;
  }
  .entry-recipes-grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 340px));
    gap: 28px;
    justify-content: center;
  }
`;

export default function JournalEntry() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { entries, loading } = useJournal();
  const { recipes } = useRecipes();
  const entry = entries.find((e) => e.slug === slug);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/journal");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        role="status"
        aria-live="polite"
      >
        <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>
          Wird geladen …
        </p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
        role="main"
      >
        <p style={{ color: "var(--color-muted)", fontStyle: "italic" }}>Eintrag nicht gefunden.</p>
        <Link to="/journal" style={{ color: "var(--color-terracotta)", fontSize: "0.9rem" }}>
          Zum Journal
        </Link>
      </div>
    );
  }

  const linkedRecipeCards = entry.linkedRecipes
    .map((id) => recipes.find((r) => r.slug === id))
    .filter(Boolean)
    .slice(0, 3);

  const sections = [
    { label: "Hintergrund", content: entry.background },
    { label: "Geschmacksprofil", content: entry.tastingNotes },
    { label: "Fun Fact", content: entry.funFact },
  ].filter((s) => s.content);

  return (
    <>
      <style>{herbariumEntryStyles}</style>
      <SEO
        title={`${entry.title} – Journal – Supper Edit`}
        description={entry.intro ?? `${entry.title} im Supper Edit Journal.`}
        image={entry.image}
      />

      <article className="entry-page" lang="de">
        <div className="entry-inner">
          <button
            type="button"
            onClick={goBack}
            aria-label="Zurueck zum Journal"
            className="entry-back-btn"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            Zurueck
          </button>

          <header>
            {(entry.category || entry.season) && (
              <div className="entry-classification" aria-label="Klassifikation">
                {entry.category && (
                  <span className="entry-class-category">{entry.category}</span>
                )}
                {entry.category && entry.season && (
                  <span className="entry-class-divider" aria-hidden="true" />
                )}
                {entry.season && (
                  <span className="entry-class-season">{entry.season}</span>
                )}
              </div>
            )}

            <h1 className="entry-title font-display">{entry.title}</h1>

            {entry.intro && (
              <p className="entry-intro">{entry.intro}</p>
            )}
          </header>

          {entry.image && (
            <figure className="entry-figure" aria-label={`Bild: ${entry.title}`}>
              <img
                src={entry.image}
                alt={entry.title}
                className="entry-img"
              />
            </figure>
          )}

          <div className="entry-sections">
            {sections.map((section) => (
              <section
                key={section.label}
                className="entry-section"
                aria-labelledby={`section-${section.label}`}
              >
                <span className="entry-section-label" aria-hidden="true">
                  {section.label === "Hintergrund" && "Historia"}
                  {section.label === "Geschmacksprofil" && "Gustus"}
                  {section.label === "Fun Fact" && "Curiositas"}
                </span>
                <h2
                  id={`section-${section.label}`}
                  className="entry-section-heading font-display"
                >
                  {section.label}
                </h2>
                <p className="entry-section-text">{section.content}</p>
              </section>
            ))}
          </div>

          {entry.myNote && (
            <aside className="entry-note" aria-label="Persoenlicher Kommentar">
              <p className="entry-note-text">{entry.myNote}</p>
            </aside>
          )}
        </div>

        {linkedRecipeCards.length > 0 && (
          <section
            aria-labelledby="linked-recipes-heading"
            className="entry-recipes-section"
          >
            <div className="entry-recipes-divider" aria-hidden="true" />
            <span className="entry-recipes-label" aria-hidden="true">Receptura</span>
            <h2
              id="linked-recipes-heading"
              className="entry-recipes-heading font-display"
            >
              Passende Rezepte
            </h2>
            <ul className="entry-recipes-grid" aria-label="Verlinkte Rezepte">
              {linkedRecipeCards.map(
                (recipe) =>
                  recipe && (
                    <li key={recipe.slug}>
                      <RecipeCard recipe={recipe} />
                    </li>
                  )
              )}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
