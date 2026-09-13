interface JournalEntry {
  slug: string;
  title: string;
  intro: string | null;
  image?: string;
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

  const journalRes = await fetch(`${origin}/api/journal`);
  if (!journalRes.ok) {
    return assetResponse;
  }

  const entries: JournalEntry[] = await journalRes.json();
  const entry = entries.find((e) => e.slug === slug);
  if (!entry) {
    return assetResponse;
  }

  const title = `${entry.title} – Herbarium · Supper Edit`;
  const description = entry.intro ?? `${entry.title}: botanische Notizen im Supper Edit Herbarium.`;
  const image = entry.image ? `${SITE_URL}/img/journal/${entry.slug}` : `${SITE_URL}/og-image.jpg`;
  const url = `${SITE_URL}/journal/${entry.slug}`;

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
        element.setAttribute("content", title);
      },
    })
    .on('meta[property="og:description"]', {
      element(element) {
        element.setAttribute("content", description);
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
        element.setAttribute("content", title);
      },
    })
    .on('meta[name="twitter:description"]', {
      element(element) {
        element.setAttribute("content", description);
      },
    })
    .on('meta[name="twitter:image"]', {
      element(element) {
        element.setAttribute("content", image);
      },
    })
    .transform(assetResponse);
};
