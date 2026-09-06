export interface JournalEntry {
  slug: string;
  title: string;
  category: string;
  season: string | null;
  intro: string | null;
  background: string | null;
  funFact: string | null;
  tastingNotes: string | null;
  myNote: string | null;
  image?: string;
  linkedRecipes: string[];
}
