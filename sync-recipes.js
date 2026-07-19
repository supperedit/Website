const fs = require("fs");
const path = require("path");

const __dirname = path.resolve();

function slugify(text) {
  const map = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => map[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

console.log("🔄 Syncing Rezepte...\n");

const fallbackRecipes = [
  {
    slug: "placeholder",
    kategorie: "Placeholder",
    titel: "Noch keine Rezepte",
    portionen: "für 2",
    portionenzahl: 2,
    einleitung: "Rezepte folgen...",
    bild: undefined,
    ingredientGroups: [{ group: null, items: [] }],
    steps: [{ title: "Rezepte werden geladen", content: "", veganNote: undefined }],
    published: true,
  },
];

const jsonPath = path.join(__dirname, "src", "data", "recipes.json");

try {
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(fallbackRecipes, null, 2),
    "utf-8"
  );
  console.log("✅ recipes.json erstellt");
  console.log(`💾 Gespeichert in: ${jsonPath}\n`);
} catch (err) {
  console.error("❌ Fehler:", err.message);
  process.exit(1);
}
