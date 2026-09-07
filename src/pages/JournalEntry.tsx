import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useJournal } from "../data/useJournal";
import { useRecipes } from "../data/useRecipes";
import RecipeCard from "../components/RecipeCard";
import SEO from "../components/SEO";

export default function JournalEntry() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { entries, loading } = useJournal();
  const { recipes } = useRecipes();
  const entry = entries.find((e) => e.slug === slug);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/journal");
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
      >
        <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
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
      >
        <p style={{ color: "var(--color-muted)" }}>Eintrag nicht gefunden.</p>
        <Link
          to="/journal"
          style={{ color: "var(--color-terracotta)", fontSize: "0.9rem" }}
        >
          Zum Journal
        </Link>
      </div>
    );
  }

  const linkedRecipeCards = entry.linkedRecipes
    .map((id) => recipes.find((r) => r.slug === id))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <>
      <SEO
        title={`${entry.title} – Journal – Supper Edit`}
        description={entry.intro ?? `${entry.title} im Supper Edit Journal.`}
        image={entry.image}
      />

      <style>{`
        .je-herbar-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(32px, 5vw, 72px);
          align-items: start;
        }
        @media (max-width: 700px) {
          .je-herbar-grid {
            grid-template-columns: 1fr;
          }
        }
        .je-field {
          padding: 16px 20px;
          border: 1px solid var(--color-border, #e0d8cc);
        }
        .je-field + .je-field {
          border-top: none;
        }
        .je-field-label {
          font-size: 0.63rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-muted, #9a8a7a);
          margin-bottom: 5px;
        }
        .je-field-value {
          font-size: 0.93rem;
          color: var(--color-maroon, #5c2d1e);
          line-height: 1.55;
        }
        .je-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .je-field-row .je-field:first-child {
          border-right: none;
        }
        @media (max-width: 400px) {
          .je-field-row {
            grid-template-columns: 1fr;
          }
          .je-field-row .je-field:first-child {
            border-right: 1px solid var(--color-border, #e0d8cc);
            border-bottom: none;
          }
        }
      `}</style>

      <article>
        <div
          style={{
            maxWidth: 1120,
            marginInline: "auto",
            paddingInline: "clamp(20px, 5vw, 60px)",
            paddingTop: 100,
            paddingBottom: 72,
          }}
        >
          <button
            type="button"
            onClick={goBack}
            aria-label="Zurück zum Journal"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-muted, #9a8a7a)",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 0",
              marginBottom: 52,
            }}
          >
            <ChevronLeft size={14} aria-hidden="true" />
            Journal
          </button>

          <h1
            className="font-display"
            style={{
              fontSize: "clamp(3.5rem, 9vw, 7.5rem)",
              color: "var(--color-maroon, #5c2d1e)",
              lineHeight: 0.92,
              marginBottom: 52,
              letterSpacing: "-0.025em",
            }}
          >
            {entry.title}
          </h1>

          <div className="je-herbar-grid">
            {entry.image ? (
              <figure
                style={{ margin: 0 }}
                aria-label={`Bild von ${entry.title}`}
              >
                <img
                  src={entry.image}
                  alt={entry.title}
                  style={{
                    width: "100%",
                    aspectRatio: "4 / 5",
                    objectFit: "cover",
                    display: "block",
                    border: "1px solid var(--color-border, #e0d8cc)",
                  }}
                />
              </figure>
            ) : (
              <div
                aria-hidden="true"
                style={{
                  aspectRatio: "4 / 5",
                  background: "var(--color-border, #e0d8cc)",
                }}
              />
            )}

            <div>
              {(entry.category || entry.season) && (
                <div className="je-field-row" role="list" aria-label="Kategorie und Saison">
                  {entry.category && (
                    <div className="je-field" role="listitem">
                      <div className="je-field-label">Kategorie</div>
                      <div className="je-field-value">{entry.category}</div>
                    </div>
                  )}
                  {entry.season && (
                    <div className="je-field" role="listitem">
                      <div className="je-field-label">Saison</div>
                      <div className="je-field-value">{entry.season}</div>
                    </div>
                  )}
                </div>
              )}

              {entry.tastingNotes && (
                <div className="je-field" role="region" aria-label="Geschmacksprofil">
                  <div className="je-field-label">Geschmacksprofil</div>
                  <p
                    className="je-field-value"
                    style={{ margin: 0, lineHeight: 1.65 }}
                  >
                    {entry.tastingNotes}
                  </p>
                </div>
              )}

              {entry.intro && (
                <p
                  style={{
                    fontSize: "1rem",
                    color: "var(--color-muted, #9a8a7a)",
                    lineHeight: 1.72,
                    fontStyle: "italic",
                    marginTop: 36,
                  }}
                >
                  {entry.intro}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--color-border, #e0d8cc)",
          }}
        />

        <div
          style={{
            maxWidth: 680,
            marginInline: "auto",
            paddingInline: "clamp(20px, 5vw, 40px)",
            paddingTop: 72,
            paddingBottom: 96,
          }}
        >
          {entry.background && (
            <section
              aria-labelledby="hintergrund-heading"
              style={{ marginBottom: 56 }}
            >
              <h2
                id="hintergrund-heading"
                className="font-display"
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2rem)",
                  color: "var(--color-maroon, #5c2d1e)",
                  marginBottom: 20,
                  letterSpacing: "-0.01em",
                }}
              >
                Hintergrund
              </h2>
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "var(--color-maroon, #5c2d1e)",
                  lineHeight: 1.78,
                  opacity: 0.82,
                  margin: 0,
                }}
              >
                {entry.background}
              </p>
            </section>
          )}

          {entry.funFact && (
            <aside
              aria-label="Fun Fact"
              style={{
                marginBottom: 56,
                padding: "28px 32px",
                background: "rgba(192, 96, 74, 0.04)",
                borderTop: "1px solid var(--color-border, #e0d8cc)",
                borderBottom: "1px solid var(--color-border, #e0d8cc)",
              }}
            >
              <div
                style={{
                  fontSize: "0.63rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-terracotta, #c0604a)",
                  marginBottom: 14,
                  fontWeight: 600,
                }}
              >
                Fun Fact
              </div>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--color-maroon, #5c2d1e)",
                  lineHeight: 1.72,
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                {entry.funFact}
              </p>
            </aside>
          )}

          {entry.myNote && (
            <section
              aria-labelledby="mynote-heading"
            >
              <h2
                id="mynote-heading"
                className="font-display"
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2rem)",
                  color: "var(--color-maroon, #5c2d1e)",
                  marginBottom: 20,
                  letterSpacing: "-0.01em",
                }}
              >
                Mein Kommentar
              </h2>
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "var(--color-maroon, #5c2d1e)",
                  lineHeight: 1.78,
                  fontStyle: "italic",
                  opacity: 0.85,
                  margin: 0,
                }}
              >
                {entry.myNote}
              </p>
            </section>
          )}
        </div>

        {linkedRecipeCards.length > 0 && (
          <section
            aria-labelledby="linked-recipes-heading"
            style={{
              borderTop: "1px solid var(--color-border, #e0d8cc)",
              paddingTop: 60,
              paddingBottom: 96,
            }}
          >
            <div
              style={{
                maxWidth: 1120,
                marginInline: "auto",
                paddingInline: "clamp(20px, 5vw, 60px)",
              }}
            >
              <h2
                id="linked-recipes-heading"
                className="font-display"
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2rem)",
                  color: "var(--color-maroon, #5c2d1e)",
                  marginBottom: 36,
                  letterSpacing: "-0.01em",
                }}
              >
                Passende Rezepte
              </h2>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(260px, 340px))",
                  gap: 28,
                }}
              >
                {linkedRecipeCards.map(
                  (recipe) =>
                    recipe && (
                      <li key={recipe.slug}>
                        <RecipeCard recipe={recipe} />
                      </li>
                    )
                )}
              </ul>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
