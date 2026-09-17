export default function Datenschutz() {
  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "64px 24px", lineHeight: 1.7 }}>
      <h1 style={{ marginBottom: 8 }}>Datenschutzerklärung</h1>
      <p style={{ color: "var(--color-terracotta)", marginBottom: 40, fontSize: 14 }}>
        Stand: August 2026
      </p>

      <section style={{ marginBottom: 40 }}>
        <h2>1. Verantwortliche</h2>
        <p>
          Amy Djuritschek<br />
          Schubertstr. 42, 90530 Wendelstein<br />
          E-Mail: <a href="mailto:suppereditclub@gmail.com">suppereditclub@gmail.com</a>
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>2. Hosting</h2>
        <p>
          Diese Website wird über <strong>Cloudflare Pages</strong> (Cloudflare,
          Inc., 101 Townsend St., San Francisco, CA 94107, USA) gehostet.
          Cloudflare verarbeitet beim Aufruf der Seite technisch notwendige
          Daten (IP-Adresse, Zeitstempel, aufgerufene URL, Browser-Typ). Dies
          dient der Bereitstellung und Sicherheit der Website und beruht auf
          Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Cloudflare ist
          nach dem EU-US Data Privacy Framework zertifiziert.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>3. Cookies & lokale Speicherung</h2>
        <p>
          Diese Website setzt keine Tracking-Cookies. Im Browser wird
          ausschließlich der <strong>lokale Speicher (localStorage)</strong>{" "}
          verwendet, um deine gespeicherten Lieblingsrezepte zu merken. Diese
          Daten verlassen deinen Browser nicht und werden nicht an Server
          übertragen.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>4. Keine Analyse- oder Tracking-Dienste</h2>
        <p>
          Auf dieser Website werden keine Analyse- oder Tracking-Dienste (z. B.
          Google Analytics) eingesetzt. Es werden keine Profile über das
          Nutzungsverhalten erstellt.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>5. Kontaktaufnahme per E-Mail</h2>
        <p>
          Wenn du mir per E-Mail schreibst, werden die von dir übermittelten
          Daten (Name, E-Mail-Adresse, Nachrichteninhalt) ausschließlich zur
          Bearbeitung deiner Anfrage verwendet und nicht an Dritte weitergegeben.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>6. Externe Inhalte & eingebettete Medien</h2>
        <p>
          Rezeptbilder werden über <strong>Google Drive</strong> ausgeliefert.
          Beim Laden dieser Bilder kann Google die IP-Adresse des abrufenden
          Geräts verarbeiten. Weitere Informationen findest du in der{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Datenschutzerklärung von Google
          </a>
          .
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>7. Deine Rechte</h2>
        <p>
          Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung
          der Verarbeitung sowie Datenübertragbarkeit (Art. 15–20 DSGVO).
          Außerdem kannst du der Verarbeitung widersprechen (Art. 21 DSGVO) und
          dich bei einer Aufsichtsbehörde beschweren. Die zuständige Behörde für
          Bayern ist das Bayerische Landesamt für Datenschutzaufsicht (BayLDA),
          Promenade 18, 91522 Ansbach.
        </p>
        <p>
          Für Anfragen wende dich an:{" "}
          <a href="mailto:suppereditclub@gmail.com">suppereditclub@gmail.com</a>
        </p>
      </section>

      <section>
        <h2>8. Aktualität</h2>
        <p>
          Diese Datenschutzerklärung kann bei Änderungen der Website oder der
          gesetzlichen Anforderungen angepasst werden. Die aktuelle Version ist
          stets auf dieser Seite abrufbar.
        </p>
      </section>
    </main>
  );
}
