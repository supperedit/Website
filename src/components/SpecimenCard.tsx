import { useLayoutEffect, useRef } from "react";
import { Leaf } from "lucide-react";
import "../styles/collection-cards.css";
import type { JournalEntry } from "../data/useJournal";

interface SpecimenCardProps {
  entry: JournalEntry & {
    tastingNotesShort?: string | null;
  };
}

export default function SpecimenCard({
  entry,
}: SpecimenCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const fitText = () => {
      card
        .querySelectorAll<HTMLElement>("[data-fit]")
        .forEach((text) => {
          text.style.removeProperty("font-size");

          const parent = text.parentElement!;
          const style = getComputedStyle(parent);

          const availableHeight =
            parent.clientHeight -
            parseFloat(style.paddingTop) -
            parseFloat(style.paddingBottom);

          const siblings = Array.from(
            parent.children,
          ).filter((child) => child !== text);

          const reservedHeight =
            parent.classList.contains(
              "specimen-inline-fact",
            )
              ? siblings.reduce(
                  (height, child) =>
                    height +
                    child.getBoundingClientRect().height,
                  0,
                ) + parseFloat(style.rowGap || "0")
              : 0;

          let size = parseFloat(
            getComputedStyle(text).fontSize,
          );

          while (
            (text.scrollHeight >
              availableHeight - reservedHeight + 1 ||
              text.scrollWidth >
                text.clientWidth + 1) &&
            size > 8
          ) {
            size -= 0.5;
            text.style.fontSize = `${size}px`;
          }
        });
    };

    const observer = new ResizeObserver(fitText);
    observer.observe(card);

    let active = true;

    document.fonts.ready.then(() => {
      if (active) fitText();
    });

    fitText();

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [
    entry.title,
    entry.season,
    entry.tastingNotes,
    entry.tastingNotesShort,
  ]);

  return (
    <div
      ref={cardRef}
      className="specimen-card collection-card"
      lang="de"
    >
      <div className="specimen-photo">
        {entry.image ? (
          <img
            src={entry.image}
            alt=""
            loading="lazy"
          />
        ) : (
          <div
            className="specimen-photo-placeholder"
            aria-hidden="true"
          >
            <Leaf size={36} strokeWidth={1.2} />
          </div>
        )}
      </div>

      <div className="specimen-row specimen-row-title">
        <div className="specimen-identity">
          <h3
            data-fit
            className={`specimen-name${
              entry.title.length > 13
                ? " specimen-name--long"
                : ""
            }`}
          >
            {entry.title}
          </h3>
        </div>

        <div className="specimen-inline-fact">
          <span className="specimen-meta-label">
            Saison
          </span>
          <span
            data-fit
            className="specimen-meta-value specimen-meta-value--inline"
          >
            {entry.season || "\u2013"}
          </span>
        </div>
      </div>

      <div className="specimen-row specimen-row-single">
        <span className="specimen-meta-label">
          Geschmack:
        </span>
        <span
          data-fit
          className="specimen-meta-value"
        >
          {entry.tastingNotesShort ||
            entry.tastingNotes ||
            "\u2013"}
        </span>
      </div>
    </div>
  );
}
