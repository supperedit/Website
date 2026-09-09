import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { useJournal } from '../data/useJournal';
import { matchesSearch, matchesSeason, plantGroup } from '../data/herbarium';
import SEO from '../components/SEO';
import '../styles/herbarium.css';

export default function Journal() {
  const { entries, loading, error } = useJournal();
  const [params, setParams] = useSearchParams();
  const category = params.get('kategorie') || 'Alle';
  const season = params.get('saison') || '';
  const query = params.get('suche') || '';
  const sorted = useMemo(() => [...entries].sort((a,b) => a.title.localeCompare(b.title, 'de')), [entries]);
  const categories = ['Alle', ...new Set(sorted.map(plantGroup))];
  const seasons = ['Frühling', 'Sommer', 'Herbst', 'Winter'].filter(value => entries.some(entry => matchesSeason(entry, value)));
  const filtered = sorted.filter(entry => (category === 'Alle' || plantGroup(entry) === category) && (!season || matchesSeason(entry, season)) && matchesSearch(entry, query));
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'Alle') next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };
  return <>
    <SEO title="Herbarium" description="Saisonale Zutaten, kurze Küchenideen und kleine Impulse für dein Wohlbefinden. Geschmack, Verwendung und Ideen für deine Wohlfühlküche." />
    <div className="herbarium">
      <header className="herbarium-heading">
        <div><p className="herbarium-kicker">Supper Edit / Das Zutatenarchiv</p><h1>Herbarium<span className="herbarium-heading-dot">.</span></h1></div>
        <div className="herbarium-introduction"><p>Was wächst.<br />Was schmeckt.<br /><em>Was auf den Tisch kommt.</em></p><span>Saisonale Zutaten, kurze Küchenideen und kleine Impulse für dein Wohlbefinden.</span></div>
      </header>
      <div className="herbarium-tools">
        <nav className="herbarium-categories" aria-label="Pflanzengruppen filtern">{categories.map(group => <button type="button" key={group} aria-pressed={category === group} onClick={() => update('kategorie', group)}>{group}<span className="herbarium-category-count">{group === 'Alle' ? entries.length : entries.filter(e => plantGroup(e) === group).length}</span></button>)}</nav>
        <div className="herbarium-search-row">
          <label className="herbarium-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Im Herbarium suchen</span><input type="search" value={query} onChange={e => update('suche', e.target.value)} placeholder="Im Herbarium stöbern …" /></label>
          <label className="herbarium-season"><span className="sr-only">Saison</span><select value={season} onChange={e => update('saison', e.target.value)}><option value="">Alle Jahreszeiten</option>{seasons.map(value => <option key={value}>{value}</option>)}</select></label>
        </div>
      </div>
      <div className="herbarium-index"><p role="status" aria-live="polite">{loading ? 'Die Sammlung wird geladen …' : error ? 'Sammlung nicht verfügbar' : `${filtered.length} ${filtered.length === 1 ? 'Eintrag' : 'Einträge'}`}</p><span>Alphabetisch · A–Z</span></div>
      {error ? <div className="herbarium-empty"><h2>Die Sammlung lässt sich gerade nicht laden.</h2><p>Bitte versuche es gleich noch einmal.</p><button type="button" onClick={() => window.location.reload()}>Erneut laden</button></div> : loading ? <div className="herbarium-loading" aria-hidden="true"><div /><div /><div /></div> : filtered.length ? <ul className="herbarium-grid" aria-label="Herbarium-Einträge">{filtered.map(entry => <li key={entry.slug}>
        <Link className="specimen" to={`/journal/${entry.slug}`} state={{ herbariumSearch: params.toString() }}>
          <div className="specimen-top"><span>{plantGroup(entry)}</span><span>{entry.season}</span></div>
          {entry.image ? <div className="specimen-image"><img src={entry.image} alt="" loading="lazy" /></div> : <div className="specimen-type" aria-hidden="true"><span>{entry.title.slice(0,1)}</span><em>{entry.latinName || 'Botanische Notizen'}</em></div>}
          <div className="specimen-title"><h2>{entry.title}</h2><ArrowUpRight size={23} strokeWidth={1.2} aria-hidden="true" /></div>
          {entry.latinName && <p className="specimen-latin">{entry.latinName}</p>}
          {entry.intro && <p className="specimen-intro">{entry.intro}</p>}
          <span className="specimen-read">Steckbrief entdecken <span aria-hidden="true">↗</span></span>
        </Link>
      </li>)}</ul> : <div className="herbarium-empty"><h2>{entries.length ? 'Hier wächst noch kein Treffer.' : 'Die Sammlung beginnt hier.'}</h2><p>{entries.length ? 'Versuche einen anderen Suchbegriff oder öffne die gesamte Sammlung.' : 'Die ersten Pflanzenporträts folgen bald.'}</p>{(query || season || category !== 'Alle') && <button type="button" onClick={() => setParams({})}><X size={15} aria-hidden="true" /> Filter zurücksetzen</button>}</div>}
      <footer className="herbarium-colophon"><span>Von der Pflanze zum Teller.</span><p>Zum Nachschlagen, Wiederentdecken<br />und Ausprobieren.</p></footer>
    </div>
  </>;
}
