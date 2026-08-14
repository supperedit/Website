import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { seasonalCalendar } from "../data/seasonalCalendar";
import { dinnerIdeas, type DinnerIdea } from "../data/dinnerIdeas";
import { useRecipes, resizeDriveUrl } from "../data/useRecipes";
import type { Recipe } from "../data/recipeTypes";
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

/**
 * Pick up to 3 unique recipes with seasonal bias.
 * Excluded zone: dinner idea days ± 2 days (so the overflowing spiral text
 * doesn't land directly next to a recipe cell).
 */
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

  // Buffer zone: exclude days within 2 of any dinner idea
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
  // Leading empty cells (days before month starts)
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
  // Pad to complete last row (keep trailing empties so grid lines look correct)
  while (cells.length % 7 !== 0)
    cells.push({ day: null, isToday: false, idea: null, recipe: null });

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Blue spiral circle — centered on cell, overflows visually */
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
      {/* ── Two-column layout ── */}
      <div className="sc-layout">

        {/* ── LEFT: calendar card ── */}
        <div className="sc-card">

          {/* Month nav */}
          <div className="sc-month-row">
            <button
              type="button"
              className="sc-nav"
              onClick={() => goToMonth(-1)}
              aria-label="Vorheriger Monat"
            >
              <ChevronLeft size={14} aria-hidden />
            </button>
            <h2 className="sc-month-title">
              {MONTH_NAMES[monthIndex0].toUpperCase()}
            </h2>
            <button
              type="button"
              className="sc-nav"
              onClick={() => goToMonth(1)}
              aria-label="Nächster Monat"
            >
              <ChevronRight size={14} aria-hidden />
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
                const key = `${wi}-${di}`;

                // Empty filler cell (before/after month)
                if (cell.day === null) {
                  return <div key={key} className="sc-cell sc-cell-empty" />;
                }

                const hasIdea = !!cell.idea;
                const hasRecipe = !!cell.recipe;

                return (
                  <div
                    key={key}
                    className={`sc-cell${cell.isToday ? " sc-cell-today" : ""}${hasRecipe ? " sc-cell-recipe" : ""}${hasIdea ? " sc-cell-idea" : ""}`}
                  >
                    {/* Day number — hidden for recipe and idea cells */}
                    {!hasRecipe && !hasIdea && (
                      <span className="sc-day-num">{cell.day}</span>
                    )}

                    {/* Recipe: full-bleed image */}
                    {hasRecipe && cell.recipe && (
                      <Link
                        to={`/rezepte/${cell.recipe.slug}`}
                        className="sc-recipe-link"
                        aria-label={cell.recipe.title}
                      >
                        {cell.recipe.image && (
                          <img
                            src={resizeDriveUrl(cell.recipe.image, "w300")}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </Link>
                    )}

                    {/* Dinner idea: spiral + large overflowing title */}
                    {hasIdea && cell.idea && (
                      <button
                        type="button"
                        className="sc-idea-btn"
                        onClick={(e) => openPopup(cell.idea!, e.currentTarget)}
                      >
                        <SpiralCircle />
                        <span className="sc-idea-title">{cell.idea.title}</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Popup detail */}
          {activePopup && (
            <div
              className="sc-overlay"
              onClick={(e) => { if (e.target === e.currentTarget) closePopup(); }}
            >
              <div
                className="sc-popup"
                role="dialog"
                aria-modal="true"
                aria-labelledby="sc-popup-title"
              >
                <button
                  type="button"
                  ref={closeRef}
                  className="sc-popup-close"
                  onClick={closePopup}
                  aria-label="Schließen"
                >
                  <X size={13} aria-hidden />
                </button>
                <span className="sc-popup-eyebrow">
                  {activePopup.idea.day}. {MONTH_NAMES[activePopup.idea.month - 1]}
                </span>
                <h3 id="sc-popup-title" className="sc-popup-title">
                  {activePopup.idea.title}
                </h3>
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
              <span key={item.slug} className="sc-seasonal-pill">
                {item.name}
              </span>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Homemade+Apple&display=swap');

        /* ─── Outer wrapper ─── */
        .sc-root {
          position: relative;
          width: 100%;
          max-width: 1060px;
          margin: 0 auto;
          /* 16:9 keeps it laptop-proportioned; no overflow:hidden so dinner
             idea titles can spill beyond their cell boundaries */
          aspect-ratio: 16 / 9;
        }

        /* ─── Two-column layout ─── */
        .sc-layout {
          position: relative; z-index: 1;
          display: flex;
          align-items: flex-start;
          gap: 2.2%;
          padding: 3.2% 3%;
          height: 100%;
          box-sizing: border-box;
        }

        /* ─── Calendar card ─── */
        .sc-card {
          position: relative;
          flex: 0 0 60%;
          background: #F7F6EC;
          border-radius: 14px;
          padding: 2.4% 2% 1.6%;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* Month row */
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

        /* Weekday headers */
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

        /* ─── Day grid ─── */
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

        /* Day number — plain cells only */
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

        /* ─── Recipe cell: full-bleed image ─── */
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

        /* ─── Dinner idea: centered, overflows cell ─── */
        .sc-cell-idea { z-index: 4; }

        .sc-idea-btn {
          /* Centered on the cell */
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          /* Wider than cell so text + spiral can overflow naturally */
          width: 210%;
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

        /* Spiral SVG: fills the button area */
        .sc-spiral {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: visible;
        }

        /* Title text on top of spiral */
        .sc-idea-title {
          position: relative; z-index: 1;
          font-family: 'Homemade Apple', cursive;
          font-size: clamp(11px, 1.5vw, 16px);
          line-height: 1.35;
          color: var(--color-ink, #2b1210);
          /* The button is 210% wide; text wraps freely */
          white-space: normal;
          padding: 20% 12%;
        }

        /* ─── Popup overlay ─── */
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

        /* ─── Seasonal sidebar ─── */
        .sc-seasonal {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding-top: 2px;
        }
        .sc-seasonal-header {
          background: #F7F6EC;
          border-radius: 999px;
          padding: 10px 22px;
          display: inline-flex;
          align-self: flex-start;
        }
        .sc-seasonal-title {
          font-family: var(--font-body, 'Elms Sans', sans-serif);
          font-weight: 300;
          font-size: clamp(12px, 1.6vw, 18px);
          letter-spacing: 0.07em;
          color: var(--color-ink, #2b1210);
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
          padding: 7px 16px;
          font-family: var(--font-body, 'Elms Sans', sans-serif);
          font-weight: 300;
          font-size: clamp(11px, 1.35vw, 15px);
          color: var(--color-ink, #2b1210);
          white-space: nowrap;
        }

        /* ─── Responsive ─── */
        @media (max-width: 700px) {
          .sc-root { aspect-ratio: auto; overflow: visible; }
          .sc-layout { flex-direction: column; padding: 16px; gap: 14px; height: auto; }
          .sc-card { flex: none; width: 100%; height: auto; overflow: visible; }
          .sc-grid { grid-auto-rows: auto; }
          .sc-grid { overflow: visible; }
          .sc-seasonal { width: 100%; }
          .sc-dow-full { display: none; }
          .sc-dow-short { display: inline; }
          /* On mobile the idea button is still 210% of a narrow cell — allow
             it to visually overflow without being cut by any parent */
          .sc-cell { overflow: visible; }
          .sc-idea-title { font-size: 9px; }
          .sc-seasonal-pill { font-size: 11px; padding: 5px 12px; }
        }
        @media (min-width: 701px) and (max-width: 960px) {
          .sc-root { aspect-ratio: auto; min-height: 500px; }
          .sc-dow-full { display: none; }
          .sc-dow-short { display: inline; }
        }
      `}</style>
    </div>
  );
}
