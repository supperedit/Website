import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useRecipes, resizeDriveUrl } from "../data/useRecipes";
import { categories } from "../data/categories";
import RecipeCard from "../components/RecipeCard";
import SEO from "../components/SEO";
import AnimatedLogo from "../components/AnimatedLogo";
import SeasonalCalendarCard from "../components/SeasonalCalendarCard";
import HomeHerbarium from "../components/HomeHerbarium";
import SupperPairing from "../components/SupperPairing";
import heroImage from "../assets/images/hero.webp";
import "../styles/hero.css";
import CookieIcon from "../assets/icons/cookie.svg?react";
import RollIcon from "../assets/icons/roll.svg?react";
import DrinkIcon from "../assets/icons/drink.svg?react";
import PickleIcon from "../assets/icons/pickle.svg?react";
import SauceIcon from "../assets/icons/sauce.svg?react";
import ButterIcon from "../assets/icons/butter.svg?react";
import PastaIcon from "../assets/icons/pasta.svg?react";
import SnackIcon from "../assets/icons/snack.svg?react";
import SlowSipsIcon from "../assets/icons/slow-sips.svg?react";
import PantryIcon from "../assets/icons/pantry.svg?react";
import picnicImage from "../assets/images/picnic.webp";

const marqueeText = "Recipes for people who don't follow recipes.";
const marqueeSeparator = "   ·   ";
const marqueeUnit =
  Array(5).fill(marqueeText).join(marqueeSeparator) + marqueeSeparator;

const categoryIcons: Record<
  string,
  {
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    height: number;
  }
> = {
  cookie: { Icon: CookieIcon, height: 78 },
  swirl: { Icon: RollIcon, height: 79 },
  saucy: { Icon: SauceIcon, height: 95 },
  pickle: { Icon: PickleIcon, height: 102 },
  fizz: { Icon: DrinkIcon, height: 94 },
  bites: { Icon: SnackIcon, height: 110 },
  bread: { Icon: ButterIcon, height: 67 },
  pasta: { Icon: PastaIcon, height: 69 },
  "slow-sips": { Icon: SlowSipsIcon, height: 90 },
  pantry: { Icon: PantryIcon, height: 90 },
};

