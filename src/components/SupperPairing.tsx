import { useEffect, useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { useRecipes, resizeDriveUrl } from "../data/useRecipes";
import type { Recipe } from "../data/recipeTypes";
import RecipeCard from "./RecipeCard";

const PAIRINGS = [
  {
    label: "Herzhaft am Abend",
    categoryA: "Small Bites",
    categoryB: "Fizz & Friends",
  },
  {
    label: "Kaffee & Kuchen Vibe",
    categoryA: "Bake Club",
    categoryB: "Slow Sips",
  },
] as const;

function pickRandom(recipes: Recipe[], category: string, exclude?: string): Recipe | null {
  const pool = recipes.filter((r) => r.category === category && r.slug !== exclude);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function SupperPairing() {
  const { recipes, loading } = useRecipes();
  const [pairingIndex, setPairingIndex] = useState(0);
  const [itemA, setItemA] = useState<Recipe | null>(null);
  const [itemB, setItemB] = useState<Recipe | null>(null);

  const currentPairing = PAIRINGS[pairingIndex];

  // Only offer pairings where both categories actually have a recipe.
  const availablePairings = useMemo(
    () =>
      PAIRINGS.filter(
        (p) =>
          recipes.some((r) => r.category === p.categoryA) &&
          recipes.some((r) => r.category === p.categoryB),
      ),
    [recipes],
  );

  useEffect(() => {
    if (recipes.length > 0 && !itemA && !itemB && availablePairings.length > 0) {
      const idx = PAIRINGS.indexOf(availablePairings[Math.floor(Math.random() * availablePairings.length)]);
      setPairingIndex(idx);
      setItemA(pickRandom(recipes, PAIRINGS[idx].categoryA));
      setItemB(pickRandom(recipes, PAIRINGS[idx].categoryB));
    }
  }, [recipes, itemA, itemB, availablePairings]);

  const shuffle = () => {
    if (availablePairings.length === 0) return;
    const idx = PAIRINGS.indexOf(availablePairings[Math.floor(Math.random() * availablePairings.length)]);
    setPairingIndex(idx);
    setItemA(pickRandom(recipes, PAIRINGS[idx].categoryA, itemA?.slug));
    setItemB(pickRandom(recipes, PAIRINGS[idx].categoryB, itemB?.slug));
  };

  if (loading || !itemA || !itemB) return null;

  return (
    <section className="pairing-section">
      <div className="wrap" style={{ textAlign: "center", position: "relative" }}>
        <p className="pairing-eyebrow">{currentPairing.label}</p>
        <h2 className="font-display pairing-heading">The Supper Pairing</h2>

        <div className="pairing-card">
          <div className="pairing-row">
            <div className="pairing-item">
              <RecipeCard
                slug={itemA.slug}
                title={itemA.title}
                category={itemA.category}
                image={resizeDriveUrl(itemA.image, "w600")}
              />
            </div>

            <div className="pairing-connector" aria-hidden="true">
              <span className="pairing-plus">+</span>
              <span className="pairing-connector-line" />
            </div>

            <div className="pairing-item">
              <RecipeCard
                slug={itemB.slug}
                title={itemB.title}
                category={itemB.category}
                image={resizeDriveUrl(itemB.image, "w600")}
              />
            </div>
          </div>
        </div>

        <button onClick={shuffle} className="pairing-shuffle">
          <Shuffle size={13} /> anderes Pairing
        </button>
      </div>

      <style>{`
        .pairing-section {
          background-color: var(--color-sand);
          padding-block: 80px;
          position: relative;
          overflow: hidden;
        }
        .pairing-eyebrow {
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--color-terracotta);
          margin-bottom: 12px;
        }
        .pairing-heading {
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          margin: 0 0 48px;
          color: var(--color-maroon);
        }
        .pairing-card {
          max-width: 640px;
          margin: 0 auto;
          background: var(--color-cream);
          border-radius: 20px;
          padding: 40px 32px;
          box-shadow: 0 20px 48px rgba(43, 18, 16, 0.12);
        }
        .pairing-row {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 24px;
        }
        .pairing-item {
          width: 220px;
          flex-shrink: 0;
          text-align: left;
          transition: transform 0.25s ease;
        }
        .pairing-item:hover {
          transform: translateY(-4px);
        }
        .pairing-connector {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 70px; /* roughly centers on the image, above the text block */
          flex-shrink: 0;
        }
        .pairing-plus {
          font-family: var(--font-display);
          font-size: 34px;
          line-height: 1;
          color: var(--color-terracotta);
        }
        .pairing-connector-line {
          width: 1px;
          height: 24px;
          background: var(--color-line);
          margin-top: 6px;
        }
        .pairing-shuffle {
          margin-top: 40px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1px solid var(--color-line);
          border-radius: 999px;
          padding: 10px 20px;
          font-size: 13px;
          color: var(--color-ink);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .pairing-shuffle:hover {
          background: rgba(43, 18, 16, 0.06);
        }
        @media (max-width: 560px) {
          .pairing-card { padding: 32px 20px; }
          .pairing-row { flex-direction: column; align-items: center; gap: 20px; }
          .pairing-item { width: 220px; text-align: center; }
          .pairing-connector { flex-direction: row; padding-top: 0; }
          .pairing-connector-line { width: 24px; height: 1px; margin-top: 0; margin-left: 6px; }
        }
      `}</style>
    </section>
  );
}
