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
  const withoutExcluded = recipes.filter((r) => r.category === category && r.slug !== exclude);
  if (withoutExcluded.length > 0) {
    return withoutExcluded[Math.floor(Math.random() * withoutExcluded.length)];
  }
  const full = recipes.filter((r) => r.category === category);
  if (full.length === 0) return null;
  return full[Math.floor(Math.random() * full.length)];
}

export default function SupperPairing() {
  const { recipes, loading } = useRecipes();
  const [pairingIndex, setPairingIndex] = useState(0);
  const [itemA, setItemA] = useState<Recipe | null>(null);
  const [itemB, setItemB] = useState<Recipe | null>(null);

  const currentPairing = PAIRINGS[pairingIndex];

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
    const nextA = pickRandom(recipes, PAIRINGS[idx].categoryA, itemA?.slug) ?? itemA;
    const nextB = pickRandom(recipes, PAIRINGS[idx].categoryB, itemB?.slug) ?? itemB;
    setPairingIndex(idx);
    setItemA(nextA);
    setItemB(nextB);
  };

  if (loading || !itemA || !itemB) return null;

  return (
    <section className="pairing-section">
      <div className="wrap" style={{ textAlign: "center" }}>
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

        <button type="button" onClick={shuffle} className="btn-secondary btn-small pairing-shuffle">
          <Shuffle size={13} /> Neues Pairing
        </button>
      </div>

      <style>{`
        .pairing-section {
          background-color: var(--color-cream);
          padding-block: 80px;
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
          margin: 0 0 40px;
          color: var(--color-maroon);
        }
        .pairing-card {
          max-width: 560px;
          margin: 0 auto;
          background: var(--color-cream);
          border-radius: 20px;
          padding: 32px 20px;
          box-shadow: 0 20px 48px rgba(43, 18, 16, 0.12);
        }
        /* Row layout stays side-by-side at every width — including mobile —
           so the whole pairing fits on one screen while scrolling, instead
           of stacking into a tall column. Card width shrinks with the
           viewport instead. */
        .pairing-row {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: clamp(10px, 4vw, 24px);
        }
        .pairing-item {
          width: clamp(120px, 38vw, 220px);
          flex-shrink: 0;
          text-align: left;
          transition: transform 0.25s ease;
        }
        .pairing-item:hover {
          transform: translateY(-4px);
        }
        .pairing-symbol {
          flex-shrink: 0;
          align-self: center;
          font-family: var(--font-display);
          font-size: clamp(20px, 5vw, 28px);
          line-height: 1;
          color: var(--color-terracotta);
        }
        .pairing-shuffle {
          margin-top: 32px;
        }
      `}</style>
    </section>
  );
}
