export interface SeasonalItem {
  name: string;
  slug: string;
}

export interface SeasonalMonth {
  month: number;
  name: string;
  items: SeasonalItem[];
}

export const seasonalCalendar: SeasonalMonth[] = [
  {
    month: 1,
    name: "Januar",
    items: [
      { name: "Grünkohl", slug: "gruenkohl" },
      { name: "Rosenkohl", slug: "rosenkohl" },
      { name: "Rote Bete", slug: "rote_beete" },
      { name: "Lauch", slug: "lauch" },
      { name: "Chicorée", slug: "chicoree" },
      { name: "Feldsalat", slug: "feldsalat" },
      { name: "Pastinaken", slug: "pastinaken" },
      { name: "Sellerie", slug: "sellerie" },
      { name: "Wirsing", slug: "wirsing" },
      { name: "Äpfel", slug: "apfel" },
    ],
  },
  {
    month: 2,
    name: "Februar",
    items: [
      { name: "Grünkohl", slug: "gruenkohl" },
      { name: "Rosenkohl", slug: "rosenkohl" },
      { name: "Rote Bete", slug: "rote_beete" },
      { name: "Lauch", slug: "lauch" },
      { name: "Chicorée", slug: "chicoree" },
      { name: "Feldsalat", slug: "feldsalat" },
      { name: "Pastinaken", slug: "pastinaken" },
      { name: "Sellerie", slug: "sellerie" },
      { name: "Wirsing", slug: "wirsing" },
      { name: "Äpfel", slug: "apfel" },
    ],
  },
  {
    month: 3,
    name: "März",
    items: [
      { name: "Spinat", slug: "spinat" },
      { name: "Radieschen", slug: "radieschen" },
      { name: "Bärlauch", slug: "baerlauch" },
      { name: "Feldsalat", slug: "feldsalat" },
      { name: "Lauch", slug: "lauch" },
      { name: "Rhabarber", slug: "rhabarber" },
      { name: "Rote Bete", slug: "rote_beete" },
    ],
  },
  {
    month: 4,
    name: "April",
    items: [
      { name: "Spargel", slug: "spargel" },
      { name: "Bärlauch", slug: "baerlauch" },
      { name: "Radieschen", slug: "radieschen" },
      { name: "Spinat", slug: "spinat" },
      { name: "Rhabarber", slug: "rhabarber" },
      { name: "Kohlrabi", slug: "kohlrabie" },
    ],
  },
  {
    month: 5,
    name: "Mai",
    items: [
      { name: "Spargel", slug: "spargel" },
      { name: "Radieschen", slug: "radieschen" },
      { name: "Rhabarber", slug: "rhabarber" },
      { name: "Kohlrabi", slug: "kohlrabie" },
      { name: "Spinat", slug: "spinat" },
      { name: "Erdbeeren", slug: "erdbeere" },
    ],
  },
  {
    month: 6,
    name: "Juni",
    items: [
      { name: "Erdbeeren", slug: "erdbeere" },
      { name: "Kirschen", slug: "kirsche" },
      { name: "Zucchini", slug: "zucchini" },
      { name: "Erbsen", slug: "erbse" },
      { name: "Kohlrabi", slug: "kohlrabie" },
      { name: "Blumenkohl", slug: "blumenkohl" },
      { name: "Spargel", slug: "spargel" },
    ],
  },
  {
    month: 7,
    name: "Juli",
    items: [
      { name: "Tomaten", slug: "tomate" },
      { name: "Gurken", slug: "gurken" },
      { name: "Zucchini", slug: "zucchini" },
      { name: "Paprika", slug: "paprika" },
      { name: "Kirschen", slug: "kirsche" },
      { name: "Johannisbeeren", slug: "johannisbeeren" },
      { name: "Heidelbeeren", slug: "heidelbeeren" },
      { name: "Aprikosen", slug: "aprikose" },
    ],
  },
  {
    month: 8,
    name: "August",
    items: [
      { name: "Tomaten", slug: "tomate" },
      { name: "Paprika", slug: "paprika" },
      { name: "Zucchini", slug: "zucchini" },
      { name: "Pflaumen", slug: "pflaumen" },
      { name: "Pfirsiche", slug: "pfirsich" },
      { name: "Brombeeren", slug: "brombeere" },
      { name: "Mais", slug: "mais" },
      { name: "Bohnen", slug: "bohne" },
    ],
  },
  {
    month: 9,
    name: "September",
    items: [
      { name: "Äpfel", slug: "apfel" },
      { name: "Birnen", slug: "birne" },
      { name: "Pflaumen", slug: "pflaumen" },
      { name: "Weintrauben", slug: "weintraube" },
      { name: "Kürbis", slug: "kuerbis" },
      { name: "Mais", slug: "mais" },
      { name: "Pilze", slug: "pilz" },
    ],
  },
  {
    month: 10,
    name: "Oktober",
    items: [
      { name: "Kürbis", slug: "kuerbis" },
      { name: "Äpfel", slug: "apfel" },
      { name: "Birnen", slug: "birne" },
      { name: "Rote Bete", slug: "rote_beete" },
      { name: "Weintrauben", slug: "weintraube" },
      { name: "Walnüsse", slug: "walnuss" },
      { name: "Pilze", slug: "pilz" },
      { name: "Grünkohl", slug: "gruenkohl" },
    ],
  },
  {
    month: 11,
    name: "November",
    items: [
      { name: "Grünkohl", slug: "gruenkohl" },
      { name: "Rosenkohl", slug: "rosenkohl" },
      { name: "Rote Bete", slug: "rote_beete" },
      { name: "Chicorée", slug: "chicoree" },
      { name: "Lauch", slug: "lauch" },
      { name: "Sellerie", slug: "sellerie" },
      { name: "Äpfel", slug: "apfel" },
    ],
  },
  {
    month: 12,
    name: "Dezember",
    items: [
      { name: "Grünkohl", slug: "gruenkohl" },
      { name: "Rosenkohl", slug: "rosenkohl" },
      { name: "Rote Bete", slug: "rote_beete" },
      { name: "Chicorée", slug: "chicoree" },
      { name: "Lauch", slug: "lauch" },
      { name: "Sellerie", slug: "sellerie" },
      { name: "Äpfel", slug: "apfel" },
    ],
  },
];