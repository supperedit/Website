import { useEffect, useState } from "react";
import type { Recipe } from "./recipeTypes";

function slugify(text: string): string {
  const map: Record<string, string> = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    ß: "ss",
  };
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => map[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseIngredients(
  cell: string,
): Recipe["ingredientGroups"] {
  const groups: Recipe["ingredientGroups"] = [
    { group: null, items: [] },
  ];
  const lines = cell
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  lines.forEach((line) => {
    if (line.startsWith("##")) {
      groups.push({
        group: line.replace(/^##\s*/, ""),
        items: [],
      });
      return;
    }
    const parts = line.split("|").map((p) => p.trim());
    const [amount, name, veganAmount, veganName] = parts;
    if (!amount || !name) return;
    groups[groups.length - 1].items.push({
      amount,
      name,
      veganAmount: veganAmount || null,
      veganName: veganName || null,
    });
  });

  return groups.filter((g) => g.items.length > 0);
}

function parseSteps(cell: string): Recipe["steps"] {
  return cell
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, content, veganNote] = line
        .split("::")
        .map((p) => (p || "").trim());
      return {
        title: title || "",
        content: content || "",
        veganNote: veganNote || undefined,
      };
    })
    .filter((s) => s.title);
}

interface UseRecipesResult {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
}

let cachedRecipes: Recipe[] | null = null;
let cachedError: string | null = null;
let inFlightPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

function fetchRecipesOnce(): Promise<void> {
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = fetch("/recipes.json")
    .then((res) => {
      if (!res.ok)
        throw new Error("Rezepte konnten nicht geladen werden");
      return res.json();
    })
    .then((rows: any[]) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      cachedRecipes = rows
        .filter((r) => {
          const hasTitle = !!r.Titel?.trim();
          const isAktiv = !r.Status || r.Status.toLowerCase() === "aktiv";
          
          let isPublished = true;
          if (r.Datum) {
            const publishDate = new Date(r.Datum);
            publishDate.setHours(0, 0, 0, 0);
            isPublished = publishDate <= today;
          }
          
          return hasTitle && isAktiv && isPublished;
        })
        .map((r) => {
          const baseServingsNum = r.PortionenZahl
            ? parseInt(r.PortionenZahl, 10)
            : NaN;
          return {
            slug: r.Slug?.trim() || slugify(r.Titel),
            category: r.Kategorie?.trim() || "",
            title: r.Titel?.trim() || "",
            servings: r.Portion?.trim() || "",
            baseServings:
              Number.isFinite(baseServingsNum) &&
              baseServingsNum > 0
                ? baseServingsNum
                : null,
            intro: r.Einleitung?.trim() || null,
            image: r.Bild || undefined,
            ingredientGroups: parseIngredients(
              r.Zutaten || "",
            ),
            steps: parseSteps(r.Zubereitung || ""),
          };
        });
    })
    .catch((err: Error) => {
      cachedError = err.message;
    })
    .then(() => {
      notifyListeners();
    });

  return inFlightPromise;
}

fetchRecipesOnce();

export function useRecipes(): UseRecipesResult {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    recipes: cachedRecipes ?? [],
    loading: cachedRecipes === null && cachedError === null,
    error: cachedError,
  };
}
