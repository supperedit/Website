import { useEffect, useState } from "react";

export interface JournalEntry {
  edibleParts?: string | null;
  sowingTime?: string | null;
  plantingTime?: string | null;
  harvest?: string | null;
  wellnessNote?: string | null;
  usage?: string | null;
  pairings?: string | null;
  goodToKnow?: string | null;
  supperIdeas?: string | null;
  seasonMonths?: string[];
  slug: string;
  title: string;
  category: string;
  season: string | null;
  intro: string | null;
  background: string | null;
  funFact: string | null;
  tastingNotes: string | null;
  image?: string;
  linkedRecipes: string[];
  latinName: string | null;
  plantFamily: string | null;
  typ: string | null;
  bloomTime: string | null;
  location: string | null;
  appearance: string | null;
  healing: string | null;
  temperament: string | null;
}

interface UseJournalResult {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
}

let cachedEntries: JournalEntry[] | null = null;
let cachedError: string | null = null;
let inFlightPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

function fetchJournalOnce(): Promise<void> {
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = fetch("/api/journal")
    .then((res) => {
      if (!res.ok) throw new Error(`Journal konnte nicht geladen werden (${res.status})`);
      return res.json() as Promise<JournalEntry[]>;
    })
    .then((data) => {
      cachedEntries = data;
    })
    .catch((err: Error) => {
      cachedError = err.message;
    })
    .then(() => {
      notifyListeners();
    });

  return inFlightPromise;
}

fetchJournalOnce();

export function useJournal(): UseJournalResult {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return {
    entries: cachedEntries ?? [],
    loading: cachedEntries === null && cachedError === null,
    error: cachedError,
  };
}
