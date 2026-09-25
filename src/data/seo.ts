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
const STATE_WORDS = new Set(['weich', 'weiche', 'weicher', 'weiches', 'kalt', 'kalte', 'kalter', 'kaltes', 'zimmerwarm', 'zimmerwarme', 'zimmerwarmer', 'lauwarm', 'lauwarme', 'lauwarmer', 'geschmolzen', 'geschmolzene', 'geschmolzener', 'flüssig', 'flüssige', 'flüssiger']);
const PLURAL_UNITS: Record<string, string> = { prise: 'Prisen', msp: 'Msp.', 'msp.': 'Msp.', bund: 'Bund', stück: 'Stück', dose: 'Dosen', zehe: 'Zehen', scheibe: 'Scheiben', zweig: 'Zweige' };
function parseAmount(amount: string): { value: number; unit: string } | null {
  const match = amount.trim().match(/^(\d+\/\d+|\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match || /^[–-]/.test(match[2])) return null;
  const [numerator, denominator] = match[1].split('/');
  const value = denominator ? Number(numerator) / Number(denominator) : Number(match[1].replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? { value, unit: match[2].trim() } : null;
}
function cleanName(name: string): string {
  return name.split(',')[0].split(/\s+/).filter(word => !STATE_WORDS.has(word.toLowerCase())).join(' ').trim();
}
function formatValue(value: number): string {
  if (value === 0.5) return '1/2';
  if (value === 0.25) return '1/4';
  return value.toLocaleString('de-DE', { maximumFractionDigits: 2 });
}
function formatUnit(unit: string, value: number): string {
  if (value <= 1) return unit;
  return PLURAL_UNITS[unit.toLowerCase()] ?? unit;
}
export function pinterestIngredients(recipe: Recipe): string[] {
  if (recipe.pinterestIngredients?.length) return recipe.pinterestIngredients;
  const merged = new Map<string, { value: number; unit: string; name: string }>();
  const lines: (string | { key: string })[] = [];
  for (const item of recipe.ingredientGroups.flatMap(group => group.items)) {
    const name = cleanName(item.name);
    if (!name) continue;
    const parsed = parseAmount(item.amount);
    if (!parsed) {
      const amount = item.amount.trim();
      lines.push(amount ? (/^\d/.test(amount) ? `${amount} ${name}` : `${name} ${amount.charAt(0).toLowerCase()}${amount.slice(1)}`) : name);
      continue;
    }
    const key = `${parsed.unit.toLowerCase().replace(/\.$/, '')}|${name.toLowerCase()}`;
    const existing = merged.get(key);
    if (existing) existing.value += parsed.value;
    else { merged.set(key, { ...parsed, name }); lines.push({ key }); }
  }
  return lines.map(line => {
    if (typeof line === 'string') return line;
    const entry = merged.get(line.key)!;
    return [formatValue(entry.value), formatUnit(entry.unit, entry.value), entry.name].filter(Boolean).join(' ');
  });
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
    recipeIngredient: pinterestIngredients(recipe),
    recipeInstructions: recipe.steps.map((step, i) => ({ '@type': 'HowToStep', position: i + 1, name: step.title, text: step.content || step.title, url: `${url}#schritt-${i + 1}` })),
  };
}
export function recipeListSchema(recipes: Recipe[]) {
  return { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: recipes.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE_URL + recipePath(r.slug) })) };
}
export const jsonLdText = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
