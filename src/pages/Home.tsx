import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, Shuffle } from "lucide-react";
import { useRecipes } from "../data/useRecipes";
import type { Recipe } from "../data/recipeTypes";
import FavoriteButton from "../components/FavoriteButton";
import { categories } from "../data/categories";
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


const marqueeText = "Recipes for people who don’t follow recipes. ";

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

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { recipes, loading, error } = useRecipes();
  const [suggestion, setSuggestion] = useState<Recipe | null>(null);

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

      {/* Hero */}
      <section style={{ position: "relative", minHeight: "100svh", display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
        <img src={heroImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", backgroundColor: "var(--color-ink)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(20,8,4,0.0)" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", paddingBottom: 48 }}>
          <AnimatedLogo />
          
        </div>
      </section>

      {/* Marquee */}
      <div style={{ overflow: "hidden", backgroundColor: "var(--color-maroon)", paddingBlock: 4 }}>
  <div style={{ display: "flex", width: "max-content", whiteSpace: "nowrap", animation: "marquee-scroll 26s linear infinite" }}>
    <span 
      className="font-body font-[Elms_Sans] text-center" 
      style={{ 
        color: "var(--color-cream)", 
        fontSize: 12, 
        fontStyle: "thin 100", 
        letterSpacing: "0.08em",
        paddingInline: 40 
      }}
    >
      {marqueeText.repeat(4)}
    </span>

    <span 
      className="font-body" 
      style={{ 
        color: "var(--color-cream)", 
        fontSize: 12, 
        fontStyle: "thin 100",
        letterSpacing: "0.08em",
        paddingInline: 40 
      }}
    >
      {marqueeText.repeat(3)}
    </span>
  </div>
</div>

            {/* Categories */}
      <section style={{ backgroundColor: "var(--color-cream)", paddingBlock: 40 }}>
        <div>
          <div className="wrap" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 40 }}>
            <h2 className="font-display text-center" style={{ fontSize: 36, margin: 0 }}>Kategorien</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => scrollRef.current?.scrollBy({ left: -220, behavior: "smooth" })} style={{ width: 32, height: 32, border: "none", background: "none", cursor: "pointer" }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => scrollRef.current?.scrollBy({ left: 220, behavior: "smooth" })} style={{ width: 32, height: 32, border: "none", background: "none", cursor: "pointer" }}>
                <ChevronLeft size={14} style={{ transform: "rotate(180deg)" }} />
              </button>
            </div>
          </div>
 
          <div
            ref={scrollRef}
            className="categories-scroll"
            style={{
              display: "flex",
              gap: 40,
              overflowX: "auto",
              paddingBottom: 4,
              paddingLeft: "max(clamp(20px, 5vw, 56px), calc((100vw - 1180px) / 2 + 56px))",
            }}
          >
            {categories.map((cat) => {
              const entry = categoryIcons[cat.slug];
              const Icon = entry.Icon;
              return (
                <Link key={cat.slug} to={`/rezepte?kategorie=${cat.slug}`} className="cat-link" style={{ width: 140, flexShrink: 0, textAlign: "center" }}>
                  <div style={{ height: 100, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon className="cat-icon" style={{ height: entry.height, width: "auto" }} color="var(--color-ink)" />
                  </div>
                  <span className="font-display" style={{ display: "block", fontSize: 22 }}>{cat.name}</span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--color-muted)" }}>{cat.sub}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

            {/* Latest recipes */}
      <section className="wrap" style={{ paddingBlock: 40 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: 36, margin: 0 }}>Neue Rezepte</h2>
          <Link to="/rezepte" style={{ fontSize: 14, borderBottom: "1px solid var(--color-ink)" }}>Alle ansehen</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 28 }}>
          {recipes.slice(-4).reverse().map((r) => (
            <Link key={r.slug} to={`/rezepte/${r.slug}`} className="recipe-card-hover">
              <div
                className="recipe-card-image"
                style={{
                  position: "relative",
                  aspectRatio: "3/4",
                  borderRadius: 12,
                  backgroundColor: r.image ? "transparent" : "var(--color-dusty-blue)",
                  backgroundImage: r.image ? `url(${r.image})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <FavoriteButton slug={r.slug} title={r.title} style={{ position: "absolute", top: 10, right: 10 }} />
              </div>
              <span style={{ display: "block", marginTop: 12, fontSize: 12, color: "var(--color-terracotta)" }}>{r.category}</span>
              <h3 className="font-display" style={{ fontSize: 24, margin: 0 }}>{r.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Saisonkalender, mit Bild-Hintergrund (Platzhalter: Hero-Bild, später eigenes Motiv) */}
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


      {/* Sticky Bild, Text läuft daneben durch */}
      <section className="wrap sticky-feature">
        <div className="sticky-feature-image" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="sticky-feature-text">
          <p className="font-display" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: 10 }}>
            The Art of Supper.
          </p>
          <p style={{ color: "var(--color-maroon)", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
            Supper ist mehr als nur ein Abendessen. Es beschreibt diese <strong>entspannten Abende</strong>, an denen
            Menschen zusammenkommen, sich Zeit füreinander nehmen und Essen teilen.
          </p>
          <p style={{ color: "var(--color-maroon)", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
            Genau darum geht es bei <strong>Supper Edit</strong>.
          </p>
          <p style={{ color: "var(--color-maroon)", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
            Nicht um das perfekte Menü oder stundenlange Vorbereitung. Sondern um <strong>einfache Rezepte,
            saisonale Zutaten und kleine Ideen</strong> für Tisch, Deko und Anrichten, die aus einem
            gewöhnlichen Abend etwas Besonderes machen. Oft reichen ein paar Teller zum Teilen,
            Kerzen auf dem Tisch und <strong>die richtigen Menschen</strong>, damit aus einem Dienstagabend ein Anlass wird.
          </p>
          <p style={{ color: "var(--color-maroon)", fontSize: 15, lineHeight: 1.8 }}>
            Denn die schönsten Dinner entstehen nicht durch Perfektion, sondern durch
            <strong> die Menschen, die daran sitzen</strong>.
          </p>
        </div>
      </section>


      {/* Statement, mit Bild-Hintergrund (Platzhalter: Hero-Bild, später eigenes Motiv) */}
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
        <p className="font-display" style={{ fontStyle: "italic", fontSize: "clamp(1.6rem, 4vw, 2.6rem)", maxWidth: 720, margin: "0 auto", position: "relative", color: "var(--color-cream)" }}>
          Recipes worth making twice.
        </p>
      </section>

            {/* Random recipe picker */}
      {suggestion && (
      <section style={{ backgroundColor: "var(--color-sky)", paddingBlock: 72 }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-maroon)", marginBottom: 12 }}>
            Keine Ahnung was heute?
          </p>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--color-maroon)", margin: "0 0 32px" }}>
            Lass dir was vorschlagen
          </h2>

          <div
            style={{
              maxWidth: 420,
              margin: "0 auto",
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 28,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--color-terracotta)" }}>{suggestion.category}</span>
            <p className="font-display" style={{ fontSize: 26, margin: "8px 0 20px" }}>{suggestion.title}</p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
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
                Rezept ansehen <ArrowRight size={13} />
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
                <Shuffle size={13} className="shuffle-icon" /> anderes Rezept
              </button>
            </div>
          </div>
        </div>
      </section>
      )}

      <style>{`
        .categories-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .categories-scroll::-webkit-scrollbar {
          display: none;
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
        .sticky-feature-text {
          padding-top: 10vh;
          padding-bottom: 10vh;
        }
        @media (max-width: 780px) {
          .sticky-feature { grid-template-columns: 1fr; }
          .sticky-feature-image { position: static; height: 50vh; }
          .sticky-feature-text { padding-top: 0; padding-bottom: 0; }
        }

        .recipe-card-hover .recipe-card-image {
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
        }
        .recipe-card-hover:hover .recipe-card-image {
          transform: translateY(-4px) scale(1.015);
          box-shadow: 0 16px 32px rgba(43, 18, 16, 0.18);
        }

        .shuffle-icon {
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        button:active .shuffle-icon {
          transform: rotate(180deg);
        }

        @media (prefers-reduced-motion: reduce) {
          .sticky-feature-image { position: static !important; }
          .recipe-card-hover .recipe-card-image,
          .shuffle-icon {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}