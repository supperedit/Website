import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NOTION_SHARE_LINK =
  "https://app.notion.com/p/7609f4fa14a34cf9a0783b5b1bfe63e9?v=fc1813ade0c54575a45992a5827917a1&source=copy_link";

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

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    let data = "";

    const makeRequest = (protocol) => {
      protocol.get(url, { timeout: 10000 }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const redirectUrl = res.headers.location;
          const redirectProtocol = redirectUrl.startsWith("https")
            ? https
            : require("http");
          makeRequest(redirectProtocol);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      });
    };

    makeRequest(url.startsWith("https") ? https : require("http"));
  });
}

async function processRecipes() {
  console.log("🔄 Syncing Notion Rezepte...\n");

  let csvContent = null;
  const csvPath = path.join(__dirname, "recipes.csv");

  if (fs.existsSync(csvPath)) {
    console.log("📄 Verwende lokale recipes.csv");
    csvContent = fs.readFileSync(csvPath, "utf-8");
  } else {
    console.log("📥 Versuche CSV von Notion zu laden...");
    try {
      csvContent = await downloadFile(
        "https://www.notion.so/7609f4fa14a34cf9a0783b5b1bfe63e9?format=csv"
      );
      console.log("✅ CSV von Notion geladen");
    } catch (err) {
      console.log(
        "⚠️  Konnte nicht von Notion laden:",
        err.message
      );
      console.log("💡 Fallback: Versuche lokale CSV...\n");

      if (!fs.existsSync(csvPath)) {
        console.error(
          "❌ Keine CSV verfügbar (weder Online noch Lokal)"
        );
        console.error(
          "💡 Bitte manuell von Notion exportieren: ··· → Download → CSV"
        );
        process.exit(1);
      }
    }
  }

  if (!csvContent) {
    console.error("❌ CSV konnte nicht geladen werden");
    process.exit(1);
  }

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
  console.log(`💾 Gespeichert in: ${jsonPath}\n`);
}

try {
  await processRecipes();
} catch (err) {
  console.error("❌ Fehler:", err.message);
  process.exit(1);
}
