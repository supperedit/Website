exports.handler = async () => {
  const recipes = [
    {
      Status: "aktiv",
      Slug: "cookies-schoko",
      Kategorie: "Bake Club",
      Titel: "Weiße Schoko Himbeerkekse",
      Portion: "ca. 12 Cookies",
      PortionenZahl: 1,
      Einleitung: "Cookies mit Himbeeren und weißer Schokolade",
      Bild: "",
      Zutaten: "115 g | Butter\n100 g | Zucker\n1 | Ei\n150 g | Mehl\n100 g | weiße Schokolade, gehackt\n100 g | Himbeeren, getrocknet",
      Zubereitung: "Butter cremig schlagen :: Zucker und Ei hinzufügen, gut verrühren\nMehl, Schokolade und Himbeeren unterheben :: Vorsichtig mischen\nPortionieren :: Mit Löffel auf Backblech\nBacken :: 12-15 Min bei 180°C",
      PinterestTitel: "Einfache Himbeerkekse",
      PinterestBeschreibung: "Schnelle Kekse mit Himbeeren",
      Datum: "2026-07-15"
    },
    {
      Status: "aktiv",
      Slug: "passionfruit-ginger",
      Kategorie: "Fizz & Friends",
      Titel: "Passionfruit Ginger Punch",
      Portion: "für 2 Gläser",
      PortionenZahl: 1,
      Einleitung: "Frischer, würziger Punch mit Passionsfrucht",
      Bild: "",
      Zutaten: "2 | Passionsfrüchte\n1 Stück | Ingwer (ca. 3cm), geschält\n300 ml | Wasser\n2 EL | Agave\n100 ml | Zitronensaft\nEis | zum Servieren",
      Zubereitung: "Ingwer raspeln :: Fein raspeln\nFrüchte auspressen :: Passionsfrucht auspressen\nMischen :: Alle Flüssigkeiten und Ingwer mischen, 30 Min kühlen\nServieren :: Mit Eis in Gläsern",
      PinterestTitel: "Frischer Ingwer-Punch",
      PinterestBeschreibung: "Sommerlicher Punch",
      Datum: "2026-07-15"
    },
    {
      Status: "aktiv",
      Slug: "gochujang-sesamoel",
      Kategorie: "Saucy Stuff",
      Titel: "Gochujang Sesamöl Dip",
      Portion: "ca. 250 ml",
      PortionenZahl: 1,
      Einleitung: "Würziger koreanischer Dip zu allem",
      Bild: "",
      Zutaten: "3 EL | Gochujang\n2 EL | Sesamöl\n1 EL | Agave\n1 EL | Reisessig\n1 Zehe | Knoblauch, gerieben",
      Zubereitung: "Mischen :: Alle Zutaten in einer Schüssel vermischen :: Gut verrühren bis glatt",
      PinterestTitel: "Schneller Gochujang Dip",
      PinterestBeschreibung: "Würziger Dip",
      Datum: "2026-07-15"
    }
  ];

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipes),
  };
};
