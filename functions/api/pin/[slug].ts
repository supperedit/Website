import { ImageResponse, loadGoogleFont } from "workers-og";
import { isRateLimited, rateLimitResponse } from "../_rateLimit";

interface Env {
  RATE_LIMIT?: KVNamespace;
}

interface JournalEntryLite {
  slug: string;
  title: string;
  latinName: string | null;
  season: string | null;
  edibleParts: string | null;
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

  const slug = context.params.slug as string;
  const origin = new URL(context.request.url).origin;

  const journalRes = await fetch(`${origin}/api/journal`);
  if (!journalRes.ok) {
    console.error("pin: journal fetch failed with status", journalRes.status);
    return new Response("Karte konnte nicht geladen werden.", { status: 502 });
  }
  const entries = (await journalRes.json()) as JournalEntryLite[];
  const entry = entries.find((e) => e.slug === slug);

  if (!entry) {
    return new Response("Eintrag nicht gefunden.", { status: 404 });
  }

  const title = escapeHtml(entry.title);
  const latin = entry.latinName ? escapeHtml(entry.latinName) : "";
  const season = escapeHtml(entry.season || "\u2013");
  const edibleParts = escapeHtml(entry.edibleParts || "\u2013");
  const line = "rgba(67,9,8,.35)";
  const maroon = "#430908";
  const muted = "#7c4535";
  const cream = "#F7F6EC";

  const photo = entry.image
    ? `<img src="${entry.image}" style="width:100%;height:100%;object-fit:contain;" />`
    : `<div style="display:flex;width:100%;height:100%;background:${cream};"></div>`;

  const html = `
  <div style="display:flex;flex-direction:column;width:1000px;height:1500px;background:${cream};border:3px solid ${line};box-sizing:border-box;">
    <div style="display:flex;flex:1;align-items:center;justify-content:center;padding:40px;">
      ${photo}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;border-top:3px solid ${line};padding:24px 40px;">
      <div style="display:flex;font-family:'Homemade Apple';font-size:64px;color:${maroon};">${title}</div>
      ${latin ? `<div style="display:flex;font-family:'Homemade Apple';font-size:36px;color:${muted};">${latin}</div>` : ""}
    </div>
    <div style="display:flex;border-top:3px solid ${line};">
      <div style="display:flex;flex-direction:column;flex:1;padding:20px 40px;gap:6px;">
        <div style="display:flex;font-family:sans-serif;font-size:22px;color:${muted};">Saison:</div>
        <div style="display:flex;font-family:'Homemade Apple';font-size:40px;color:${maroon};">${season}</div>
      </div>
      <div style="display:flex;flex-direction:column;flex:1;padding:20px 40px;gap:6px;border-left:3px solid ${line};">
        <div style="display:flex;font-family:sans-serif;font-size:22px;color:${muted};">Essbare Teile:</div>
        <div style="display:flex;font-family:'Homemade Apple';font-size:40px;color:${maroon};">${edibleParts}</div>
      </div>
    </div>
  </div>`;

  try {
    const fontText = `${entry.title}${entry.latinName || ""}${entry.season || ""}${entry.edibleParts || ""}SaisonEssbareTeile0123456789\u2013`;
    const fontData = await loadGoogleFont({ family: "Homemade Apple", text: fontText });

    return new ImageResponse(html, {
      width: 1000,
      height: 1500,
      fonts: [{ name: "Homemade Apple", data: fontData, weight: 400, style: "normal" }],
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    } as never);
  } catch (err) {
    console.error("pin:", err);
    return new Response("Bild konnte nicht erzeugt werden.", { status: 500 });
  }
};
