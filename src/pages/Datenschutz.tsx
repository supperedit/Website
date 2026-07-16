import SEO from "../components/SEO";

export default function Datenschutz() {
  return (
    <>
      <SEO title="Datenschutz" description="Datenschutzerklärung (Privacy Policy) von Supper Edit." />

      <section className="wrap" style={{ paddingBlock: 80, maxWidth: 640 }}>
        <h1 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", marginBottom: 4 }}>
          Datenschutzerklärung
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 24 }}>
          Privacy Policy
        </p>

        <h2 className="font-display" style={{ fontSize: 20, marginTop: 32 }}>1. Verantwortliche Stelle</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-muted)" }}>
          Amy Djuritschek, Schubertstr. 42, 90530 Wendelstein, suppereditclub@gmail.com
        </p>

        <h2 className="font-display" style={{ fontSize: 20, marginTop: 32 }}>2. Allgemeines zur Datenverarbeitung</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-muted)" }}>
          Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit
          dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und
          Leistungen erforderlich ist. Rechtsgrundlage ist, soweit nichts anderes angegeben
          ist, Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am reibungslosen Betrieb
          der Website) bzw. Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
        </p>

        <h2 className="font-display" style={{ fontSize: 20, marginTop: 32 }}>3. Hosting</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-muted)" }}>
          Diese Website wird über Figma, Inc. (760 Market St, San Francisco, CA, USA)
          gehostet und veröffentlicht. Beim Aufruf der Seite verarbeitet Figma automatisch
          Server-Logdaten, die dein Browser übermittelt (z. B. IP-Adresse, Datum und
          Uhrzeit des Zugriffs, verwendeter Browser, aufgerufene Seite). Diese Daten sind
          technisch erforderlich, um die Website auszuliefern, und werden nicht mit
          anderen Datenquellen zusammengeführt. Details entnimmst du der Datenschutzerklärung
          von Figma.
        </p>

        <h2 className="font-display" style={{ fontSize: 20, marginTop: 32 }}>4. Google Fonts</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-muted)" }}>
          Diese Website bindet die Schriftart "Elms Sans" von Google Fonts ein. Beim
          Aufruf einer Seite lädt dein Browser die benötigten Schriften direkt von
          Servern von Google (Google Ireland Limited). Dabei wird deine IP-Adresse an
          Google übertragen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
        </p>

        <h2 className="font-display" style={{ fontSize: 20, marginTop: 32 }}>5. Rezeptdaten über Google Sheets</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-muted)" }}>
          Die Rezepttexte und -bilder dieser Seite werden aus einer öffentlich
          veröffentlichten Google-Tabelle geladen. Dein Browser ruft diese Inhalte direkt
          bei Google ab, wodurch auch hierbei deine IP-Adresse an Google übertragen wird.
          Es werden dabei keine Formulareingaben oder sonstigen personenbezogenen Daten
          von dir an Google übermittelt.
        </p>

        <h2 className="font-display" style={{ fontSize: 20, marginTop: 32 }}>6. Lokale Speicherung im Browser</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-muted)" }}>
          Diese Website speichert einzelne Informationen ausschließlich lokal in deinem
          Browser (Local Storage), nicht auf unseren Servern: deine Entscheidung im
          Cookie-Hinweis sowie die Rezepte, die du dir über die Merkliste-Funktion
          gemerkt hast. Diese Daten verlassen dein Gerät nicht und werden von uns nicht
          eingesehen. Du kannst sie jederzeit über die Einstellungen deines Browsers
          löschen.
        </p>

        <h2 className="font-display" style={{ fontSize: 20, marginTop: 32 }}>7. Kontaktformular</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-muted)" }}>
          Wenn du uns über das Kontaktformular schreibst, verwenden wir die von dir
          angegebenen Daten (Name, E-Mail-Adresse, Nachricht) ausschließlich zur
          Bearbeitung deiner Anfrage und für den Fall von Anschlussfragen.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Eine Weitergabe an Dritte
          erfolgt nicht.
        </p>

        <h2 className="font-display" style={{ fontSize: 20, marginTop: 32 }}>8. Deine Rechte</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-muted)" }}>
          Du hast jederzeit das Recht auf Auskunft über deine bei uns gespeicherten
          personenbezogenen Daten, deren Herkunft und Empfänger sowie den Zweck der
          Datenverarbeitung, außerdem ein Recht auf Berichtigung, Löschung oder
          Einschränkung der Verarbeitung dieser Daten. Wende dich dazu an die oben
          genannte Kontaktadresse. Dir steht zudem ein Beschwerderecht bei der
          zuständigen Aufsichtsbehörde zu.
        </p>

        <h2 className="font-display" style={{ fontSize: 20, marginTop: 32 }}>9. Datensicherheit</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--color-muted)" }}>
          Diese Website nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung.
          Eine verschlüsselte Verbindung erkennst du daran, dass die Adresszeile deines
          Browsers mit "https://" beginnt.
        </p>

        <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 40 }}>
          Stand: Juli 2026
        </p>
      </section>
    </>
  );
}