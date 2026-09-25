import { ImageResponse, loadGoogleFont } from "workers-og";
import { isRateLimited, rateLimitResponse } from "../_rateLimit";

interface Env {
  RATE_LIMIT?: KVNamespace;
}

interface HerbariumEntryLite {
  slug: string;
  title: string;
  latinName: string | null;
  season: string | null;
  edibleParts: string | null;
  tastingNotes: string | null;
  image?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (await isRateLimited(context.request, context.env.RATE_LIMIT, "pin")) {
    return rateLimitResponse();
  }

  let cache: Cache | undefined;
  let cacheKey: Request | undefined;
  try {
    cache = (caches as unknown as { default: Cache }).default;
    cacheKey = new Request(context.request.url, context.request);
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }
  } catch (err) {
    console.error("pin: cache read failed", err);
  }

  const slug = context.params.slug as string;
  const origin = new URL(context.request.url).origin;

  const herbariumRes = await fetch(`${origin}/api/herbarium`);
  if (!herbariumRes.ok) {
    console.error("pin: herbarium fetch failed with status", herbariumRes.status);
    return new Response("Karte konnte nicht geladen werden.", { status: 502 });
  }
  const entries = (await herbariumRes.json()) as HerbariumEntryLite[];
  const entry = entries.find((e) => e.slug === slug);

  if (!entry) {
    return new Response("Eintrag nicht gefunden.", { status: 404 });
  }

  const title = escapeHtml(entry.title);
  const season = escapeHtml(entry.season || "\u2013");
  const tastingNotes = escapeHtml(entry.tastingNotes || "\u2013");

  const cream = "#F7F6EC";
  const maroon = "#430908";
  const line = "rgba(67,9,8,0.42)";

  const photo = entry.image
    ? `<img src="${origin}/img/herbarium/${entry.slug}" width="960" height="1180" style="width:960px;height:1180px;object-fit:contain;" />`
    : `<div style="display:flex;width:100%;height:100%;background:${cream};"></div>`;

  const html = `
  <div style="display:flex;flex-direction:column;width:1000px;height:1500px;background:${cream};border:2px solid ${line};box-sizing:border-box;">
    <div style="display:flex;flex:8;align-items:center;justify-content:center;padding:20px;">
      ${photo}
    </div>
    <div style="display:flex;flex:1;border-top:2px solid ${line};">
      <div style="display:flex;flex:1.55;align-items:center;padding:10px 28px;">
        <div style="display:flex;font-family:'Homemade Apple';font-size:56px;color:${maroon};">${title}</div>
      </div>
      <div style="display:flex;flex:1;flex-direction:column;justify-content:center;align-items:flex-start;gap:8px;border-left:2px solid ${line};padding:10px 28px;">
        <div style="display:flex;font-family:sans-serif;font-size:20px;color:${maroon};">Saison</div>
        <div style="display:flex;font-family:'Homemade Apple';font-size:38px;color:${maroon};">${season}</div>
      </div>
    </div>
    <div style="display:flex;flex:1;align-items:center;border-top:2px solid ${line};padding:10px 28px;gap:20px;">
      <div style="display:flex;font-family:sans-serif;font-size:20px;color:${maroon};white-space:nowrap;">Geschmack:</div>
      <div style="display:flex;flex:1;font-family:sans-serif;font-size:26px;color:${maroon};">${tastingNotes}</div>
    </div>
  </div>`;

  try {
    const scriptText = `${entry.title}${entry.season || ""}0123456789\u2013`;
    const scriptFont = await loadGoogleFont({ family: "Homemade Apple", text: scriptText });

    const image = new ImageResponse(html, {
      width: 1000,
      height: 1500,
      fonts: [{ name: "Homemade Apple", data: scriptFont, weight: 400, style: "normal" }],
    });

    const buf = await image.arrayBuffer();

    const response = new Response(buf, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });

    if (cache && cacheKey) {
      context.waitUntil(
        cache.put(cacheKey, response.clone()).catch((err) => console.error("pin: cache write failed", err)),
      );
    }

    return response;
  } catch (err) {
    console.error("pin:", err);
    return new Response("Bild konnte nicht erzeugt werden.", { status: 500 });
  }
};
