import { categories } from '../src/data/categories';
import { SITE_URL, categoryPath, recipePath } from '../src/data/seo';
const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const load = async (origin: string, path: string): Promise<unknown> => {
  try {
    const response = await fetch(origin + path);
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
};
const slugs = (value: unknown): string[] => Array.isArray(value)
  ? value.map(item => (item as { slug?: unknown })?.slug).filter((slug): slug is string => typeof slug === 'string' && slug.length > 0)
  : [];
export const onRequest: PagesFunction = async context => {
  try {
    const origin = new URL(context.request.url).origin;
    const [recipesData, herbariumData, notesData] = await Promise.all([
      load(origin, '/api/recipes'),
      load(origin, '/api/herbarium'),
      load(origin, '/api/kitchen-notes'),
    ]);
    if (!Array.isArray(recipesData)) throw new Error('Recipes unavailable');
    const recipes = recipesData as Array<{ slug?: string; category?: string }>;
    const notes = (notesData as { posts?: unknown } | null)?.posts;
    const paths = new Set(['/', '/rezepte', '/herbarium', '/kitchen-notes', '/kontakt', '/impressum', '/datenschutz',
      ...categories.filter(c => recipes.some(r => r.category === c.name)).map(c => categoryPath(c.slug)),
      ...slugs(recipes).map(slug => recipePath(slug)),
      ...slugs(herbariumData).map(slug => `/herbarium/${encodeURIComponent(slug)}`),
      ...slugs(notes).map(slug => `/kitchen-notes/${encodeURIComponent(slug)}`)]);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths].map(p => `  <url><loc>${xml(SITE_URL + p)}</loc></url>`).join('\n')}\n</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=3600' } });
  } catch {
    return new Response('Sitemap vorübergehend nicht verfügbar.', { status: 503, headers: { 'Retry-After': '300', 'Cache-Control': 'no-store' } });
  }
};
