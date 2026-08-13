export interface Category {
  slug: string;
  name: string;
  sub: string;
}

export const categories: Category[] = [
  { 
    slug: "cookie", 
    name: "Bake Club", 
    sub: "Cookies, Kuchen & Gebäck" 
  },
  { 
    slug: "swirl", 
    name: "Swirl Society", 
    sub: "Zimtschnecken & Hefegebäck" 
  },
  { 
    slug: "saucy", 
    name: "Saucy Stuff", 
    sub: "Saucen, Dips & Dressings" 
  },
  { 
    slug: "pickle", 
    name: "Pickle & Ferment", 
    sub: "Pickles & Fermentiertes" 
  },
  { 
    slug: "fizz", 
    name: "Fizz & Friends", 
    sub: "Limonaden, Sodas & Mocktails" 
  },
  { 
    slug: "bites", 
    name: "Small Bites", 
    sub: "Snacks, Crostini & Vorspeisen" 
  },
  { 
    slug: "bread", 
    name: "Bread & Butter", 
    sub: "Brot, Butter & Aufstriche" 
  },
  { 
    slug: "pasta", 
    name: "Pasta Night", 
    sub: "Pasta & schnelle Abendessen" 
  },
  { 
    slug: "slow-sips", 
    name: "Slow Sips", 
    sub: "Matcha, Kaffee & Café-Drinks" 
  },
  { 
    slug: "pantry", 
    name: "Pantry Edit", 
    sub: "Sirups, Öle & Vorräte" 
  },
];
