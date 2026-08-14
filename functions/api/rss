interface Recipe {
  slug: string;
  title: string;
  category: string;
  intro: string | null;
  image?: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const onRequest: PagesFunction = async () => {
  const BASE = "https://www.supperedit.de";

  const res = await fetch(`${BASE}/api/recipes`);
  if (!res.ok) {
    return new Response("Could not load recipes", { status: 502 });
  }

  const recipes = (await res.json()) as Recipe[];

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Supper Edit – Rezepte</title>
    <link>${BASE}</link>
    <description>Gute Rezepte, schnelle Drinks und kleine Ideen für entspannte Abende.</description>
    <language>de</language>
    <ttl>60</ttl>
${recipes
  .map((r) => {
    const url = `${BASE}/rezepte/${r.slug}`;
    const desc = escapeXml(r.intro || r.category || r.title);
    const imgTag = r.image
      ? `      <enclosure url="${escapeXml(r.image)}" type="image/jpeg" length="0"/>
      <media:content url="${escapeXml(r.image)}" medium="image"/>`
      : "";
    return `    <item>
      <title>${escapeXml(r.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${desc}</description>
${imgTag}
    </item>`;
  })
  .join("\n")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=120",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
