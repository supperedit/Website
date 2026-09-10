import { useRef, useState, useEffect } from "react";
import { Printer, Download, Share2, X } from "lucide-react";
import { toPng } from "html-to-image";
import SpecimenCard from "./SpecimenCard";
import type { JournalEntry } from "../data/journalTypes";

interface SpecimenCardPrintableProps {
  entry: JournalEntry;
}

export default function SpecimenCardPrintable({ entry }: SpecimenCardPrintableProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => { setOpen(false); triggerRef.current?.focus(); };

  const handlePrint = () => {
    window.setTimeout(() => window.print(), 50);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const link = document.createElement("a");
      link.download = `${entry.slug}-herbarium-karte.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Kartenbild konnte nicht erzeugt werden:", err);
    } finally {
      setBusy(false);
    }
  };

  const handlePinterest = () => {
    const pageUrl = `${window.location.origin}/journal/${entry.slug}`;
    const imageUrl = `${window.location.origin}/api/pin/${entry.slug}`;
    const description = entry.intro || `${entry.title} im Supper Edit Herbarium`;
    const pinUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(description)}`;
    window.open(pinUrl, "_blank", "noopener,noreferrer,width=750,height=650");
  };

  return (
    <div className="sc-printable">
      <button
        type="button"
        className="sc-printable-trigger"
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${entry.title} als Karte drucken oder teilen`}
        title="Drucken / teilen"
      >
        <Printer size={17} aria-hidden="true" />
      </button>

      {open && (
        <div className="sc-printable-overlay" role="presentation" onClick={close}>
          <div
            className="sc-printable-dialog"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${entry.title} Karte teilen`}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="sc-printable-close" onClick={close} aria-label="Schließen">
              <X size={18} aria-hidden="true" />
            </button>

            <div className="sc-printable-preview">
              <div className="sc-printable-card" ref={cardRef}>
                <SpecimenCard entry={entry} />
              </div>
            </div>

            <div className="sc-printable-actions">
              <button type="button" className="sc-printable-option" onClick={handlePrint}>
                <Printer size={18} aria-hidden="true" />
                Drucken
              </button>
              <button type="button" className="sc-printable-option" onClick={handleDownload} disabled={busy}>
                <Download size={18} aria-hidden="true" />
                {busy ? "Wird erzeugt …" : "Als Bild herunterladen"}
              </button>
              <button type="button" className="sc-printable-option" onClick={handlePinterest}>
                <Share2 size={18} aria-hidden="true" />
                Bei Pinterest speichern
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sc-printable-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          background: transparent;
          color: var(--color-maroon);
          border: 1px solid var(--herb-line);
          border-radius: 50%;
          cursor: pointer;
        }
        .sc-printable-trigger:hover { background: color-mix(in srgb, var(--color-terracotta) 12%, transparent); }
        .sc-printable-overlay {
          position: fixed;
          inset: 0;
          background: rgba(43,18,16,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 60;
          padding: 20px;
        }
        .sc-printable-dialog {
          position: relative;
          background: var(--color-cream);
          border-radius: 10px;
          padding: 28px 24px 20px;
          width: 100%;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 20px 60px rgba(43,18,16,0.3);
        }
        .sc-printable-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: transparent;
          border: none;
          color: var(--color-maroon);
          cursor: pointer;
          padding: 6px;
        }
        .sc-printable-preview {
          padding-top: 6px;
        }
        .sc-printable-card {
          max-width: 260px;
          margin: 0 auto;
        }
        .sc-printable-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sc-printable-option {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #F7F6EC;
          border: 1px solid var(--herb-line);
          border-radius: 8px;
          padding: 11px 14px;
          font: inherit;
          font-size: 14px;
          color: var(--color-maroon);
          cursor: pointer;
          text-align: left;
        }
        .sc-printable-option:hover { background: color-mix(in srgb, var(--color-terracotta) 12%, #F7F6EC); }
        .sc-printable-option:disabled { opacity: 0.6; cursor: default; }

        @media print {
          body * { visibility: hidden; }
          .sc-printable-card, .sc-printable-card * { visibility: visible; }
          .sc-printable-card {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 130mm;
            height: 184mm;
            max-width: none;
          }
          .sc-printable-trigger, .sc-printable-close, .sc-printable-actions { display: none !important; }
          .sc-printable-overlay { position: static; background: none; padding: 0; }
          .sc-printable-dialog { box-shadow: none; padding: 0; max-width: none; }
          @page { size: A6 portrait; margin: 8mm; }
        }
      `}</style>
    </div>
  );
}
