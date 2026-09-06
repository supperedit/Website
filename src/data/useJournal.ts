import { useEffect, useState } from "react";
import type { JournalEntry } from "./journalTypes";

let cachedEntries: JournalEntry[] | null = null;
let cachedError: string | null = null;
let inFlightPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

function fetchEntriesOnce(): Promise<void> {
  if (cachedEntries !== null || cachedError !== null) return Promise.resolve();
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = fetch("/api/journal")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<JournalEntry[]>;
    })
    .then((data) => {
      cachedEntries = data;
      cachedError = null;
    })
    .catch((err: unknown) => {
      cachedError = String(err);
      cachedEntries = [];
    })
    .finally(() => {
      inFlightPromise = null;
      notify();
    });

  return inFlightPromise;
}

fetchEntriesOnce();

export function useJournal() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const update = () => forceUpdate((n) => n + 1);
    listeners.add(update);
    fetchEntriesOnce();
    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    entries: cachedEntries ?? [],
    loading: cachedEntries === null && cachedError === null,
    error: cachedError,
  };
}
