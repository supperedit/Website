import { useEffect, useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { useRecipes, resizeDriveUrl } from "../data/useRecipes";
import type { Recipe } from "../data/recipeTypes";
import RecipeCard from "./RecipeCard";

/**
 * Zwei feste Pairing-Vibes. Jede Vibe zieht ein zufälliges Rezept aus
 * jeder der beiden Kategorien (Kategorie-Namen müssen exakt zu
 * src/data/categories.ts passen).
 */
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

  // Availability check: only offer pairings where both categories have at least one recipe
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
    <section style={{ backgroundColor: "var(--color-cream)", paddingBlock: 72 }}>
      <div className="wrap" style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--color-terracotta)",
            marginBottom: 12,
          }}
        >
          {currentPairing.label}
        </p>
        <h2
          className="font-display"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", margin: "0 0 40px" }}
        >
          The Supper Pairing
        </h2>

        <div className="pairing-row">
          <div className="pairing-item">
            <RecipeCard
              slug={itemA.slug}
              title={itemA.title}
              category={itemA.category}
              image={resizeDriveUrl(itemA.image, "w600")}
            />
          </div>

          <span className="font-display pairing-plus" aria-hidden="true">+</span>

          <div className="pairing-item">
            <RecipeCard
              slug={itemB.slug}
              title={itemB.title}
              category={itemB.category}
              image={resizeDriveUrl(itemB.image, "w600")}
            />
          </div>
        </div>

        <button
          onClick={shuffle}
          style={{
            marginTop: 40,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "1px solid var(--color-line)",
            borderRadius: 999,
            padding: "10px 20px",
            fontSize: 13,
            color: "var(--color-ink)",
            cursor: "pointer",
          }}
        >
          <Shuffle size={13} /> anderes Pairing
        </button>
      </div>

      <style>{`
        .pairing-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          max-width: 640px;
          margin: 0 auto;
        }
        .pairing-item { width: 220px; flex-shrink: 0; }
        .pairing-plus {
          font-size: 32px;
          color: var(--color-terracotta);
          flex-shrink: 0;
        }
        @media (max-width: 560px) {
          .pairing-row { flex-direction: column; gap: 20px; }
          .pairing-plus { transform: rotate(90deg); }
        }
      `}</style>
    </section>
  );
}
