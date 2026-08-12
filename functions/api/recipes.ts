interface Env {
  NOTION_TOKEN: string;
  NOTION_DATABASE_ID: string;
}

interface NotionRichText {
  plain_text: string;
}

interface NotionProperty {
  type: string;
  title?: NotionRichText[];
  rich_text?: NotionRichText[];
  select?: { name: string } | null;
  number?: number | null;
  url?: string | null;
  files?: { type: string; file?: { url: string }; external?: { url: string }; name: string }[];
}

interface NotionPage {
  id: string;
  properties: Record<string, NotionProperty>;
}

function richText(prop: NotionProperty | undefined): string {
  if (!prop) return "";
  if (prop.type === "title") return prop.title?.map((t) => t.plain_text).join("") ?? "";
  if (prop.type === "rich_text") return prop.rich_text?.map((t) => t.plain_text).join("") ?? "";
  return "";
}

function slugify(text: string): string {
  const map: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => map[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseIngredients(cell: string) {
  const groups: { group: string | null; items: { amount: string; name: string; veganAmount: string | null; veganName: string | null }[] }[] = [
    { group: null, items: [] },
  ];
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

function parseSteps(cell: string) {
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

function imageUrl(prop: NotionProperty | undefined): string | undefined {
  if (!prop) return undefined;
  if (prop.type === "url" && prop.url) return prop.url;
  if (prop.type === "files" && prop.files?.[0]) {
    const f = prop.files[0];
    if (f.type === "file" && f.file) return f.file.url;
    if (f.type === "external" && f.external) return f.external.url;
  }
  return undefined;
}

async function queryAll(databaseId: string, token: string): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Notion API error: ${res.status} — ${body}`);
    }
    const data = (await res.json()) as { results: NotionPage[]; has_more: boolean; next_cursor: string | null };
    pages.push(...data.results);
    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined;
  } while (cursor);

  return pages;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { NOTION_TOKEN, NOTION_DATABASE_ID } = context.env;

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    return new Response(JSON.stringify({ error: "NOTION_TOKEN or NOTION_DATABASE_ID not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const pages = await queryAll(NOTION_DATABASE_ID, NOTION_TOKEN);

    const recipes = pages
      .filter((page) => {
        const status = page.properties["Status"];
        if (!status) return true;
        if (status.type === "select") return status.select?.name?.toLowerCase() === "aktiv";
        return true;
      })
      .map((page) => {
        const p = page.properties;
        const title = richText(p["Titel"] ?? p["titel"] ?? p["Name"] ?? p["name"]);
        const slug = richText(p["Slug"] ?? p["slug"]) || slugify(title);
        const baseServingsNum = p["Portionenzahl"]?.number ?? p["portionenzahl"]?.number ?? null;

        return {
          slug,
          category: (p["Kategorie"] ?? p["kategorie"])?.select?.name ?? richText(p["Kategorie"] ?? p["kategorie"]) ?? "",
          title,
          servings: richText(p["Portionen"] ?? p["portionen"]),
          baseServings: baseServingsNum && baseServingsNum > 0 ? baseServingsNum : null,
          intro: richText(p["Einleitung"] ?? p["einleitung"]) || null,
          image: imageUrl(p["Bild"] ?? p["bild"]),
          ingredientGroups: parseIngredients(richText(p["Zutaten"] ?? p["zutaten"])),
          steps: parseSteps(richText(p["Zubereitung"] ?? p["zubereitung"])),
        };
      })
      .filter((r) => r.title);

    return new Response(JSON.stringify(recipes), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
