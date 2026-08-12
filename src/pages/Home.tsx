import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shuffle } from "lucide-react";
import { useRecipes, resizeDriveUrl } from "../data/useRecipes";
import type { Recipe } from "../data/recipeTypes";
import { categories } from "../data/categories";
import RecipeCard from "../components/RecipeCard";
import SEO from "../components/SEO";
import AnimatedLogo from "../components/AnimatedLogo";
import SeasonalCalendarCard from "../components/SeasonalCalendarCard";
import heroImage from "../assets/images/hero.jpg";
import CookieIcon from "../assets/icons/cookie.svg?react";
import RollIcon from "../assets/icons/roll.svg?react";
import DrinkIcon from "../assets/icons/drink.svg?react";
import PickleIcon from "../assets/icons/pickle.svg?react";
import SauceIcon from "../assets/icons/sauce.svg?react";
import ButterIcon from "../assets/icons/butter.svg?react";
import PastaIcon from "../assets/icons/pasta.svg?react";
import SnackIcon from "../assets/icons/snack.svg?react";
import picnicImage from "../assets/images/picnic.jpg";

const marqueeText = "Recipes for people who don't follow recipes. ";

const categoryIcons: Record<string, { Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; height: number }> = {
  cookie: { Icon: CookieIcon, height: 78 },
  swirl:  { Icon: RollIcon,   height: 79 },
  saucy:  { Icon: SauceIcon,  height: 95 },
  pickle: { Icon: PickleIcon, height: 102 },
  fizz:   { Icon: DrinkIcon,  height: 94 },
  bites:  { Icon: SnackIcon,  height: 110 },
  bread:  { Icon: ButterIcon, height: 67 },
  pasta:  { Icon: PastaIcon,  height: 69 },
};

