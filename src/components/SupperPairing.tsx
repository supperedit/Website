import { useEffect, useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { useRecipes, resizeDriveUrl } from "../data/useRecipes";
import type { Recipe } from "../data/recipeTypes";
import RecipeCard from "./RecipeCard";
import FetchError from "./FetchError";

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
  const { recipes, loading, error } = useRecipes();
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

  if (loading) return null;

  if (error) {
    return (
      <section className="pairing-section">
        <div className="wrap" style={{ textAlign: "center" }}>
          <FetchError
            compact
            title="Die Pairing-Idee lässt sich gerade nicht laden."
            message="Versuch es gleich noch einmal."
          />
        </div>
      </section>
    );
  }

  if (!itemA || !itemB) return null;

  return (
    <section className="pairing-section">
      <div className="wrap" style={{ textAlign: "center" }}>
        <p className="pairing-eyebrow">{currentPairing.label}</p>
        <h2 className="font-display pairing-heading">The Supper Pairing</h2>

        <div className="pairing-layout">
          <div className="pairing-row">
            <div className="pairing-item">
              <RecipeCard
                slug={itemA.slug}
                title={itemA.title}
                category={itemA.category}
                image={resizeDriveUrl(itemA.image, "w600")}
              />
            </div>

            <span className="pairing-symbol" aria-hidden="true">&amp;</span>
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
        .pairing-section { background: var(--color-sky); padding-block: clamp(48px, 7vw, 80px); }
        .pairing-eyebrow { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--color-maroon); margin-bottom: 12px; }
        .pairing-heading { font-size: clamp(1.8rem, 4vw, 2.6rem); margin: 0 0 32px; color: var(--color-maroon); }
        .pairing-layout { max-width: 620px; margin-inline: auto; }
        .pairing-row { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: clamp(8px, 2vw, 24px); align-items: stretch; }
        .pairing-item { min-width: 0; text-align: left; }
        .pairing-symbol { align-self: center; font: 400 clamp(24px, 5vw, 48px)/1 var(--font-display); color: var(--color-maroon); }
        .pairing-shuffle { margin-top: 28px; }
        @media (max-width: 480px) {
          .pairing-item .recipe-card-caption { padding: 10px 10px 14px; }
          .pairing-item .recipe-card-caption h3 { font-size: 17px !important; }
          .pairing-item .recipe-card-category { font-size: 10px; }
        }
      `}</style>
    </section>
  );
}
