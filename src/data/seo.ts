import type { Recipe } from './recipeTypes';
import { categories } from './categories';
export const SITE_URL = 'https://www.supperedit.de';
export const recipePath = (slug: string) => `/rezepte/${encodeURIComponent(slug)}`;
export const recipeImagePath = (slug: string) => `/img/recipes/${encodeURIComponent(slug)}`;
export const categoryPath = (slug: string) => `/rezepte?kategorie=${encodeURIComponent(slug)}`;
export function canonicalPath(pathname: string, search = ''): string {
  const path = pathname.replace(/\/+$/, '') || '/';
  const category = new URLSearchParams(search).get('kategorie');
  return path === '/rezepte' && categories.some(c => c.slug === category) ? categoryPath(category!) : path;
}
export function recipeDescription(recipe: Recipe): string {
  return recipe.seoDescription || recipe.intro || `${recipe.title}, ein Rezept von Supper Edit.`;
}
export function recipeSchema(recipe: Recipe) {
  const url = SITE_URL + recipePath(recipe.slug);
  return {
    '@context': 'https://schema.org', '@type': 'Recipe', '@id': `${url}#recipe`, url,
    name: recipe.title, description: recipeDescription(recipe),
    ...(recipe.image ? { image: [SITE_URL + recipeImagePath(recipe.slug)] } : {}),
    author: { '@type': 'Organization', name: 'Supper Edit', url: SITE_URL },
    recipeCategory: categories.find(c => c.name === recipe.category)?.sub || recipe.category,
    ...(recipe.servings ? { recipeYield: recipe.servings } : recipe.baseServings ? { recipeYield: String(recipe.baseServings) } : {}),
    ...(recipe.datePublished ? { datePublished: recipe.datePublished } : {}),
    ...(recipe.dateModified ? { dateModified: recipe.dateModified } : {}),
    ...(recipe.prepMinutes ? { prepTime: `PT${recipe.prepMinutes}M` } : {}),
    ...(recipe.cookMinutes ? { cookTime: `PT${recipe.cookMinutes}M` } : {}),
    ...(recipe.totalMinutes ? { totalTime: `PT${recipe.totalMinutes}M` } : {}),
    recipeIngredient: recipe.ingredientGroups.flatMap(g => g.items.map(i => `${i.amount} ${i.name}`.trim())),
    recipeInstructions: recipe.steps.map((step, i) => ({ '@type': 'HowToStep', position: i + 1, name: step.title, text: step.content || step.title, url: `${url}#schritt-${i + 1}` })),
  };
}
export function recipeListSchema(recipes: Recipe[]) {
  return { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: recipes.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE_URL + recipePath(r.slug) })) };
}
export const jsonLdText = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
