import { useState } from "react";
import { Link } from "react-router-dom";
import { useJournal } from "../data/useJournal";
import SEO from "../components/SEO";

const CATEGORIES = ["Alle", "Saisonal", "Zutaten", "Kräuter", "Reise & Food"];

export default function Journal() {
  const { entries, loading } = useJournal();
  const [activeCategory, setActiveCategory] = useState("Alle");

  const filtered =
    activeCategory === "Alle"
      ? entries
      : entries.filter((e) => e.category === activeCategory);

  return (
    <>
      <SEO
        title="Journal – Supper Edit"
        description="Hintergruende, Geschmacksprofile und alles, was gut zu kochen wissen gehoert."
      />

      <main
        style={{
          minHeight: "100vh",
          background: "var(--color-cream, #faf8f2)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            marginInline: "auto",
            paddingInline: 28,
            paddingTop: 120,
            paddingBottom: 100,
          }}
        >
          <header style={{ marginBottom: 48 }}>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                color: "var(--color-maroon, #5c2d1e)",
                lineHeight: 1,
                marginBottom: 16,
                letterSpacing: "-0.01em",
              }}
            >
              Journal
            </h1>
            <p
              style={{
                fontSize: "0.95rem",
                color: "var(--color-muted, #9a8a7a)",
                maxWidth: 420,
                lineHeight: 1.6,
              }}
            >
              Hintergruende, Geschmacksprofile und alles, was gut zu kochen wissen gehoert.
            </p>
          </header>

          <nav aria-label="Kategorien filtern" style={{ marginBottom: 48 }}>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    aria-pressed={activeCategory === cat}
                    style={{
                      padding: "6px 18px",
                      borderRadius: 100,
                      border: "1.5px solid",
                      borderColor:
                        activeCategory === cat
                          ? "var(--color-maroon, #5c2d1e)"
                          : "var(--color-border, #e0d8cc)",
                      background:
                        activeCategory === cat
                          ? "var(--color-maroon, #5c2d1e)"
                          : "transparent",
                      color:
                        activeCategory === cat
                          ? "var(--color-cream, #faf8f2)"
                          : "var(--color-muted, #9a8a7a)",
                      fontSize: "0.78rem",
                      letterSpacing: "0.06em",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      fontFamily: "var(--font-body, sans-serif)",
                    }}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {loading && (
            <p style={{ color: "var(--color-muted, #9a8a7a)", fontSize: "0.9rem" }}>
              Wird geladen …
            </p>
          )}

          {!loading && filtered.length === 0 && (
            <p style={{ color: "var(--color-muted, #9a8a7a)", fontSize: "0.9rem" }}>
              Noch keine Eintraege in dieser Kategorie.
            </p>
          )}

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 340px))",
              gap: 32,
              justifyContent: "start",
            }}
            aria-label="Journal-Eintraege"
          >
            {filtered.map((entry) => (
              <li key={entry.slug}>
                <Link
                  to={`/journal/${entry.slug}`}
                  style={{ textDecoration: "none", display: "block" }}
                  aria-label={`${entry.title}${entry.season ? `, ${entry.season}` : ""}`}
                >
                  <article
                    style={{
                      background: "var(--color-cream, #faf8f2)",
                      border: "1px solid var(--color-border, #e0d8cc)",
                      borderRadius: 16,
                      overflow: "hidden",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    {entry.image && (
                      <div
                        style={{
                          aspectRatio: "3/2",
                          overflow: "hidden",
                          background: "var(--color-border, #e0d8cc)",
                        }}
                      >
                        <img
                          src={entry.image}
                          alt={entry.title}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            transition: "transform 0.4s ease",
                          }}
                        />
                      </div>
                    )}

                    <div style={{ padding: "20px 22px 24px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginBottom: 10,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        {entry.category && (
                          <span
                            aria-label={`Kategorie: ${entry.category}`}
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: "var(--color-terracotta, #c0604a)",
                            }}
                          >
                            {entry.category}
                          </span>
                        )}
                        {entry.season && (
                          <span
                            aria-label={`Saison: ${entry.season}`}
                            style={{
                              fontSize: "0.68rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: "var(--color-muted, #9a8a7a)",
                            }}
                          >
                            {entry.season}
                          </span>
                        )}
                      </div>

                      <h2
                        className="font-display"
                        style={{
                          fontSize: "1.4rem",
                          color: "var(--color-maroon, #5c2d1e)",
                          marginBottom: 8,
                          lineHeight: 1.15,
                        }}
                      >
                        {entry.title}
                      </h2>

                      {entry.intro && (
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--color-muted, #9a8a7a)",
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical" as const,
                            overflow: "hidden",
                          }}
                        >
                          {entry.intro}
                        </p>
                      )}
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
