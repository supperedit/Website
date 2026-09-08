import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useJournal } from '../data/useJournal';
import { useRecipes } from '../data/useRecipes';
import { MONTHS, plantGroup, seasonMonthIndexes } from '../data/herbarium';
import RecipeCard from '../components/RecipeCard';
import SEO from '../components/SEO';
import '../styles/herbarium.css';

export default function JournalEntry() {
  const { slug } = useParams();
  const location = useLocation();
  const { entries, loading, error } = useJournal();
  const { recipes } = useRecipes();
  const entry = entries.find(e => e.slug === slug);
  const savedSearch = typeof location.state?.herbariumSearch === 'string' ? location.state.herbariumSearch : '';
  const archiveUrl = `/journal${savedSearch ? `?${savedSearch}` : ''}`;
  if (loading || error || !entry) return <div className="herbarium herbarium-empty"><h1>{loading ? 'Wird geladen …' : error ? 'Die Sammlung ist gerade nicht erreichbar.' : 'Eintrag nicht gefunden.'}</h1><Link to={archiveUrl}>Zum Herbarium</Link></div>;
  const months = seasonMonthIndexes(entry.seasonMonths);
  const facts = [
    ['Pflanzengruppe', plantGroup(entry)], ['Typ', entry.typ], ['Saison', entry.season],
    ['Pflanzenfamilie', entry.plantFamily], ['Blütezeit', entry.bloomTime], ['Standort', entry.location],
  ].filter(([, value]) => Boolean(value));
  const sections = [
    ['Geschmack', entry.tastingNotes], ['So verwenden wir sie', entry.usage], ['Passt besonders gut zu', entry.pairings],
    ['Gut zu wissen', entry.goodToKnow], ['Supper Edit Ideen', entry.supperIdeas], ['Hintergrund', entry.background],
  ].filter(([, value]) => Boolean(value));
  const linkedRecipes = recipes.filter(recipe => entry.linkedRecipes.includes(recipe.slug));
  return <>
    <SEO title={`${entry.title} – Herbarium`} description={entry.intro ?? `${entry.title}: botanische Notizen im Supper Edit Herbarium.`} image={entry.image} />
    <article className="herbarium plant-entry">
      <Link className="herbarium-back" to={archiveUrl}><ArrowLeft size={16} aria-hidden="true" /> Zur Sammlung</Link>
      <header className="plant-heading"><div><p className="herbarium-kicker">Herbarium / {plantGroup(entry)}</p><h1>{entry.title}</h1>{entry.latinName && <p className="plant-latin">{entry.latinName}</p>}</div>{entry.season && <span className="plant-season-stamp"><span>Saison</span>{entry.season}</span>}</header>
      <div className={`plant-layout${entry.image ? '' : ' plant-layout--text'}`}>
        <aside className="plant-sheet" aria-label="Botanischer Steckbrief">
          {entry.image && <figure><img src={entry.image} alt={entry.title} /><figcaption>{entry.latinName || entry.title}</figcaption></figure>}
          <p className="herbarium-kicker">Botanische Notizen</p>
          <dl className="plant-facts">{facts.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          {months.length > 0 && <div className="plant-calendar"><p className="herbarium-kicker">Saison im Jahreslauf</p><p className="sr-only">Saisonmonate: {months.map(i => MONTHS[i]).join(', ')}</p><ol aria-hidden="true">{MONTHS.map((month,index) => <li key={month} className={months.includes(index) ? 'in-season' : ''} title={month}>{month.slice(0,3)}</li>)}</ol></div>}
        </aside>
        <div className="plant-story">
          {entry.intro && <p className="plant-intro">{entry.intro}</p>}
          {sections.map(([label,value]) => <section className="plant-section" key={label}><h2>{label}</h2><p>{value}</p></section>)}
          {entry.funFact && <aside className="plant-note"><span className="herbarium-kicker">Am Rande notiert</span><p>{entry.funFact}</p></aside>}
          {(entry.appearance || entry.healing || entry.temperament) && <details className="plant-extra"><summary>Weitere Pflanzennotizen</summary>{[['Erkennungsmerkmale',entry.appearance],['Heilwirkung',entry.healing],['Temperament',entry.temperament]].filter(([,value]) => Boolean(value)).map(([label,value]) => <section key={label}><h2>{label}</h2><p>{value}</p></section>)}</details>}
        </div>
      </div>
      {linkedRecipes.length > 0 && <section className="plant-recipes"><p className="herbarium-kicker">Aus der Sammlung in die Küche</p><h2>Damit kochen wir.</h2><ul>{linkedRecipes.map(recipe => <li key={recipe.slug}><RecipeCard recipe={recipe} /></li>)}</ul></section>}
      <footer className="herbarium-colophon"><Link to={archiveUrl}>Weiter im Herbarium <ArrowUpRight size={18} aria-hidden="true" /></Link><p>Von der Pflanze zum Teller.</p></footer>
    </article>
  </>;
}
