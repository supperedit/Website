import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Leaf, ChevronLeft, Copy, Check, Minus, Plus, Share2 } from "lucide-react";
import { useRecipes, resizeDriveUrl } from "../data/useRecipes";
import { scaleAmount, scaleServingsText } from "../data/scaleAmount";
import FavoriteButton from "../components/FavoriteButton";
import RecipeCard from "../components/RecipeCard";
import SEO from "../components/SEO";

export default function Recipe() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { recipes, loading, error } = useRecipes();
  const [veganMode, setVeganMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [servings, setServings] = useState<number | null>(null);
  const recipe = recipes.find((r) => r.slug === slug);

  useEffect(() => {
    setServings(recipe?.baseServings ?? null);
  }, [recipe?.slug, recipe?.baseServings]);

  const scaleFactor =
    recipe?.baseServings && servings ? servings / recipe.baseServings : 1;

  const relatedRecipes = useMemo(() => {
    if (!recipe) return [];
    return [...recipes]
      .reverse()
      .filter((r) => r.slug !== recipe.slug && r.category === recipe.category)
      .slice(0, 3);
  }, [recipes, recipe]);

  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  const shareRecipe = async () => {
    try {
      await navigator.share({
        title: recipe?.title ?? "Supper Edit",
        text: recipe?.intro ?? `${recipe?.title} – ein Rezept von Supper Edit`,
        url: window.location.href,
      });
    } catch {}
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/rezepte");
    }
  };

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
        <Link
          to="/rezepte"
          style={{ marginTop: 16, display: "inline-block", fontSize: 14, color: "var(--color-muted)" }}
        >
          Zurück zu allen Rezepten
        </Link>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    ...(recipe.intro ? { description: recipe.intro } : {}),
    ...(recipe.image ? { image: [resizeDriveUrl(recipe.image, "w1200")] } : {}),
    recipeCategory: recipe.category,
    recipeYield: recipe.servings,
    recipeIngredient: recipe.ingredientGroups.flatMap((g) =>
      g.items.map((item) => `${item.amount} ${item.name}`.trim()),
    ),
    recipeInstructions: recipe.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.title,
      text: step.content,
    })),
  };

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
    document.body.removeChild(textarea);
  };

  const copyIngredients = () => {
    const lines: string[] = [recipe.title, ""];
    recipe.ingredientGroups.forEach((group) => {
      if (group.group) lines.push(group.group.toUpperCase());
      group.items.forEach((item) => {
        const amount = veganMode ? item.veganAmount || item.amount : item.amount;
        const name   = veganMode ? item.veganName  || item.name  : item.name;
        lines.push(`${scaleAmount(amount, scaleFactor)} ${name}`.trim());
      });
      lines.push("");
    });
    const text = lines.join("\n").trim();
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  return (
    <>
      <SEO
        title={recipe.title}
        description={recipe.intro ?? `${recipe.title}, ein Rezept von Supper Edit.`}
        ogTitle={recipe.pinterestTitle ?? undefined}
        ogDescription={recipe.pinterestDescription ?? undefined}
        ogImage={recipe.image ? resizeDriveUrl(recipe.image, "w1200") : undefined}
        ogImageAlt={recipe.altText ?? recipe.title}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="recipe-mobile-hero">
        {recipe.image && (
          <img
            src={resizeDriveUrl(recipe.image, "w1200")}
            alt={recipe.title}
            loading="eager"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>

      <div className="wrap" style={{ paddingBlock: 64 }}>

        <button
          onClick={goBack}
          className="recipe-back-btn"
          aria-label="Zurück"
        >
          <ChevronLeft size={14} />
          Zurück
        </button>

        <div className="recipe-header">
          <span style={{ fontSize: 12, color: "var(--color-terracotta)" }}>{recipe.category}</span>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", margin: "8px 0" }}>
            {recipe.title}
          </h1>
          {recipe.intro && (
            <p style={{ maxWidth: 520, margin: "16px auto 0", color: "var(--color-muted)", fontSize: 14 }}>
              {recipe.intro}
            </p>
          )}
          <div
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setVeganMode((v) => !v)}
              aria-pressed={veganMode}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "none", border: "none", padding: 0,
                cursor: "pointer", fontSize: 14, color: "var(--color-ink)",
              }}
            >
              <Leaf size={15} />
              vegane Version
              <span
                aria-hidden="true"
                style={{
                  position: "relative", width: 42, height: 24, borderRadius: 999,
                  backgroundColor: veganMode ? "var(--color-mustard)" : "var(--color-line)",
                  transition: "background-color 0.2s ease", flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute", top: 3, left: veganMode ? 21 : 3,
                    width: 18, height: 18, borderRadius: "50%",
                    backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                    transition: "left 0.2s ease",
                  }}
                />
              </span>
            </button>

            {canShare && (
              <button
                onClick={shareRecipe}
                aria-label="Rezept teilen"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "none", border: "1px solid var(--color-line)",
                  borderRadius: 999, padding: "6px 14px",
                  fontSize: 13, color: "var(--color-ink)", cursor: "pointer",
                }}
              >
                <Share2 size={13} />
                Teilen
              </button>
            )}
          </div>
        </div>

        <div className="recipe-grid">

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
            <div
              style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                borderBottom: "2px solid var(--color-ink)", paddingBottom: 12, marginBottom: 4,
              }}
            >
              <div>
                <p className="font-display" style={{ fontSize: 22, margin: 0 }}>Zutaten</p>
                {recipe.baseServings && servings ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setServings((s) => Math.max(1, (s ?? 1) - 1))}
                      aria-label="Weniger Portionen"
                      style={{
                        width: 20, height: 20, borderRadius: "50%",
                        border: "1px solid var(--color-ink)", background: "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", flexShrink: 0,
                      }}
                    >
                      <Minus size={11} />
                    </button>
                    <span
                      style={{
                        fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                        color: "var(--color-muted)", minWidth: 62, textAlign: "center",
                      }}
                    >
                      {scaleServingsText(recipe.servings, scaleFactor)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setServings((s) => (s ?? 1) + 1)}
                      aria-label="Mehr Portionen"
                      style={{
                        width: 20, height: 20, borderRadius: "50%",
                        border: "1px solid var(--color-ink)", background: "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", flexShrink: 0,
                      }}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                      color: "var(--color-muted)", margin: 0,
                    }}
                  >
                    {recipe.servings}
                  </p>
                )}
              </div>

              <button
                onClick={copyIngredients}
                aria-label="Zutatenliste kopieren"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "none", border: "1px solid var(--color-ink)",
                  borderRadius: 999, padding: "6px 10px",
                  fontSize: 11, color: "var(--color-ink)", cursor: "pointer",
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "kopiert" : "kopieren"}
              </button>
            </div>

            {veganMode && (
              <p style={{ fontSize: 11, color: "var(--color-mustard)", marginTop: 20, marginBottom: 12, textAlign: "center" }}>
                Vegane Alternativen sind markiert.
              </p>
            )}

            {recipe.ingredientGroups.map((group, gi) => (
              <div key={gi} style={{ marginTop: 20 }}>
                {group.group && (
                  <p
                    style={{
                      fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em",
                      color: "var(--color-terracotta)", marginBottom: 6, textAlign: "center",
                    }}
                  >
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
                          display: "flex", gap: 18,
                          borderBottom: "1px solid var(--color-line)",
                          padding: "10px 0", fontSize: 13.5, alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            width: 65, flexShrink: 0, textAlign: "left", fontWeight: 500,
                            color: showVegan ? "var(--color-mustard)" : "var(--color-terracotta)",
                            paddingRight: 14, borderRight: "1px solid var(--color-line)",
                          }}
                        >
                          {scaleAmount(
                            showVegan ? item.veganAmount || item.amount : item.amount,
                            scaleFactor,
                          )}
                        </span>
                        <span>{showVegan ? item.veganName || item.name : item.name}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="recipe-content">
            <div className="recipe-desktop-image">
              {recipe.image && (
                <img
                  src={resizeDriveUrl(recipe.image, "w1200")}
                  alt={recipe.title}
                  loading="lazy"
                  decoding="async"
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover", display: "block",
                  }}
                />
              )}
              <FavoriteButton
                slug={recipe.slug}
                title={recipe.title}
                style={{ position: "absolute", top: 12, right: 12 }}
              />
            </div>

            <h2 className="font-display" style={{ fontSize: 26, marginBottom: 20 }}>
              Zubereitung
            </h2>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 24 }}>
              {recipe.steps.map((step, i) => (
                <li key={i} style={{ display: "flex", gap: 16 }}>
                  <span
                    style={{
                      flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
                      backgroundColor: "var(--color-terracotta)", color: "var(--color-cream)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display" style={{ fontSize: 18, margin: "0 0 4px" }}>
                      {step.title}
                    </p>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-muted)", margin: 0 }}>
                      {step.content}
                    </p>
                    {veganMode && step.veganNote && (
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-mustard)", margin: "6px 0 0" }}>
                        Vegan: {step.veganNote}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {relatedRecipes.length > 0 && (
        <section
          style={{
            backgroundColor: "var(--color-cream)",
            borderTop: "1px solid var(--color-line)",
            paddingBlock: 64,
          }}
        >
          <div className="wrap">
            <h2 className="font-display" style={{ fontSize: 28, marginBottom: 32 }}>
              Mehr aus {recipe.category}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 28,
              }}
            >
              {relatedRecipes.map((r) => (
                <RecipeCard
                  key={r.slug}
                  slug={r.slug}
                  title={r.title}
                  category={r.category}
                  image={resizeDriveUrl(r.image, "w600")}
                  titleSize={20}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .recipe-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          padding: 0;
          font-size: 13px;
          color: var(--color-muted);
          cursor: pointer;
          margin-bottom: 16px;
        }

        .recipe-desktop-image {
          position: relative;
          aspect-ratio: 4/3;
          margin-bottom: 32px;
          overflow: hidden;
          border-radius: 4px;
          background-color: var(--color-dusty-blue);
        }

        .recipe-mobile-hero {
          display: none;
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
          background-color: var(--color-dusty-blue);
        }

        .recipe-header {
          text-align: center;
          max-width: 680px;
          margin-inline: auto;
          margin-bottom: 48px;
          padding-top: 30px;
        }

        .recipe-grid {
          display: grid;
          grid-template-columns: minmax(260px, 340px) 1fr;
          gap: 40px;
          align-items: start;
        }

        @media (max-width: 780px) {
          .recipe-mobile-hero {
            display: block;
          }
          .recipe-desktop-image {
            display: none;
          }
          .recipe-back-btn {
            display: inline-flex;
            margin-bottom: 12px;
          }
          .recipe-header {
            padding-top: 8px;
            margin-bottom: 24px;
          }
          .recipe-grid {
            display: flex;
            flex-direction: column;
          }
          .recipe-ingredients {
            position: static !important;
          }
        }
      `}</style>
    </>
  );
}
