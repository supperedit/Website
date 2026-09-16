interface FetchErrorProps {
  title: string;
  message?: string;
  compact?: boolean;
}

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
