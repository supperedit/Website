import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { seasonalCalendar } from "../data/seasonalCalendar";
import { dinnerIdeas, type DinnerIdea } from "../data/dinnerIdeas";
import { getMomentsForMonth, type CalendarMoment } from "../data/calendarMoments";
import { useRecipes, resizeDriveUrl } from "../data/useRecipes";
import type { Recipe } from "../data/recipeTypes";

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const WEEKDAY_LABELS = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];

interface DayCell {
  day: number | null;
  isToday: boolean;
  idea: DinnerIdea | null;
  moment: CalendarMoment | null;
  recipe: Recipe | null;
}

function buildMonthGrid(
  year: number,
  monthIndex0: number,
  moments: CalendarMoment[],
  recipeByDay: Record<number, Recipe>,
): DayCell[][] {
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
  const firstWeekday = (new Date(year, monthIndex0, 1).getDay() + 6) % 7; // Monday-first
  const today = new Date();
  const monthIdeas = dinnerIdeas.filter((entry) => entry.month === monthIndex0 + 1);
  const momentsByDay = new Map(moments.map((m) => [m.day, m]));

  const cells: DayCell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null, isToday: false, idea: null, moment: null, recipe: null });
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      isToday:
        today.getFullYear() === year &&
        today.getMonth() === monthIndex0 &&
        today.getDate() === day,
      idea: monthIdeas.find((entry) => entry.day === day) ?? null,
      moment: momentsByDay.get(day) ?? null,
      recipe: recipeByDay[day] ?? null,
    });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, isToday: false, idea: null, moment: null, recipe: null });

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

type ActivePopup = { type: "idea"; idea: DinnerIdea } | null;

