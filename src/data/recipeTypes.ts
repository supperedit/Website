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
  ingredientGroups: IngredientGroup[];
  steps: RecipeStep[];
}