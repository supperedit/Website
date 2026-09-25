interface HerbariumEntry {
  slug: string;
  image?: string;
}

export const onRequest: PagesFunction = async (context) => {
  const slug = context.params.slug as string;
  const url = new URL(context.request.url);

  let cache: Cache | undefined;
  const cacheKey = new Request(`${url.origin}${url.pathname}`);
  try {
    cache = (caches as unknown as { default: Cache }).default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  } catch (err) {
    console.error("img/herbarium: cache read failed", err);
  }

  const res = await fetch(`${url.origin}/api/herbarium`);
  if (!res.ok) {
    return new Response("Herbarium konnte nicht geladen werden.", { status: 502 });
  }

  const entries: HerbariumEntry[] = await res.json();
  const entry = entries.find((e) => e.slug === slug);

  if (!entry || !entry.image) {
    return new Response("Bild nicht gefunden.", { status: 404 });
  }

  const imageRes = await fetch(entry.image, {
    cf: { image: { format: "jpeg", quality: 90 } },
  } as RequestInit);
  if (!imageRes.ok || !imageRes.body) {
    return new Response("Bild konnte nicht geladen werden.", { status: 502 });
  }

  const response = new Response(imageRes.body, {
    headers: {
      "Content-Type": imageRes.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  });

  if (cache) {
    context.waitUntil(
      cache.put(cacheKey, response.clone()).catch((err) => console.error("img/herbarium: cache write failed", err)),
    );
  }

  return response;
};