export default function SeasonalCalendarCard() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [monthIndex0, setMonthIndex0] = useState(today.getMonth());
  const [activePopup, setActivePopup] = useState<ActivePopup>(null);
  const { recipes } = useRecipes();

  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const monthData = seasonalCalendar[monthIndex0] ?? { month: monthIndex0 + 1, name: "", items: [] };
  const moments = useMemo(() => getMomentsForMonth(year, monthIndex0), [year, monthIndex0]);

  // A handful of random days get a small recipe photo — "random, aber eher
  // saisonal verfügbare Sachen": we bias the pool toward categories whose
  // recipes tend to lean on fresh produce (pickles/ferments, bites, saucy
  // stuff) before falling back to any recipe, so picks skew seasonal without
  // needing per-recipe season tags that don't exist yet in Notion.
  const recipeByDay = useMemo(() => {
    if (recipes.length === 0) return {};
    const seasonalLeaning = recipes.filter((r) =>
      ["Pickle & Ferment", "Saucy Stuff", "Small Bites", "Pasta Night"].includes(r.category),
    );
    const pool = seasonalLeaning.length > 0 ? seasonalLeaning : recipes;

    const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
    const candidateDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    for (let i = candidateDays.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidateDays[i], candidateDays[j]] = [candidateDays[j], candidateDays[i]];
    }
    const chosenDays = candidateDays.slice(0, Math.min(5, candidateDays.length));

    const map: Record<number, Recipe> = {};
    chosenDays.forEach((day) => {
      map[day] = pool[Math.floor(Math.random() * pool.length)];
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipes, year, monthIndex0]);

  const weeks = useMemo(
    () => buildMonthGrid(year, monthIndex0, moments, recipeByDay),
    [year, monthIndex0, moments, recipeByDay],
  );

  useEffect(() => {
    if (!activePopup) return;
    closeRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopup();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activePopup]);

  const openPopup = (popup: ActivePopup, trigger: HTMLElement) => {
    lastFocusedRef.current = trigger;
    setActivePopup(popup);
  };
  const closePopup = () => {
    setActivePopup(null);
    lastFocusedRef.current?.focus();
  };

  const goToMonth = (delta: number) => {
    let nextMonth = monthIndex0 + delta;
    let nextYear = year;
    if (nextMonth < 0) { nextMonth = 11; nextYear -= 1; }
    if (nextMonth > 11) { nextMonth = 0; nextYear += 1; }
    setMonthIndex0(nextMonth);
    setYear(nextYear);
  };

  return (
    <div className="cal-outer">
      <div className="cal-stack">
        <div className="cal-sheet-white" aria-hidden="true" />

        <div className="cal-card">
          <div className="cal-header">
            <button type="button" className="cal-nav-btn" onClick={() => goToMonth(-1)} aria-label="Vorheriger Monat">
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <h2 className="cal-month font-display">{MONTH_NAMES[monthIndex0]}</h2>
            <button type="button" className="cal-nav-btn" onClick={() => goToMonth(1)} aria-label="Nächster Monat">
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="cal-weekdays">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="cal-grid">
            {weeks.map((week, wi) =>
              week.map((cell, di) => {
                if (cell.day === null) return <div key={`${wi}-${di}`} className="cal-cell cal-cell-empty" />;

                return (
                  <div key={`${wi}-${di}`} className={`cal-cell ${cell.isToday ? "cal-cell-today" : ""}`}>
                    <span className="cal-cell-day">{cell.day}</span>

                    {cell.idea && (
                      <button
                        type="button"
                        className="cal-cell-idea"
                        onClick={(e) => openPopup({ type: "idea", idea: cell.idea! }, e.currentTarget)}
                      >
                        <span className="cal-cell-idea-dot" aria-hidden="true" />
                        <span className="cal-cell-idea-title">{cell.idea.title}</span>
                      </button>
                    )}

                    {!cell.idea && cell.moment && (
                      <div className="cal-cell-moment">
                        <span aria-hidden="true">{cell.moment.emoji}</span>
                        <span className="cal-cell-moment-label">{cell.moment.label}</span>
                      </div>
                    )}

                    {!cell.idea && !cell.moment && cell.recipe && (
                      <Link to={`/rezepte/${cell.recipe.slug}`} className="cal-cell-recipe" aria-label={cell.recipe.title}>
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

            {/* Note box, bottom-right — mirrors the "charity partner" callout in the reference:
                this is where the month's seasonal ingredients live now, instead of scattered tags. */}
            <div className="cal-note">
              <p className="font-display cal-note-heading">Gibt's gerade frisch</p>
              <div className="cal-note-tags">
                {(monthData.items ?? []).map((item) => (
                  <span key={item.slug} className="cal-note-tag">{item.name}</span>
                ))}
              </div>
            </div>
          </div>

          {activePopup && (
            <div className="cal-popup-overlay" onClick={(e) => { if (e.target === e.currentTarget) closePopup(); }}>
              <div className="cal-popup" role="dialog" aria-modal="true" aria-labelledby="cal-popup-title">
                <button type="button" ref={closeRef} className="cal-popup-close" onClick={closePopup} aria-label="Schließen">
                  <X size={16} aria-hidden="true" />
                </button>
                <span className="cal-popup-eyebrow">
                  {activePopup.idea.day}. {MONTH_NAMES[activePopup.idea.month - 1]}
                </span>
                <h3 id="cal-popup-title" className="font-display cal-popup-heading">{activePopup.idea.title}</h3>
                {activePopup.idea.subtitle && <p className="cal-popup-subtitle">{activePopup.idea.subtitle}</p>}
                <p className="cal-popup-text cal-popup-section">{activePopup.idea.idea}</p>
                {(activePopup.idea.onTheTable || activePopup.idea.kochen) && (
                  <div className="cal-popup-section">
                    <p className="cal-popup-label">Auf dem Tisch</p>
                    <ul className="cal-popup-list">
                      {(activePopup.idea.onTheTable || activePopup.idea.kochen)!.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {activePopup.idea.drink && (
                  <div className="cal-popup-section">
                    <p className="cal-popup-label">Dazu trinken</p>
                    <p className="cal-popup-text">{activePopup.idea.drink}</p>
                  </div>
                )}
                {activePopup.idea.afterDinner && (
                  <div className="cal-popup-section">
                    <p className="cal-popup-label">Nach dem Essen</p>
                    <ul className="cal-popup-list">
                      {activePopup.idea.afterDinner.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .cal-outer { display: flex; justify-content: center; width: 100%; }
        .cal-stack { display: grid; width: min(94vw, 620px); }
        .cal-sheet-white {
          grid-column: 1; grid-row: 1;
          align-self: stretch; justify-self: stretch;
          transform: translate(12px, 12px) rotate(1deg);
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(43, 18, 16, 0.15);
        }
        .cal-card {
          grid-column: 1; grid-row: 1;
          position: relative; z-index: 1;
          background: var(--color-cream);
          border-radius: 20px;
          box-shadow: 0 24px 48px rgba(43, 18, 16, 0.18);
          padding: 28px 20px;
        }
        .cal-header {
          display: flex; align-items: center; justify-content: center; gap: 16px;
          margin-bottom: 16px;
        }
        .cal-month { font-size: clamp(30px, 8vw, 44px); margin: 0; color: var(--color-maroon); min-width: 160px; text-align: center; }
        .cal-nav-btn {
          width: 30px; height: 30px; border-radius: 50%;
          border: 1px solid var(--color-ink); background: none; color: var(--color-ink);
          display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.7; flex-shrink: 0;
        }
        .cal-nav-btn:hover { opacity: 1; background: rgba(43, 18, 16, 0.08); }

        .cal-weekdays {
          display: grid; grid-template-columns: repeat(7, 1fr);
          font-size: 10px; letter-spacing: 0.06em; color: var(--color-muted);
          padding-bottom: 6px; border-bottom: 1px solid var(--color-line);
          margin-bottom: 4px;
        }
        .cal-weekdays span { text-align: center; }

        .cal-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        .cal-cell {
          position: relative;
          aspect-ratio: 1 / 1;
          border-right: 1px solid var(--color-line);
          border-bottom: 1px solid var(--color-line);
          padding: 4px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .cal-cell:nth-child(7n) { border-right: none; }
        .cal-cell-empty { background: rgba(43, 18, 16, 0.02); }
        .cal-cell-day { font-size: 10px; color: var(--color-ink); opacity: 0.7; }
        .cal-cell-today { box-shadow: inset 0 0 0 1.5px var(--color-maroon); border-radius: 4px; }

        .cal-cell-idea {
          margin-top: auto;
          display: flex; align-items: center; gap: 4px;
          background: none; border: none; padding: 0; cursor: pointer; text-align: left;
        }
        .cal-cell-idea-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--color-terracotta); flex-shrink: 0;
        }
        .cal-cell-idea-title {
          font-size: 9px; line-height: 1.15; color: var(--color-terracotta);
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        .cal-cell-moment {
          margin-top: auto;
          font-size: 8px; line-height: 1.2; color: var(--color-ink); opacity: 0.75;
          display: flex; flex-direction: column; gap: 2px;
        }
        .cal-cell-moment-label {
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        .cal-cell-recipe {
          margin-top: auto;
          display: block;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 4px;
          overflow: hidden;
        }
        .cal-cell-recipe img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .cal-note {
          grid-column: 5 / 8;
          grid-row: -2 / -1;
          background: var(--color-butter);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-left: 1px solid var(--color-line);
          border-top: 1px solid var(--color-line);
        }
        .cal-note-heading { font-size: 13px; margin: 0 0 6px; color: var(--color-maroon); }
        .cal-note-tags { display: flex; flex-wrap: wrap; gap: 4px; }
        .cal-note-tag {
          font-size: 9px; padding: 2px 6px; border-radius: 999px;
          background: #ffffff; border: 1px solid var(--color-line); color: var(--color-ink);
        }

        .cal-popup-overlay {
          position: absolute; inset: 0; z-index: 5;
          background: rgba(20, 8, 4, 0.5);
          display: flex; align-items: center; justify-content: center;
          padding: 20px; border-radius: 20px;
        }
        .cal-popup {
          position: relative; width: 100%; max-width: 280px;
          background: #ffffff; border-radius: 16px; padding: 28px 22px 22px;
          text-align: left; box-shadow: 0 20px 40px rgba(43, 18, 16, 0.25);
        }
        .cal-popup-close {
          position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; border-radius: 50%;
          border: none; background: var(--color-sand); color: var(--color-ink);
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .cal-popup-eyebrow { display: block; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-terracotta); }
        .cal-popup-subtitle { font-size: 12px; font-style: italic; color: var(--color-muted); margin: 0 0 14px; }
        .cal-popup-heading { font-size: 22px; margin: 6px 0 4px; }
        .cal-popup-text { font-size: 13px; color: var(--color-muted); line-height: 1.6; margin: 0; }
        .cal-popup-section { margin: 0 0 18px; }
        .cal-popup-label { font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-terracotta); margin: 0 0 8px; }
        .cal-popup-list { list-style: none; padding: 0; margin: 0; font-size: 13px; line-height: 1.5; color: var(--color-ink); display: flex; flex-direction: column; gap: 4px; }

        @media (min-width: 640px) {
          .cal-card { padding: 40px 36px; }
          .cal-cell { padding: 8px; }
          .cal-cell-day { font-size: 13px; }
          .cal-cell-idea-title, .cal-cell-moment-label { font-size: 11px; }
          .cal-note-heading { font-size: 16px; }
          .cal-note-tag { font-size: 11px; padding: 4px 10px; }
        }
      `}</style>
    </div>
  );
}
