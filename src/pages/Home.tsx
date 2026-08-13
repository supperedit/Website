import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shuffle } from "lucide-react";
import { useRecipes, resizeDriveUrl } from "../data/useRecipes";
import type { Recipe } from "../data/recipeTypes";
import { categories } from "../data/categories";
import RecipeCard from "../components/RecipeCard";
import SEO from "../components/SEO";
import AnimatedLogo from "../components/AnimatedLogo";
import SeasonalCalendarCard from "../components/SeasonalCalendarCard";
import SupperPairing from "../components/SupperPairing";
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

// Duration of one full loop through the category set, in seconds. Higher = slower.
const CATEGORY_LOOP_SECONDS = 45;
// How quickly velocity eases toward its target (0 on hover, base speed otherwise).
const CATEGORY_EASE_FACTOR = 0.14;

const categoryIcons: Record<string, { Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; height: number }> = {
  cookie: { Icon: CookieIcon, height: 78 },
  swirl: { Icon: RollIcon, height: 79 },
  saucy: { Icon: SauceIcon, height: 95 },
  pickle: { Icon: PickleIcon, height: 102 },
  fizz: { Icon: DrinkIcon, height: 94 },
  bites: { Icon: SnackIcon, height: 110 },
  bread: { Icon: ButterIcon, height: 67 },
  pasta: { Icon: PastaIcon, height: 69 },
};

/**
 * "Vibes" for the recipe-suggestion picker. Category names must match
 * src/data/categories.ts exactly. Adjust these groupings any time —
 * they're just editorial buckets, not a fixed taxonomy.
 */
const VIBES = [
  { key: "alle", label: "Alles", categories: null as string[] | null },
  { key: "suess", label: "Süßes", categories: ["Bake Club", "Swirl Society"] },
  {
    key: "herzhaft",
    label: "Herzhaft",
    categories: ["Small Bites", "Bread & Butter", "Pasta Night", "Saucy Stuff", "Pickle & Ferment"],
  },
  { key: "maedelsabend", label: "Mädelsabend", categories: ["Fizz & Friends", "Slow Sips", "Small Bites"] },
] as const;

