exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([{
      Status: "aktiv",
      Slug: "test-rezept",
      Kategorie: "Bake Club",
      Titel: "Test Rezept",
      Portion: "2 Portionen",
      PortionenZahl: 1,
      Einleitung: "Das ist ein Test-Rezept",
      Bild: "",
      Zutaten: "100 g | Zucker\n50 g | Butter",
      Zubereitung: "Test :: Das ist ein Test"
    }])
  };
};
