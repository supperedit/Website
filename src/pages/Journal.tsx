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
        description="Wissen rund ums Kochen: Zutaten, Saison, Geschmack und Hintergrunde."
      />

      <div
        style={{
          maxWidth: 1180,
          marginInline: "auto",
          paddingInline: 24,
          paddingTop: 120,
          paddingBottom: 80,
        }}
      >
        <header style={{ marginBottom: 48 }}>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              color: "var(--color-maroon)",
              marginBottom: 16,
              lineHeight: 1.05,
            }}
          >
            Journal
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--color-muted)",
              maxWidth: 480,
            }}
          >
            Hintergrunde, Geschmacksprofile und alles, was gut zu kochen wissen gehort.
          </p>
        </header>

        <nav
          aria-label="Kategorien filtern"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 48,
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              style={{
                padding: "6px 16px",
                borderRadius: 999,
                border: "1.5px solid",
                borderColor:
                  activeCategory === cat
                    ? "var(--color-terracotta)"
                    : "var(--color-border, #ddd)",
                backgroundColor:
                  activeCategory === cat ? "var(--color-terracotta)" : "transparent",
                color:
                  activeCategory === cat ? "#fff" : "var(--color-maroon)",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </nav>

        {loading && (
          <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>Wird geladen …</p>
        )}

        {!loading && filtered.length === 0 && (
          <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
            Noch keine Eintrage in dieser Kategorie.
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
            justifyContent: "center",
          }}
        >
          {filtered.map((entry) => (
            <li key={entry.slug}>
              <Link
                to={`/journal/${entry.slug}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <article
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    backgroundColor: "var(--color-card-bg, var(--color-cream))",
                    border: "1px solid var(--color-border, #e8e5dc)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 8px 24px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "none";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  {entry.image && (
                    <div
                      style={{
                        aspectRatio: "4/3",
                        overflow: "hidden",
                        backgroundColor: "var(--color-border, #e8e5dc)",
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
                        }}
                      />
                    </div>
                  )}

                  <div style={{ padding: "20px 20px 24px" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 10,
                        flexWrap: "wrap",
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

                    <h2
                      className="font-display"
                      style={{
                        fontSize: "1.35rem",
                        color: "var(--color-maroon)",
                        marginBottom: 8,
                        lineHeight: 1.2,
                      }}
                    >
                      {entry.title}
                    </h2>

                    {entry.intro && (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--color-muted)",
                          lineHeight: 1.55,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
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
    </>
  );
}
