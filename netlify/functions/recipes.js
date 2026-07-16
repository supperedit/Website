const NOTION_VERSION = "2022-06-28";

function getRichText(property) {
  if (!property) return "";
  const list = property.rich_text || property.title || [];
  return list.map((t) => t.plain_text).join("");
}

function getSelect(property) {
  return property && property.select ? property.select.name : "";
}

function getNumber(property) {
  return property && typeof property.number === "number" ? property.number : null;
}

function getDate(property) {
  return property && property.date ? property.date.start : null;
}

function getFileUrl(property) {
  const file = property && property.files && property.files[0];
  if (!file) return "";
  return file.file ? file.file.url : file.external ? file.external.url : "";
}

exports.handler = async () => {
  const token = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "NOTION_API_KEY oder NOTION_DATABASE_ID fehlt in den Netlify-Umgebungsvariablen." }),
    };
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 100 }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: text }) };
    }

    const data = await response.json();

    const rows = data.results.map((page) => {
      const p = page.properties;
      return {
        Status: getSelect(p.Status),
        Slug: getRichText(p.Slug),
        Kategorie: getSelect(p.Kategorie),
        Titel: getRichText(p.Titel),
        Portion: getRichText(p.Portion),
        PortionenZahl: getNumber(p.PortionenZahl),
        Einleitung: getRichText(p.Einleitung),
        Bild: getFileUrl(p.Bild),
        Zutaten: getRichText(p.Zutaten),
        Zubereitung: getRichText(p.Zubereitung),
        PinterestTitel: getRichText(p.PinterestTitel),
        PinterestBeschreibung: getRichText(p.PinterestBeschreibung),
        Datum: getDate(p.Datum),
      };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
      body: JSON.stringify(rows),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
