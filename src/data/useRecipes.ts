import { useEffect, useSyncExternalStore } from "react";
import { recipeImagePath } from "./seo";
import type { Recipe } from "./recipeTypes";

// ─── Image size helper ────────────────────────────────────────────────────────
/**
 * Returns a resized Google Drive thumbnail URL if the URL contains an `sz=`
 * param. For Notion-hosted images (which have direct URLs), the URL is returned
 * unchanged — so this function is safe to call on any image URL.
 */
export function resizeDriveUrl(
  url: string | undefined,
  size: "w300" | "w400" | "w600" | "w800" | "w1000" | "w1200",
): string | undefined {
  if (!url) return undefined;
  return url.includes("sz=") ? url.replace(/sz=w\d+/, `sz=${size}`) : url;
}

// ─── Shared cache ─────────────────────────────────────────────────────────────
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

  inFlightPromise = fetch("/api/recipes")
    .then((res) => {
      if (!res.ok) throw new Error(`Rezepte konnten nicht geladen werden (${res.status})`);
      return res.json() as Promise<Recipe[]>;
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error("Ungültige Rezeptdaten");
      cachedRecipes = data.map(recipe => ({ ...recipe, image: recipe.image ? recipeImagePath(recipe.slug) : undefined }));
    })
    .catch((err: Error) => {
      cachedError = err.message;
    })
    .then(() => {
      snapshot = { recipes: cachedRecipes ?? emptyRecipes, loading: false, error: cachedError };
      notifyListeners();
    });

  return inFlightPromise;
}

const emptyRecipes: Recipe[] = [];
let snapshot: UseRecipesResult = { recipes: emptyRecipes, loading: true, error: null };
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function useRecipes(): UseRecipesResult {
  const result = useSyncExternalStore(subscribe, () => snapshot);
  useEffect(() => { void fetchRecipesOnce(); }, []);
  return result;
}