export default function Home() {
  const { recipes, loading } = useRecipes();
  const [vibeKey, setVibeKey] = useState<(typeof VIBES)[number]["key"]>("alle");
  const [suggestion, setSuggestion] = useState<Recipe | null>(null);

  const activeVibe = VIBES.find((v) => v.key === vibeKey) ?? VIBES[0];
  const vibePool = useMemo(
    () => (activeVibe.categories ? recipes.filter((r) => activeVibe.categories!.includes(r.category)) : recipes),
    [recipes, activeVibe],
  );

  // The API now returns recipes newest-first (sorted server-side by Notion date),
  // so no client-side re-sorting is needed here.
  const newestRecipes = useMemo(() => recipes.slice(0, 4), [recipes]);

  useEffect(() => {
    if (vibePool.length > 0) {
      setSuggestion(vibePool[Math.floor(Math.random() * vibePool.length)]);
    } else {
      setSuggestion(null);
    }
    // Re-roll whenever the vibe changes, or once recipes first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vibeKey, recipes.length]);

  const pickRandom = () => {
    if (vibePool.length === 0) return;
    let next = vibePool[Math.floor(Math.random() * vibePool.length)];
    if (vibePool.length > 1 && suggestion) {
      while (next.slug === suggestion.slug) {
        next = vibePool[Math.floor(Math.random() * vibePool.length)];
      }
    }
    setSuggestion(next);
  };

  // ── Smooth-hover category scroller ──────────────────────────────────────
  // Runs opposite to the ticker and eases its speed down to a stop on hover
  // instead of cutting abruptly, then eases back up when the pointer leaves.
  const catTrackRef = useRef<HTMLDivElement>(null);
  const catHoverRef = useRef(false);
  const catVelocityRef = useRef(0);
  const catOffsetRef = useRef(0);
  const catBaseSpeedRef = useRef(0);
  const catSetWidthRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const measure = () => {
      const track = catTrackRef.current;
      if (!track) return;
      catSetWidthRef.current = track.scrollWidth / 2;
      catBaseSpeedRef.current = catSetWidthRef.current / (CATEGORY_LOOP_SECONDS * 60);
    };
    measure();
    window.addEventListener("resize", measure);

    let rafId: number;
    const tick = () => {
      const setWidth = catSetWidthRef.current;
      const targetSpeed = catHoverRef.current ? 0 : catBaseSpeedRef.current;
      catVelocityRef.current += (targetSpeed - catVelocityRef.current) * CATEGORY_EASE_FACTOR;
      catOffsetRef.current += catVelocityRef.current;

      if (setWidth > 0) {
        if (catOffsetRef.current >= setWidth) catOffsetRef.current -= setWidth;
        if (catOffsetRef.current < 0) catOffsetRef.current += setWidth;
      }

      if (catTrackRef.current) {
        catTrackRef.current.style.transform = `translateX(${-catOffsetRef.current}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
    };
  }, []);

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
          <p
            className="font-body"
            style={{
              color: "var(--color-cream)",
              fontSize: 15,
              lineHeight: 1.7,
              maxWidth: 380,
              margin: "20px auto 24px",
              opacity: 0.92,
            }}
          >
            Gute Rezepte, schnelle Drinks und kleine Ideen für Abende, an denen man
            einfach hängen bleibt.
          </p>
          <Link
            to="/rezepte"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "var(--color-terracotta)",
              color: "var(--color-cream)",
              borderRadius: 999,
              padding: "12px 26px",
              fontSize: 14,
            }}
          >
            Alle Rezepte <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div style={{ overflow: "hidden", backgroundColor: "var(--color-maroon)", paddingBlock: 4 }}>
        <div
          style={{
            display: "flex",
            width: "max-content",
            whiteSpace: "nowrap",
            animation: "marquee-scroll 26s linear infinite reverse",
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

        <div
          style={{ overflow: "hidden", paddingBottom: 8 }}
          onMouseEnter={() => { catHoverRef.current = true; }}
          onMouseLeave={() => { catHoverRef.current = false; }}
        >
          <div className="categories-infinite" ref={catTrackRef}>
            {[...categories, ...categories].map((cat, i) => {
              const entry = categoryIcons[cat.slug];
              const Icon = entry?.Icon;
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
                  <div
                    style={{
                      height: 120,
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {Icon && (
                      <Icon
                        className="cat-icon"
                        style={{ height: entry.height, width: "auto" }}
                        color="var(--color-ink)"
                      />
                    )}
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

      {/* ── Manifest / The Art of Supper (moved up, right after Kategorien) ── */}
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

      {/* ── Random suggestion, with a vibe filter ── */}
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
              margin: "0 0 24px",
            }}
          >
            Heute kochst du:
          </h2>

          <div className="vibe-filter" role="group" aria-label="Nach Vibe filtern">
            {VIBES.map((vibe) => (
              <button
                key={vibe.key}
                type="button"
                onClick={() => setVibeKey(vibe.key)}
                aria-pressed={vibeKey === vibe.key}
                className={`vibe-pill ${vibeKey === vibe.key ? "vibe-pill-active" : ""}`}
              >
                {vibe.label}
              </button>
            ))}
          </div>

          {suggestion ? (
            <div className="postcard">
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

              <div className="postcard-right">
                <span style={{ fontSize: 11, color: "var(--color-terracotta)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8, minHeight: "1em" }}>
                  {suggestion.category}
                </span>

                <p
                  className="font-display"
                  style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.65rem)", margin: "0 0 12px", lineHeight: 1.2, minHeight: "3.6em" }}
                >
                  {suggestion.title}
                </p>

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
          ) : (
            !loading && (
              <p style={{ color: "var(--color-maroon)", fontSize: 14 }}>
                Für "{activeVibe.label}" ist noch kein Rezept da.
              </p>
            )
          )}
        </div>
      </section>

      {/* ── Quote / statement (sits between the two "pick a recipe" sections on purpose) ── */}
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

      {/* ── The Supper Pairing ── */}
      <SupperPairing />

      <style>{`
        .categories-infinite {
          display: flex;
          gap: 40px;
          width: max-content;
          padding-left: max(clamp(20px, 5vw, 56px), calc((100vw - 1180px) / 2 + 56px));
          will-change: transform;
        }

        .vibe-filter {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-bottom: 40px;
        }
        .vibe-pill {
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid var(--color-line);
          background: transparent;
          color: var(--color-ink);
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .vibe-pill:hover {
          background: rgba(43, 18, 16, 0.06);
        }
        .vibe-pill-active {
          background: var(--color-terracotta);
          border-color: var(--color-terracotta);
          color: var(--color-cream);
        }

        .postcard {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          position: relative;
          overflow: hidden;
          background: var(--color-cream);
          box-shadow: 0 6px 32px rgba(43, 18, 16, 0.10);
        }
        .postcard::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          background:
            radial-gradient(circle at 0 0, var(--color-sky) 9px, transparent 9px) 0 0 / 18px 18px no-repeat,
            radial-gradient(circle at 100% 0, var(--color-sky) 9px, transparent 9px) 100% 0 / 18px 18px no-repeat,
            radial-gradient(circle at 0 100%, var(--color-sky) 9px, transparent 9px) 0 100% / 18px 18px no-repeat,
            radial-gradient(circle at 100% 100%, var(--color-sky) 9px, transparent 9px) 100% 100% / 18px 18px no-repeat,
            radial-gradient(circle at 50% 0, var(--color-sky) 9px, transparent 9px) top / 22px 9px repeat-x,
            radial-gradient(circle at 50% 100%, var(--color-sky) 9px, transparent 9px) bottom / 22px 9px repeat-x,
            radial-gradient(circle at 0 50%, var(--color-sky) 9px, transparent 9px) left / 9px 22px repeat-y,
            radial-gradient(circle at 100% 50%, var(--color-sky) 9px, transparent 9px) right / 9px 22px repeat-y;
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
          .categories-infinite { overflow-x: auto; transform: none !important; }
        }
      `}</style>
    </>
  );
}
