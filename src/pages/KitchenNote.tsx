import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { useKitchenNotes, type NoteBlock } from '../data/useKitchenNotes';
import { kitchenNotesExample } from '../data/kitchenNotesExample';
import '../styles/kitchen-notes.css';
function Text({ block }: { block: NoteBlock }) {
  return <>{block.text.map((part, index) => {
    let text = <>{part.text}</>;
    if (part.bold) text = <strong>{text}</strong>;
    if (part.italic) text = <em>{text}</em>;
    if (part.href && /^https?:\/\//i.test(part.href)) text = <a href={part.href}>{text}</a>;
    return <Fragment key={index}>{text}</Fragment>;
  })}</>;
}
function Blocks({ blocks }: { blocks: NoteBlock[] }) {
  const rendered = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const text = <Text block={block} />;
    if (block.type === 'table_row') {
      const rows = [block];
      while (i + 1 < blocks.length && blocks[i + 1].type === 'table_row') rows.push(blocks[++i]);
      rendered.push(<div className="notes-table-wrap" key={block.id}><table><thead><tr>{rows[0].cells?.map((cell, index) => <th scope="col" key={index}>{cell}</th>)}</tr></thead><tbody>{rows.slice(1).map(row => <tr key={row.id}>{row.cells?.map((cell, index) => index === 0 ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div>);
    } else if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
      const items = [block];
      while (i + 1 < blocks.length && blocks[i + 1].type === block.type && blocks[i + 1].depth === block.depth) items.push(blocks[++i]);
      const Tag = block.type === 'numbered_list_item' ? 'ol' : 'ul';
      rendered.push(<Tag key={block.id}>{items.map(item => <li key={item.id}><Text block={item} /></li>)}</Tag>);
    } else if (block.type === 'image' && block.image) {
      rendered.push(<figure key={block.id}><img src={block.image} alt={block.caption ?? ''} loading="lazy" />{block.caption && <figcaption>{block.caption}</figcaption>}</figure>);
    } else if (block.type === 'heading_1' || block.type === 'heading_2') rendered.push(<h2 key={block.id}>{text}</h2>);
    else if (block.type === 'heading_3') rendered.push(<h3 key={block.id}>{text}</h3>);
    else if (block.type === 'quote') rendered.push(<blockquote key={block.id}>{text}</blockquote>);
    else if (block.type === 'callout') rendered.push(<aside className="notes-callout" key={block.id}>{text}</aside>);
    else if (block.type === 'divider') rendered.push(<hr key={block.id} />);
    else if (block.text.length) rendered.push(<p className={block.text.some(part => part.href) && block.text.every(part => part.href || !part.text.replace(/[·\s]/g, '')) ? 'notes-source' : undefined} key={block.id}>{text}</p>);
  }
  return <>{rendered}</>;
}
function ArticleSections({ blocks }: { blocks: NoteBlock[] }) {
  const sections: NoteBlock[][] = [];
  for (const block of blocks) {
    if (!sections.length || block.type === 'heading_1' || block.type === 'heading_2') sections.push([]);
    sections[sections.length - 1].push(block);
  }
  let imageIndex = 0;
  return <>{sections.map((section, index) => {
    const image = section.find(block => block.type === 'image' && block.image);
    const memo = section.some(block => block.type === 'callout');
    const classes = image ? `notes-split${imageIndex++ % 2 ? ' notes-split--reverse' : ''}` : `notes-reading${memo ? ' notes-reading--memo' : ''}`;
    return <section className={classes} key={section[0]?.id ?? index}>
      {image && <figure><img src={image.image} alt={image.caption ?? ''} loading="lazy" />{image.caption && <figcaption>{image.caption}</figcaption>}</figure>}
      <div className="notes-section-copy"><Blocks blocks={section.filter(block => block !== image)} /></div>
    </section>;
  })}</>;
}

export default function KitchenNote() {
  const { slug } = useParams();
  const { data, loading, error } = useKitchenNotes(slug);
  const preview = data?.configured === false;
  const post = preview && slug === kitchenNotesExample.slug ? kitchenNotesExample : data?.post;
  if (loading || error || !post) return <section className="wrap kitchen-notes"><p role={error ? 'alert' : 'status'}>{loading ? 'Der Artikel wird geladen …' : error ?? 'Artikel nicht gefunden.'}</p><Link to="/kitchen-notes">← Zu Kitchen Notes</Link></section>;
  return <article className="wrap kitchen-notes notes-article">
    <SEO title={post.title} description={post.intro} image={post.image} imageAlt={post.imageAlt} />
    <Link className="notes-back" to="/kitchen-notes">← Alle Kitchen Notes</Link>
    <div className={`notes-article-intro${post.image ? '' : ' notes-article-intro--text'}`}>
      <header><p className="notes-kicker">{post.category}{post.date && <> · <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time></>}</p><h1>{post.title}</h1><p className="notes-intro">{post.intro}</p></header>
      {post.image && <img className="notes-hero-image" src={post.image} alt={post.imageAlt ?? post.title} fetchpriority="high" />}
    </div>
    {preview && <p className="notes-preview">Beispielartikel · Vorläufige Bilder aus der bestehenden Supper-Edit-Bildwelt.</p>}
    <div className="notes-body notes-editorial"><ArticleSections blocks={post.blocks ?? []} /><footer><Link to="/rezepte">Etwas Gutes kochen →</Link></footer></div>
  </article>;
}
