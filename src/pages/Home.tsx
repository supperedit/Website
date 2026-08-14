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

const marqueeText = "Recipes for people who don't follow recipes.";
const marqueeSeparator = "   ·   ";
const marqueeUnit = Array(5).fill(marqueeText).join(marqueeSeparator) + marqueeSeparator;

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

  const newestRecipes = useMemo(() => recipes.slice(0, 4), [recipes]);

  useEffect(() => {
    if (vibePool.length > 0) {
      setSuggestion(vibePool[Math.floor(Math.random() * vibePool.length)]);
    } else {
      setSuggestion(null);
    }
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

  const catContainerRef = useRef<HTMLDivElement>(null);
  const catSetWidthRef = useRef(0);
  const catAdjustingRef = useRef(false);
  const catInitializedRef = useRef(false);
  const catIsDraggingRef = useRef(false);
  const catDragStartXRef = useRef(0);
  const catDragStartScrollRef = useRef(0);

  useEffect(() => {
    const container = catContainerRef.current;
    if (!container) return;

    const measure = () => {
      catSetWidthRef.current = container.scrollWidth / 2;
      if (!catInitializedRef.current && catSetWidthRef.current > 0) {
        catAdjustingRef.current = true;
        container.scrollLeft = catSetWidthRef.current / 2;
        catInitializedRef.current = true;
      }
    };
    measure();
    window.addEventListener("resize", measure);

    const wrap = () => {
      const setWidth = catSetWidthRef.current;
      if (setWidth <= 0) return;
      if (container.scrollLeft <= 0) {
        catAdjustingRef.current = true;
        container.scrollLeft += setWidth;
      } else if (container.scrollLeft >= setWidth) {
        catAdjustingRef.current = true;
        container.scrollLeft -= setWidth;
      }
    };

    const onContainerScroll = () => {
      if (catAdjustingRef.current) {
        catAdjustingRef.current = false;
        return;
      }
      wrap();
    };
    container.addEventListener("scroll", onContainerScroll, { passive: true });

    let prevScrollY = window.scrollY;
    let catVelocity = 0;

    const onWindowScroll = () => {
      const delta = window.scrollY - prevScrollY;
      prevScrollY = window.scrollY;
      catVelocity += delta * 0.75;
    };
    window.addEventListener("scroll", onWindowScroll, { passive: true });

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      catIsDraggingRef.current = true;
      catDragStartXRef.current = e.clientX;
      catDragStartScrollRef.current = container.scrollLeft;
      container.setPointerCapture(e.pointerId);
      container.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!catIsDraggingRef.current) return;
      catAdjustingRef.current = true;
      container.scrollLeft = catDragStartScrollRef.current - (e.clientX - catDragStartXRef.current);
      catVelocity = 0;
      wrap();
    };
    const endDrag = () => {
      catIsDraggingRef.current = false;
      container.style.cursor = "grab";
    };
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", endDrag);
    container.addEventListener("pointercancel", endDrag);
    container.addEventListener("pointerleave", endDrag);

    let rafId: number;
    const tick = () => {
      if (!catIsDraggingRef.current && Math.abs(catVelocity) > 0.05) {
        catAdjustingRef.current = true;
        container.scrollLeft += catVelocity;
        catVelocity *= 0.9;
        wrap();
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onWindowScroll);
      container.removeEventListener("scroll", onContainerScroll);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", endDrag);
      container.removeEventListener("pointercancel", endDrag);
      container.removeEventListener("pointerleave", endDrag);
    };
  }, []);

  return (
    <>
      <SEO
        title="Rezepte, die bleiben"
        description="Eine kuratierte Rezeptsammlung aus dem Alltag. Einfach in der Zubereitung, nie langweilig im Ergebnis."
      />

      <section
        style={{
          position: "relative",
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
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
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <AnimatedLogo />
          <p
            className="font-body"
            style={{
              color: "var(--color-cream)",
              fontSize: 15,
              lineHeight: 1.7,
              maxWidth: 380,
              margin: "6px auto 20px",
              opacity: 0.92,
            }}
          >
            Gute Rezepte, schnelle Drinks und kleine Ideen für Abende, an denen man
            einfach hängen bleibt.
          </p>
          <Link
            to="/rezepte"
            className="btn-primary"
            style={{
              backgroundColor: "var(--color-dusty-blue)",
              color: "var(--color-maroon)",
              borderColor: "var(--color-dusty-blue)",
            }}
          >
            Alle Rezepte <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <div style={{ overflow: "hidden", backgroundColor: "var(--color-maroon)", paddingBlock: 4 }}>
        <div
          style={{
            display: "flex",
            width: "max-content",
            whiteSpace: "nowrap",
            animation: "marquee-scroll 32s linear infinite",
            animationDirection: "reverse",
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
                paddingInline: 24,
              }}
            >
              {marqueeUnit}
            </span>
          ))}
        </div>
      </div>

      <section style={{ backgroundColor: "var(--color-cream)", paddingBlock: 40 }}>
        <div className="wrap" style={{ marginBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", margin: 0, fontWeight: 400 }}>
            Kategorien
          </h2>
        </div>

        <div className="categories-scroll" ref={catContainerRef}>
          <div className="categories-track">
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
                  draggable={false}
                >
                  <div
                    style={{
                      height: 120,
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
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
                  <span className="font-display" style={{ display: "block", fontSize: 22, pointerEvents: "none" }}>
                    {cat.name}
                  </span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--color-muted)", pointerEvents: "none" }}>
                    {cat.sub}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

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
            <h2 className="font-display" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", margin: 0, fontWeight: 400 }}>
              Neue Rezepte
            </h2>
            <Link to="/rezepte" style={{ fontSize: 14, borderBottom: "1px solid var(--color-ink)" }}>
              Alle ansehen
            </Link>
          </div>

          <div className="newest-grid">
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
              fontWeight: 400,
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
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: "clamp(1.2rem, 2.2vw, 1.65rem)", margin: "0 0 12px", lineHeight: 1.2, minHeight: "3.6em" }}
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
                  <Link to={`/rezepte/${suggestion.slug}`} className="btn-primary btn-small">
                    Zum Rezept <ArrowRight size={13} />
                  </Link>
                  <button onClick={pickRandom} className="btn-secondary btn-small">
                    <Shuffle size={13} /> Anderes Rezept
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

      <SupperPairing />

      <style>{`
        .btn-primary, .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 12px 24px;
          font-size: 14px;
          text-decoration: none;
          cursor: pointer;
          transition: opacity 0.2s ease, background 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .btn-primary {
          background-color: var(--color-terracotta);
          color: var(--color-cream);
          border: 1px solid var(--color-terracotta);
        }
        .btn-primary:hover { opacity: 0.9; }
        .btn-secondary {
          background: none;
          color: var(--color-ink);
          border: 1px solid var(--color-line);
        }
        .btn-secondary:hover { background: rgba(43, 18, 16, 0.06); }
        .btn-small { padding: 10px 20px; font-size: 13px; }

        .newest-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 28px;
        }
        @media (max-width: 640px) {
          .newest-grid {
            display: flex;
            gap: 16px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 8px;
            margin-inline: -20px;
            padding-inline: 20px;
            scrollbar-width: none;
          }
          .newest-grid::-webkit-scrollbar { display: none; }
          .newest-grid > * {
            flex: 0 0 68%;
            scroll-snap-align: start;
          }
        }

        .categories-scroll {
          overflow-x: auto;
          overflow-y: hidden;
          padding-bottom: 8px;
          cursor: grab;
          touch-action: pan-x;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .categories-scroll::-webkit-scrollbar { display: none; }
        .categories-track {
          display: flex;
          gap: 40px;
          width: max-content;
          padding-left: max(clamp(20px, 5vw, 56px), calc((100vw - 1180px) / 2 + 56px));
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
        .vibe-pill:hover { background: rgba(43, 18, 16, 0.06); }
        .vibe-pill-active {
          background: var(--color-terracotta);
          border-color: var(--color-terracotta);
          color: var(--color-cream);
        }

        .postcard {
          max-width: 640px;
          margin: 0 auto;
          display: flex;
          background: var(--color-cream);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 48px rgba(43, 18, 16, 0.12);
        }
        .postcard-photo {
          width: 240px;
          flex-shrink: 0;
          position: relative;
          min-height: 320px;
          background-color: var(--color-line);
        }
        .postcard-right {
          flex: 1;
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: left;
        }
        @media (max-width: 580px) {
          .postcard { flex-direction: column; }
          .postcard-photo { width: 100%; min-height: 220px; }
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
        }
      `}</style>
    </>
  );
}
