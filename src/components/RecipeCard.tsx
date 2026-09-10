import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";

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
    <Link to={`/rezepte/${slug}`} className="recipe-card-hover">
      <div className="recipe-card-image" style={{ aspectRatio: "4/5" }}>
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

      <span className="category-label" style={{ marginTop: 12 }}>
        {category}
      </span>
      <h3 style={{ fontSize: titleSize, margin: "6px 0 0" }}>
        {title}
      </h3>
    </Link>
  );
}
