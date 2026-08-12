import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCSV(text) {
  const rows = [];
  let row = [];
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

function slugify(text) {
  const map = {
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

function parseIngredients(cell) {
  const groups = [{ group: null, items: [] }];
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

function parseSteps(cell) {
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

function getImageUrl(text) {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (trimmed.startsWith("http")) return trimmed;
  return undefined;
}

function processRecipes() {
  const csvPath = path.join(__dirname, "recipes.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("❌ recipes.csv nicht gefunden!");
    console.error("📍 Erwartet in:", csvPath);
    console.error("💡 Notion → ··· → Download → CSV speichern als recipes.csv");
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(csvContent);

  if (rows.length === 0) {
    console.error("❌ CSV ist leer!");
    process.exit(1);
  }

  const [header, ...dataRows] = rows;

  const col = (name) => {
    const idx = header.findIndex(
      (h) => h.trim().toLowerCase() === name.toLowerCase()
    );
    return idx;
  };

  const idx = {
    titel: col("titel"),
    slug: col("slug"),
    kategorie: col("kategorie"),
    portionen: col("portionen"),
    portionenzahl: col("portionenzahl"),
    einleitung: col("einleitung"),
    bild: col("bild"),
    zutaten: col("zutaten"),
    zubereitung: col("zubereitung"),
    status: col("status"),
    datum: col("datum"),
  };

  const recipes = dataRows
    .filter((r) => {
      const hasTitle = !!r[idx.titel]?.trim();
      if (idx.status === -1) return hasTitle;
      const status = r[idx.status]?.trim().toLowerCase();
      return hasTitle && status === "aktiv";
    })
    .map((r) => {
      const title = r[idx.titel]?.trim() || "";
      const slug = r[idx.slug]?.trim() || slugify(title);

      const baseServingsRaw = r[idx.portionenzahl]?.trim();
      const baseServings =
        baseServingsRaw && !isNaN(baseServingsRaw)
          ? parseInt(baseServingsRaw, 10)
          : null;

      const datum = r[idx.datum]?.trim() || null;
      const published = datum ? new Date(datum) <= new Date() : true;

      return {
        slug,
        kategorie: r[idx.kategorie]?.trim() || "",
        titel: title,
        portionen: r[idx.portionen]?.trim() || "",
        portionenzahl: baseServings,
        einleitung: r[idx.einleitung]?.trim() || null,
        bild: getImageUrl(r[idx.bild]) || undefined,
        ingredientGroups: parseIngredients(r[idx.zutaten] || ""),
        steps: parseSteps(r[idx.zubereitung] || ""),
        published,
      };
    });

  const jsonPath = path.join(__dirname, "src", "data", "recipes.json");
  fs.writeFileSync(jsonPath, JSON.stringify(recipes, null, 2), "utf-8");

  console.log("✅ Fertig!");
  console.log(`📊 ${recipes.length} Rezepte konvertiert`);
  console.log(`💾 Gespeichert in: ${jsonPath}`);
}

try {
  processRecipes();
} catch (err) {
  console.error("❌ Fehler:", err.message);
  process.exit(1);
}
