import { Link } from "react-router-dom";
import { useRecipes } from "../data/useRecipes";
import { useFavorites } from "../data/useFavorites";
import FavoriteButton from "../components/FavoriteButton";
import SEO from "../components/SEO";

export default function Favorites() {
  const { recipes, loading, error } = useRecipes();
  const { favorites } = useFavorites();

  const savedRecipes = recipes.filter((r) => favorites.includes(r.slug));

  return (
    <>
      <SEO title="Merkliste" description="Deine gemerkten Rezepte von Supper Edit." />

      <section className="wrap" style={{ paddingBlock: 80 }}>
        <h1 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: 12 }}>
          Merkliste
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: 14, marginBottom: 48 }}>
          Wird nur auf diesem Gerät in diesem Browser gespeichert.
        </p>

        {loading && <p style={{ color: "var(--color-muted)" }}>Rezepte werden geladen …</p>}
        {error && <p style={{ color: "var(--color-muted)" }}>Rezepte konnten gerade nicht geladen werden.</p>}

        {!loading && !error && savedRecipes.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 340px))", justifyContent: "center", gap: 28 }}>
            {savedRecipes.map((r) => (
              <Link key={r.slug} to={`/rezepte/${r.slug}`} className="recipe-card-hover">
                <div
                  className="recipe-card-image"
                  style={{
                    position: "relative",
                    aspectRatio: "3/4",
                    borderRadius: 12,
                    backgroundColor: r.image ? "transparent" : "var(--color-sky)",
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

        {!loading && !error && savedRecipes.length === 0 && (
          <p style={{ color: "var(--color-muted)" }}>
            Noch nichts gemerkt. Tipp auf das Herz bei einem Rezept, um es hier zu sammeln.
          </p>
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