export default function Home() {
  const { recipes, loading } = useRecipes();
  const newestRecipes = useMemo(
    () => recipes.slice(0, 4),
    [recipes],
  );

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

      if (
        !catInitializedRef.current &&
        catSetWidthRef.current > 0
      ) {
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

    container.addEventListener("scroll", onContainerScroll, {
      passive: true,
    });

    let prevScrollY = window.scrollY;
    let catVelocity = 0;

    const onWindowScroll = () => {
      const delta = window.scrollY - prevScrollY;
      prevScrollY = window.scrollY;
      catVelocity += delta * 0.06;
    };

    window.addEventListener("scroll", onWindowScroll, {
      passive: true,
    });

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
      container.scrollLeft =
        catDragStartScrollRef.current -
        (e.clientX - catDragStartXRef.current);
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
      if (
        !catIsDraggingRef.current &&
        Math.abs(catVelocity) > 0.05
      ) {
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
      container.removeEventListener(
        "scroll",
        onContainerScroll,
      );
      container.removeEventListener(
        "pointerdown",
        onPointerDown,
      );
      container.removeEventListener(
        "pointermove",
        onPointerMove,
      );
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
        className="supper-hero"
        aria-label="Supper Edit – Rezepte für lange Abende"
      >
        <img
          className="supper-hero__image"
          src={heroImage}
          alt=""
          fetchPriority="high"
        />

        <div
          className="supper-hero__shade"
          aria-hidden="true"
        />

        <div className="supper-hero__logo">
          <AnimatedLogo />
        </div>

        <div className="supper-hero__content">
          <p className="supper-hero__description">
            Gute Rezepte, schnelle Drinks und kleine Ideen
            für Abende, an denen man einfach hängen bleibt.
          </p>

          <Link
            to="/rezepte"
            className="hero-menu-link"
          >
            <span>Rezepte entdecken</span>
            <ArrowRight
              size={22}
              strokeWidth={1.25}
              aria-hidden="true"
            />
          </Link>
        </div>

        <span
          className="supper-hero__caption"
          aria-hidden="true"
        >
          Rezepte für lange Abende
        </span>
      </section>

      <div
        style={{
          overflow: "hidden",
          backgroundColor: "var(--color-maroon)",
          paddingBlock: 4,
        }}
      >
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

      <section
        style={{
          backgroundColor: "var(--color-cream)",
          paddingBlock: 40,
        }}
      >
        <div
          className="wrap"
          style={{ marginBottom: 40 }}
        >
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Kategorien
          </h2>
        </div>

        <div
          className="categories-scroll"
          ref={catContainerRef}
        >
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
                  style={{
                    width: 140,
                    flexShrink: 0,
                    textAlign: "center",
                  }}
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
                        style={{
                          height: entry.height,
                          width: "auto",
                        }}
                        color="var(--color-ink)"
                      />
                    )}
                  </div>

                  <span
                    className="font-display"
                    style={{
                      display: "block",
                      fontSize: 22,
                      pointerEvents: "none",
                    }}
                  >
                    {cat.name}
                  </span>

                  <span
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: "var(--color-muted)",
                      pointerEvents: "none",
                    }}
                  >
                    {cat.sub}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {!loading && newestRecipes.length > 0 && (
        <section
          className="wrap"
          style={{ paddingBlock: 40 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 40,
            }}
          >
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                margin: 0,
                fontWeight: 400,
              }}
            >
              Neue Rezepte
            </h2>

            <Link
              to="/rezepte"
              style={{
                fontSize: 14,
                borderBottom: "1px solid var(--color-ink)",
              }}
            >
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
                titleSize={18}
              />
            ))}
          </div>
        </section>
      )}

      <HomeHerbarium />

      <section
        style={{
          backgroundImage: `linear-gradient(rgba(43, 18, 16, 0.45), rgba(43, 18, 16, 0.45)), url(${picnicImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingBlock: 64,
          overflow: "hidden",
        }}
      >
        <SeasonalCalendarCard />
      </section>

      <SupperPairing />

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

      <section className="wrap sticky-feature">
        <div
          className="sticky-feature-image"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />

        <div className="sticky-feature-text">
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              marginBottom: 20,
            }}
          >
            The Art of Supper.
          </h2>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              marginBottom: 20,
            }}
          >
            Gute Abende brauchen kein perfektes Menü.
            Ein paar Teller zum Teilen, Kerzen auf dem
            Tisch und Menschen, mit denen man gerne
            sitzen bleibt.
          </p>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              marginBottom: 24,
            }}
          >
            Dafür sammeln wir Rezepte, kleine Dinnerideen
            und Wissen über das, was draußen wächst.
            Zum Ausprobieren und Immer-wieder-Machen.
          </p>

          <Link
            to="/about"
            style={{
              display: "inline-block",
              fontSize: 14,
              paddingBlock: 8,
              borderBottom: "1px solid var(--color-maroon)",
            }}
          >
            Mehr über Supper Edit →
          </Link>
        </div>
      </section>

      <style>{`
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
            scroll-padding-left: 20px;
            padding-bottom: 8px;
            margin-inline: -20px;
            padding-inline: 20px;
            scrollbar-width: none;
          }

          .newest-grid::-webkit-scrollbar {
            display: none;
          }

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

        .categories-scroll::-webkit-scrollbar {
          display: none;
        }

        .categories-track {
          display: flex;
          gap: 40px;
          width: max-content;
          padding-left: max(
            clamp(20px, 5vw, 56px),
            calc((100vw - 1180px) / 2 + 56px)
          );
        }

        .statement-section {
          background-attachment: fixed;
        }

        @media (max-width: 780px) {
          .statement-section {
            background-attachment: scroll;
          }
        }

        .sticky-feature {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          padding-block: 64px;
        }

        .sticky-feature-image {
          height: clamp(280px, 36vw, 440px);
          border-radius: 16px;
          background-size: cover;
          background-position: center;
        }

        .sticky-feature-text {
          padding-block: 12px;
        }

        @media (max-width: 780px) {
          .sticky-feature {
            grid-template-columns: 1fr;
          }

          .sticky-feature-image {
            height: 320px;
          }

          .sticky-feature-text {
            padding-top: 0;
            padding-bottom: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sticky-feature-image {
            position: static !important;
          }
        }
      `}</style>
    </>
  );
}
