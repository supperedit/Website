import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";

interface RecipeCardProps {
  slug: string;
  title: string;
  category: string;
  /** Resolved image URL (already sized for this context) */
  image?: string;
  /** Font size for the recipe title. Default: 20 */
  titleSize?: number;
}

/**
 * Shared recipe card used on the Home page and the Recipes listing.
 * Hover animation comes from the global `.recipe-card-hover` / `.recipe-card-image` styles.
 */
export default function RecipeCard({
  slug,
  title,
  category,
  image,
  titleSize = 20,
}: RecipeCardProps) {
  return (
    <Link to={`/rezepte/${slug}`} className="recipe-card-hover">
      <div className="recipe-card-image" style={{ aspectRatio: "3/4" }}>
        {image ? (
          <img
            src={image}
            alt={title}
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
        ) : null}
        <FavoriteButton
          slug={slug}
          title={title}
          style={{ position: "absolute", top: 10, right: 10 }}
        />
      </div>

      <span
        style={{
          display: "block",
          marginTop: 12,
          fontSize: 12,
          color: "var(--color-terracotta)",
        }}
      >
        {category}
      </span>
      <h3
        className="font-display"
        style={{ fontSize: titleSize, margin: "2px 0 0" }}
      >
        {title}
      </h3>
    </Link>
  );
}