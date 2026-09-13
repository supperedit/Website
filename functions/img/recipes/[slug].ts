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

  const imageRes = await fetch(recipe.image, {
    cf: { image: { format: "jpeg", quality: 90 } },
  } as RequestInit);
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
