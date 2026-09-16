import { useEffect, useState } from "react";
import type { Recipe } from "./recipeTypes";

// ─── Image size helper ────────────────────────────────────────────────────────
/**
 * Returns a resized Google Drive thumbnail URL if the URL contains an `sz=`
 * param. For Notion-hosted images (which have direct URLs), the URL is returned
 * unchanged — so this function is safe to call on any image URL.
 */
export function resizeDriveUrl(
  url: string | undefined,
  size: "w400" | "w600" | "w800" | "w1000" | "w1200",
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
      cachedRecipes = data;
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
    return () => { listeners.delete(listener); };
  }, []);

  return {
    recipes: cachedRecipes ?? [],
    loading: cachedRecipes === null && cachedError === null,
    error: cachedError,
  };
}