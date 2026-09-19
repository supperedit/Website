import { categories } from '../src/data/categories';
import { SITE_URL, canonicalPath, recipeDescription, recipeImagePath, recipeSchema, recipeListSchema } from '../src/data/seo';
import type { Recipe } from '../src/data/recipeTypes';
import { withMetadata, type Metadata } from './_lib/metadata';
const pages: Record<string, [string, string]> = {
  '/': ['Rezepte, die bleiben', 'Eine kuratierte Rezeptsammlung aus dem Alltag. Einfach in der Zubereitung, nie langweilig im Ergebnis.'],
  '/rezepte': ['Alle Rezepte', 'Alle Rezepte von Supper Edit: Pasta, Gebäck, Drinks, Dips und kleine Ideen für lange Abende.'],
  '/journal': ['Herbarium', 'Botanische Notizen, saisonale Zutaten und essbare Pflanzen im Supper Edit Herbarium.'],
  '/kitchen-notes': ['Kitchen Notes', 'Geschichten aus der Küche, praktische Ideen und kleine Entdeckungen für deinen Alltag.'],
  '/about': ['Was ist Supper Edit', 'Über Abende, die man nicht vergisst.'],
  '/kontakt': ['Kontakt', 'Fragen, Ideen oder Kooperationen, immer gern per Mail.'],
  '/impressum': ['Impressum', 'Anbieterangaben und Kontakt zu Supper Edit.'],
  '/datenschutz': ['Datenschutz', 'Informationen zum Datenschutz bei Supper Edit.'],
  '/merkliste': ['Merkliste', 'Deine gemerkten Rezepte von Supper Edit.'],
};
export const onRequest: PagesFunction = async context => {
  const url = new URL(context.request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/img/')) return context.next();
  const response = await context.next();
  if (!(response.headers.get('Content-Type') || '').includes('text/html')) return response;
  const path = url.pathname.replace(/\/+$/, '') || '/';
  // The existing herbarium detail route owns its metadata.
  if (path.startsWith('/journal/')) return response;
  let status = response.status;
  let meta: Metadata = { title: 'Seite nicht gefunden', description: 'Diese Seite gibt es nicht oder nicht mehr.', path: canonicalPath(path, url.search), noindex: true };
  const base = pages[path];
  if (base) meta = { title: base[0], description: base[1], path: canonicalPath(path, url.search), noindex: path === '/merkliste' };
  else status = 404;
  try {
    if (path === '/rezepte' || path.startsWith('/rezepte/')) {
      const result = await fetch(`${url.origin}/api/recipes`);
      if (!result.ok) throw new Error('Recipes unavailable');
      const recipes = await result.json() as Recipe[];
      if (!Array.isArray(recipes)) throw new Error('Invalid recipe response');
      if (path === '/rezepte') {
        const category = categories.find(c => c.slug === url.searchParams.get('kategorie'));
        if (category) { meta.title = `${category.name} – ${category.sub}`; meta.description = `${category.sub}: Entdecke die Rezepte aus ${category.name} bei Supper Edit.`; }
        meta.structuredData = recipeListSchema(category ? recipes.filter(r => r.category === category.name) : recipes);
      } else {
        const slug = decodeURIComponent(path.slice('/rezepte/'.length));
        const recipe = recipes.find(r => r.slug === slug);
        if (recipe) {
          status = 200;
          meta = { title: recipe.seoTitle || recipe.title, description: recipeDescription(recipe), path: canonicalPath(path),
            image: recipe.image ? SITE_URL + recipeImagePath(recipe.slug) : undefined, imageAlt: recipe.imageAlt || recipe.title,
            ogTitle: recipe.pinterestTitle || undefined, ogDescription: recipe.pinterestDescription || undefined, structuredData: recipeSchema(recipe) };
        }
      }
    } else if (path.startsWith('/kitchen-notes/')) {
      const result = await fetch(`${url.origin}/api/kitchen-notes?slug=${encodeURIComponent(decodeURIComponent(path.slice('/kitchen-notes/'.length)))}`);
      if (result.status !== 404 && !result.ok) throw new Error('Article unavailable');
      if (result.ok) {
        const { post } = await result.json() as { post?: { title: string; intro: string; image?: string; imageAlt?: string } };
        if (post) { status = 200; meta = { title: post.title, description: post.intro, image: post.image, imageAlt: post.imageAlt, path }; }
      }
    }
  } catch {
    status = 503;
    meta = { title: 'Inhalte gerade nicht erreichbar', description: 'Bitte versuche es später erneut.', path: meta.path, noindex: true };
  }
  return withMetadata(response, meta, status);
};
