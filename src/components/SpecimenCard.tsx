import { Leaf } from "lucide-react";
import type { JournalEntry } from "../data/journalTypes";

interface SpecimenCardProps {
  entry: JournalEntry;
}

export default function SpecimenCard({ entry }: SpecimenCardProps) {
  const hasMeta = Boolean(entry.season || entry.edibleParts);
  return (
    <div className="specimen-card">
      <div className="specimen-photo">
        {entry.image
          ? <img src={entry.image} alt="" loading="lazy" />
          : <div className="specimen-photo-placeholder" aria-hidden="true">
              <Leaf size={36} strokeWidth={1.2} />
            </div>
        }
      </div>
      <div className="specimen-row specimen-row-title">
        <h2 className="specimen-name">{entry.title}</h2>
        {entry.latinName && <span className="specimen-latin">{entry.latinName}</span>}
      </div>
      {hasMeta && (
        <div className="specimen-row specimen-row-meta">
          {entry.season && (
            <div className="specimen-meta-cell">
              <span className="specimen-meta-label">Saison:</span>
              <span className="specimen-meta-value">{entry.season}</span>
            </div>
          )}
          {entry.edibleParts && (
            <div className="specimen-meta-cell">
              <span className="specimen-meta-label">Essbare Teile:</span>
              <span className="specimen-meta-value">{entry.edibleParts}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
