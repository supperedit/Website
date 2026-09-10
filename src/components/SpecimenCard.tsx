import { Leaf, ArrowUpRight } from "lucide-react";
import { plantGroup } from "../data/herbarium";
import type { JournalEntry } from "../data/journalTypes";

interface SpecimenCardProps {
  entry: JournalEntry;
  showArrow?: boolean;
}

export default function SpecimenCard({ entry, showArrow = true }: SpecimenCardProps) {
  return (
    <>
      <div className="specimen-top">
        <span>{plantGroup(entry)}</span>
        <span>{entry.season}</span>
      </div>
      {entry.image
        ? <div className="specimen-image"><img src={entry.image} alt="" loading="lazy" /></div>
        : <div className="specimen-type" aria-hidden="true">
            <Leaf size={48} strokeWidth={1.2} />
            <em>{entry.latinName || "Botanische Notizen"}</em>
          </div>
      }
      <div className="specimen-title">
        <h2>{entry.title}</h2>
        {showArrow && <ArrowUpRight size={23} strokeWidth={1.2} aria-hidden="true" />}
      </div>
      {entry.latinName && <p className="specimen-latin">{entry.latinName}</p>}
      {entry.intro && <p className="specimen-intro">{entry.intro}</p>}
    </>
  );
}
