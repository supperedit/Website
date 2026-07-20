import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { seasonalCalendar } from "../data/seasonalCalendar";
import { dinnerIdeas, type DinnerIdea } from "../data/dinnerIdeas";
import CircleScribble from "../assets/icons/circle-scribble.svg?react";

import seasonalSpriteUrl from "../assets/icons/seasonal-sprite.png";
import {
  seasonalSpritePositions,
  SPRITE_SHEET_WIDTH,
  SPRITE_SHEET_HEIGHT,
} from "../data/seasonalSpritePositions";
import type { CSSProperties } from "react";

function getSpriteStyle(slug: string, boxSize: number): CSSProperties | null {
  const rect = seasonalSpritePositions[slug];
  if (!rect) return null;
  const scale = boxSize / Math.max(rect.w, rect.h);
  return {
    width: rect.w * scale,
    height: rect.h * scale,
    backgroundImage: `url(${seasonalSpriteUrl})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: `-${rect.x * scale}px -${rect.y * scale}px`,
    backgroundSize: `${SPRITE_SHEET_WIDTH * scale}px ${SPRITE_SHEET_HEIGHT * scale}px`,
  };
}

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

interface DayCell {
  day: number | null;
  isToday: boolean;
  idea: DinnerIdea | null;
}

function buildMonthGrid(year: number, monthIndex0: number): DayCell[][] {
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
  const firstWeekday = (new Date(year, monthIndex0, 1).getDay() + 6) % 7;
  const today = new Date();
  const monthIdeas = dinnerIdeas.filter((entry) => entry.month === monthIndex0 + 1);

  const cells: DayCell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null, isToday: false, idea: null });
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      isToday:
        today.getFullYear() === year &&
        today.getMonth() === monthIndex0 &&
        today.getDate() === day,
      idea: monthIdeas.find((entry) => entry.day === day) ?? null,
    });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, isToday: false, idea: null });
  while (cells.length < 42) cells.push({ day: null, isToday: false, idea: null });

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

interface StickerPosition {
  x: number;
  y: number;
  rotation: number;
}

function scatterPositions(slugs: string[]): Record<string, StickerPosition> {
  const columns = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(slugs.length))));
  const rows = Math.ceil(slugs.length / columns);
  const positions: Record<string, StickerPosition> = {};

  slugs.forEach((slug, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);

    let hash = 0;
    for (let c = 0; c < slug.length; c++) hash = (hash * 31 + slug.charCodeAt(c)) % 1000;
    const jitterX = (hash % 100) / 100 - 0.5;
    const jitterY = ((hash * 7) % 100) / 100 - 0.5;
    const rotationSeed = ((hash * 13) % 100) / 100 - 0.5;

    const baseX = ((col + 0.5) / columns) * 100;
    const baseY = 22 + ((row + 0.5) / rows) * 68;

    positions[slug] = {
      x: Math.min(92, Math.max(8, baseX + jitterX * 12)),
      y: Math.min(94, Math.max(20, baseY + jitterY * 10)),
      rotation: rotationSeed * 24,
    };
  });

  return positions;
}

const clampPercent = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function getCircleTransform(day: number): string {
  const seed = (day * 37) % 30;
  const rotation = seed - 15;
  const mirror = day % 2 === 0 ? -1 : 1;
  return `translate(-50%, -50%) rotate(${rotation}deg) scaleX(${mirror})`;
}

type ActivePopup = { type: "sticker"; name: string; slug: string } | { type: "idea"; idea: DinnerIdea } | null;

export default function SeasonalCalendarCard() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [monthIndex0, setMonthIndex0] = useState(today.getMonth());
  const [positions, setPositions] = useState<Record<string, StickerPosition>>({});
  const [activePopup, setActivePopup] = useState<ActivePopup>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 700px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{
    slug: string;
    startClientX: number;
    startClientY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const monthData = seasonalCalendar[monthIndex0] ?? { month: monthIndex0 + 1, name: "", items: [] };
  const weeks = useMemo(() => buildMonthGrid(year, monthIndex0), [year, monthIndex0]);

  useEffect(() => {
    setPositions(scatterPositions((monthData.items ?? []).map((item) => item.slug)));
  }, [monthData]);

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
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setMonthIndex0(nextMonth);
    setYear(nextYear);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>, slug: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      slug,
      startClientX: e.clientX,
      startClientY: e.clientY,
      originX: positions[slug]?.x ?? 50,
      originY: positions[slug]?.y ?? 50,
      moved: false,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    const dx = e.clientX - drag.startClientX;
    const dy = e.clientY - drag.startClientY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true;
    const nextX = clampPercent(drag.originX + (dx / rect.width) * 100, 4, 96);
    const nextY = clampPercent(drag.originY + (dy / rect.height) * 100, 22, 96);
    setPositions((prev) => ({
      ...prev,
      [drag.slug]: { x: nextX, y: nextY, rotation: prev[drag.slug]?.rotation ?? 0 },
    }));
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>, slug: string, name: string) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag && !drag.moved) {
      openPopup({ type: "sticker", name, slug }, e.currentTarget);
    }
  };

  return (
    <div className="sk-outer">
      <div className="sk-stack">
        <div className="sk-sheet-white" aria-hidden="true" />

        <div className="sk-card" ref={cardRef}>
          <div className="sk-header">
            <div className="sk-month-row">
              <h2 className="sk-month-name font-display">{MONTH_NAMES[monthIndex0]}</h2>
            </div>
            <span className="sk-intro">
              <strong>Saisonale Zutaten</strong>, besondere Momente und Ideen für <strong>gemeinsame Abende</strong>.
            </span>
          </div>

          <div className="sk-grid">
            {weeks.map((week, i) =>
              week.map((cell, j) => {
                if (cell.day === null) return <div key={`${i}-${j}`} className="sk-cell sk-cell-empty" />;

                if (cell.idea) {
                  const circleTransform = getCircleTransform(cell.day);
                  return (
                    <button
                      key={`${i}-${j}`}
                      type="button"
                      className={`sk-cell sk-cell-idea ${cell.isToday ? "sk-cell-today" : ""}`}
                      aria-label={`${cell.day}. ${MONTH_NAMES[monthIndex0]}, Dinner Idee: ${cell.idea.title}`}
                      onClick={(e) => openPopup({ type: "idea", idea: cell.idea! }, e.currentTarget)}
                    >
                      <span className="sk-cell-day-wrap">
                        <CircleScribble className="sk-day-circle" style={{ transform: circleTransform }} aria-hidden="true" />
                        <span className="sk-cell-day">{cell.day}</span>
                      </span>
                      <span className="sk-cell-idea-title">{cell.idea.title}</span>
                    </button>
                  );
                }

                return (
                  <div
                    key={`${i}-${j}`}
                    className={`sk-cell ${cell.isToday ? "sk-cell-today" : ""}`}
                    aria-current={cell.isToday ? "date" : undefined}
                  >
                    <span className="sk-cell-day">{cell.day}</span>
                  </div>
                );
              })
            )}
          </div>

          <p className="sk-hint">Eingekreiste Tage antippen für Dinnerideen.</p>

          <div className="sk-month-nav">
            <button type="button" className="sk-nav-btn" onClick={() => goToMonth(-1)} aria-label="Vorheriger Monat">
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            <button type="button" className="sk-nav-btn" onClick={() => goToMonth(1)} aria-label="Nächster Monat">
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="sk-stickers">
            {(monthData.items ?? []).map((item) => {
              const pos = positions[item.slug];
              if (!pos) return null;
              const spriteStyle = getSpriteStyle(item.slug, isDesktop ? 108 : 68);
              return (
                <button
                  key={item.slug}
                  type="button"
                  className="sk-sticker"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
                  }}
                  aria-label={`${item.name}, hat jetzt Saison. Zum Verschieben ziehen, zum Ansehen antippen oder Enter drücken.`}
                  onPointerDown={(e) => handlePointerDown(e, item.slug)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={(e) => handlePointerUp(e, item.slug, item.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openPopup({ type: "sticker", name: item.name, slug: item.slug }, e.currentTarget);
                    }
                  }}
                >
                  {spriteStyle ? (
                    <span style={spriteStyle} aria-hidden="true" />
                  ) : (
                    <span className="sk-sticker-placeholder" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {activePopup && (
            <div
              className="sk-popup-overlay"
              onClick={(e) => {
                if (e.target === e.currentTarget) closePopup();
              }}
            >
              <div className="sk-popup" role="dialog" aria-modal="true" aria-labelledby="sk-popup-title">
                <button type="button" ref={closeRef} className="sk-popup-close" onClick={closePopup} aria-label="Schließen">
                  <X size={16} aria-hidden="true" />
                </button>

                {activePopup.type === "sticker" ? (
                  <>
                    {getSpriteStyle(activePopup.slug, 52) && (
                      <span style={getSpriteStyle(activePopup.slug, 52)!} className="sk-popup-icon" aria-hidden="true" />
                    )}
                    <h3 id="sk-popup-title" className="font-display sk-popup-heading">
                      {activePopup.name}
                    </h3>
                    <p className="sk-popup-text">Hat jetzt Saison.</p>
                  </>
                ) : (
                  <>
                    <span className="sk-popup-eyebrow">
                      {activePopup.idea.day}. {MONTH_NAMES[activePopup.idea.month - 1]}
                    </span>
                    <h3 id="sk-popup-title" className="font-display sk-popup-heading">
                      {activePopup.idea.title}
                    </h3>
                    {activePopup.idea.subtitle && (
                      <p className="sk-popup-subtitle">{activePopup.idea.subtitle}</p>
                    )}
                    <p className="sk-popup-text sk-popup-section">{activePopup.idea.idea}</p>
                    {(activePopup.idea.onTheTable || activePopup.idea.kochen) && (
                      <div className="sk-popup-section">
                        <p className="sk-popup-kochen-label">Auf dem Tisch</p>
                        <ul className="sk-popup-kochen">
                          {(activePopup.idea.onTheTable || activePopup.idea.kochen)!.map((entry) => (
                            <li key={entry}>{entry}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {activePopup.idea.drink && (
                      <div className="sk-popup-section">
                        <p className="sk-popup-kochen-label">Dazu trinken</p>
                        <p className="sk-popup-text">{activePopup.idea.drink}</p>
                      </div>
                    )}
                    {activePopup.idea.afterDinner && (
                      <div className="sk-popup-section">
                        <p className="sk-popup-kochen-label">Nach dem Essen</p>
                        <ul className="sk-popup-kochen">
                          {activePopup.idea.afterDinner.map((entry) => (
                            <li key={entry}>{entry}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .sk-outer {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .sk-stack {
          display: grid;
          width: min(88vw, 420px);
        }
        .sk-sheet-white {
          grid-column: 1;
          grid-row: 1;
          align-self: stretch;
          justify-self: stretch;
          transform: translate(16px, 16px) rotate(1deg);
          background: #ffffff;
          border-radius: 4px;
          box-shadow: 0 20px 40px rgba(43, 18, 16, 0.15);
        }
        .sk-card {
          grid-column: 1;
          grid-row: 1;
          position: relative;
          z-index: 1;
          background: var(--color-sky);
          border-radius: 4px;
          box-shadow: 0 24px 48px rgba(43, 18, 16, 0.18);
          padding: 44px 44px 40px 36px;
        }
        .sk-header {
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: nowrap;
        }
        .sk-intro {
          display: block;
          min-width: 0;
          font-size: 11px;
          line-height: 1.4;
          color: var(--color-ink);
          opacity: 0.8;
          max-width: 130px;
          text-align: right;
          order: 2;
        }
        .sk-month-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
          order: 1;
          min-width: 0;
        }
        .sk-month-name {
          font-size: clamp(28px, 9vw, 40px);
          margin: 0;
          color: var(--color-maroon);
          line-height: 1;
          white-space: nowrap;
        }
        .sk-month-nav {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 16px;
        }
        .sk-nav-btn {
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
          opacity: 0.75;
        }
        .sk-nav-btn:hover {
          opacity: 1;
          background: rgba(43, 18, 16, 0.08);
        }
        .sk-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-auto-rows: 1fr;
          border-top: 1px solid rgba(43, 18, 16, 0.35);
          border-left: 1px solid rgba(43, 18, 16, 0.35);
        }
        .sk-cell {
          position: relative;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          min-height: 0;
          min-width: 0;
          border-right: 1px solid var(--color-ink);
          border-bottom: 1px solid var(--color-ink);
          border-color: rgba(43, 18, 16, 0.35);
          padding: 4px 6px;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          background: none;
          font-family: inherit;
          text-align: right;
          cursor: default;
          appearance: none;
          -webkit-appearance: none;
          box-shadow: none;
          outline: none;
          box-sizing: border-box;
        }
        .sk-cell-empty {
          background: rgba(255, 255, 255, 0.15);
        }
        .sk-cell-day {
          font-size: 12px;
          color: var(--color-ink);
        }
        .sk-cell-idea {
          background: #ffffff;
          cursor: pointer;
          align-items: flex-start;
          text-align: left;
          gap: 2px;
          overflow: visible;
          z-index: 3;
        }
        .sk-cell-idea .sk-cell-day-wrap {
          align-self: flex-end;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .sk-day-circle {
          display: block;
          position: absolute;
          top: 50%;
          left: 50%;
          width: 32px;
          height: 32px;
          color: var(--color-terracotta);
          pointer-events: none;
        }
        .sk-day-circle path {
          fill: currentColor;
        }
        .sk-cell-idea:focus-visible {
          outline: 1.5px solid var(--color-terracotta);
          outline-offset: -3px;
        }
        .sk-cell-idea-title {
          display: none;
          width: max-content;
          max-width: 150px;
          font-family: var(--font-display);
          font-size: 13px;
          line-height: 1.05;
          font-weight: 400;
          color: var(--color-terracotta);
          transform: rotate(-3deg);
          transform-origin: left top;
          hyphens: auto;
          -webkit-hyphens: auto;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .sk-hint {
          margin: 10px 0 0;
          font-size: 11px;
          text-align: center;
          color: var(--color-ink);
          opacity: 0.6;
        }
        .sk-cell-today {
          border: 1.5px dashed var(--color-maroon);
        }
        .sk-stickers {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
        }
        .sk-sticker {
          position: absolute;
          width: 72px;
          height: 72px;
          padding: 0;
          border-radius: 0;
          background: none;
          border: none;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          pointer-events: auto;
          touch-action: none;
          user-select: none;
        }
        .sk-sticker:active {
          cursor: grabbing;
        }
        .sk-sticker:focus-visible {
          outline: 2px solid var(--color-terracotta);
          outline-offset: 2px;
        }
        .sk-sticker-placeholder {
          width: 60%;
          height: 60%;
          border-radius: 50%;
          border: 2px dashed var(--color-line);
        }
        .sk-popup-overlay {
          position: absolute;
          inset: 0;
          z-index: 5;
          background: rgba(20, 8, 4, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          border-radius: 4px;
        }
        .sk-popup {
          position: relative;
          width: 100%;
          max-width: 280px;
          background: #ffffff;
          border-radius: 16px;
          padding: 28px 22px 22px;
          text-align: left;
          box-shadow: 0 20px 40px rgba(43, 18, 16, 0.25);
        }
        .sk-popup-close {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: var(--color-sand);
          color: var(--color-ink);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .sk-popup-icon {
          display: block;
          margin: 0 auto 10px;
        }
        .sk-popup-eyebrow {
          display: block;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-terracotta);
        }
        .sk-popup-subtitle {
          font-family: var(--font-body);
          font-size: 12px;
          font-style: italic;
          color: var(--color-muted);
          margin: 0 0 14px;
        }
        .sk-popup-heading {
          font-size: 22px;
          margin: 6px 0 4px;
        }
        .sk-popup-text {
          font-family: var(--font-body);
          font-weight: 400;
          font-size: 13px;
          color: var(--color-muted);
          line-height: 1.6;
          margin: 0;
        }
        .sk-popup-section {
          margin: 0 0 18px;
        }
        .sk-popup-kochen-label {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-terracotta);
          margin: 0 0 8px;
        }
        .sk-popup-kochen {
          list-style: none;
          padding: 0;
          margin: 0;
          font-family: var(--font-body);
          font-weight: 400;
          font-size: 13px;
          line-height: 1.5;
          color: var(--color-ink);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        @media (min-width: 700px) {
          .sk-stack {
            width: min(88vw, 820px);
          }
          .sk-intro {
            max-width: 280px;
            font-size: 13px;
          }
          .sk-sheet-white {
            transform: translate(24px, 24px) rotate(1deg);
          }
          .sk-cell {
            aspect-ratio: 4 / 3;
          }
          .sk-sticker {
            width: 116px;
            height: 116px;
          }
          .sk-cell-idea-title {
            display: block;
            font-size: 16px;
            max-width: 110px;
          }
          .sk-day-circle {
            display: none;
          }
          .sk-hint {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}