export interface IngredientItem {
  amount: string;
  name: string;
  veganAmount: string | null;
  veganName: string | null;
}

export interface IngredientGroup {
  group: string | null;
  items: IngredientItem[];
}

export interface RecipeStep {
  title: string;
  content: string;
  veganNote?: string;
}

export interface Recipe {
  slug: string;
  category: string;
  title: string;
  servings: string;
  baseServings: number | null;
  intro: string | null;
  image?: string;
  imageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  datePublished?: string;
  dateModified?: string;
  prepMinutes?: number;
  cookMinutes?: number;
  totalMinutes?: number;
  ingredientGroups: IngredientGroup[];
  steps: RecipeStep[];
  pinterestTitle?: string | null;
  pinterestDescription?: string | null;
  related: string[];
  linkedIngredients: { title: string; slug: string }[];
}
