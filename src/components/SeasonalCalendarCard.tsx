import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { seasonalCalendar } from "../data/seasonalCalendar";
import { dinnerIdeas, type DinnerIdea } from "../data/dinnerIdeas";
import { getMomentsForMonth, type CalendarMoment } from "../data/calendarMoments";
import { useRecipes, resizeDriveUrl } from "../data/useRecipes";
import type { Recipe } from "../data/recipeTypes";
import picnicImage from "../assets/images/picnic.jpg";

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const WEEKDAY_LABELS_FULL = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const WEEKDAY_LABELS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

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
  const firstWeekday = (new Date(year, monthIndex0, 1).getDay() + 6) % 7;
  const today = new Date();
  const monthIdeas = dinnerIdeas.filter((e) => e.month === monthIndex0 + 1);
  const momentsByDay = new Map(moments.map((m) => [m.day, m]));

  const cells: DayCell[] = [];
  for (let i = 0; i < firstWeekday; i++)
    cells.push({ day: null, isToday: false, idea: null, moment: null, recipe: null });
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      isToday:
        today.getFullYear() === year &&
        today.getMonth() === monthIndex0 &&
        today.getDate() === day,
      idea: monthIdeas.find((e) => e.day === day) ?? null,
      moment: momentsByDay.get(day) ?? null,
      recipe: recipeByDay[day] ?? null,
    });
  }
  while (cells.length % 7 !== 0)
    cells.push({ day: null, isToday: false, idea: null, moment: null, recipe: null });

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Hand-drawn spiral circle, mirroring the SVG reference design. */
function SpiralCircle() {
  return (
    <svg
      viewBox="0 0 120 80"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: "-10px -8px",
        width: "calc(100% + 16px)",
        height: "calc(100% + 20px)",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <path
        d="M108,40 C106,12 86,-1 60,3 C30,8 6,20 6,40 C6,60 28,74 60,74 C92,74 114,60 108,40 C102,22 82,8 60,12 C34,16 14,28 14,42 C14,56 30,66 58,66"
        stroke="var(--color-dusty-blue)"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
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
    chosenDays.forEach((day) => { map[day] = pool[Math.floor(Math.random() * pool.length)]; });
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
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") closePopup(); };
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
    let next = monthIndex0 + delta;
    let nextYear = year;
    if (next < 0) { next = 11; nextYear -= 1; }
    if (next > 11) { next = 0; nextYear += 1; }
    setMonthIndex0(next);
    setYear(nextYear);
  };

  return (
    <div className="svgcal-outer">
      {/* Background image */}
      <img src={picnicImage} alt="" aria-hidden className="svgcal-bg" />
      <div className="svgcal-bg-overlay" aria-hidden />

      <div className="svgcal-card">
        {/* Month header */}
        <div className="svgcal-header">
          <button
            type="button"
            className="svgcal-nav"
            onClick={() => goToMonth(-1)}
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <h2 className="svgcal-month-title">
            {MONTH_NAMES[monthIndex0].toUpperCase()}
          </h2>
          <button
            type="button"
            className="svgcal-nav"
            onClick={() => goToMonth(1)}
            aria-label="Nächster Monat"
          >
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>

        {/* Weekday row */}
        <div className="svgcal-weekdays">
          {WEEKDAY_LABELS_FULL.map((label, i) => (
            <div key={label} className="svgcal-dow">
              <span className="svgcal-dow-full">{label}</span>
              <span className="svgcal-dow-short">{WEEKDAY_LABELS_SHORT[i]}</span>
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="svgcal-grid">
          {weeks.map((week, wi) =>
            week.map((cell, di) => {
              if (cell.day === null) {
                return <div key={`${wi}-${di}`} className="svgcal-cell svgcal-cell-empty" />;
              }

              return (
                <div
                  key={`${wi}-${di}`}
                  className={`svgcal-cell ${cell.isToday ? "svgcal-cell-today" : ""}`}
                >
                  <span className="svgcal-day-num">{cell.day}</span>

                  {cell.idea && (
                    <button
                      type="button"
                      className="svgcal-idea-btn"
                      onClick={(e) => openPopup({ type: "idea", idea: cell.idea! }, e.currentTarget)}
                    >
                      <SpiralCircle />
                      <span className="svgcal-idea-title font-display">
                        {cell.idea.title}
                      </span>
                    </button>
                  )}

                  {!cell.idea && cell.moment && (
                    <p className="svgcal-moment">{cell.moment.label}</p>
                  )}

                  {!cell.idea && !cell.moment && cell.recipe && (
                    <Link
                      to={`/rezepte/${cell.recipe.slug}`}
                      className="svgcal-recipe-thumb"
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

          {/* Seasonal note — bottom-right, spanning 3 columns */}
          <div className="svgcal-note">
            <p className="svgcal-note-heading">Das hat Saison</p>
            <div className="svgcal-note-pills">
              {(monthData.items ?? []).map((item) => (
                <span key={item.slug} className="svgcal-pill">{item.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Popup overlay */}
        {activePopup && (
          <div
            className="svgcal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) closePopup(); }}
          >
            <div
              className="svgcal-popup"
              role="dialog"
              aria-modal="true"
              aria-labelledby="svgcal-popup-title"
            >
              <button
                type="button"
                ref={closeRef}
                className="svgcal-popup-close"
                onClick={closePopup}
                aria-label="Schließen"
              >
                <X size={14} aria-hidden />
              </button>

              <span className="svgcal-popup-eyebrow">
                {activePopup.idea.day}. {MONTH_NAMES[activePopup.idea.month - 1]}
              </span>
              <h3 id="svgcal-popup-title" className="svgcal-popup-title">
                {activePopup.idea.title}
              </h3>
              {activePopup.idea.subtitle && (
                <p className="svgcal-popup-subtitle">{activePopup.idea.subtitle}</p>
              )}
              <p className="svgcal-popup-idea">{activePopup.idea.idea}</p>

              {(activePopup.idea.onTheTable || activePopup.idea.kochen) && (
                <div className="svgcal-popup-section">
                  <p className="svgcal-popup-label">Auf dem Tisch</p>
                  <ul className="svgcal-popup-list">
                    {(activePopup.idea.onTheTable || activePopup.idea.kochen)!.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              {activePopup.idea.drink && (
                <div className="svgcal-popup-section">
                  <p className="svgcal-popup-label">Dazu trinken</p>
                  <p className="svgcal-popup-text">{activePopup.idea.drink}</p>
                </div>
              )}
              {activePopup.idea.afterDinner && (
                <div className="svgcal-popup-section">
                  <p className="svgcal-popup-label">Nach dem Essen</p>
                  <ul className="svgcal-popup-list">
                    {activePopup.idea.afterDinner.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Homemade+Apple&display=swap');

        /* ── Outer wrapper ── */
        .svgcal-outer {
          position: relative;
          width: 100%;
          border-radius: 24px;
          overflow: hidden;
        }

        /* ── Background image ── */
        .svgcal-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          display: block;
        }
        .svgcal-bg-overlay {
          position: absolute;
          inset: 0;
          background: rgba(43, 18, 16, 0.35);
        }

        /* ── Cream card ── */
        .svgcal-card {
          position: relative;
          z-index: 1;
          margin: 32px 24px;
          background: var(--color-cream);
          border-radius: 18px;
          padding: 28px 24px 20px;
        }

        /* ── Month header ── */
        .svgcal-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        .svgcal-month-title {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: clamp(28px, 7vw, 52px);
          letter-spacing: 0.18em;
          color: var(--color-ink);
          margin: 0;
          text-align: center;
          min-width: 200px;
        }
        .svgcal-nav {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--color-line);
          background: none;
          color: var(--color-ink);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.15s;
        }
        .svgcal-nav:hover { opacity: 1; }

        /* ── Weekday labels ── */
        .svgcal-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-bottom: 1px solid var(--color-line);
          margin-bottom: 0;
        }
        .svgcal-dow {
          text-align: center;
          padding: 0 0 8px;
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 11px;
          letter-spacing: 0.04em;
          color: var(--color-muted);
        }
        .svgcal-dow-short { display: none; }

        /* ── Day grid ── */
        .svgcal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        .svgcal-cell {
          position: relative;
          aspect-ratio: 1 / 1;
          border-right: 1px solid var(--color-line);
          border-bottom: 1px solid var(--color-line);
          padding: 6px;
          display: flex;
          flex-direction: column;
          overflow: visible;
        }
        .svgcal-cell:nth-child(7n) { border-right: none; }
        .svgcal-cell-empty {
          background: rgba(43, 18, 16, 0.02);
        }
        .svgcal-cell-today {
          box-shadow: inset 0 0 0 1.5px var(--color-maroon);
          border-radius: 3px;
        }

        .svgcal-day-num {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 11px;
          color: var(--color-ink);
          opacity: 0.65;
          line-height: 1;
        }

        /* ── Dinner idea ── */
        .svgcal-idea-btn {
          position: relative;
          flex: 1;
          margin-top: 4px;
          background: none;
          border: none;
          padding: 6px 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .svgcal-idea-title {
          font-family: 'Homemade Apple', cursive;
          font-size: clamp(10px, 1.4vw, 14px);
          line-height: 1.25;
          color: var(--color-ink);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        /* ── Moment label ── */
        .svgcal-moment {
          font-family: var(--font-body);
          font-size: 8px;
          font-weight: 300;
          color: var(--color-muted);
          margin-top: auto;
          line-height: 1.3;
        }

        /* ── Recipe thumbnail ── */
        .svgcal-recipe-thumb {
          display: block;
          margin-top: auto;
          border-radius: 4px;
          overflow: hidden;
          aspect-ratio: 1;
          width: 100%;
        }
        .svgcal-recipe-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* ── Seasonal note ── */
        .svgcal-note {
          grid-column: 5 / 8;
          grid-row: -2 / -1;
          background: rgba(43, 18, 16, 0.04);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-left: 1px solid var(--color-line);
          border-top: 1px solid var(--color-line);
        }
        .svgcal-note-heading {
          font-family: 'Homemade Apple', cursive;
          font-size: clamp(12px, 2vw, 16px);
          color: var(--color-maroon);
          margin: 0 0 8px;
        }
        .svgcal-note-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .svgcal-pill {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 10px;
          padding: 3px 9px;
          border-radius: 999px;
          background: var(--color-cream);
          border: 1px solid var(--color-line);
          color: var(--color-ink);
        }

        /* ── Popup ── */
        .svgcal-overlay {
          position: absolute;
          inset: 0;
          z-index: 10;
          background: rgba(20, 8, 4, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          border-radius: 18px;
        }
        .svgcal-popup {
          position: relative;
          width: 100%;
          max-width: 300px;
          background: var(--color-cream);
          border-radius: 16px;
          padding: 28px 24px 24px;
          box-shadow: 0 20px 48px rgba(43, 18, 16, 0.3);
        }
        .svgcal-popup-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: rgba(43, 18, 16, 0.08);
          color: var(--color-ink);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .svgcal-popup-eyebrow {
          display: block;
          font-family: var(--font-body);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-terracotta);
          margin-bottom: 4px;
        }
        .svgcal-popup-title {
          font-family: 'Homemade Apple', cursive;
          font-size: clamp(20px, 5vw, 28px);
          color: var(--color-ink);
          margin: 0 0 4px;
          line-height: 1.2;
        }
        .svgcal-popup-subtitle {
          font-family: var(--font-body);
          font-size: 12px;
          font-style: italic;
          color: var(--color-muted);
          margin: 0 0 14px;
        }
        .svgcal-popup-idea {
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.65;
          color: var(--color-muted);
          margin: 0;
        }
        .svgcal-popup-section { margin-top: 16px; }
        .svgcal-popup-label {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-terracotta);
          margin: 0 0 6px;
        }
        .svgcal-popup-text {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-muted);
          line-height: 1.6;
          margin: 0;
        }
        .svgcal-popup-list {
          list-style: none;
          padding: 0;
          margin: 0;
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.5;
          color: var(--color-ink);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* ── Responsive ── */
        @media (max-width: 520px) {
          .svgcal-card { margin: 16px 12px; padding: 18px 12px 14px; }
          .svgcal-dow-full { display: none; }
          .svgcal-dow-short { display: inline; }
          .svgcal-idea-title { font-size: 9px; -webkit-line-clamp: 2; }
          .svgcal-pill { font-size: 9px; }
        }

        @media (min-width: 640px) {
          .svgcal-cell { padding: 8px; }
          .svgcal-day-num { font-size: 13px; }
          .svgcal-moment { font-size: 9px; }
          .svgcal-pill { font-size: 11px; padding: 4px 11px; }
        }
      `}</style>
    </div>
  );
}
