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
      >
        <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>Wird geladen …</p>
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
        <Link to="/journal" style={{ color: "var(--color-terracotta)", fontSize: "0.9rem" }}>
          Zum Journal
        </Link>
      </div>
    );
  }

  const linkedRecipeCards = entry.linkedRecipes
    .map((id) => recipes.find((r) => r.slug === id || r.slug))
    .filter(Boolean)
    .slice(0, 3);

  const sections = [
    { label: "Hintergrund", content: entry.background },
    { label: "Geschmacksprofil", content: entry.tastingNotes },
    { label: "Fun Fact", content: entry.funFact },
  ].filter((s) => s.content);

  return (
    <>
      <SEO
        title={`${entry.title} – Journal – Supper Edit`}
        description={entry.intro ?? `${entry.title} im Supper Edit Journal.`}
        image={entry.image}
      />

      <article>
        <div
          style={{
            maxWidth: 740,
            marginInline: "auto",
            paddingInline: 24,
            paddingTop: 100,
            paddingBottom: 80,
          }}
        >
          <button
            type="button"
            onClick={goBack}
            aria-label="Zurück"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-muted)",
              fontSize: "0.875rem",
              padding: "4px 0",
              marginBottom: 40,
            }}
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Zurück
          </button>

          <header style={{ marginBottom: 40 }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 14,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {entry.category && (
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-terracotta)",
                  }}
                >
                  {entry.category}
                </span>
              )}
              {entry.season && (
                <span
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--color-muted)",
                  }}
                >
                  {entry.season}
                </span>
              )}
            </div>

            <h1
              className="font-display"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: "var(--color-maroon)",
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              {entry.title}
            </h1>

            {entry.intro && (
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "var(--color-muted)",
                  lineHeight: 1.65,
                  fontStyle: "italic",
                }}
              >
                {entry.intro}
              </p>
            )}
          </header>

          {entry.image && (
            <figure style={{ margin: "0 0 48px" }}>
              <img
                src={entry.image}
                alt={entry.title}
                style={{
                  width: "100%",
                  borderRadius: 16,
                  display: "block",
                  maxHeight: 480,
                  objectFit: "cover",
                }}
              />
            </figure>
          )}

          <div
            style={{ display: "flex", flexDirection: "column", gap: 40 }}
          >
            {sections.map((section) => (
              <section key={section.label} aria-labelledby={`section-${section.label}`}>
                <h2
                  id={`section-${section.label}`}
                  className="font-display"
                  style={{
                    fontSize: "1.4rem",
                    color: "var(--color-maroon)",
                    marginBottom: 12,
                  }}
                >
                  {section.label}
                </h2>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "var(--color-text, var(--color-maroon))",
                    lineHeight: 1.7,
                    opacity: 0.85,
                  }}
                >
                  {section.content}
                </p>
              </section>
            ))}

            {entry.myNote && (
              <aside
                aria-label="Persönlicher Kommentar"
                style={{
                  borderLeft: "3px solid var(--color-terracotta)",
                  paddingLeft: 20,
                  marginTop: 8,
                }}
              >
                <p
                  style={{
                    fontSize: "1rem",
                    color: "var(--color-maroon)",
                    lineHeight: 1.7,
                    fontStyle: "italic",
                  }}
                >
                  {entry.myNote}
                </p>
              </aside>
            )}
          </div>
        </div>

        {linkedRecipeCards.length > 0 && (
          <section
            aria-labelledby="linked-recipes-heading"
            style={{
              maxWidth: 1180,
              marginInline: "auto",
              paddingInline: 24,
              paddingBottom: 80,
            }}
          >
            <h2
              id="linked-recipes-heading"
              className="font-display"
              style={{
                fontSize: "1.6rem",
                color: "var(--color-maroon)",
                marginBottom: 28,
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
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 340px))",
                gap: 28,
                justifyContent: "center",
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
          </section>
        )}
      </article>
    </>
  );
}
