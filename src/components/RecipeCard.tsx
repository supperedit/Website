import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";
import "../styles/collection-cards.css";

interface RecipeCardProps {
  slug: string;
  title: string;
  category: string;
  image?: string;
  titleSize?: number;
}

export default function RecipeCard({
  slug,
  title,
  category,
  image,
  titleSize = 20,
}: RecipeCardProps) {
  return (
    <Link
      to={`/rezepte/${slug}`}
      className="recipe-card-hover collection-card"
    >
      <div
        className="recipe-card-image"
        style={{ aspectRatio: "4/5" }}
      >
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
          style={{
            position: "absolute",
            top: 10,
            right: 10,
          }}
        />
      </div>

      <div className="recipe-card-caption">
        <span className="recipe-card-category">
          {category}
        </span>
        <h3 style={{ fontSize: titleSize }}>
          {title}
        </h3>
      </div>
    </Link>
  );
}
