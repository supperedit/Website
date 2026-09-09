import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, Search, X } from 'lucide-react';
import { useJournal } from '../data/useJournal';
import { matchesSearch, matchesSeason, plantGroup } from '../data/herbarium';
import SEO from '../components/SEO';
import '../styles/herbarium.css';

interface SeasonDropdownProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function SeasonDropdown({ value, options, onChange }: SeasonDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const label = value || 'Alle Jahreszeiten';

  return (
    <div ref={ref} className="season-dropdown" aria-label="Jahreszeit wählen">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={`season-dropdown-trigger ${open ? 'is-open' : ''}`}
      >
        <span>{label}</span>
        <ChevronDown size={13} aria-hidden="true" className="season-dropdown-chevron" />
      </button>

      {open && (
        <ul role="listbox" aria-label="Jahreszeit" className="season-dropdown-list">
          {['', ...options].map(opt => (
            <li
              key={opt || '__all__'}
              role="option"
              aria-selected={value === opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`season-dropdown-option ${value === opt ? 'is-selected' : ''}`}
            >
              {opt || 'Alle Jahreszeiten'}
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .season-dropdown {
          position: relative;
          min-width: 0;
        }
        .season-dropdown-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
          min-height: 40px;
          padding: 9px 14px 9px 16px;
          background: transparent;
          border: 1px solid rgba(67,9,8,.22);
          border-radius: 999px;
          color: var(--color-maroon);
          font: 12px var(--font-body);
          cursor: pointer;
          transition: background 0.18s ease, border-color 0.18s ease;
          white-space: nowrap;
        }
        .season-dropdown-trigger:hover,
        .season-dropdown-trigger.is-open {
          background: color-mix(in srgb, var(--color-blush) 30%, transparent);
          border-color: var(--color-maroon);
        }
        .season-dropdown-trigger:focus-visible {
          outline: 2px solid var(--color-terracotta);
          outline-offset: 3px;
        }
        .season-dropdown-chevron {
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .season-dropdown-trigger.is-open .season-dropdown-chevron {
          transform: rotate(180deg);
        }
        .season-dropdown-list {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: var(--color-cream);
          border: 1px solid rgba(67,9,8,.16);
          border-radius: 12px;
          list-style: none;
          margin: 0;
          padding: 4px;
          z-index: 50;
          box-shadow: 0 6px 20px rgba(43,18,16,0.1);
          animation: dropdownIn 0.15s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .season-dropdown-option {
          padding: 8px 12px;
          font: 12px var(--font-body);
          color: var(--color-maroon);
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.12s ease;
        }
        .season-dropdown-option:hover {
          background: color-mix(in srgb, var(--color-blush) 50%, transparent);
        }
        .season-dropdown-option.is-selected {
          background: var(--color-blush);
          font-weight: 500;
        }
        @media (prefers-reduced-motion: reduce) {
          .season-dropdown-list { animation: none; }
          .season-dropdown-chevron { transition: none; }
          .season-dropdown-trigger { transition: none; }
        }
      `}</style>
    </div>
  );
}

export default function Journal() {
  const { entries, loading, error } = useJournal();
  const [params, setParams] = useSearchParams();
  const category = params.get('kategorie') || 'Alle';
  const season = params.get('saison') || '';
  const query = params.get('suche') || '';

  const sorted = useMemo(() => [...entries].sort((a, b) => a.title.localeCompare(b.title, 'de')), [entries]);
  const categories = ['Alle', ...new Set(sorted.map(plantGroup))];
  const seasons = ['Frühling', 'Sommer', 'Herbst', 'Winter'].filter(value =>
    entries.some(entry => matchesSeason(entry, value))
  );
  const filtered = sorted.filter(entry =>
    (category === 'Alle' || plantGroup(entry) === category) &&
    (!season || matchesSeason(entry, season)) &&
    matchesSearch(entry, query)
  );

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'Alle') next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <>
      <SEO
        title="Herbarium"
        description="Saisonale Zutaten, kurze Küchenideen und kleine Impulse für dein Wohlbefinden."
      />
      <div className="herbarium">
        <header className="herbarium-heading">
          <div>
            <p className="herbarium-kicker">Supper Edit / Das Zutatenarchiv</p>
            <h1>Herbarium<span className="herbarium-heading-dot">.</span></h1>
          </div>
          <div className="herbarium-introduction">
            <p>Was wächst.<br />Was schmeckt.<br /><em>Was auf den Tisch kommt.</em></p>
            <span>Saisonale Zutaten, kurze Küchenideen und kleine Impulse für dein Wohlbefinden.</span>
          </div>
        </header>

        <div className="herbarium-tools">
          <nav className="herbarium-categories" aria-label="Pflanzengruppen filtern">
            {categories.map(group => (
              <button
                type="button"
                key={group}
                aria-pressed={category === group}
                onClick={() => update('kategorie', group)}
              >
                {group}
                <span className="herbarium-category-count">
                  {group === 'Alle' ? entries.length : entries.filter(e => plantGroup(e) === group).length}
                </span>
              </button>
            ))}
          </nav>

          <div className="herbarium-search-row">
            <label className="herbarium-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Im Herbarium suchen</span>
              <input
                type="search"
                value={query}
                onChange={e => update('suche', e.target.value)}
                placeholder="Im Herbarium stöbern …"
              />
            </label>

            <SeasonDropdown
              value={season}
              options={seasons}
              onChange={val => update('saison', val)}
            />
          </div>
        </div>

        <div className="herbarium-index">
          <p role="status" aria-live="polite">
            {loading
              ? 'Die Sammlung wird geladen …'
              : error
              ? 'Sammlung nicht verfügbar'
              : `${filtered.length} ${filtered.length === 1 ? 'Eintrag' : 'Einträge'}`}
          </p>
          <span>Alphabetisch · A–Z</span>
        </div>

        {error ? (
          <div className="herbarium-empty">
            <h2>Die Sammlung lässt sich gerade nicht laden.</h2>
            <p>Bitte versuche es gleich noch einmal.</p>
            <button type="button" onClick={() => window.location.reload()}>Erneut laden</button>
          </div>
        ) : loading ? (
          <div className="herbarium-loading" aria-hidden="true">
            <div /><div /><div /><div />
          </div>
        ) : filtered.length ? (
          <ul className="herbarium-grid" aria-label="Herbarium-Einträge">
            {filtered.map(entry => (
              <li key={entry.slug}>
                <Link
                  className="specimen"
                  to={`/journal/${entry.slug}`}
                  state={{ herbariumSearch: params.toString() }}
                >
                  <div className="specimen-top">
                    <span>{plantGroup(entry)}</span>
                    <span>{entry.season}</span>
                  </div>
                  {entry.image
                    ? <div className="specimen-image"><img src={entry.image} alt="" loading="lazy" /></div>
                    : <div className="specimen-type" aria-hidden="true">
                        <span>{entry.title.slice(0, 1)}</span>
                        <em>{entry.latinName || 'Botanische Notizen'}</em>
                      </div>
                  }
                  <div className="specimen-title">
                    <h2>{entry.title}</h2>
                    <ArrowUpRight size={23} strokeWidth={1.2} aria-hidden="true" />
                  </div>
                  {entry.latinName && <p className="specimen-latin">{entry.latinName}</p>}
                  {entry.intro && <p className="specimen-intro">{entry.intro}</p>}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="herbarium-empty">
            <h2>{entries.length ? 'Hier wächst noch kein Treffer.' : 'Die Sammlung beginnt hier.'}</h2>
            <p>{entries.length
              ? 'Versuche einen anderen Suchbegriff oder öffne die gesamte Sammlung.'
              : 'Die ersten Pflanzenporträts folgen bald.'}
            </p>
            {(query || season || category !== 'Alle') && (
              <button type="button" onClick={() => setParams({})}>
                <X size={15} aria-hidden="true" /> Filter zurücksetzen
              </button>
            )}
          </div>
        )}

        <footer className="herbarium-colophon">
          <span>Von der Pflanze zum Teller.</span>
          <p>Zum Nachschlagen, Wiederentdecken<br />und Ausprobieren.</p>
        </footer>
      </div>
    </>
  );
}
