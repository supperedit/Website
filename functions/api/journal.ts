interface Env {
  NOTION_TOKEN: string;
  NOTION_JOURNAL_DATABASE_ID: string;
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
  url?: string | null;
  files?: { type: string; file?: { url: string }; external?: { url: string }; name: string }[];
  relation?: { id: string }[];
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
  const { NOTION_TOKEN, NOTION_JOURNAL_DATABASE_ID, NOTION_DATABASE_ID } = context.env;

  if (!NOTION_TOKEN || !NOTION_JOURNAL_DATABASE_ID) {
    return new Response(
      JSON.stringify({ error: "NOTION_TOKEN or NOTION_JOURNAL_DATABASE_ID not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const [journalPages, recipePages] = await Promise.all([
      queryAll(NOTION_JOURNAL_DATABASE_ID, NOTION_TOKEN),
      NOTION_DATABASE_ID ? queryAll(NOTION_DATABASE_ID, NOTION_TOKEN) : Promise.resolve([]),
    ]);

    const recipeIdToSlug = new Map<string, string>();
    for (const page of recipePages) {
      const p = page.properties;
      const title = richText(p["Titel"] ?? p["titel"] ?? p["Name"] ?? p["name"]);
      const slug = richText(p["Slug"] ?? p["slug"]) || slugify(title);
      if (slug) recipeIdToSlug.set(page.id.replace(/-/g, ""), slug);
    }

    const entries = journalPages
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
        const linkedRecipes = (p["Verlinkte Rezepte"]?.relation ?? [])
          .map((r: { id: string }) => recipeIdToSlug.get(r.id.replace(/-/g, "")))
          .filter((s): s is string => Boolean(s));

        return {
          slug,
          title,
          category: (p["Kategorie"] ?? p["kategorie"])?.select?.name ?? "",
          season: (p["Saison"] ?? p["saison"])?.select?.name ?? null,
          intro: richText(p["Intro"] ?? p["intro"]) || null,
          background: richText(p["Hintergrund"] ?? p["hintergrund"]) || null,
          funFact: richText(p["Fun Fact"] ?? p["fun fact"]) || null,
          tastingNotes: richText(p["Geschmacksprofil"] ?? p["geschmacksprofil"]) || null,
          myNote: richText(p["Mein Kommentar"] ?? p["mein kommentar"]) || null,
          image: imageUrl(p["Bild"] ?? p["bild"]),
          linkedRecipes,
        };
      })
      .filter((e) => e.title);

    return new Response(JSON.stringify(entries), {
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
