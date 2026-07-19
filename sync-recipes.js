const fs = require("fs");
const path = require("path");
const https = require("https");

const __dirname = path.resolve();

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
      protocol
        .get(url, { timeout: 10000 }, (res) => {
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
        })
        .on("error", reject);
    };

    makeRequest(url.startsWith("https") ? https : require("http"));
  });
}

function processRecipes() {
  return new Promise((resolve, reject) => {
    console.log("🔄 Syncing Notion Rezepte...\n");

    downloadFile(
      "https://www.notion.so/7609f4fa14a34cf9a0783b5b1bfe63e9?format=csv"
    )
      .then((csvContent) => {
        console.log("✅ CSV von Notion geladen");
        processCSV(csvContent);
      })
      .catch((err) => {
        console.error("❌ Fehler beim Laden von Notion:", err.message);
        reject(err);
      });

    function processCSV(csvContent) {
      if (!csvContent) {
        reject(new Error("CSV konnte nicht geladen werden"));
        return;
      }

      const rows = parseCSV(csvContent);
      if (rows.length === 0) {
        reject(new Error("CSV ist leer!"));
        return;
      }

      const [header, ...dataRows] = rows;
      const col = (name) =>
        header.findIndex(
          (h) => h.trim().toLowerCase() === name.toLowerCase()
        );

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
          return hasTitle && r[idx.status]?.trim().toLowerCase() === "aktiv";
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
      resolve();
    }
  });
}

processRecipes()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Fehler:", err.message);
    process.exit(1);
  });
