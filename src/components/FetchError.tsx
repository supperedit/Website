interface FetchErrorProps {
  title: string;
  message?: string;
  compact?: boolean;
}

// Shared warm, on-brand "content didn't load" state with a real retry action —
// modeled on Journal.tsx's error handling, which was the one place this was
// done right. Used everywhere a useRecipes()/useJournal()/useKitchenNotes()
// fetch can fail so the site doesn't fall back to bare caption text.
export default function FetchError({
  title,
  message = "Bitte versuche es gleich noch einmal.",
  compact = false,
}: FetchErrorProps) {
  return (
    <div
      role="alert"
      style={{
        textAlign: "center",
        paddingBlock: compact ? 24 : 48,
      }}
    >
      <h2
        className="font-display"
        style={{
          margin: "0 0 8px",
          fontSize: compact ? "clamp(18px, 3vw, 22px)" : "clamp(22px, 4vw, 28px)",
          fontWeight: 400,
        }}
      >
        {title}
      </h2>
      <p style={{ color: "var(--color-muted)", fontSize: 14, margin: "0 0 16px" }}>
        {message}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          background: "var(--color-terracotta)",
          color: "var(--color-cream)",
          border: "none",
          borderRadius: 999,
          padding: "10px 22px",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Erneut laden
      </button>
    </div>
  );
}
