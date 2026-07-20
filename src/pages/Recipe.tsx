import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Leaf, ChevronLeft, Copy, Check, Minus, Plus } from "lucide-react";
import { useRecipes } from "../data/useRecipes";
import { scaleAmount, scaleServingsText } from "../data/scaleAmount";
import FavoriteButton from "../components/FavoriteButton";
import SEO from "../components/SEO";

export default function Recipe() {
  const { slug } = useParams();
  const { recipes, loading, error } = useRecipes();
  const [veganMode, setVeganMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [servings, setServings] = useState<number | null>(null);
  const recipe = recipes.find((r) => r.slug === slug);

  useEffect(() => {
    setServings(recipe?.baseServings ?? null);
  }, [recipe?.slug, recipe?.baseServings]);

  const scaleFactor = recipe?.baseServings && servings ? servings / recipe.baseServings : 1;

  if (loading) {
    return (
      <div className="wrap" style={{ paddingBlock: 96, textAlign: "center", color: "var(--color-muted)" }}>
        Rezept wird geladen …
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrap" style={{ paddingBlock: 96, textAlign: "center", color: "var(--color-muted)" }}>
        Rezepte konnten gerade nicht geladen werden. Versuch es später nochmal.
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="wrap" style={{ paddingBlock: 96, textAlign: "center" }}>
        <p className="font-display" style={{ fontSize: 28 }}>Rezept nicht gefunden</p>
        <Link to="/rezepte" style={{ marginTop: 16, display: "inline-block", fontSize: 14, color: "var(--color-muted)" }}>
          Zurück zu allen Rezepten
        </Link>
      </div>
    );
  }

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
    document.body.removeChild(textarea);
  };

  const copyIngredients = () => {
    const lines: string[] = [`${recipe.title}`, ""];
    recipe.ingredientGroups.forEach((group) => {
      if (group.group) lines.push(group.group.toUpperCase());
      group.items.forEach((item) => {
        const amount = veganMode ? item.veganAmount || item.amount : item.amount;
        const name = veganMode ? item.veganName || item.name : item.name;
        lines.push(`${scaleAmount(amount, scaleFactor)} ${name}`.trim());
      });
      lines.push("");
    });
    const text = lines.join("\n").trim();

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  return (
    <>
      <SEO title={recipe.title} description={recipe.intro ?? `${recipe.title}, ein Rezept von Supper Edit.`} />

      <div className="wrap" style={{ paddingBlock: 64 }}>
        <div style={{ textAlign: "center", maxWidth: 680, marginInline: "auto", marginBottom: 48, paddingTop: 30 }}>
          <span style={{ fontSize: 12, color: "var(--color-terracotta)" }}>{recipe.category}</span>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", margin: "8px 0" }}>
            {recipe.title}
          </h1>
          {recipe.intro && (
            <p style={{ maxWidth: 520, margin: "16px auto 0", color: "var(--color-muted)", fontSize: 14 }}>
              {recipe.intro}
            </p>
          )}

          <button
            onClick={() => setVeganMode((v) => !v)}
            aria-pressed={veganMode}
            style={{
              marginTop: 24,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontSize: 14,
              color: "var(--color-ink)",
            }}
          >
            <Leaf size={15} />
            vegane Version
            <span
              aria-hidden="true"
              style={{
                position: "relative",
                width: 42,
                height: 24,
                borderRadius: 999,
                backgroundColor: veganMode ? "var(--color-mustard)" : "var(--color-line)",
                transition: "background-color 0.2s ease",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: veganMode ? 21 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                  transition: "left 0.2s ease",
                }}
              />
            </span>
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 340px) 1fr", gap: 40, alignItems: "start" }} className="recipe-grid">
          <div
            className="recipe-ingredients"
            style={{
              borderRadius: 4,
              backgroundColor: "#ffffff",
              padding: "24px 20px",
              position: "sticky",
              top: 100,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "2px solid var(--color-ink)", paddingBottom: 12, marginBottom: 4 }}>
              <div>
                <p className="font-display" style={{ fontSize: 22, margin: 0 }}>Zutaten</p>
                {recipe.baseServings && servings ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setServings((s) => Math.max(1, (s ?? 1) - 1))}
                      aria-label="Weniger Portionen"
                      style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid var(--color-ink)", background: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    >
                      <Minus size={11} />
                    </button>
                    <span style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-muted)", minWidth: 62, textAlign: "center" }}>
                      {scaleServingsText(recipe.servings, scaleFactor)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setServings((s) => (s ?? 1) + 1)}
                      aria-label="Mehr Portionen"
                      style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid var(--color-ink)", background: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-muted)", margin: 0 }}>
                    {recipe.servings}
                  </p>
                )}
              </div>
              <button
                onClick={copyIngredients}
                aria-label="Zutatenliste kopieren"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "1px solid var(--color-ink)",
                  borderRadius: 999,
                  padding: "6px 10px",
                  fontSize: 11,
                  color: "var(--color-ink)",
                  cursor: "pointer",
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "kopiert" : "kopieren"}
              </button>
            </div>

            {veganMode && (
              <p style={{ fontSize: 11, color: "var(--color-mustard)", marginTop: 12, textAlign: "center" }}>
                Vegane Alternativen sind markiert.
              </p>
            )}

            {recipe.ingredientGroups.map((group, gi) => (
              <div key={gi} style={{ marginTop: 20 }}>
                {group.group && (
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-terracotta)", marginBottom: 6, textAlign: "center" }}>
                    {group.group}
                  </p>
                )}
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {group.items.map((item, ii) => {
                    const showVegan = veganMode && (item.veganAmount || item.veganName);
                    return (
                      <li
                        key={ii}
                        style={{
                          display: "flex",
                          gap: 18,
                          borderBottom: "1px solid var(--color-line)",
                          padding: "10px 0",
                          fontSize: 13.5,
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            width: 65,
                            flexShrink: 0,
                            textAlign: "left",
                            fontWeight: 500,
                            color: showVegan ? "var(--color-mustard)" : "var(--color-terracotta)",
                            paddingRight: 14,
                            borderRight: "1px solid var(--color-line)",
                          }}
                        >
                          {scaleAmount(showVegan ? item.veganAmount || item.amount : item.amount, scaleFactor)}
                        </span>
                      
                        <span>
                          {showVegan ? item.veganName || item.name : item.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="recipe-content">
            <div
              style={{
                position: "relative",
                aspectRatio: "4/3",
                marginBottom: 32,
                overflow: "hidden",
                backgroundColor: recipe.image ? "transparent" : "var(--color-dusty-blue)",
              }}
            >
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              )}
              <FavoriteButton slug={recipe.slug} title={recipe.title} style={{ position: "absolute", top: 12, right: 12 }} />
            </div>

            <h2 className="font-display" style={{ fontSize: 26, marginBottom: 20 }}>Zubereitung</h2>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 24 }}>
              {recipe.steps.map((step, i) => (
                <li key={i} style={{ display: "flex", gap: 16 }}>
                  <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--color-terracotta)", color: "var(--color-cream)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display" style={{ fontSize: 18, margin: "0 0 4px" }}>{step.title}</p>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-muted)", margin: 0 }}>{step.content}</p>
                    {veganMode && step.veganNote && (
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-mustard)", margin: "6px 0 0" }}>
                        Vegan: {step.veganNote}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <Link
              to="/rezepte"
              style={{ marginTop: 48, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-muted)" }}
            >
              <ChevronLeft size={14} />
              Zurück zu allen Rezepten
            </Link>
          </div>
        </div>
      </div>

      <style>{`
  @media (max-width: 780px) {
    .recipe-grid {
      display: flex !important;
      flex-direction: column !important;
    }

    .recipe-content {
      display: contents;
    }

    .recipe-ingredients {
      order: 2;
      position: static !important;
    }

    .recipe-content > div:first-child {
      order: 1;
    }

    .recipe-content > h2,
    .recipe-content > ol,
    .recipe-content > a {
      order: 3;
    }
  }
`}</style>
    </>
  );
}