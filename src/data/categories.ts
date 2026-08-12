export interface Category {
  slug: string;
  name: string;
  sub: string;
}

export const categories: Category[] = [
  { slug: "cookie", name: "Bake Club", sub: "Cookies & süße Kleinigkeiten" },
  { slug: "swirl", name: "Swirl Society", sub: "Zimtschnecken & süßes Hefegebäck" },
  { slug: "saucy", name: "Saucy Stuff", sub: "Soßen, Dips & Aufstriche" },
  { slug: "pickle", name: "Pickle & Ferment", sub: "Fermentiertes & Eingelegtes" },
  { slug: "fizz", name: "Fizz & Friends", sub: "Getränke & alkoholfreie Drinks" },
  { slug: "bites", name: "Small Bites", sub: "Snacks & kleine Gerichte" },
  { slug: "bread", name: "Bread & Butter", sub: "Brot & Aufstriche" },
  { slug: "pasta", name: "Pasta Night", sub: "Pasta & italienische Klassiker" },
];