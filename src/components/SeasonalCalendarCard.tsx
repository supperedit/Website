import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { seasonalCalendar } from "../data/seasonalCalendar";
import { dinnerIdeas, type DinnerIdea } from "../data/dinnerIdeas";
import { useRecipes, resizeDriveUrl } from "../data/useRecipes";
import { useJournal } from "../data/useJournal";
import SpecimenCard from "./SpecimenCard";
import type { Recipe } from "../data/recipeTypes";
import "../styles/herbarium.css";

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const WEEKDAY_FULL = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const WEEKDAY_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

interface DayCell {
  day: number | null;
  isToday: boolean;
  idea: DinnerIdea | null;
  recipe: Recipe | null;
}

function pickSeasonalRecipes(
  recipes: Recipe[],
  monthIndex0: number,
  year: number,
  ideaDays: Set<number>,
): Map<number, Recipe> {
  if (recipes.length === 0) return new Map();

  const monthData = seasonalCalendar[monthIndex0];
  const seasonalSlugs = new Set((monthData?.items ?? []).map((i) => i.slug));

  const seasonal = recipes.filter((r) =>
    [...seasonalSlugs].some(
      (slug) => r.slug?.includes(slug) || r.title?.toLowerCase().includes(slug),
    ),
  );
  const pool = seasonal.length >= 3 ? seasonal : recipes;

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const unique: Recipe[] = [];
  const seen = new Set<string>();
  for (const r of shuffled) {
    if (!seen.has(r.slug)) { seen.add(r.slug); unique.push(r); }
    if (unique.length === 3) break;
  }

  const blocked = new Set<number>();
  ideaDays.forEach((d) => {
    for (let offset = -2; offset <= 2; offset++) blocked.add(d + offset);
  });

  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
  const candidates = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(
    (d) => !blocked.has(d),
  );
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const map = new Map<number, Recipe>();
  unique.forEach((r, idx) => { if (candidates[idx]) map.set(candidates[idx], r); });
  return map;
}

