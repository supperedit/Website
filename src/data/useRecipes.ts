import { useEffect, useState } from "react";
import type { Recipe } from "./recipeTypes";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6_hiJTDhokBCSLMyOMvV99CzQjuztfs_uZzk5wkOQA_3Y8KU7vbiMY2ylAA9N86YSqm00i1FqS2Lv/pub?output=csv";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function driveImageUrl(link: string): string | undefined {
  if (!link) return undefined;
  const match = link.match(/[-\w]{25,}/);
  if (!match) return link;
  return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w1000`;
}

function slugify(text: string): string {
  const map: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => map[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseIngredients(cell: string): Recipe["ingredientGroups"] {
  const groups: Recipe["ingredientGroups"] = [{ group: null, items: [] }];
  const lines = cell.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  lines.forEach((line) => {
    if (line.startsWith("##")) {
      groups.push({ group: line.replace(/^##\s*/, ""), items: [] });
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
      const [title, content, veganNote] = line.split("::").map((p) => (p || "").trim());
      return { title: title || "", content: content || "", veganNote: veganNote || undefined };
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

  inFlightPromise = fetch(SHEET_CSV_URL)
    .then((res) => {
      if (!res.ok) throw new Error("Tabelle konnte nicht geladen werden");
      return res.text();
    })
    .then((text) => {
      const rows = parseCSV(text);
      const [header, ...dataRows] = rows;
      const col = (name: string) =>
        header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());

      const idx = {
        slug: col("slug"),
        category: col("kategorie"),
        title: col("titel"),
        servings: col("portionen") !== -1 ? col("portionen") : col("portion"),
        baseServings: col("portionenzahl"),
        intro: col("einleitung"),
        image: col("bild"),
        ingredients: col("zutaten"),
        steps: col("zubereitung"),
        status: col("Status"),
      };

      cachedRecipes = dataRows
        .filter((r) => {
          const hasTitle = !!r[idx.title]?.trim();
          if (idx.status === -1) return hasTitle;
          const isAktiv = r[idx.status]?.trim().toLowerCase() === "aktiv";
          return hasTitle && isAktiv;
        })
        .map((r) => {
          const baseServingsRaw = idx.baseServings !== -1 ? r[idx.baseServings]?.trim() : "";
          const baseServingsNum = baseServingsRaw ? parseInt(baseServingsRaw, 10) : NaN;
          return {
            slug: r[idx.slug]?.trim() || slugify(r[idx.title]),
            category: r[idx.category]?.trim() || "",
            title: r[idx.title]?.trim() || "",
            servings: r[idx.servings]?.trim() || "",
            baseServings:
              Number.isFinite(baseServingsNum) && baseServingsNum > 0 ? baseServingsNum : null,
            intro: r[idx.intro]?.trim() || null,
            image: driveImageUrl(r[idx.image]?.trim() || ""),
            ingredientGroups: parseIngredients(r[idx.ingredients] || ""),
            steps: parseSteps(r[idx.steps] || ""),
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
