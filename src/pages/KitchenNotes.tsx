import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useKitchenNotes } from '../data/useKitchenNotes';
import { kitchenNotesExample } from '../data/kitchenNotesExample';
import '../styles/kitchen-notes.css';

export default function KitchenNotes() {
  const { data, loading, error } = useKitchenNotes();
  const [category, setCategory] = useState('Alle');
  const preview = data?.configured === false;
  const posts = preview ? [kitchenNotesExample] : data?.posts ?? [];
  const categories = ['Alle', ...Array.from(new Set(posts.map(post => post.category).filter(Boolean)))];
  const activeCategory = categories.includes(category) ? category : 'Alle';
  const visiblePosts = activeCategory === 'Alle' ? posts : posts.filter(post => post.category === activeCategory);

  return <section className="wrap kitchen-notes notes-archive">
    <SEO title="Kitchen Notes" description="Geschichten aus der Küche, praktische Ideen und kleine Entdeckungen für deinen Alltag." />
    <header className="notes-archive-header">
      <p className="notes-kicker">Das Journal von Supper Edit</p>
      <h1>Kitchen Notes</h1>
      <p className="notes-intro">Geschichten aus der Küche. Kleine Aha-Momente. Und Ideen, die im Alltag bleiben.</p>
    </header>
    {preview && <p className="notes-preview">Ein erster Einblick — dieser Beispielartikel zeigt, wie Kitchen Notes aussehen wird.</p>}
    {categories.length > 2 && <nav className="notes-filters" aria-label="Artikel nach Thema filtern">
      {categories.map(value => <button type="button" key={value} aria-pressed={activeCategory === value} onClick={() => setCategory(value)}>{value}</button>)}
    </nav>}
    {loading && <p role="status">Die Kitchen Notes werden geladen …</p>}
    {error && <p role="alert">{error}</p>}
    {!loading && !error && !posts.length && <p>Die ersten Kitchen Notes sind in Vorbereitung.</p>}
    {!loading && !error && posts.length > 0 && <>
      <div className="notes-archive-label"><h2>{activeCategory === 'Alle' ? 'Zum Weiterlesen' : activeCategory}</h2><span>{visiblePosts.length} Artikel</span></div>
      <div className="notes-post-grid">{visiblePosts.map(post => <article className="notes-post" key={post.slug}>
        <Link className="notes-post-link" to={`/kitchen-notes/${post.slug}`}>
          {post.image ? <img className="notes-post-image" src={post.image} alt={post.imageAlt ?? post.title} loading="lazy" /> : <div className="notes-post-cover" aria-hidden="true">Kitchen Notes</div>}
          <div className="notes-post-copy">
            <div className="notes-post-meta"><span>{post.category}</span>{post.date && <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time>}</div>
            <h3>{post.title}</h3>
            {post.intro && <p>{post.intro}</p>}
            <span className="notes-read">Artikel lesen <span aria-hidden="true">→</span></span>
          </div>
        </Link>
      </article>)}</div>
    </>}
  </section>;
}
