import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { seasonalCalendar } from "../data/seasonalCalendar";

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

/**
 * Compact "Kalenderblatt" card: month + heading + a row of seasonal-ingredient
 * tag pills. Replaces the previous version's draggable sprite illustrations
 * and day-by-day dinner-idea grid with a much smaller, static card.
 *
 * Note: tags are currently display-only. The brief asked for tags to link to
 * a recipe list filtered by ingredient, but that filter doesn't exist yet on
 * the Recipes page (it only filters by category today) — add that separately
 * if wanted, then wire these spans up as <Link> elements.
 */
export default function SeasonalCalendarCard() {
  const today = new Date();
  const [monthIndex0, setMonthIndex0] = useState(today.getMonth());

  const monthData = seasonalCalendar[monthIndex0] ?? { month: monthIndex0 + 1, name: "", items: [] };

  const goToMonth = (delta: number) => {
    let next = monthIndex0 + delta;
    if (next < 0) next = 11;
    if (next > 11) next = 0;
    setMonthIndex0(next);
  };

  return (
    <div className="cal-outer">
      <div className="cal-stack">
        <div className="cal-sheet-white" aria-hidden="true" />

        <div className="cal-card">
          <button
            type="button"
            className="cal-nav-btn cal-nav-left"
            onClick={() => goToMonth(-1)}
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>

          <div className="cal-header">
            <span className="cal-month font-display">{MONTH_NAMES[monthIndex0]}</span>
            <h3 className="cal-heading font-display">Gibt's gerade frisch</h3>
          </div>

          <div className="cal-tags">
            {(monthData.items ?? []).map((item) => (
              <span key={item.slug} className="cal-tag">
                {item.name}
              </span>
            ))}
          </div>

          <button
            type="button"
            className="cal-nav-btn cal-nav-right"
            onClick={() => goToMonth(1)}
            aria-label="Nächster Monat"
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <style>{`
        .cal-outer {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .cal-stack {
          display: grid;
          width: min(88vw, 480px);
        }
        .cal-sheet-white {
          grid-column: 1;
          grid-row: 1;
          align-self: stretch;
          justify-self: stretch;
          transform: translate(10px, 10px) rotate(1deg);
          background: #ffffff;
          border-radius: 4px;
          box-shadow: 0 16px 32px rgba(43, 18, 16, 0.15);
        }
        .cal-card {
          grid-column: 1;
          grid-row: 1;
          position: relative;
          z-index: 1;
          background: var(--color-sky);
          border-radius: 4px;
          box-shadow: 0 20px 40px rgba(43, 18, 16, 0.18);
          padding: 28px 52px;
          text-align: center;
        }
        .cal-header { margin-bottom: 18px; }
        .cal-month {
          display: block;
          font-size: 13px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--color-terracotta);
          margin-bottom: 4px;
        }
        .cal-heading {
          font-size: clamp(22px, 5vw, 28px);
          margin: 0;
          color: var(--color-maroon);
        }
        .cal-tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }
        .cal-tag {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 999px;
          background: #ffffff;
          border: 1px solid var(--color-line);
          color: var(--color-ink);
          font-size: 13px;
        }
        .cal-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1px solid var(--color-ink);
          background: none;
          color: var(--color-ink);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.65;
        }
        .cal-nav-btn:hover { opacity: 1; background: rgba(43, 18, 16, 0.08); }
        .cal-nav-left { left: 12px; }
        .cal-nav-right { right: 12px; }

        @media (min-width: 700px) {
          .cal-stack { width: min(88vw, 560px); }
          .cal-card { padding: 34px 64px; }
        }
      `}</style>
    </div>
  );
}