function buildGrid(year: number, monthIndex0: number, recipeByDay: Map<number, Recipe>): DayCell[][] {
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
  const firstWeekday = (new Date(year, monthIndex0, 1).getDay() + 6) % 7;
  const today = new Date();
  const monthIdeas = dinnerIdeas.filter((e) => e.month === monthIndex0 + 1);

  const cells: DayCell[] = [];
  for (let i = 0; i < firstWeekday; i++)
    cells.push({ day: null, isToday: false, idea: null, recipe: null });
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      isToday:
        today.getFullYear() === year &&
        today.getMonth() === monthIndex0 &&
        today.getDate() === day,
      idea: monthIdeas.find((e) => e.day === day) ?? null,
      recipe: recipeByDay.get(day) ?? null,
    });
  }
  while (cells.length % 7 !== 0)
    cells.push({ day: null, isToday: false, idea: null, recipe: null });

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function SpiralCircle() {
  return (
    <svg
      viewBox="0 0 110 85"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      className="sc-spiral"
    >
      <path
        d="M100,42 C98,14 80,2 55,6 C26,11 6,22 6,42 C6,63 26,78 55,78 C84,78 104,63 100,42 C96,21 77,8 55,12 C30,16 12,28 12,44 C12,61 28,73 54,72"
        stroke="#85a9c7"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

type ActivePopup = { idea: DinnerIdea } | null;

export default function SeasonalCalendarCard() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [monthIndex0, setMonthIndex0] = useState(today.getMonth());
  const [activePopup, setActivePopup] = useState<ActivePopup>(null);
  const { recipes } = useRecipes();
  const { entries } = useJournal();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const currentMonthName = MONTH_NAMES[monthIndex0];

  const seasonalEntries = useMemo(() => {
    return entries.filter(entry =>
      entry.seasonMonths?.some(m =>
        m.toLowerCase().includes(currentMonthName.toLowerCase().slice(0, 3))
      )
    ).slice(0, 6);
  }, [entries, currentMonthName]);

  const [cardIndex, setCardIndex] = useState(0);
  useEffect(() => { setCardIndex(0); }, [seasonalEntries]);
  const activeCardIndex = cardIndex % Math.max(1, seasonalEntries.length);
  const goToCard = (delta: number) => {
    if (seasonalEntries.length === 0) return;
    setCardIndex((i) => (i + delta + seasonalEntries.length) % seasonalEntries.length);
  };

  const ideaDays = useMemo(() => {
    const s = new Set<number>();
    dinnerIdeas.filter((e) => e.month === monthIndex0 + 1).forEach((e) => s.add(e.day));
    return s;
  }, [monthIndex0]);

  const recipeByDay = useMemo(
    () => pickSeasonalRecipes(recipes, monthIndex0, year, ideaDays),
    [recipes, monthIndex0, year],
  );

  const weeks = useMemo(
    () => buildGrid(year, monthIndex0, recipeByDay),
    [year, monthIndex0, recipeByDay],
  );

  useEffect(() => {
    if (!activePopup) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePopup(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activePopup]);

  const openPopup = (idea: DinnerIdea, trigger: HTMLElement) => {
    lastFocusedRef.current = trigger;
    setActivePopup({ idea });
  };
  const closePopup = () => {
    setActivePopup(null);
    lastFocusedRef.current?.focus();
  };

  const goToMonth = (delta: number) => {
    let m = monthIndex0 + delta, y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonthIndex0(m);
    setYear(y);
  };

  return (
    <div className="sc-root">
      <header className="sc-heading">
        <p className="sc-eyebrow">Supper Edit · Im Rhythmus der Jahreszeiten</p>
        <h2>Was die Saison mitbringt</h2>
      </header>
      <div className="sc-layout">

        <div className="sc-calendar-column">
          <h3 className="sc-subheading">Der Saisonkalender</h3>
        <div className="sc-card">
          <div className="sc-month-row">
            <button type="button" className="sc-nav" onClick={() => goToMonth(-1)} aria-label="Vorheriger Monat">
              <ChevronLeft size={14} aria-hidden />
            </button>
            <h4 className="sc-month-title">{MONTH_NAMES[monthIndex0].toUpperCase()}</h4>
            <button type="button" className="sc-nav" onClick={() => goToMonth(1)} aria-label="Nächster Monat">
              <ChevronRight size={14} aria-hidden />
            </button>
          </div>

          <div className="sc-weekdays">
            {WEEKDAY_FULL.map((label, i) => (
              <div key={label} className="sc-dow">
                <span className="sc-dow-full">{label}</span>
                <span className="sc-dow-short">{WEEKDAY_SHORT[i]}</span>
              </div>
            ))}
          </div>

          <div className="sc-grid">
            {weeks.map((week, wi) =>
              week.map((cell, di) => {
                const key = `${wi}-${di}`;
                if (cell.day === null) return <div key={key} className="sc-cell sc-cell-empty" />;
                const hasIdea = !!cell.idea;
                const hasRecipe = !!cell.recipe;
                return (
                  <div key={key} className={`sc-cell${cell.isToday ? " sc-cell-today" : ""}${hasRecipe ? " sc-cell-recipe" : ""}${hasIdea ? " sc-cell-idea" : ""}`}>
                    {!hasRecipe && !hasIdea && <span className="sc-day-num">{cell.day}</span>}
                    {hasRecipe && cell.recipe && (
                      <Link to={`/rezepte/${cell.recipe.slug}`} className="sc-recipe-link" aria-label={cell.recipe.title}>
                        {cell.recipe.image && (
                          <img src={resizeDriveUrl(cell.recipe.image, "w300")} alt="" loading="lazy" decoding="async" />
                        )}
                      </Link>
                    )}
                    {hasIdea && cell.idea && (
                      <button type="button" className="sc-idea-btn" onClick={(e) => openPopup(cell.idea!, e.currentTarget)}>
                        <SpiralCircle />
                        <span className="sc-idea-title">{cell.idea.title}</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {activePopup && (
            <div className="sc-overlay" onClick={(e) => { if (e.target === e.currentTarget) closePopup(); }}>
              <div className="sc-popup" role="dialog" aria-modal="true" aria-labelledby="sc-popup-title">
                <button type="button" ref={closeRef} className="sc-popup-close" onClick={closePopup} aria-label="Schließen">
                  <X size={13} aria-hidden />
                </button>
                <span className="sc-popup-eyebrow">{activePopup.idea.day}. {MONTH_NAMES[activePopup.idea.month - 1]}</span>
                <h3 id="sc-popup-title" className="sc-popup-title">{activePopup.idea.title}</h3>
                <p className="sc-popup-idea">{activePopup.idea.idea}</p>
                {(activePopup.idea.onTheTable || activePopup.idea.kochen) && (
                  <div className="sc-popup-section">
                    <p className="sc-popup-label">Auf dem Tisch</p>
                    <ul className="sc-popup-list">
                      {(activePopup.idea.onTheTable || activePopup.idea.kochen)!.map((e) => <li key={e}>{e}</li>)}
                    </ul>
                  </div>
                )}
                {activePopup.idea.drink && (
                  <div className="sc-popup-section">
                    <p className="sc-popup-label">Dazu trinken</p>
                    <p className="sc-popup-idea">{activePopup.idea.drink}</p>
                  </div>
                )}
                {activePopup.idea.afterDinner && (
                  <div className="sc-popup-section">
                    <p className="sc-popup-label">Nach dem Essen</p>
                    <ul className="sc-popup-list">{activePopup.idea.afterDinner.map((e) => <li key={e}>{e}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        </div>

        <div className="sc-seasonal">
          <h3 className="sc-subheading">Aus dem Herbarium</h3>

          {seasonalEntries.length > 0 ? (
            <>
              <div className="sc-stack" aria-roledescription="Karussell" aria-label="Saisonale Zutaten">
                {seasonalEntries.map((entry, i) => {
                  const offset = (i - activeCardIndex + seasonalEntries.length) % seasonalEntries.length;
                  if (offset > 2) return null;
                  return (
                    <Link
                      key={entry.slug}
                      to={`/journal/${entry.slug}`}
                      className={`sc-stack-card specimen${offset === 0 ? " is-active" : ""}`}
                      data-depth={offset}
                      aria-hidden={offset !== 0}
                      tabIndex={offset === 0 ? 0 : -1}
                    >
                      <SpecimenCard entry={entry} />
                    </Link>
                  );
                })}
              </div>
              <div className="sc-stack-nav">
                <button type="button" disabled={seasonalEntries.length < 2} className="sc-stack-arrow" onClick={() => goToCard(-1)} aria-label="Vorherige Zutat">
                  <ChevronLeft size={14} aria-hidden />
                </button>
                <span className="sc-stack-count" aria-live="polite">
                  {activeCardIndex + 1} / {seasonalEntries.length}
                </span>
                <button type="button" disabled={seasonalEntries.length < 2} className="sc-stack-arrow" onClick={() => goToCard(1)} aria-label="Nächste Zutat">
                  <ChevronRight size={14} aria-hidden />
                </button>
              </div>
            </>
          ) : (
            <div className="sc-seasonal-pills">
              {(seasonalCalendar[monthIndex0]?.items ?? []).map((item) => (
                <span key={item.slug} className="sc-seasonal-pill">{item.name}</span>
              ))}
            </div>
          )}

          <Link to="/journal" className="sc-herb-more">
            Das Herbarium entdecken →
          </Link>
        </div>

      </div>

      <style>{`
        .sc-root { position: relative; width: 100%; max-width: 1180px; margin: 0 auto; padding: 16px clamp(24px, 4vw, 48px); }
        .sc-heading { color: var(--color-cream); margin-bottom: 44px; }
        .sc-eyebrow { font: 11px/1.6 var(--font-body); letter-spacing: .12em; text-transform: uppercase; margin: 0 0 16px; }
        .sc-heading h2 { font: 400 clamp(36px, 4.5vw, 58px)/1.15 var(--font-display); color: inherit; max-width: 780px; }
        .sc-layout { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0,1fr) minmax(0,300px); align-items: start; gap: clamp(48px, 6vw, 80px); }
        .sc-calendar-column, .sc-seasonal { min-width: 0; }
        .sc-subheading { font: 400 12px/1.6 var(--font-body); letter-spacing: .08em; color: var(--color-cream); margin: 0 0 26px; }
        .sc-card { position: relative; background: var(--color-cream); border-radius: 4px; padding: 22px 18px 18px; display: flex; flex-direction: column; min-height: 490px; }
        .sc-month-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 1.4%;
          flex-shrink: 0;
        }
        .sc-month-title {
          font-family: var(--font-body, 'Elms Sans', sans-serif);
          font-weight: 300;
          font-size: clamp(18px, 3.4vw, 38px);
          letter-spacing: 0.18em;
          color: var(--color-ink, #2b1210);
          margin: 0;
          flex: 1;
          text-align: center;
        }
        .sc-nav {
          flex-shrink: 0;
          width: 26px; height: 26px;
          border-radius: 50%;
          border: 1px solid rgba(43,18,16,0.2);
          background: none;
          color: var(--color-ink, #2b1210);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0.5; transition: opacity 0.15s;
        }
        .sc-nav:hover { opacity: 1; }
        .sc-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-bottom: 1px solid rgba(43,18,16,0.14);
          padding-bottom: 4px;
          flex-shrink: 0;
        }
        .sc-dow {
          text-align: center;
          font-family: var(--font-body, 'Elms Sans', sans-serif);
          font-weight: 300;
          font-size: clamp(7px, 0.85vw, 11px);
          color: rgba(43,18,16,0.45);
          letter-spacing: 0.02em;
        }
        .sc-dow-short { display: none; }
        .sc-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-auto-rows: 1fr;
          flex: 1;
          min-height: 0;
          overflow: visible;
        }
        .sc-cell {
          position: relative;
          border-right: 0.7px solid rgba(43,18,16,0.13);
          border-bottom: 0.7px solid rgba(43,18,16,0.13);
          overflow: visible;
        }
        .sc-cell:nth-child(7n) { border-right: none; }
        .sc-cell-empty { background: rgba(43,18,16,0.015); }
        .sc-cell-today {
          box-shadow: inset 0 0 0 1.5px var(--color-maroon, #8b2e2e);
          border-radius: 2px;
        }
        .sc-day-num {
          position: absolute;
          top: 5px; left: 6px;
          font-family: var(--font-body, 'Elms Sans', sans-serif);
          font-weight: 300;
          font-size: clamp(7px, 0.75vw, 10px);
          color: rgba(43,18,16,0.45);
          line-height: 1;
          z-index: 2;
        }
        .sc-cell-recipe { overflow: hidden; }
        .sc-recipe-link {
          position: absolute;
          inset: 0;
          display: block;
          text-decoration: none;
        }
        .sc-recipe-link img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }
        .sc-recipe-link:hover img { transform: scale(1.04); }
        .sc-cell-idea { z-index: 4; }
        .sc-idea-btn {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 150%;
          background: none; border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          z-index: 5;
          padding: 0;
        }
        .sc-spiral {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: visible;
        }
        .sc-idea-title {
          position: relative; z-index: 1;
          font-family: 'Homemade Apple', cursive;
          font-size: clamp(11px, 1.5vw, 16px);
          line-height: 1.35;
          color: var(--color-ink, #2b1210);
          white-space: normal;
          padding: 20% 12%;
        }
        .sc-overlay {
          position: absolute; inset: 0; z-index: 20;
          background: rgba(20,8,4,0.55);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          border-radius: 14px;
        }
        .sc-popup {
          position: relative; width: 100%; max-width: 280px;
          background: #F7F6EC;
          border-radius: 12px;
          padding: 24px 20px 20px;
          box-shadow: 0 16px 40px rgba(43,18,16,0.28);
        }
        .sc-popup-close {
          position: absolute; top: 10px; right: 10px;
          width: 26px; height: 26px; border-radius: 50%;
          border: none; background: rgba(43,18,16,0.08);
          color: var(--color-ink, #2b1210);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .sc-popup-eyebrow {
          display: block;
          font-family: var(--font-body, 'Elms Sans', sans-serif);
          font-size: 10px;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--color-terracotta, #c4714a); margin-bottom: 3px;
        }
        .sc-popup-title {
          font-family: 'Homemade Apple', cursive;
          font-size: clamp(18px, 4vw, 24px);
          color: var(--color-ink, #2b1210); margin: 0 0 10px; line-height: 1.2;
        }
        .sc-popup-idea {
          font-family: var(--font-body, 'Elms Sans', sans-serif);
          font-size: 12px; line-height: 1.65;
          color: var(--color-muted, #6b5a57); margin: 0;
        }
        .sc-popup-section { margin-top: 12px; }
        .sc-popup-label {
          font-family: var(--font-body, 'Elms Sans', sans-serif);
          font-weight: 600; font-size: 9px;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: var(--color-terracotta, #c4714a); margin: 0 0 4px;
        }
        .sc-popup-list {
          list-style: none; padding: 0; margin: 0;
          font-family: var(--font-body, 'Elms Sans', sans-serif);
          font-size: 12px; line-height: 1.55;
          color: var(--color-ink, #2b1210);
          display: flex; flex-direction: column; gap: 2px;
        }
        .sc-seasonal { display: flex; flex-direction: column; width: 100%; max-width: 300px; justify-self: center; }
        .sc-stack { display: grid; position: relative; isolation: isolate; width: 100%; overflow: visible; margin-top: 6px; }
        .sc-stack-card { grid-area: 1 / 1; align-self: start; width: 100%; text-decoration: none; box-shadow: 0 3px 9px rgba(43,18,16,.12); transition: transform .25s ease; pointer-events: none; }
        .sc-stack-card[data-depth="0"] { transform: rotate(-1deg); z-index: 3; }
        .sc-stack-card[data-depth="1"] { transform: translate(7px, 6px) rotate(2deg); z-index: 2; }
        .sc-stack-card[data-depth="2"] { transform: translate(-5px, 10px) rotate(-3deg); z-index: 1; }
        .sc-stack-card.is-active { pointer-events: auto; }
        .sc-stack-nav { display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 30px; }
        .sc-stack-arrow { width: 44px; height: 44px; display: grid; place-items: center; padding: 0; border: 0; border-radius: 0; box-shadow: none; background: transparent; color: #fff; cursor: pointer; transition: transform .15s ease; }
        .sc-stack-arrow svg { width: 24px; height: 24px; stroke: currentColor; }
        .sc-stack-arrow:hover:not(:disabled) { transform: scale(1.12); }
        .sc-stack-arrow:disabled { opacity: .45; cursor: default; }
        .sc-stack-arrow:focus-visible, .sc-herb-more:focus-visible, .sc-stack-card:focus-visible { outline: 2px solid var(--color-cream); outline-offset: 5px; }
        .sc-stack-count { font: 12px/1.5 var(--font-body); color: var(--color-cream); min-width: 44px; text-align: center; font-variant-numeric: tabular-nums; }
        .sc-herb-more { font: 12px/1.6 var(--font-body); color: var(--color-cream); text-decoration: underline; text-underline-offset: 5px; align-self: center; margin-top: 20px; }
        .sc-seasonal-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .sc-seasonal-pill {
          background: #F7F6EC;
          border-radius: 999px;
          padding: 7px 16px;
          font-family: var(--font-body, 'Elms Sans', sans-serif);
          font-weight: 300;
          font-size: clamp(11px, 1.35vw, 15px);
          color: var(--color-ink, #2b1210);
          white-space: nowrap;
        }
        @media (max-width: 960px) {
          .sc-layout { grid-template-columns: minmax(0,1fr); gap: 52px; }
          .sc-card { min-height: 520px; }
          .sc-seasonal { width: 100%; max-width: 300px; margin-inline: auto; }
        }
        @media (max-width: 600px) {
          .sc-root { padding-inline: 24px; }
          .sc-seasonal { max-width: 280px; }
          .sc-heading { margin-bottom: 32px; }
          .sc-eyebrow { font-size: 10px; }
          .sc-card { padding: 16px 10px 12px; min-height: 390px; }
          .sc-month-title { font-size: 19px; letter-spacing: .09em; }
          .sc-dow-full { display: none; }
          .sc-dow-short { display: inline; }
          .sc-dow, .sc-day-num { font-size: 10px; }
          .sc-idea-title { font-size: 9px; }
          .sc-subheading { margin-bottom: 22px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sc-recipe-link img, .sc-stack-card, .sc-stack-arrow { transition: none; }
        }
      `}</style>
    </div>
  );
}
