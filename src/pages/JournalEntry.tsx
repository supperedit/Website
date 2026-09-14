import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useJournal } from '../data/useJournal';
import { useRecipes } from '../data/useRecipes';
import { MONTHS, plantGroup, seasonMonthIndexes } from '../data/herbarium';
import RecipeCard from '../components/RecipeCard';
import SpecimenCardPrintable from '../components/SpecimenCardPrintable';
import SEO from '../components/SEO';
import '../styles/herbarium.css';
import '../styles/plant-notebook.css';

function DotRating({ label, value, low, high }: { label: string; value?: number | null; low: string; high: string }) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5) return null;
  return <div className="plant-rating"><span>{label}</span><span className="plant-rating-dots" role="img" aria-label={`${label}: ${value} von 5; 1 bedeutet ${low}, 5 bedeutet ${high}`} >{[1, 2, 3, 4, 5].map(i => <i key={i} className={i <= value ? 'is-filled' : ''} />)}</span><small>{low} — {high}</small></div>;
}


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
    ['Pflanzenfamilie', entry.plantFamily], ['Saison', entry.season], ['Essbare Teile', entry.edibleParts],
  ].filter(([, value]) => Boolean(value));
  const growing = [
    ['Aussaat', entry.sowingTime], ['Pflanzzeit', entry.plantingTime],
    ['Standort', entry.location], ['Ernte', entry.harvest],
  ].filter(([, value]) => Boolean(value));
  const kitchen = [
    ['So verwenden wir sie', entry.usage], ['Passt zusammen', entry.pairings],
    ['Für deinen nächsten Supper', entry.supperIdeas], ['Gut zu wissen', entry.goodToKnow],
  ].filter(([, value]) => Boolean(value));
  const linkedRecipes = recipes.filter(recipe => entry.linkedRecipes.includes(recipe.slug));
  return <>
    <SEO title={`${entry.title} – Herbarium`} description={entry.intro ?? `${entry.title}: botanische Notizen im Supper Edit Herbarium.`} image={entry.image ? `/img/journal/${entry.slug}` : undefined} />
    <article className="herbarium plant-entry plant-notebook">
      <Link className="herbarium-back" to={archiveUrl}><ArrowLeft size={16} aria-hidden="true" /> Zur Sammlung</Link>
      <header className="plant-heading"><div><p className="herbarium-kicker">Herbarium / {plantGroup(entry)}</p><h1>{entry.title}</h1>{entry.latinName && <p className="plant-latin">{entry.latinName}</p>}</div>{entry.season && <span className="plant-season-stamp"><span>Saison</span>{entry.season}</span>}</header>
      {entry.intro && <p className="plant-intro plant-lead">{entry.intro}</p>}
      <div className={`plant-layout${entry.image ? '' : ' plant-layout--text'}`}>
        <aside className="plant-sheet" aria-label="Botanischer Steckbrief">
          {entry.image && <figure style={{ position: 'relative' }}>
            <img src={entry.image} alt={entry.title} />
            <figcaption>{entry.latinName || entry.title}</figcaption>
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
              <SpecimenCardPrintable entry={entry} />
            </div>
          </figure>}
          {!entry.image && <SpecimenCardPrintable entry={entry} />}
          <p className="herbarium-kicker">Auf einen Blick</p>
          <dl className="plant-facts">{facts.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          {months.length > 0 && <div className="plant-calendar"><p className="herbarium-kicker">Saison im Jahreslauf</p><p className="sr-only">Saisonmonate: {months.map(i => MONTHS[i]).join(', ')}</p><ol aria-hidden="true">{MONTHS.map((month,index) => <li key={month} className={months.includes(index) ? 'in-season' : ''} title={month}>{month.slice(0,3)}</li>)}</ol></div>}
        </aside>
        <div className="plant-story">
          {entry.tastingNotes && <section className="plant-taste"><p className="herbarium-kicker">Der erste Eindruck</p><h2>Geschmack & Duft</h2><p>{entry.tastingNotes}</p></section>}
          {kitchen.length > 0 && <section className="plant-kitchen"><p className="herbarium-kicker">Von der Pflanze zum Teller</p><h2>In der Küche</h2><div className="plant-kitchen-notes">{kitchen.map(([label, value]) => <div key={label}><h3>{label}</h3><p>{value}</p></div>)}</div></section>}
          {(growing.length > 0 || entry.lightNeed || entry.waterNeed) && <section className="plant-growing"><h2>Hier fühlt sie sich wohl.</h2><div className="plant-ratings"><DotRating label="Lichtbedarf" value={entry.lightNeed} low="schattig" high="sonnig" /><DotRating label="Wasserbedarf" value={entry.waterNeed} low="wenig" high="viel" /></div><dl>{growing.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>}
          {entry.funFact && <aside className="plant-notebook-note"><p className="herbarium-kicker">Am Rande notiert</p><p>{entry.funFact}</p></aside>}
          {entry.background && <section className="plant-reading"><h2>Die Geschichte dahinter.</h2><p>{entry.background}</p></section>}
          {entry.wellnessNote && <section className="plant-reading"><h2>Für dein Wohlbefinden</h2><p>{entry.wellnessNote}</p></section>}

        </div>
      </div>
      {linkedRecipes.length > 0 && <section className="plant-recipes"><p className="herbarium-kicker">Aus der Sammlung in die Küche</p><h2>Damit kochen wir.</h2><ul>{linkedRecipes.map(recipe => <li key={recipe.slug}><RecipeCard slug={recipe.slug} title={recipe.title} category={recipe.category} image={recipe.image} /></li>)}</ul></section>}
      <footer className="herbarium-colophon"><Link to={archiveUrl}>Weiter im Herbarium <ArrowUpRight size={18} aria-hidden="true" /></Link><p>Von der Pflanze zum Teller.</p></footer>
    </article>
  </>;
}
