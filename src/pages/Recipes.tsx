import { categoryPath, recipeListSchema } from "../data/seo";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRecipes, resizeDriveUrl } from "../data/useRecipes";
import { categories } from "../data/categories";
import RecipeCard from "../components/RecipeCard";
import SEO from "../components/SEO";

export default function Recipes() {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("kategorie");
  const { recipes, loading, error } = useRecipes();

  // The API already returns recipes newest-first (sorted server-side by
  // Notion date), so no client-side reversing needed here.
  const selectedCategory = categories.find((c) => c.slug === activeCategory);
  const activeCategoryName = selectedCategory?.name;
  const filtered = activeCategoryName
    ? recipes.filter((r) => r.category === activeCategoryName)
    : recipes;

  // Recipe count per category (for the filter chips)
  const countByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    recipes.forEach((r) => {
      if (r.category) map[r.category] = (map[r.category] ?? 0) + 1;
    });
    return map;
  }, [recipes]);

  return (
    <>
      <SEO title={selectedCategory ? `${selectedCategory.name} – ${selectedCategory.sub}` : "Alle Rezepte"}
        description={selectedCategory ? `${selectedCategory.sub}: Entdecke die Rezepte aus ${selectedCategory.name} bei Supper Edit.` : "Alle Rezepte von Supper Edit: Pasta, Gebäck, Drinks, Dips und kleine Ideen für lange Abende."}
        structuredData={!loading && !error ? recipeListSchema(filtered) : undefined} />

      <section className="wrap" style={{ paddingBlock: 80 }}>
        <h1 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: 32 }}>
          {selectedCategory?.name || "Rezepte"}
        </h1>

        <p style={{ marginTop: -16, marginBottom: 32, color: "var(--color-muted)" }}>{selectedCategory?.sub || "Von Pasta Night bis Bake Club – finde dein nächstes Rezept."}</p>
        {/* ── Category filter ── */}
        <div
          role="group"
          aria-label="Nach Kategorie filtern"
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 48 }}
        >
          <Link
            to="/rezepte"
            aria-current={!selectedCategory ? "page" : undefined}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid var(--color-line)",
              background: !activeCategory ? "var(--color-terracotta)" : "transparent",
              color: !activeCategory ? "var(--color-cream)" : "var(--color-ink)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Alle
            {!loading && (
              <span style={{ marginLeft: 6, opacity: 0.65, fontSize: 11 }}>
                {recipes.length}
              </span>
            )}
          </Link>

          {categories.map((cat) => {
            const count = countByCategory[cat.name] ?? 0;
            const active = activeCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                to={categoryPath(cat.slug)}
                title={cat.sub}
                aria-label={`${cat.name}: ${cat.sub}${count ? `, ${count} Rezepte` : ""}`}
                aria-current={active ? "page" : undefined}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid var(--color-line)",
                  background: active ? "var(--color-terracotta)" : "transparent",
                  color: active ? "var(--color-cream)" : "var(--color-ink)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {cat.name}
                {!loading && count > 0 && (
                  <span style={{ marginLeft: 6, opacity: 0.65, fontSize: 11 }}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Skeleton loading ── */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 28 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="recipe-skeleton-image" />
                <div className="recipe-skeleton-line" style={{ width: "40%", marginTop: 14 }} />
                <div className="recipe-skeleton-line" style={{ width: "70%", marginTop: 8 }} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <p style={{ color: "var(--color-muted)" }}>
            Rezepte konnten gerade nicht geladen werden.
          </p>
        )}

        {/* ── Recipe grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 28,
            }}
          >
            {filtered.map((r) => (
              <RecipeCard
                key={r.slug}
                slug={r.slug}
                title={r.title}
                category={r.category}
                image={resizeDriveUrl(r.image, "w600")}
                titleSize={20}
                headingLevel={2}
              />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p style={{ color: "var(--color-muted)" }}>
            Für diese Kategorie ist noch kein Rezept da.
          </p>
        )}
      </section>

      <style>{`
        .recipe-skeleton-image {
          aspect-ratio: 4/5;
          border-radius: 12px;
          background: linear-gradient(90deg, var(--color-line) 25%, rgba(43,18,16,0.08) 50%, var(--color-line) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.4s ease infinite;
        }
        .recipe-skeleton-line {
          height: 14px;
          border-radius: 4px;
          background: linear-gradient(90deg, var(--color-line) 25%, rgba(43,18,16,0.08) 50%, var(--color-line) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.4s ease infinite;
        }
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .recipe-skeleton-image, .recipe-skeleton-line { animation: none; }
        }
      `}</style>
    </>
  );
}
