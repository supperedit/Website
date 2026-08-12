import { useEffect, useState } from "react";

const STORAGE_KEY = "supper-edit-favorites";
const listeners = new Set<() => void>();

function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeFavorites(slugs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
  }
  listeners.forEach((fn) => fn());
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => readFavorites());

  useEffect(() => {
    const listener = () => setFavorites(readFavorites());
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  }, []);

  const isFavorite = (slug: string) => favorites.includes(slug);

  const toggleFavorite = (slug: string) => {
    const current = readFavorites();
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    writeFavorites(next);
  };

  return { favorites, isFavorite, toggleFavorite };
}