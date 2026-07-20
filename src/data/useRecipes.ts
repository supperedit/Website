import { useEffect, useState } from "react";
import type { Recipe } from "./recipeTypes";

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
      if (!res.ok) throw new Error("Rezepte konnten nicht geladen werden");
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