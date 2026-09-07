import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useJournal } from "../data/useJournal";
import { useRecipes } from "../data/useRecipes";
import RecipeCard from "../components/RecipeCard";
import SEO from "../components/SEO";

function StampBadge({ text }: { text: string }) {
  const upper = text.toUpperCase();
  const repeated = `${upper} · ${upper} · ${upper} · `;
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      aria-label={text}
      role="img"
      style={{ display: "block" }}
    >
      <defs>
        <path
          id="je-stamp-path"
          d="M48,48 m-34,0 a34,34 0 1,1 68,0 a34,34 0 1,1-68,0"
        />
      </defs>
      <circle
        cx="48"
        cy="48"
        r="45"
        fill="var(--color-cream,#faf8f2)"
        stroke="var(--color-maroon,#5c2d1e)"
        strokeWidth="1"
      />
      <circle
        cx="48"
        cy="48"
        r="39"
        fill="none"
        stroke="var(--color-maroon,#5c2d1e)"
        strokeWidth="0.5"
      />
      <text
        fontSize="6"
        fill="var(--color-maroon,#5c2d1e)"
        letterSpacing="3"
        fontFamily="var(--font-body,sans-serif)"
      >
        <textPath href="#je-stamp-path">{repeated}</textPath>
      </text>
      <text
        x="48"
        y="52"
        textAnchor="middle"
        fontSize="9"
        fill="var(--color-maroon,#5c2d1e)"
        fontFamily="var(--font-body,sans-serif)"
        letterSpacing="0.5"
      >
        ◆
      </text>
    </svg>
  );
}

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

  const steckbriefRows: { label: string; value: string; span?: boolean }[] = [
    entry.category
      ? { label: "Kategorie", value: entry.category }
      : null,
    entry.season ? { label: "Saison", value: entry.season } : null,
    entry.plantFamily
      ? { label: "Pflanzenfamilie", value: entry.plantFamily, span: true }
      : null,
    entry.latinName
      ? { label: "Lateinischer Name", value: entry.latinName, span: true }
      : null,
    entry.bloomTime ? { label: "Blütezeit", value: entry.bloomTime } : null,
    entry.location ? { label: "Standort", value: entry.location } : null,
    entry.appearance
      ? { label: "Erkennungsmerkmale", value: entry.appearance, span: true }
      : null,
    entry.tastingNotes
      ? { label: "Geschmacksprofil", value: entry.tastingNotes, span: true }
      : null,
    entry.healing
      ? { label: "Heilwirkung", value: entry.healing, span: true }
      : null,
    entry.temperament
      ? { label: "Temperament", value: entry.temperament, span: true }
      : null,
  ].filter(Boolean) as { label: string; value: string; span?: boolean }[];

  const pairedRows: ({ label: string; value: string; span?: boolean } | null)[][] = [];
  let i = 0;
  while (i < steckbriefRows.length) {
    const cur = steckbriefRows[i];
    if (cur.span) {
      pairedRows.push([cur]);
      i++;
    } else {
      const next = steckbriefRows[i + 1];
      if (next && !next.span) {
        pairedRows.push([cur, next]);
        i += 2;
      } else {
        pairedRows.push([cur]);
        i++;
      }
    }
  }

  return (
    <>
      <SEO
        title={`${entry.title} – Journal – Supper Edit`}
        description={entry.intro ?? `${entry.title} im Supper Edit Journal.`}
        image={entry.image}
      />

      <style>{`
        .je-grid {
          display: grid;
          grid-template-columns: minmax(0,2fr) minmax(0,3fr);
          gap: clamp(32px, 5vw, 80px);
          align-items: start;
        }
        @media (max-width: 720px) {
          .je-grid { grid-template-columns: 1fr; }
        }
        .je-field-pair {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .je-field-pair > .je-field:first-child {
          border-right: none;
        }
        @media (max-width: 420px) {
          .je-field-pair { grid-template-columns: 1fr; }
          .je-field-pair > .je-field:first-child { border-right: 1px solid var(--color-border,#e0d8cc); border-bottom: none; }
        }
        .je-field {
          padding: 14px 18px;
          border: 1px solid var(--color-border,#e0d8cc);
        }
        .je-field + .je-field,
        .je-field-pair + .je-field,
        .je-field-pair + .je-field-pair,
        .je-field + .je-field-pair {
          border-top: none;
        }
        .je-label {
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--color-muted,#9a8a7a);
          margin-bottom: 5px;
        }
        .je-value {
          font-size: 0.9rem;
          color: var(--color-maroon,#5c2d1e);
          line-height: 1.6;
        }
      `}</style>

      <article>
        <div
          style={{
            maxWidth: 1140,
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
              color: "var(--color-muted,#9a8a7a)",
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 0",
              marginBottom: 48,
            }}
          >
            <ChevronLeft size={13} aria-hidden="true" />
            Journal
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 24,
              marginBottom: 52,
              flexWrap: "wrap",
            }}
          >
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(3.5rem, 9vw, 8rem)",
                color: "var(--color-maroon,#5c2d1e)",
                lineHeight: 0.9,
                letterSpacing: "-0.03em",
                flex: "1 1 auto",
              }}
            >
              {entry.title}
            </h1>
            {entry.typ && (
              <div style={{ flexShrink: 0 }} aria-label={`Typ: ${entry.typ}`}>
                <StampBadge text={entry.typ} />
              </div>
            )}
          </div>

          <div className="je-grid">
            <div style={{ position: "relative" }}>
              {entry.image ? (
                <figure style={{ margin: 0 }}>
                  <img
                    src={entry.image}
                    alt={entry.title}
                    style={{
                      width: "100%",
                      aspectRatio: "3 / 4",
                      objectFit: "cover",
                      display: "block",
                      border: "1px solid var(--color-border,#e0d8cc)",
                    }}
                  />
                </figure>
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    aspectRatio: "3 / 4",
                    background: "var(--color-border,#e0d8cc)",
                  }}
                />
              )}
            </div>

            <div>
              <div role="list" aria-label="Steckbrief">
                {pairedRows.map((pair, rowIdx) => {
                  if (pair.length === 2) {
                    return (
                      <div key={rowIdx} className="je-field-pair" role="listitem">
                        {pair.map((field) =>
                          field ? (
                            <div key={field.label} className="je-field">
                              <div className="je-label">{field.label}</div>
                              <div className="je-value">{field.value}</div>
                            </div>
                          ) : null
                        )}
                      </div>
                    );
                  }
                  const field = pair[0];
                  if (!field) return null;
                  return (
                    <div key={rowIdx} className="je-field" role="listitem">
                      <div className="je-label">{field.label}</div>
                      <div className="je-value">{field.value}</div>
                    </div>
                  );
                })}
              </div>

              {entry.intro && (
                <p
                  style={{
                    fontSize: "0.97rem",
                    color: "var(--color-muted,#9a8a7a)",
                    lineHeight: 1.72,
                    fontStyle: "italic",
                    marginTop: 32,
                  }}
                >
                  {entry.intro}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          style={{ borderTop: "1px solid var(--color-border,#e0d8cc)" }}
          role="separator"
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
              aria-labelledby="je-hintergrund"
              style={{ marginBottom: 56 }}
            >
              <h2
                id="je-hintergrund"
                className="font-display"
                style={{
                  fontSize: "clamp(1.5rem, 2.5vw, 1.9rem)",
                  color: "var(--color-maroon,#5c2d1e)",
                  marginBottom: 18,
                  letterSpacing: "-0.01em",
                }}
              >
                Hintergrund
              </h2>
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "var(--color-maroon,#5c2d1e)",
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
                padding: "26px 30px",
                borderTop: "1px solid var(--color-border,#e0d8cc)",
                borderBottom: "1px solid var(--color-border,#e0d8cc)",
                background: "rgba(192,96,74,0.035)",
              }}
            >
              <div
                style={{
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--color-terracotta,#c0604a)",
                  marginBottom: 12,
                  fontWeight: 600,
                }}
              >
                Fun Fact
              </div>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--color-maroon,#5c2d1e)",
                  lineHeight: 1.72,
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                {entry.funFact}
              </p>
            </aside>
          )}
        </div>

        {linkedRecipeCards.length > 0 && (
          <section
            aria-labelledby="je-rezepte"
            style={{
              borderTop: "1px solid var(--color-border,#e0d8cc)",
              paddingTop: 60,
              paddingBottom: 96,
            }}
          >
            <div
              style={{
                maxWidth: 1140,
                marginInline: "auto",
                paddingInline: "clamp(20px, 5vw, 60px)",
              }}
            >
              <h2
                id="je-rezepte"
                className="font-display"
                style={{
                  fontSize: "clamp(1.5rem, 2.5vw, 1.9rem)",
                  color: "var(--color-maroon,#5c2d1e)",
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
                  gridTemplateColumns: "repeat(auto-fill,minmax(260px,340px))",
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
