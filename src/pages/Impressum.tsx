export default function Impressum() {
  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "64px 24px", lineHeight: 1.7 }}>
      <h1 style={{ marginBottom: 40 }}>Impressum</h1>

      <section style={{ marginBottom: 40 }}>
        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
          Amy Djuritschek<br />
          Schubertstr. 42<br />
          90530 Wendelstein
        </p>
        <p>
          <strong>Kontakt</strong><br />
          E-Mail: <a href="mailto:suppereditclub@gmail.com">suppereditclub@gmail.com</a>
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>Verantwortlich für den Inhalt</h2>
        <p>Amy Djuritschek (Anschrift wie oben)</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>Bildrechte & KI-generierte Inhalte</h2>
        <p>
          Ein Teil der auf dieser Website verwendeten Bilder wurde mithilfe von
          KI-Tools erstellt oder bearbeitet. Die betreffenden Bilder sind in den
          Metadaten entsprechend als KI-generiert bzw. KI-bearbeitet
          gekennzeichnet. Eigene Fotografien sind ebenfalls vertreten und als
          solche nicht KI-generiert.
        </p>
        <p>
          Alle Inhalte (Texte, Rezepte, Bilder) unterliegen dem Urheberrecht.
          Vervielfältigung, Bearbeitung oder Nutzung außerhalb der Grenzen des
          Urheberrechts bedürfen der schriftlichen Zustimmung der Autorin.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>Haftungsausschluss</h2>
        <h3>Haftung für Inhalte</h3>
        <p>
          Als Betreiberin dieser Website bin ich für eigene Inhalte nach den
          allgemeinen Gesetzen verantwortlich. Ich bin nicht verpflichtet,
          übermittelte oder gespeicherte fremde Informationen zu überwachen.
          Verpflichtungen zur Entfernung oder Sperrung bestehen erst ab
          Kenntnis einer konkreten Rechtsverletzung.
        </p>
        <h3>Haftung für Links</h3>
        <p>
          Diese Website enthält Links zu externen Webseiten Dritter, auf deren
          Inhalte ich keinen Einfluss habe. Zum Zeitpunkt der Verlinkung wurden
          keine Rechtsverstöße festgestellt. Bei Bekanntwerden von
          Rechtsverletzungen werden entsprechende Links umgehend entfernt.
        </p>
      </section>

      <section>
        <h2>Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          . Ich bin nicht bereit und nicht verpflichtet, an einem
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </section>
    </main>
  );
}
