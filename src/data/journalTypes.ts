export interface JournalEntry {
  slug: string;
  title: string;
  category: string;
  season: string | null;
  intro: string | null;
  background: string | null;
  funFact: string | null;
  tastingNotes: string | null;
  image?: string;
  linkedRecipes: string[];
  latinName: string | null;
  plantFamily: string | null;
  typ: string | null;
  bloomTime: string | null;
  location: string | null;
  appearance: string | null;
  healing: string | null;
  temperament: string | null;
}
