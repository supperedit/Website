interface Recipe {
  slug: string;
  image?: string;
}

export const onRequest: PagesFunction = async (context) => {
  const slug = context.params.slug as string;
  const origin = new URL(context.request.url).origin;

  const res = await fetch(`${origin}/api/recipes`);
  if (!res.ok) {
    return new Response("Rezepte konnten nicht geladen werden.", { status: 502 });
  }

  const recipes: Recipe[] = await res.json();
  const recipe = recipes.find((r) => r.slug === slug);

  if (!recipe || !recipe.image) {
    return new Response("Bild nicht gefunden.", { status: 404 });
  }

  // Preserve the original JPEG and its 2:3 dimensions: no re-export or conversion.
  const imageRes = await fetch(recipe.image);
  if (!imageRes.ok || !imageRes.body) {
    return new Response("Bild konnte nicht geladen werden.", { status: 502 });
  }

  const type = imageRes.headers.get("Content-Type")?.split(";")[0].trim();
  if (!type || !["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"].includes(type)) {
    return new Response("Ungültiges Bildformat.", { status: 502 });
  }
  return new Response(imageRes.body, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
