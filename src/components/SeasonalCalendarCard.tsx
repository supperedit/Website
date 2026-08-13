import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { seasonalCalendar } from "../data/seasonalCalendar";
import { dinnerIdeas, type DinnerIdea } from "../data/dinnerIdeas";
import { useRecipes, resizeDriveUrl } from "../data/useRecipes";
import type { Recipe } from "../data/recipeTypes";
import picnicImage from "../assets/images/picnic.jpg";

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

/** Pick up to 3 unique recipes biased toward seasonal ingredients. No duplicates. */
function pickSeasonalRecipes(
  recipes: Recipe[],
  monthIndex0: number,
  year: number,
  ideaDays: Set<number>,
): Map<number, Recipe> {
  if (recipes.length === 0) return new Map();

  const monthData = seasonalCalendar[monthIndex0];
  const seasonalSlugs = new Set((monthData?.items ?? []).map((i) => i.slug));

  // Prefer recipes whose slug contains a seasonal ingredient slug
  const seasonal = recipes.filter((r) =>
    [...seasonalSlugs].some((slug) => r.slug?.includes(slug) || r.title?.toLowerCase().includes(slug)),
  );
  const pool = seasonal.length >= 3 ? seasonal : recipes;

  // Shuffle pool
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Deduplicate by slug
  const unique: Recipe[] = [];
  const seen = new Set<string>();
  for (const r of shuffled) {
    if (!seen.has(r.slug)) { seen.add(r.slug); unique.push(r); }
    if (unique.length === 3) break;
  }

  // Pick 3 days that don't overlap with dinner ideas
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
  const candidates = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(
    (d) => !ideaDays.has(d),
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
      isToday: today.getFullYear() === year && today.getMonth() === monthIndex0 && today.getDate() === day,
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

/** Hand-drawn spiral circle — mirrors the SVG reference design. */
function SpiralCircle() {
  return (
    <svg
      viewBox="0 0 110 85"
      aria-hidden="true"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: "-12px -8px",
        width: "calc(100% + 16px)",
        height: "calc(100% + 24px)",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <path
        d="M100,42 C98,14 80,2 55,6 C26,11 6,22 6,42 C6,63 26,78 55,78 C84,78 104,63 100,42 C96,21 77,8 55,12 C30,16 12,28 12,44 C12,61 28,73 54,72"
        stroke="#85a9c7"
        strokeWidth="2"
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
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const monthData = seasonalCalendar[monthIndex0] ?? { items: [] };

  const ideaDays = useMemo(() => {
    const s = new Set<number>();
    dinnerIdeas.filter((e) => e.month === monthIndex0 + 1).forEach((e) => s.add(e.day));
    return s;
  }, [monthIndex0]);

  const recipeByDay = useMemo(
    () => pickSeasonalRecipes(recipes, monthIndex0, year, ideaDays),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {/* ── Background ── */}
      <img src={picnicImage} alt="" aria-hidden className="sc-bg" />
      <div className="sc-bg-veil" aria-hidden />

      {/* ── Two-column layout ── */}
      <div className="sc-layout">

        {/* ── LEFT: calendar card ── */}
        <div className="sc-card">

          {/* Month nav */}
          <div className="sc-month-row">
            <button type="button" className="sc-nav" onClick={() => goToMonth(-1)} aria-label="Vorheriger Monat">
              <ChevronLeft size={16} aria-hidden />
            </button>
            <h2 className="sc-month-title">{MONTH_NAMES[monthIndex0].toUpperCase()}</h2>
            <button type="button" className="sc-nav" onClick={() => goToMonth(1)} aria-label="Nächster Monat">
              <ChevronRight size={16} aria-hidden />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="sc-weekdays">
            {WEEKDAY_FULL.map((label, i) => (
              <div key={label} className="sc-dow">
                <span className="sc-dow-full">{label}</span>
                <span className="sc-dow-short">{WEEKDAY_SHORT[i]}</span>
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="sc-grid">
            {weeks.map((week, wi) =>
              week.map((cell, di) => {
                if (cell.day === null)
                  return <div key={`${wi}-${di}`} className="sc-cell sc-cell-empty" />;

                return (
                  <div
                    key={`${wi}-${di}`}
                    className={`sc-cell${cell.isToday ? " sc-cell-today" : ""}`}
                  >
                    <span className="sc-day-num">{cell.day}</span>

                    {cell.idea && (
                      <button
                        type="button"
                        className="sc-idea-btn"
                        onClick={(e) => openPopup(cell.idea!, e.currentTarget)}
                      >
                        <SpiralCircle />
                        <span className="sc-idea-title">{cell.idea.title}</span>
                        {cell.idea.subtitle && (
                          <span className="sc-idea-sub">{cell.idea.subtitle}</span>
                        )}
                      </button>
                    )}

                    {!cell.idea && cell.recipe && (
                      <Link
                        to={`/rezepte/${cell.recipe.slug}`}
                        className="sc-recipe-thumb"
                        aria-label={cell.recipe.title}
                      >
                        {cell.recipe.image && (
                          <img
                            src={resizeDriveUrl(cell.recipe.image, "w200")}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </Link>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Popup */}
          {activePopup && (
            <div
              className="sc-overlay"
              onClick={(e) => { if (e.target === e.currentTarget) closePopup(); }}
            >
              <div className="sc-popup" role="dialog" aria-modal="true" aria-labelledby="sc-popup-title">
                <button type="button" ref={closeRef} className="sc-popup-close" onClick={closePopup} aria-label="Schließen">
                  <X size={14} aria-hidden />
                </button>
                <span className="sc-popup-eyebrow">
                  {activePopup.idea.day}. {MONTH_NAMES[activePopup.idea.month - 1]}
                </span>
                <h3 id="sc-popup-title" className="sc-popup-title">{activePopup.idea.title}</h3>
                {activePopup.idea.subtitle && <p className="sc-popup-subtitle">{activePopup.idea.subtitle}</p>}
                <p className="sc-popup-idea">{activePopup.idea.idea}</p>
                {(activePopup.idea.onTheTable || activePopup.idea.kochen) && (
                  <div className="sc-popup-section">
                    <p className="sc-popup-label">Auf dem Tisch</p>
                    <ul className="sc-popup-list">
                      {(activePopup.idea.onTheTable || activePopup.idea.kochen)!.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
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
                    <ul className="sc-popup-list">
                      {activePopup.idea.afterDinner.map((e) => <li key={e}>{e}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: seasonal sidebar ── */}
        <div className="sc-seasonal">
          <div className="sc-seasonal-header">
            <span className="sc-seasonal-title">Das hat Saison:</span>
          </div>
          <div className="sc-seasonal-pills">
            {(monthData.items ?? []).map((item) => (
              <span key={item.slug} className="sc-seasonal-pill">{item.name}</span>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        /* ─── Root ─── */
        .sc-root {
          position: relative;
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
        }

        /* ─── Background ─── */
        .sc-bg {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center 30%;
          display: block;
        }
        .sc-bg-veil {
          position: absolute; inset: 0;
          background: rgba(43, 18, 16, 0.38);
        }

        /* ─── Two-column layout ─── */
        .sc-layout {
          position: relative; z-index: 1;
          display: flex;
          align-items: flex-start;
          gap: 28px;
          padding: 36px 32px;
        }

        /* ─── Calendar card ─── */
        .sc-card {
          position: relative;
          flex: 0 0 62%;
          background: #F7F6EC;
          border-radius: 16px;
          padding: 28px 24px 20px;
        }

        /* Month row */
        .sc-month-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .sc-month-title {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: clamp(26px, 5.5vw, 48px);
          letter-spacing: 0.16em;
          color: var(--color-ink);
          margin: 0;
          text-align: center;
          min-width: 0;
          flex: 1;
        }
        .sc-nav {
          flex-shrink: 0;
          width: 30px; height: 30px;
          border-radius: 50%;
          border: 1px solid rgba(43,18,16,0.2);
          background: none;
          color: var(--color-ink);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0.55; transition: opacity 0.15s;
        }
        .sc-nav:hover { opacity: 1; }

        /* Weekday headers */
        .sc-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-bottom: 1px solid rgba(43,18,16,0.15);
          padding-bottom: 6px;
          margin-bottom: 0;
        }
        .sc-dow {
          text-align: center;
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 10px;
          letter-spacing: 0.04em;
          color: rgba(43,18,16,0.5);
        }
        .sc-dow-short { display: none; }

        /* Day grid */
        .sc-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        .sc-cell {
          position: relative;
          aspect-ratio: 1 / 1;
          border-right: 1px solid rgba(43,18,16,0.12);
          border-bottom: 1px solid rgba(43,18,16,0.12);
          padding: 5px;
          display: flex;
          flex-direction: column;
          overflow: visible;
        }
        .sc-cell:nth-child(7n) { border-right: none; }
        .sc-cell-empty { background: rgba(43,18,16,0.02); }
        .sc-cell-today { box-shadow: inset 0 0 0 1.5px var(--color-maroon); border-radius: 3px; }

        .sc-day-num {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 10px;
          color: var(--color-ink);
          opacity: 0.6;
          line-height: 1;
          flex-shrink: 0;
        }

        /* Dinner idea */
        .sc-idea-btn {
          position: relative;
          flex: 1;
          margin-top: 2px;
          background: none; border: none;
          padding: 8px 4px 4px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 2px;
        }
        .sc-idea-title {
          font-family: 'Homemade Apple', cursive;
          font-size: clamp(8px, 1.2vw, 13px);
          line-height: 1.3;
          color: var(--color-ink);
          position: relative; z-index: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .sc-idea-sub {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: clamp(6px, 0.85vw, 9px);
          color: var(--color-muted);
          font-style: italic;
          position: relative; z-index: 1;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Recipe thumbnail */
        .sc-recipe-thumb {
          display: block;
          margin-top: auto;
          border-radius: 3px;
          overflow: hidden;
          flex: 1;
          min-height: 0;
        }
        .sc-recipe-thumb img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }

        /* ─── Popup ─── */
        .sc-overlay {
          position: absolute; inset: 0; z-index: 10;
          background: rgba(20,8,4,0.55);
          display: flex; align-items: center; justify-content: center;
          padding: 20px; border-radius: 16px;
        }
        .sc-popup {
          position: relative; width: 100%; max-width: 300px;
          background: #F7F6EC;
          border-radius: 14px;
          padding: 28px 22px 22px;
          box-shadow: 0 20px 48px rgba(43,18,16,0.28);
        }
        .sc-popup-close {
          position: absolute; top: 12px; right: 12px;
          width: 28px; height: 28px; border-radius: 50%;
          border: none; background: rgba(43,18,16,0.08);
          color: var(--color-ink);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .sc-popup-eyebrow {
          display: block;
          font-family: var(--font-body); font-size: 11px;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--color-terracotta); margin-bottom: 4px;
        }
        .sc-popup-title {
          font-family: 'Homemade Apple', cursive;
          font-size: clamp(20px, 5vw, 26px);
          color: var(--color-ink); margin: 0 0 4px; line-height: 1.2;
        }
        .sc-popup-subtitle {
          font-family: var(--font-body); font-size: 12px;
          font-style: italic; color: var(--color-muted); margin: 0 0 12px;
        }
        .sc-popup-idea {
          font-family: var(--font-body); font-size: 13px;
          line-height: 1.65; color: var(--color-muted); margin: 0;
        }
        .sc-popup-section { margin-top: 14px; }
        .sc-popup-label {
          font-family: var(--font-body); font-weight: 600;
          font-size: 10px; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--color-terracotta); margin: 0 0 5px;
        }
        .sc-popup-list {
          list-style: none; padding: 0; margin: 0;
          font-family: var(--font-body); font-size: 13px;
          line-height: 1.5; color: var(--color-ink);
          display: flex; flex-direction: column; gap: 3px;
        }

        /* ─── Seasonal sidebar ─── */
        .sc-seasonal {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-top: 4px;
        }
        .sc-seasonal-header {
          background: #F7F6EC;
          border-radius: 999px;
          padding: 12px 24px;
          display: inline-flex;
          align-self: flex-start;
        }
        .sc-seasonal-title {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: clamp(14px, 2.2vw, 20px);
          letter-spacing: 0.08em;
          color: var(--color-ink);
          white-space: nowrap;
        }
        .sc-seasonal-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .sc-seasonal-pill {
          background: #F7F6EC;
          border-radius: 999px;
          padding: 8px 18px;
          font-family: var(--font-body);
          font-weight: 300;
          font-size: clamp(12px, 1.8vw, 16px);
          color: var(--color-ink);
          white-space: nowrap;
        }

        /* ─── Responsive ─── */
        @media (max-width: 600px) {
          .sc-layout { flex-direction: column; padding: 20px 16px; gap: 20px; }
          .sc-card { flex: none; width: 100%; padding: 18px 12px 14px; }
          .sc-seasonal { width: 100%; }
          .sc-dow-full { display: none; }
          .sc-dow-short { display: inline; }
          .sc-idea-title { font-size: 8px; -webkit-line-clamp: 2; }
          .sc-idea-sub { display: none; }
          .sc-seasonal-pill { font-size: 12px; padding: 6px 12px; }
        }
        @media (min-width: 601px) and (max-width: 900px) {
          .sc-layout { padding: 24px 20px; }
          .sc-dow-full { display: none; }
          .sc-dow-short { display: inline; }
        }
        @media (min-width: 901px) {
          .sc-cell { padding: 7px; }
          .sc-day-num { font-size: 12px; }
        }
      `}</style>
    </div>
  );
}
