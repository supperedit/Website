interface Env { NOTION_TOKEN: string; NOTION_KITCHEN_NOTES_DATABASE_ID: string; }
type Rich = { plain_text?: string; text?: { content?: string; link?: { url: string } }; href?: string; annotations?: { bold?: boolean; italic?: boolean } };
type Property = { type: string; title?: Rich[]; rich_text?: Rich[]; select?: { name: string }; status?: { name: string }; date?: { start: string }; url?: string; files?: NotionImage[] };
type NotionImage = { file?: { url: string }; external?: { url: string }; caption?: Rich[] };
type Page = { id: string; properties: Record<string, Property>; cover?: NotionImage };
type Block = { id: string; type: string; has_children?: boolean; [key: string]: unknown };
const plain = (value?: Rich[]) => (value ?? []).map(v => v.plain_text ?? v.text?.content ?? '').join('');
const propertyText = (value?: Property) => plain(value?.title ?? value?.rich_text);
const safeUrl = (value?: string) => value && /^https?:\/\//i.test(value) ? value : undefined;
const imageUrl = (image?: NotionImage) => safeUrl(image?.file?.url ?? image?.external?.url);
const slugify = (value: string) => value.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const onRequest: PagesFunction<Env> = async ({ env, request }) => {
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': status === 200 ? 'public, s-maxage=60' : 'no-store' } });
  if (!env.NOTION_KITCHEN_NOTES_DATABASE_ID) return json({ configured: false, posts: [] });
  if (!env.NOTION_TOKEN) return json({ error: 'Kitchen Notes sind gerade nicht erreichbar.' }, 503);
  const headers = { Authorization: `Bearer ${env.NOTION_TOKEN}`, 'Notion-Version': '2026-03-11', 'Content-Type': 'application/json' };
  async function notion(path: string, body?: unknown) {
    const response = await fetch(`https://api.notion.com/v1/${path}`, { method: body ? 'POST' : 'GET', headers, ...(body ? { body: JSON.stringify(body) } : {}) });
    if (!response.ok) throw new Error('Notion request failed');
    return response.json();
  }
  try {
    const database = await notion(`databases/${env.NOTION_KITCHEN_NOTES_DATABASE_ID}`) as { data_sources?: { id: string }[] };
    const pages: Page[] = [];
    for (const source of database.data_sources ?? []) {
      let cursor: string | undefined;
      do {
        const data = await notion(`data_sources/${source.id}/query`, { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }) as { results: Page[]; has_more: boolean; next_cursor: string };
        pages.push(...data.results);
        cursor = data.has_more ? data.next_cursor : undefined;
      } while (cursor);
    }
    const posts = pages.filter(page => {
      const status = page.properties.Status;
      return (status?.status?.name ?? status?.select?.name) === 'Veröffentlicht';
    }).map(page => {
      const p = page.properties;
      const title = propertyText(p.Titel ?? p.Name);
      return { id: page.id, slug: propertyText(p.Slug) || slugify(title), title, intro: propertyText(p.Kurzbeschreibung), category: p.Kategorie?.select?.name ?? 'Kitchen Notes', date: p.Datum?.date?.start ?? null, image: safeUrl(p.Titelbild?.url) ?? imageUrl(p.Titelbild?.files?.[0]) ?? imageUrl(page.cover), imageAlt: propertyText(p.Bildbeschreibung) || title };
    }).filter(post => post.title && post.slug && (!post.date || post.date.slice(0, 10) <= new Date().toISOString().slice(0, 10))).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
    const slug = new URL(request.url).searchParams.get('slug');
    if (!slug) return json({ configured: true, posts: posts.map(({ id, ...post }) => post) });
    const post = posts.find(post => post.slug === slug);
    if (!post) return json({ error: 'Artikel nicht gefunden.' }, 404);
    const blocks: unknown[] = [];
    async function readBlocks(id: string, depth = 0) {
      if (depth > 8) return;
      let cursor: string | undefined;
      do {
        const data = await notion(`blocks/${id}/children?page_size=100${cursor ? `&start_cursor=${encodeURIComponent(cursor)}` : ''}`) as { results: Block[]; has_more: boolean; next_cursor: string };
        for (const block of data.results) {
          const content = block[block.type] as { rich_text?: Rich[]; caption?: Rich[]; file?: { url: string }; external?: { url: string } } | undefined;
          if (['paragraph', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list_item', 'numbered_list_item', 'quote', 'callout', 'divider', 'image'].includes(block.type)) {
            blocks.push({ id: block.id, type: block.type, depth, text: (content?.rich_text ?? []).map(part => ({ text: part.plain_text ?? part.text?.content ?? '', href: safeUrl(part.href ?? part.text?.link?.url), bold: part.annotations?.bold, italic: part.annotations?.italic })), image: block.type === 'image' ? imageUrl(content) : undefined, caption: plain(content?.caption) });
          }
          if (block.has_children) await readBlocks(block.id, depth + 1);
        }
        cursor = data.has_more ? data.next_cursor : undefined;
      } while (cursor);
    }
    await readBlocks(post.id);
    const { id, ...publicPost } = post;
    return json({ configured: true, post: { ...publicPost, blocks } });
  } catch { return json({ error: 'Kitchen Notes konnten gerade nicht geladen werden.' }, 502); }
};
