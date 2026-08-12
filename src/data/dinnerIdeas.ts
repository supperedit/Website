export interface DinnerIdea {
  month: number;
  day: number;
  title: string;
  subtitle?: string;
  idea: string;
  onTheTable?: string[];
  drink?: string;
  afterDinner?: string[];
  kochen?: string[];
}

export const dinnerIdeas: DinnerIdea[] = [
  {
    month: 1,
    day: 3,
    title: "Soup & Stories Night",
    subtitle: "A cozy winter evening",
    idea:
      "Ein Abend für große Töpfe, frisch gebackenes Brot und lange Gespräche. Perfekt für kalte Tage, an denen man einfach zusammen am Tisch sitzen möchte.",
    onTheTable: [
      "Kürbissuppe",
      "Kartoffel-Lauch-Suppe",
      "Sauerteigbrot",
      "Zimtschnecken",
    ],
    drink:
      "Heiße Schokolade oder hausgemachter Apfelpunsch",
    afterDinner: [
      "Brettspiele spielen",
      "Ein Puzzle zusammen machen",
      "Einen gemütlichen Filmabend starten",
    ],
  },

  {
    month: 1,
    day: 6,
    title: "Three Kings Dinner",
    subtitle: "A winter celebration",
    idea:
      "Ein festlicher Jahresauftakt inspiriert vom Dreikönigstag – mit süßem Gebäck, kleinen Traditionen und einem entspannten Winterabend.",
    onTheTable: [
      "Königskuchen",
      "Hefezopf",
      "Orangen-Desserts",
      "Warme Ofengerichte",
    ],
    drink:
      "Orangenpunsch oder ein winterlicher Spritz",
    afterDinner: [
      "Alte Spiele aus dem Schrank holen",
      "Gemeinsam Geschichten erzählen",
      "Den Abend langsam ausklingen lassen",
    ],
  },

  {
    month: 1,
    day: 31,
    title: "Citrus Season",
    subtitle: "A bright winter dinner",
    idea:
      "Ein heller Winterabend, der mit Zitrusfrüchten Farbe in die dunkle Jahreszeit bringt.",
    onTheTable: [
      "Zitronenpasta",
      "Fenchel-Orangen-Salat",
      "Lemon Cake",
    ],
    drink:
      "Limoncello Spritz oder Zitronen-Ingwer-Limonade",
    afterDinner: [
      "Eine Playlist zusammenstellen",
      "Noch lange am Tisch sitzen",
      "Ein Kartenspiel spielen",
    ],
  },
  {
    month: 2,
    day: 2,
    title: "La Chandeleur",
    subtitle: "A French crêpe evening",
    idea:
      "Ein französischer Abend, an dem Crêpes gemeinsam am Tisch gefüllt, geteilt und neu kombiniert werden. Einfach, gemütlich und perfekt für einen kalten Winterabend.",
    onTheTable: [
      "Herzhafte Galettes",
      "Süße Crêpes",
      "Karamellisierte Früchte",
      "Schokolade",
    ],
    drink:
      "Café au lait oder heiße Schokolade",
    afterDinner: [
      "Jeder kreiert seine eigene Crêpe-Kombination",
      "Ein französischer Filmabend",
      "Gemeinsam ein Kartenspiel spielen",
    ],
  },

  {
    month: 2,
    day: 13,
    title: "Galentine's Dinner",
    subtitle: "A night for friendship",
    idea:
      "Ein Abend für Lieblingsmenschen, gutes Essen und Zeit miteinander – ganz ohne besonderen Anlass außer der Freude, zusammen zu sein.",
    onTheTable: [
      "Pasta zum Teilen",
      "Kleine Snacks",
      "Ein Dessert für alle",
    ],
    drink:
      "Rosé Spritz oder alkoholfreier Aperitif",
    afterDinner: [
      "Lieblingsfilme schauen",
      "Gemeinsam Fotos anschauen",
      "Eine lange Playlist laufen lassen",
    ],
  },

  {
    month: 2,
    day: 14,
    title: "Valentine's Dinner",
    subtitle: "A dinner for everyone you love",
    idea:
      "Ein Abend, der nicht nur Paaren gehört. Eine Gelegenheit, gutes Essen und Menschen, die einem wichtig sind, zu feiern.",
    onTheTable: [
      "Herzpasta",
      "Cremiges Risotto",
      "Schokoladendessert",
    ],
    drink:
      "Kir Royale oder ein besonderer alkoholfreier Drink",
    afterDinner: [
      "Ein gemeinsames Dessert teilen",
      "Eine Runde Brettspiele spielen",
      "Noch lange bei Kerzenlicht sitzen",
    ],
  },

  {
    month: 3,
    day: 8,
    title: "First Signs of Spring",
    subtitle: "A fresh start",
    idea:
      "Der erste Abend, an dem der Winter langsam verschwindet und frische Kräuter, Gemüse und leichte Gerichte zurück auf den Tisch kommen.",
    onTheTable: [
      "Kräuterpasta",
      "Frühlingssalat",
      "Radieschen",
      "Frisches Brot",
    ],
    drink:
      "Holunderblüten-Schorle oder Kräuterlimonade",
    afterDinner: [
      "Den ersten Abend wieder draußen verbringen",
      "Einen Spaziergang nach dem Essen machen",
      "Frische Blumen vom Markt mitbringen",
    ],
  },

  {
    month: 3,
    day: 17,
    title: "St. Patrick's Supper",
    subtitle: "An Irish-inspired evening",
    idea:
      "Eine gemütliche Interpretation des irischen Feiertags – weniger Party, mehr gemeinsames Essen und herzhafte Gerichte.",
    onTheTable: [
      "Soda Bread",
      "Kartoffelgerichte",
      "Herzhafte Pies",
    ],
    drink:
      "Irish Coffee oder Ginger Ale mit Limette",
    afterDinner: [
      "Irische Musik hören",
      "Eine Runde Karten spielen",
      "Gemeinsam ein Dessert teilen",
    ],
  },

  {
    month: 3,
    day: 28,
    title: "Pasta Primavera",
    subtitle: "The first taste of spring",
    idea:
      "Ein italienischer Frühlingsabend mit den ersten frischen Zutaten der Saison – leicht, bunt und voller Vorfreude auf wärmere Tage.",
    onTheTable: [
      "Pasta mit Erbsen",
      "Spargel",
      "Frische Kräuter",
      "Zitrone",
    ],
    drink:
      "Weißwein oder Zitronen-Spritz",
    afterDinner: [
      "Ein Dessert langsam teilen",
      "Eine Frühlingsplaylist hören",
      "Den Abend mit Freunden verlängern",
    ],
  },
  
  {
    month: 4,
    day: 4,
    title: "Easter Baking Day",
    subtitle: "A spring baking tradition",
    idea:
      "Ein gemütlicher Frühlingstag rund ums gemeinsame Backen, Kaffeetrinken und kleine Traditionen, die jedes Jahr wiederkommen.",
    onTheTable: [
      "Hefezopf",
      "Osterkuchen",
      "Kleine Gebäcke",
      "Frühlingshafte Desserts",
    ],
    drink:
      "Kaffee, Tee oder selbstgemachte Zitronenlimonade",
    afterDinner: [
      "Zusammen backen",
      "Einen Frühlingsspaziergang machen",
      "Ostereier verstecken oder suchen",
    ],
  },

  {
    month: 4,
    day: 12,
    title: "First Picnic",
    subtitle: "The first meal outside",
    idea:
      "Der erste Abend draußen nach dem Winter – mit einfachen Gerichten, einer Decke und dem Gefühl, dass die warme Jahreszeit endlich beginnt.",
    onTheTable: [
      "Focaccia",
      "Dips",
      "Quiche",
      "Kleine Kuchen",
    ],
    drink:
      "Hausgemachte Limonade oder Eistee",
    afterDinner: [
      "Eine Runde Karten spielen",
      "Den Sonnenuntergang anschauen",
      "Noch draußen sitzen, solange es geht",
    ],
  },

  {
    month: 4,
    day: 25,
    title: "Asparagus Season",
    subtitle: "The first spring classic",
    idea:
      "Ein Abend zu Ehren eines der schönsten Frühlingsboten: Spargel, frisch, unkompliziert und voller Saisongefühl.",
    onTheTable: [
      "Spargel mit Kartoffeln",
      "Spargel-Tarte",
      "Spargelpasta",
    ],
    drink:
      "Weißwein oder eine leichte Kräuterlimonade",
    afterDinner: [
      "Ein Dessert langsam teilen",
      "Einen Spaziergang nach dem Essen machen",
      "Den Abend mit Freunden verlängern",
    ],
  },
  
  {
    month: 5,
    day: 15,
    title: "Dinner in Bloom",
    subtitle: "A spring garden evening",
    idea:
      "Ein Abend, der den Frühling feiert – mit frischen Zutaten, ersten warmen Temperaturen und einfachen Gerichten, die man gerne teilt.",
    onTheTable: [
      "Focaccia",
      "Frühlingssalate",
      "Herzhafte Tartes",
      "Kleine Dips",
    ],
    drink:
      "Hausgemachte Zitronenlimonade oder ein leichter Spritz",
    afterDinner: [
      "Noch lange draußen sitzen",
      "Eine Runde Boule oder Karten spielen",
      "Gemeinsam Musik hören",
    ],
  },

  {
    month: 5,
    day: 24,
    title: "Strawberry Season",
    subtitle: "The first taste of summer",
    idea:
      "Ein Abend, der nach den ersten Sommertagen schmeckt – mit süßen Erdbeeren, leichten Gerichten und ganz viel Vorfreude auf warme Abende.",
    onTheTable: [
      "Erdbeer-Tiramisu",
      "Erdbeersalat",
      "Kleine Kuchen",
    ],
    drink:
      "Erdbeer-Limonade mit Minze oder Rosé",
    afterDinner: [
      "Ein Picknick daraus machen",
      "Eine Runde Badminton spielen",
      "Den Sonnenuntergang anschauen",
    ],
  },

  {
    month: 5,
    day: 29,
    title: "Fête des Voisins",
    subtitle: "A French neighborhood dinner",
    idea:
      "Inspiriert vom französischen Nachbarschaftsfest: Jeder bringt etwas mit und aus vielen kleinen Gerichten wird ein gemeinsamer Abend.",
    onTheTable: [
      "Quiches",
      "Salate",
      "Baguette",
      "Kleine Desserts",
    ],
    drink:
      "Französische Limonade oder Wein",
    afterDinner: [
      "Lange Gespräche am Tisch",
      "Gemeinsam Spiele spielen",
      "Dessert teilen",
    ],
  },


  {
    month: 6,
    day: 19,
    title: "Midsummer Supper",
    subtitle: "A Scandinavian summer evening",
    idea:
      "Ein Abend inspiriert vom schwedischen Mittsommer – mit Blumen, Erdbeeren und dem Gefühl, dass die Tage nie enden.",
    onTheTable: [
      "Neue Kartoffeln",
      "Kräutergerichte",
      "Erdbeerkuchen",
      "Leichte Salate",
    ],
    drink:
      "Holunderblüten-Spritz oder Beerenlimonade",
    afterDinner: [
      "Draußen bleiben, bis es dunkel wird",
      "Eine Playlist für den Sommer hören",
      "Eine Runde Kartenspiele spielen",
    ],
  },

  {
    month: 6,
    day: 21,
    title: "Summer Solstice Supper",
    subtitle: "The longest evening of the year",
    idea:
      "Der längste Tag des Jahres verdient ein Essen unter freiem Himmel – unkompliziert, entspannt und voller Sommergefühl.",
    onTheTable: [
      "Grillgemüse",
      "Frisches Brot",
      "Große Salate",
      "Sommerdesserts",
    ],
    drink:
      "Eisgekühlte Limonade oder ein Sommer-Spritz",
    afterDinner: [
      "Eine Decke auslegen und den Abend verlängern",
      "Den Sonnenuntergang anschauen",
      "Barfuß draußen sitzen",
    ],
  },

  {
    month: 6,
    day: 27,
    title: "Picnic at Sunset",
    subtitle: "Dinner outside",
    idea:
      "Ein Abend auf einer Decke mit einfachen Gerichten, guten Gesprächen und dem Gefühl, nirgendwo anders sein zu müssen.",
    onTheTable: [
      "Focaccia-Sandwiches",
      "Dips",
      "Obst",
      "Cookies",
    ],
    drink:
      "Selbstgemachte Limonade oder Eistee",
    afterDinner: [
      "Sterne anschauen",
      "Karten spielen",
      "Eine Playlist teilen",
    ],
  },


  {
    month: 7,
    day: 8,
    title: "Italian Summer Night",
    subtitle: "An evening in Italy",
    idea:
      "Ein langer Sommerabend inspiriert von italienischen Essenstraditionen – mit kleinen Gerichten, viel Zeit und wenig Eile.",
    onTheTable: [
      "Antipasti",
      "Pasta",
      "Zitronendesserts",
    ],
    drink:
      "Aperol Spritz oder Limoncello Spritz",
    afterDinner: [
      "Espresso nach dem Essen",
      "Eine Runde Karten spielen",
      "Noch lange zusammensitzen",
    ],
  },

  {
    month: 7,
    day: 18,
    title: "Peak Tomato Season",
    subtitle: "The tomato deserves a dinner",
    idea:
      "Ein Abend, an dem die besten Tomaten des Jahres die Hauptrolle spielen – frisch, unkompliziert und voller Sommergeschmack.",
    onTheTable: [
      "Pasta al Pomodoro",
      "Tomaten-Focaccia",
      "Caprese",
    ],
    drink:
      "Basilikum-Limonade oder ein leichter Rotwein",
    afterDinner: [
      "Draußen essen",
      "Sommermusik hören",
      "Noch eine Runde Karten spielen",
    ],
  },

  {
    month: 7,
    day: 26,
    title: "Peaches & Burrata",
    subtitle: "A late summer table",
    idea:
      "Süß, cremig und unkompliziert: Ein Abend, der die schönsten Zutaten des Sommers feiert.",
    onTheTable: [
      "Pfirsich-Burrata-Salat",
      "Pasta",
      "Crumble",
    ],
    drink:
      "Pfirsich-Eistee oder Weißwein",
    afterDinner: [
      "Eine kleine Fahrradtour vor dem Essen",
      "Den Abend draußen verlängern",
      "Gemeinsam ein Dessert teilen",
    ],
  },

  {
    month: 8,
    day: 2,
    title: "Mediterranean Picnic",
    subtitle: "A holiday feeling at home",
    idea:
      "Ein Abend wie ein kleiner Urlaub ohne Reise – mit mediterranen Aromen, einfachen Gerichten und viel Zeit draußen.",
    onTheTable: [
      "Oliven",
      "Dips",
      "Focaccia",
      "Gegrilltes Gemüse",
    ],
    drink:
      "Limoncello Spritz oder Zitronenwasser mit Kräutern",
    afterDinner: [
      "Eine Runde Karten spielen",
      "Musik aus dem Urlaub hören",
      "Den Abend unter freiem Himmel verlängern",
    ],
  },

  {
    month: 8,
    day: 15,
    title: "Greek Island Night",
    subtitle: "A summer dinner by the sea",
    idea:
      "Inspiriert von griechischen Sommerabenden: viele kleine Gerichte, frische Zutaten und gemeinsames Essen ohne Eile.",
    onTheTable: [
      "Mezze",
      "Gefülltes Gemüse",
      "Tzatziki",
      "Zitronenkuchen",
    ],
    drink:
      "Mastiha Spritz oder griechischer Wein",
    afterDinner: [
      "Eine große Schüssel Eis teilen",
      "Griechische Musik hören",
      "Noch lange zusammensitzen",
    ],
  },

  {
    month: 8,
    day: 29,
    title: "Late Summer Harvest",
    subtitle: "The last days of summer",
    idea:
      "Ein Abend, der die letzten Sommerzutaten feiert, bevor der Herbst beginnt – bunt, frisch und unkompliziert.",
    onTheTable: [
      "Mais-Salat",
      "Zucchini-Tarte",
      "Gegrilltes Gemüse",
    ],
    drink:
      "Pfirsich-Eistee oder ein leichter Spritz",
    afterDinner: [
      "Ein letztes Picknick im Garten",
      "Sonnenuntergang anschauen",
      "Sommerfotos anschauen",
    ],
  },


  {
    month: 9,
    day: 5,
    title: "Sunday Reset Dinner",
    subtitle: "Back to routine",
    idea:
      "Nach dem Sommer wieder alle an einen Tisch bringen – mit einfachen Lieblingsgerichten und Zeit zum Ankommen.",
    onTheTable: [
      "Lieblingspasta",
      "Große Salate",
      "Selbst gebackenes Brot",
    ],
    drink:
      "Hausgemachte Limonade oder ein Glas Wein",
    afterDinner: [
      "Gemeinsam die kommende Woche planen",
      "Ein Brettspiel spielen",
      "Einen gemütlichen Filmabend machen",
    ],
  },

  {
    month: 9,
    day: 19,
    title: "Apple Picking Dinner",
    subtitle: "An autumn harvest evening",
    idea:
      "Ein Abend inspiriert von der Apfelernte – mit süßen und herzhaften Rezepten und den ersten Zeichen des Herbstes.",
    onTheTable: [
      "Apfelkuchen",
      "Apfel-Zwiebel-Tarte",
      "Desserts mit Äpfeln",
    ],
    drink:
      "Apfelschorle, Cider oder warmer Apfelpunsch",
    afterDinner: [
      "Einen Herbstspaziergang machen",
      "Zusammen backen",
      "Ein Puzzle oder Brettspiel starten",
    ],
  },

  {
    month: 9,
    day: 27,
    title: "Harvest Feast",
    subtitle: "Celebrating the season",
    idea:
      "Ein Abend, um die Fülle des Jahres zu feiern – mit saisonalen Zutaten, großen Schüsseln und Essen zum Teilen.",
    onTheTable: [
      "Kürbis",
      "Brot",
      "Äpfel",
      "Saisonale Kuchen",
    ],
    drink:
      "Federweißer oder Apfel-Cider",
    afterDinner: [
      "Eine lange Tafelrunde",
      "Spieleabend",
      "Den Abend mit Kerzen ausklingen lassen",
    ],
  },


  {
    month: 10,
    day: 10,
    title: "Pumpkin Season",
    subtitle: "A cozy autumn dinner",
    idea:
      "Ein Herbstabend ganz im Zeichen des Kürbisses – warm, gemütlich und perfekt für die ersten dunklen Abende.",
    onTheTable: [
      "Kürbisrisotto",
      "Kürbis-Pasta",
      "Kürbiskuchen",
    ],
    drink:
      "Warmer Apfelpunsch oder Pumpkin Spice Latte",
    afterDinner: [
      "Einen Filmklassiker schauen",
      "Brettspiele spielen",
      "Den Abend gemütlich ausklingen lassen",
    ],
  },

  {
    month: 10,
    day: 18,
    title: "Mushroom Evening",
    subtitle: "A forest-inspired dinner",
    idea:
      "Ein Abend inspiriert von Waldspaziergängen, Pilzen und den ersten richtig gemütlichen Herbsttagen.",
    onTheTable: [
      "Pilzpasta",
      "Pilzrisotto",
      "Pilz-Tarte",
    ],
    drink:
      "Apfel-Cider oder Kräutertee",
    afterDinner: [
      "Eine Runde Brettspiele spielen",
      "Herbstfilme schauen",
      "Mit Tee auf dem Sofa sitzen",
    ],
  },

  {
    month: 10,
    day: 31,
    title: "Halloween Supper",
    subtitle: "An elegant Halloween evening",
    idea:
      "Eine erwachsene Version von Halloween – weniger Kostüm, mehr gutes Essen, dunkle Farben und ein gemütlicher Herbstabend.",
    onTheTable: [
      "Kürbisgerichte",
      "Dunkle Schokolade",
      "Kleine Snacks",
    ],
    drink:
      "Gewürzter Apfel-Cocktail oder alkoholfreier Punch",
    afterDinner: [
      "Einen Gruselfilm schauen",
      "Süßigkeiten teilen",
      "Eine Spieleabend-Runde machen",
    ],
  },

  {
    month: 11,
    day: 4,
    title: "Pasta Weather",
    subtitle: "A cozy dinner at home",
    idea:
      "Wenn die Tage kürzer werden, braucht es Gerichte, die wärmen und einen langen Abend zuhause perfekt machen.",
    onTheTable: [
      "Lasagne",
      "Pasta al forno",
      "Cremige Ofengerichte",
    ],
    drink:
      "Rotwein oder eine warme Kräuterlimonade",
    afterDinner: [
      "Einen Filmklassiker schauen",
      "Ein Brettspiel spielen",
      "Mit Tee auf dem Sofa sitzen",
    ],
  },

  {
    month: 11,
    day: 21,
    title: "Friendsgiving",
    subtitle: "A dinner for friends",
    idea:
      "Ein Abend für Dankbarkeit, Freundschaft und gemeinsames Kochen – ohne festgelegte Traditionen, einfach mit den Menschen, die man gerne um sich hat.",
    onTheTable: [
      "Ofengerichte",
      "Herzhafte Beilagen",
      "Pie",
      "Comfort Food",
    ],
    drink:
      "Cranberry Spritz oder Apfel-Cider",
    afterDinner: [
      "Lange Gespräche am Tisch",
      "Ein Gesellschaftsspiel spielen",
      "Reste gemeinsam einpacken",
    ],
  },

  {
    month: 11,
    day: 28,
    title: "Pie Night",
    subtitle: "Sweet & savory pies",
    idea:
      "Ein gemütlicher Abend rund um herzhafte und süße Pies – perfekt für kalte Tage und lange Gespräche.",
    onTheTable: [
      "Gemüse-Pie",
      "Apple Pie",
      "Kleine Tartes",
    ],
    drink:
      "Tee, Kaffee oder warmer Apfelsaft mit Gewürzen",
    afterDinner: [
      "Zusammen backen",
      "Ein Puzzle anfangen",
      "Einen gemütlichen Spieleabend machen",
    ],
  },


  {
    month: 12,
    day: 5,
    title: "Cookie Exchange",
    subtitle: "A sweet winter tradition",
    idea:
      "Ein Abend, an dem Lieblingsplätzchen geteilt werden und aus Backen eine kleine Wintertradition entsteht.",
    onTheTable: [
      "Cookies",
      "Lebkuchen",
      "Zimtsterne",
    ],
    drink:
      "Heiße Schokolade oder Glühpunsch",
    afterDinner: [
      "Weihnachtsmusik hören",
      "Plätzchen gemeinsam probieren",
      "Einen Weihnachtsfilm schauen",
    ],
  },

  {
    month: 12,
    day: 13,
    title: "Lucia Night",
    subtitle: "A Scandinavian winter evening",
    idea:
      "Ein Abend inspiriert vom schwedischen Lichterfest – ruhig, warm und voller kleiner Wintermomente.",
    onTheTable: [
      "Safrangebäck",
      "Zimtschnecken",
      "Warme Desserts",
    ],
    drink:
      "Glögg oder warme Gewürzmilch",
    afterDinner: [
      "Kerzen anzünden und Musik hören",
      "Wintergeschichten teilen",
      "Gemeinsam backen",
    ],
  },

  {
    month: 12,
    day: 27,
    title: "Between the Years Supper",
    subtitle: "A relaxed holiday dinner",
    idea:
      "Ein entspanntes Festessen zwischen den Jahren – ohne Weihnachtsstress, einfach gutes Essen und Zeit miteinander.",
    onTheTable: [
      "Kleine Menüs",
      "Ofengerichte",
      "Desserts zum Teilen",
    ],
    drink:
      "Ein besonderer Winterdrink oder alkoholfreier Spritz",
    afterDinner: [
      "Spieleabend",
      "Jahresrückblick mit Freunden",
      "Gemeinsam Filme schauen",
    ],
  },
];