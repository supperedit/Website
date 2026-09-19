import { isRateLimited, rateLimitResponse } from "./_rateLimit";

interface Env {
  NOTION_TOKEN: string;
  NOTION_DATABASE_ID: string;
  RATE_LIMIT?: KVNamespace;
}

const ALLOWED_ORIGIN = "https://www.supperedit.de";

function corsHeaders(): Record<string, string> {
  return { "Access-Control-Allow-Origin": ALLOWED_ORIGIN, Vary: "Origin" };
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
  status?: { name: string } | null;
  date?: { start: string } | null;
  url?: string | null;
  files?: { type: string; file?: { url: string }; external?: { url: string }; name: string }[];
  relation?: { id: string }[];
}

interface NotionPage {
  id: string;
  last_edited_time?: string;
  properties: Record<string, NotionProperty>;
}

function richText(prop: NotionProperty | undefined): string {
  if (!prop) return "";
  if (prop.type === "title") return prop.title?.map((t) => t.plain_text).join("") ?? "";
  if (prop.type === "rich_text") return prop.rich_text?.map((t) => t.plain_text).join("") ?? "";
  return "";
}

function positiveMinutes(prop: NotionProperty | undefined): number | undefined {
  const value = prop?.number;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
}
function isPublished(page: NotionPage): boolean {
  const status = page.properties["Status"];
  if (!status) return true;
  const name = status.type === "select" ? status.select?.name : status.type === "status" ? status.status?.name : undefined;
  return (status.type === "select" || status.type === "status") ? name?.toLowerCase() === "aktiv" : true;
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
  const groups: {
    group: string | null;
    items: { amount: string; name: string; veganAmount: string | null; veganName: string | null }[];
  }[] = [{ group: null, items: [] }];
  const lines = cell.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  lines.forEach((line) => {
    if (line.startsWith("##")) {
      groups.push({ group: line.replace(/^##\s*/, ""), items: [] });
      return;
    }
    const parts = line.split("|").map((p) => p.trim());
    const [amount, name, veganAmount, veganName] = parts;
    if (!name) return;
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

  const dbRes = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2026-03-11",
    },
  });

  let dataSourceIds: string[] = [databaseId];
  if (dbRes.ok) {
    const dbData = (await dbRes.json()) as { data_sources?: { id: string }[] };
    if (dbData.data_sources && dbData.data_sources.length > 0) {
      dataSourceIds = dbData.data_sources.map((ds) => ds.id);
    }
  }

  for (const dataSourceId of dataSourceIds) {
    let cursor: string | undefined;
    do {
      const body: Record<string, unknown> = { page_size: 100 };
      if (cursor) body.start_cursor = cursor;

      const res = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2026-03-11",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Notion API error: ${res.status} — ${errBody}`);
      }
      const data = (await res.json()) as {
        results: NotionPage[];
        has_more: boolean;
        next_cursor: string | null;
      };
      pages.push(...data.results);
      cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined;
    } while (cursor);
  }

  return pages;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { NOTION_TOKEN, NOTION_DATABASE_ID, RATE_LIMIT } = context.env;

  if (await isRateLimited(context.request, RATE_LIMIT, "recipes")) {
    return rateLimitResponse();
  }

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    console.error("recipes: NOTION_TOKEN or NOTION_DATABASE_ID not set");
    return new Response(JSON.stringify({ error: "Server-Konfigurationsfehler" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  try {
    const pages = (await queryAll(NOTION_DATABASE_ID, NOTION_TOKEN)).filter(isPublished);

    const pageIdToInfo = new Map<string, { slug: string; title: string }>();
    for (const page of pages) {
      const p = page.properties;
      const title = richText(p["Titel"] ?? p["titel"] ?? p["Name"] ?? p["name"]);
      const slug = richText(p["Slug"] ?? p["slug"]) || slugify(title);
      if (slug) pageIdToInfo.set(page.id.replace(/-/g, ""), { slug, title });
    }

    const recipes = pages
      .map((page) => {
        const p = page.properties;
        const title = richText(p["Titel"] ?? p["titel"] ?? p["Name"] ?? p["name"]);
        const slug = richText(p["Slug"] ?? p["slug"]) || slugify(title);
        const baseServingsNum = p["Portionenzahl"]?.number ?? p["portionenzahl"]?.number ?? null;

        const linkedIngredients = (p["Rezept-Zutaten"]?.relation ?? [])
          .map((r: { id: string }) => pageIdToInfo.get(r.id.replace(/-/g, "")))
          .filter((r): r is { slug: string; title: string } => r !== undefined && Boolean(r.slug));

        const related = (p["Verwandte Rezepte"]?.relation ?? [])
          .map((r: { id: string }) => pageIdToInfo.get(r.id.replace(/-/g, ""))?.slug)
          .filter((s): s is string => Boolean(s));

        return {
          slug,
          category:
            (p["Kategorie"] ?? p["kategorie"])?.select?.name ??
            richText(p["Kategorie"] ?? p["kategorie"]) ??
            "",
          title,
          servings: richText(p["Portionen"] ?? p["portionen"]),
          baseServings: baseServingsNum && baseServingsNum > 0 ? baseServingsNum : null,
          intro: richText(p["Einleitung"] ?? p["einleitung"]) || null,
          image: imageUrl(p["Bild"] ?? p["bild"]),
          imageAlt: richText(p["Alt-Text"] ?? p["Bildbeschreibung"]) || title,
          seoTitle: richText(p["SEO Title"] ?? p["SEO-Titel"]) || undefined,
          seoDescription: richText(p["Meta Description"] ?? p["SEO-Beschreibung"]) || undefined,
          pinterestTitle: richText(p["Pinterest-Titel"] ?? p["Pinterest Title"]) || undefined,
          pinterestDescription: richText(p["Pinterest-Beschreibung"] ?? p["Pinterest Description"]) || undefined,
          datePublished: (p["Veröffentlichungsdatum"]?.date?.start) || undefined,
          dateModified: page.last_edited_time || undefined,
          prepMinutes: positiveMinutes(p["Prep Time"] ?? p["Vorbereitungszeit"]),
          cookMinutes: positiveMinutes(p["Cook Time"] ?? p["Kochzeit"]),
          totalMinutes: positiveMinutes(p["Total Time"] ?? p["Gesamtzeit"]),
          ingredientGroups: parseIngredients(richText(p["Zutaten"] ?? p["zutaten"])),
          steps: parseSteps(richText(p["Zubereitung"] ?? p["zubereitung"])),
          linkedIngredients,
          related,
        };
      })
      .filter((r) => r.title && r.slug);

    return new Response(JSON.stringify(recipes), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
        ...corsHeaders(),
      },
    });
  } catch (err) {
    console.error("recipes:", err);
    return new Response(JSON.stringify({ error: "Rezepte konnten nicht geladen werden." }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
};
