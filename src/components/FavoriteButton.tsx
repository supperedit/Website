import { Heart } from "lucide-react";
import { useFavorites } from "../data/useFavorites";

interface FavoriteButtonProps {
  slug: string;
  title: string;
  size?: number;
  style?: React.CSSProperties;
}

export default function FavoriteButton({ slug, title, size = 18, style }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(slug);
      }}
      aria-pressed={active}
      aria-label={active ? `${title} von der Merkliste entfernen` : `${title} merken`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(247, 246, 236, 0.9)",
        border: "none",
        borderRadius: "50%",
        width: size + 18,
        height: size + 18,
        cursor: "pointer",
        flexShrink: 0,
        ...style,
      }}
    >
      <Heart
        size={size}
        color="var(--color-terracotta)"
        fill={active ? "var(--color-terracotta)" : "none"}
        aria-hidden="true"
      />
    </button>
  );
}
