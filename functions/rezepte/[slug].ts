interface Recipe {
  slug: string;
  title: string;
  intro: string | null;
  image?: string;
  pinterestTitle?: string | null;
  pinterestDescription?: string | null;
}

interface Env {
  ASSETS: Fetcher;
}

const SITE_URL = "https://www.supperedit.de";

export const onRequest: PagesFunction<Env> = async (context) => {
  const assetResponse = await context.env.ASSETS.fetch(context.request);
  const contentType = assetResponse.headers.get("Content-Type") ?? "";
  if (!contentType.includes("text/html")) {
    return assetResponse;
  }

  const slug = context.params.slug as string;
  const origin = new URL(context.request.url).origin;

  const recipesRes = await fetch(`${origin}/api/recipes`);
  if (!recipesRes.ok) {
    return assetResponse;
  }

  const recipes: Recipe[] = await recipesRes.json();
  const recipe = recipes.find((r) => r.slug === slug);
  if (!recipe) {
    return assetResponse;
  }

  const title = `${recipe.title} · Supper Edit`;
  const description = recipe.intro ?? `${recipe.title}, ein Rezept von Supper Edit.`;
  const ogTitle = recipe.pinterestTitle ?? recipe.title;
  const ogDescription = recipe.pinterestDescription ?? description;
  const image = recipe.image ? `${SITE_URL}/img/recipes/${recipe.slug}` : `${SITE_URL}/og-image.jpg`;
  const url = `${SITE_URL}/rezepte/${recipe.slug}`;

  return new HTMLRewriter()
    .on("title", {
      element(element) {
        element.setInnerContent(title);
      },
    })
    .on('meta[name="description"]', {
      element(element) {
        element.setAttribute("content", description);
      },
    })
    .on('link[rel="canonical"]', {
      element(element) {
        element.setAttribute("href", url);
      },
    })
    .on('meta[property="og:title"]', {
      element(element) {
        element.setAttribute("content", ogTitle);
      },
    })
    .on('meta[property="og:description"]', {
      element(element) {
        element.setAttribute("content", ogDescription);
      },
    })
    .on('meta[property="og:image"]', {
      element(element) {
        element.setAttribute("content", image);
      },
    })
    .on('meta[property="og:url"]', {
      element(element) {
        element.setAttribute("content", url);
      },
    })
    .on('meta[name="twitter:title"]', {
      element(element) {
        element.setAttribute("content", ogTitle);
      },
    })
    .on('meta[name="twitter:description"]', {
      element(element) {
        element.setAttribute("content", ogDescription);
      },
    })
    .on('meta[name="twitter:image"]', {
      element(element) {
        element.setAttribute("content", image);
      },
    })
    .transform(assetResponse);
};
