import { Link, useSearchParams } from "react-router-dom";
import { useRecipes } from "../data/useRecipes";
import { categories } from "../data/categories";
import FavoriteButton from "../components/FavoriteButton";
import SEO from "../components/SEO";

export default function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("kategorie");
  const { recipes, loading, error } = useRecipes();

  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name;
  const filtered = activeCategoryName
    ? recipes.filter((r) => r.category === activeCategoryName)
    : recipes;

  return (
    <>
      <SEO title="Alle Rezepte" description="Alle Rezepte von Supper Edit auf einen Blick." />

      <section className="wrap" style={{ paddingBlock: 80 }}>
        <h1 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: 32 }}>
          Rezepte
        </h1>

        {/* Category filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 48 }}>
          <button
            onClick={() => setSearchParams({})}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid var(--color-line)",
              background: !activeCategory ? "var(--color-terracotta)" : "transparent",
              color: !activeCategory ? "var(--color-cream)" : "var(--color-ink)",
              fontSize: 13,
            }}
          >
            Alle
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSearchParams({ kategorie: cat.slug })}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "1px solid var(--color-line)",
                background: activeCategory === cat.slug ? "var(--color-terracotta)" : "transparent",
                color: activeCategory === cat.slug ? "var(--color-cream)" : "var(--color-ink)",
                fontSize: 13,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading && <p style={{ color: "var(--color-muted)" }}>Rezepte werden geladen …</p>}
        {error && <p style={{ color: "var(--color-muted)" }}>Rezepte konnten gerade nicht geladen werden.</p>}

        {/* Recipe grid */}
        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", justifyContent: "center", gap: 28 }}>
            {filtered.map((r) => (
              <Link key={r.slug} to={`/rezepte/${r.slug}`} className="recipe-card-hover">
                <div
                className="recipe-card-image"
                style={{
                  position: "relative",
                  aspectRatio: "3/4",
                  borderRadius: 12,
                  backgroundColor: r.image ? "transparent" : "var(--color-dusty-blue)",
                  backgroundImage: r.image ? `url(${r.image})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <FavoriteButton slug={r.slug} title={r.title} style={{ position: "absolute", top: 10, right: 10 }} />
              </div>
                <span style={{ display: "block", marginTop: 12, fontSize: 12, color: "var(--color-terracotta)" }}>{r.category}</span>
                <h3 className="font-display" style={{ fontSize: 20, margin: 0 }}>{r.title}</h3>
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p style={{ color: "var(--color-muted)" }}>Für diese Kategorie ist noch kein Rezept da.</p>
        )}
      </section>

      <style>{`
        .recipe-card-hover .recipe-card-image {
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
        }
        .recipe-card-hover:hover .recipe-card-image {
          transform: translateY(-4px) scale(1.015);
          box-shadow: 0 16px 32px rgba(43, 18, 16, 0.18);
        }
        @media (prefers-reduced-motion: reduce) {
          .recipe-card-hover .recipe-card-image {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}