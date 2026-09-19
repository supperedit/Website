import { categories } from '../src/data/categories';
import { SITE_URL, categoryPath, recipePath } from '../src/data/seo';
const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
export const onRequest: PagesFunction = async context => {
  try {
    const origin = new URL(context.request.url).origin;
    const responses = await Promise.all(['/api/recipes','/api/journal','/api/kitchen-notes'].map(path => fetch(origin + path)));
    if (responses.some(r => !r.ok)) throw new Error('Content unavailable');
    const [recipes, journal, notes] = await Promise.all(responses.map(r => r.json())) as [Array<{ slug: string; category: string }>, Array<{ slug: string }>, { posts: Array<{ slug: string }> }];
    if (!Array.isArray(recipes) || !Array.isArray(journal) || !Array.isArray(notes.posts)) throw new Error('Invalid content');
    const paths = new Set(['/', '/rezepte', '/journal', '/kitchen-notes', '/about', '/kontakt', '/impressum', '/datenschutz',
      ...categories.filter(c => recipes.some(r => r.category === c.name)).map(c => categoryPath(c.slug)),
      ...recipes.filter(r => r.slug).map(r => recipePath(r.slug)),
      ...journal.filter(r => r.slug).map(r => `/journal/${encodeURIComponent(r.slug)}`),
      ...notes.posts.filter(r => r.slug).map(r => `/kitchen-notes/${encodeURIComponent(r.slug)}`)]);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths].map(p => `  <url><loc>${xml(SITE_URL + p)}</loc></url>`).join('\n')}\n</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=3600' } });
  } catch {
    // Do not return a misleading, empty success sitemap during a content outage.
    return new Response('Sitemap vorübergehend nicht verfügbar.', { status: 503, headers: { 'Retry-After': '300', 'Cache-Control': 'no-store' } });
  }
};
