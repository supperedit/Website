import { SITE_URL, jsonLdText } from '../../src/data/seo';
export interface Metadata { title: string; description: string; path: string; image?: string; imageAlt?: string; ogTitle?: string; ogDescription?: string; structuredData?: unknown; noindex?: boolean; }
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function withMetadata(response: Response, meta: Metadata, status = response.status): Response {
  const url = SITE_URL + meta.path;
  const image = meta.image || `${SITE_URL}/og-image.jpg`;
  const tags: [string, string, string][] = [
    ['name','description',meta.description], ['name','robots',meta.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'],
    ['property','og:title',meta.ogTitle || meta.title], ['property','og:description',meta.ogDescription || meta.description],
    ['property','og:url',url], ['property','og:image',image], ['property','og:image:alt',meta.imageAlt || meta.title],
    ['name','twitter:title',meta.ogTitle || meta.title], ['name','twitter:description',meta.ogDescription || meta.description],
    ['name','twitter:image',image], ['name','twitter:image:alt',meta.imageAlt || meta.title],
  ];
  let rewriter = new HTMLRewriter().on('title', { element(e) { e.setInnerContent(`${meta.title} · Supper Edit`); } })
    .on('link[rel="canonical"]', { element(e) { e.remove(); } })
    .on('#page-jsonld', { element(e) { e.remove(); } });
  for (const [attr, key] of tags) rewriter = rewriter.on(`meta[${attr}="${key}"]`, { element(e) { e.remove(); } });
  rewriter = rewriter.on('head', { element(e) {
    e.append(`<link rel="canonical" href="${escape(url)}">` + tags.map(([a,k,v]) => `<meta ${a}="${k}" content="${escape(v)}">`).join('') + (meta.structuredData ? `<script id="page-jsonld" type="application/ld+json">${jsonLdText(meta.structuredData)}</script>` : ''), { html: true });
  } });
  const result = rewriter.transform(response);
  const headers = new Headers(result.headers);
  // Metadata depends on query parameters and live content; never cache as an immutable asset.
  headers.set('Cache-Control', 'no-cache');
  return new Response(result.body, { status, headers });
}