export default function Home() {
  const { recipes, loading } = useRecipes();
  const [suggestion, setSuggestion] = useState<Recipe | null>(null);

  // Newest 4 recipes (last rows in the sheet = newest)
  const newestRecipes = useMemo(() => [...recipes].reverse().slice(0, 4), [recipes]);

  useEffect(() => {
    if (recipes.length > 0 && !suggestion) {
      setSuggestion(recipes[Math.floor(Math.random() * recipes.length)]);
    }
  }, [recipes, suggestion]);

  const pickRandom = () => {
    if (recipes.length === 0) return;
    let next = recipes[Math.floor(Math.random() * recipes.length)];
    if (recipes.length > 1 && suggestion) {
      while (next.slug === suggestion.slug) {
        next = recipes[Math.floor(Math.random() * recipes.length)];
      }
    }
    setSuggestion(next);
  };

  return (
    <>
      <SEO
        title="Rezepte, die bleiben"
        description="Eine kuratierte Rezeptsammlung aus dem Alltag. Einfach in der Zubereitung, nie langweilig im Ergebnis."
      />

      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          minHeight: "100svh",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={heroImage}
          alt=""
          fetchPriority="high"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            backgroundColor: "var(--color-ink)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", paddingBottom: 48 }}>
          <AnimatedLogo />
        </div>
      </section>

      {/* ── Marquee ── */}
      <div style={{ overflow: "hidden", backgroundColor: "var(--color-maroon)", paddingBlock: 4 }}>
        <div
          style={{
            display: "flex",
            width: "max-content",
            whiteSpace: "nowrap",
            animation: "marquee-scroll 26s linear infinite",
          }}
        >
          {[0, 1].map((i) => (
            <span
              key={i}
              className="font-body"
              style={{
                color: "var(--color-cream)",
                fontSize: 12,
                fontWeight: 100,
                letterSpacing: "0.08em",
                paddingInline: 40,
              }}
            >
              {marqueeText.repeat(i === 0 ? 4 : 3)}
            </span>
          ))}
        </div>
      </div>

      {/* ── Kategorien ── */}
      <section style={{ backgroundColor: "var(--color-cream)", paddingBlock: 40 }}>
        <div className="wrap" style={{ marginBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: 36, margin: 0 }}>Kategorien</h2>
        </div>

        {/*
          Infinite scroll: categories are rendered twice so the animation can loop
          seamlessly. translateX(-50%) = exactly one full set width.
          Duplicates are hidden from keyboard/screen readers via aria-hidden + tabIndex.
        */}
        <div style={{ overflow: "hidden", paddingBottom: 8 }}>
          <div className="categories-infinite">
            {[...categories, ...categories].map((cat, i) => {
              const entry = categoryIcons[cat.slug];
              const Icon = entry.Icon;
              const isDuplicate = i >= categories.length;
              return (
                <Link
                  key={`${cat.slug}-${i}`}
                  to={`/rezepte?kategorie=${cat.slug}`}
                  className="cat-link"
                  style={{ width: 140, flexShrink: 0, textAlign: "center" }}
                  aria-hidden={isDuplicate || undefined}
                  tabIndex={isDuplicate ? -1 : undefined}
                >
                  {/* Icon container: 120px so even the tallest icon (110px) has breathing room */}
                  <div
                    style={{
                      height: 120,
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      className="cat-icon"
                      style={{ height: entry.height, width: "auto" }}
                      color="var(--color-ink)"
                    />
                  </div>
                  <span className="font-display" style={{ display: "block", fontSize: 22 }}>
                    {cat.name}
                  </span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--color-muted)" }}>
                    {cat.sub}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Neue Rezepte ── */}
      {!loading && newestRecipes.length > 0 && (
        <section className="wrap" style={{ paddingBlock: 40 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 40,
            }}
          >
            <h2 className="font-display" style={{ fontSize: 36, margin: 0 }}>
              Neue Rezepte
            </h2>
            <Link to="/rezepte" style={{ fontSize: 14, borderBottom: "1px solid var(--color-ink)" }}>
              Alle ansehen
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 28,
            }}
          >
            {newestRecipes.map((r) => (
              <RecipeCard
                key={r.slug}
                slug={r.slug}
                title={r.title}
                category={r.category}
                image={resizeDriveUrl(r.image, "w600")}
                titleSize={24}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Seasonal calendar ── */}
      <section
        style={{
          backgroundImage: `linear-gradient(rgba(43, 18, 16, 0.45), rgba(43, 18, 16, 0.45)), url(${picnicImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingBlock: 64,
        }}
      >
        <SeasonalCalendarCard />
      </section>

      {/* ── Sticky feature ── */}
      <section className="wrap sticky-feature">
        <div className="sticky-feature-image" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="sticky-feature-text">
          <p className="font-display" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: 10 }}>
            The Art of Supper.
          </p>
          <p style={{ color: "var(--color-maroon)", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
            Supper ist mehr als nur ein Abendessen. Es beschreibt diese{" "}
            <strong>entspannten Abende</strong>, an denen Menschen zusammenkommen,
            sich Zeit füreinander nehmen und Essen teilen.
          </p>
          <p style={{ color: "var(--color-maroon)", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
            Genau darum geht es bei <strong>Supper Edit</strong>.
          </p>
          <p style={{ color: "var(--color-maroon)", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
            Nicht um das perfekte Menü oder stundenlange Vorbereitung. Sondern um{" "}
            <strong>einfache Rezepte, saisonale Zutaten und kleine Ideen</strong> für
            Tisch, Deko und Anrichten, die aus einem gewöhnlichen Abend etwas Besonderes
            machen. Oft reichen ein paar Teller zum Teilen, Kerzen auf dem Tisch und{" "}
            <strong>die richtigen Menschen</strong>, damit aus einem Dienstagabend ein
            Anlass wird.
          </p>
          <p style={{ color: "var(--color-maroon)", fontSize: 15, lineHeight: 1.8 }}>
            Denn die schönsten Dinner entstehen nicht durch Perfektion, sondern durch
            <strong> die Menschen, die daran sitzen</strong>.
          </p>
        </div>
      </section>

      {/* ── Quote / statement ── */}
      <section
        className="statement-section"
        style={{
          paddingBlock: 96,
          paddingInline: 24,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          backgroundImage: `linear-gradient(rgba(43, 18, 16, 0.55), rgba(43, 18, 16, 0.55)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p
          className="font-display"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
            maxWidth: 720,
            margin: "0 auto",
            position: "relative",
            color: "var(--color-cream)",
          }}
        >
          Recipes worth making twice.
        </p>
      </section>

      {/* ── Random suggestion ── */}
      {suggestion && (
        <section style={{ backgroundColor: "var(--color-sky)", paddingBlock: 72 }}>
          <div className="wrap" style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-maroon)",
                marginBottom: 12,
              }}
            >
              Noch nichts geplant?
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                color: "var(--color-maroon)",
                margin: "0 0 40px",
              }}
            >
              Heute kochst du:
            </h2>

            {/*
              Postcard layout: photo left, content right.
              Scalloped edges via radial-gradient painted in --color-sky
              (matches section bg) to create the perforated cutout illusion.
            */}
            <div className="postcard">
              {/* Photo side */}
              <div className="postcard-photo">
                {suggestion.image ? (
                  <img
                    src={resizeDriveUrl(suggestion.image, "w600")}
                    alt={suggestion.title}
                    loading="lazy"
                    decoding="async"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, backgroundColor: "var(--color-line)" }} />
                )}
              </div>

              {/* Content side */}
              <div className="postcard-right">
                {/* Category label above title */}
                <span style={{ fontSize: 11, color: "var(--color-terracotta)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8, minHeight: "1em" }}>
                  {suggestion.category}
                </span>

                {/* Title — fixed min-height so layout doesn't shift between recipes */}
                <p
                  className="font-display"
                  style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.65rem)", margin: "0 0 12px", lineHeight: 1.2, minHeight: "3.6em" }}
                >
                  {suggestion.title}
                </p>

                {/* Intro — fixed min-height */}
                <p style={{ fontSize: 13, color: "var(--color-muted)", lineHeight: 1.75, margin: "0 0 28px", minHeight: "4.5em" }}>
                  {suggestion.intro
                    ? suggestion.intro.length > 95
                      ? suggestion.intro.slice(0, 95) + "…"
                      : suggestion.intro
                    : ""}
                </p>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link
                    to={`/rezepte/${suggestion.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "var(--color-terracotta)",
                      color: "var(--color-cream)",
                      borderRadius: 999,
                      padding: "10px 20px",
                      fontSize: 13,
                    }}
                  >
                    Zum Rezept <ArrowRight size={13} />
                  </Link>
                  <button
                    onClick={pickRandom}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "none",
                      border: "1px solid var(--color-line)",
                      borderRadius: 999,
                      padding: "10px 20px",
                      fontSize: 13,
                      color: "var(--color-ink)",
                      cursor: "pointer",
                    }}
                  >
                    <Shuffle size={13} className="shuffle-icon" /> anderes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <style>{`
        /* ── Infinite category scroll ── */
        .categories-infinite {
          display: flex;
          gap: 40px;
          width: max-content;
          padding-left: max(clamp(20px, 5vw, 56px), calc((100vw - 1180px) / 2 + 56px));
          animation: category-scroll 28s linear infinite;
          will-change: transform;
        }
        .categories-infinite:hover {
          animation-play-state: paused;
        }
        @keyframes category-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── Postcard suggestion ── */
        .postcard {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          position: relative;       /* needed for ::after overlay */
          overflow: hidden;         /* clips photo to card boundary */
          background: var(--color-cream);
          box-shadow: 0 6px 32px rgba(43, 18, 16, 0.10);
        }
        /*
          Scalloped edges as an overlay on top of everything (incl. the photo).
          Radial-gradient circles in --color-sky sit above the card content
          and create the perforated cutout illusion against the section background.
        */
        .postcard::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          background:
            /* ── Corners: solid sky-blue quarter-circles to clean up where edges meet ── */
            radial-gradient(circle at 0    0,    var(--color-sky) 9px, transparent 9px) 0    0    / 18px 18px no-repeat,
            radial-gradient(circle at 100% 0,    var(--color-sky) 9px, transparent 9px) 100% 0    / 18px 18px no-repeat,
            radial-gradient(circle at 0    100%, var(--color-sky) 9px, transparent 9px) 0    100% / 18px 18px no-repeat,
            radial-gradient(circle at 100% 100%, var(--color-sky) 9px, transparent 9px) 100% 100% / 18px 18px no-repeat,
            /* ── Edges ── */
            radial-gradient(circle at 50% 0,    var(--color-sky) 9px, transparent 9px) top    / 22px 9px  repeat-x,
            radial-gradient(circle at 50% 100%, var(--color-sky) 9px, transparent 9px) bottom / 22px 9px  repeat-x,
            radial-gradient(circle at 0   50%,  var(--color-sky) 9px, transparent 9px) left   / 9px  22px repeat-y,
            radial-gradient(circle at 100% 50%, var(--color-sky) 9px, transparent 9px) right  / 9px  22px repeat-y;
        }
        .postcard-photo {
          width: 260px;
          flex-shrink: 0;
          position: relative;
          min-height: 360px;
          background-color: var(--color-line);
        }
        .postcard-right {
          flex: 1;
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: left;
          border-left: 1px dashed var(--color-line);
        }
@media (max-width: 580px) {
          .postcard { flex-direction: column; }
          .postcard-photo { width: 100%; min-height: 240px; }
          .postcard-right { border-left: none; border-top: 1px dashed var(--color-line); }
        }

        .statement-section { background-attachment: fixed; }
        @media (max-width: 780px) {
          .statement-section { background-attachment: scroll; }
        }

        .sticky-feature {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
          padding-block: 80px;
        }
        .sticky-feature-image {
          position: sticky;
          top: 100px;
          height: 70vh;
          border-radius: 16px;
          background-size: cover;
          background-position: center;
        }
        .sticky-feature-text { padding-top: 10vh; padding-bottom: 10vh; }

        @media (max-width: 780px) {
          .sticky-feature { grid-template-columns: 1fr; }
          .sticky-feature-image { position: static; height: 50vh; }
          .sticky-feature-text { padding-top: 0; padding-bottom: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sticky-feature-image { position: static !important; }
          .categories-infinite { animation: none; overflow-x: auto; }
        }
      `}</style>
    </>
  );
}