interface JournalEntry {
  slug: string;
  image?: string;
}

export const onRequest: PagesFunction = async (context) => {
  const slug = context.params.slug as string;
  const origin = new URL(context.request.url).origin;

  const res = await fetch(`${origin}/api/journal`);
  if (!res.ok) {
    return new Response("Herbarium konnte nicht geladen werden.", { status: 502 });
  }

  const entries: JournalEntry[] = await res.json();
  const entry = entries.find((e) => e.slug === slug);

  if (!entry || !entry.image) {
    return new Response("Bild nicht gefunden.", { status: 404 });
  }

  const imageRes = await fetch(entry.image);
  if (!imageRes.ok || !imageRes.body) {
    return new Response("Bild konnte nicht geladen werden.", { status: 502 });
  }

  return new Response(imageRes.body, {
    headers: {
      "Content-Type": imageRes.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
