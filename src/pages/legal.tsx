import { LegalLayout, h2, h3, p, ul, strong } from '../components/LegalLayout'
import { SITE, hasOperatorData } from '../config'

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

export function FaqPage() {
  return (
    <LegalLayout title="Häufige Fragen">
      <p className={p}>
        {SITE.name} ist ein Unterhaltungs-Quiz. Hier steht, wie wir mit Zitaten umgehen, warum
        fiktive Figuren neben realen Personen auftauchen und was du tun kannst, wenn dir ein Fehler
        auffällt.
      </p>

      {SITE.isBeta && (
        <p className={p}>
          <strong className={strong}>Hinweis zur Beta:</strong> Der aktuelle Zitat-Bestand stammt aus
          der Recherchephase und ist konservativ gekennzeichnet, die abschließende redaktionelle
          Quellenprüfung läuft aber noch. Rechne deshalb damit, dass einzelne Fundstellen noch
          nachgeschärft werden. Zitate lebender Personen sind währenddessen komplett deaktiviert –
          sie gehen erst nach vollständiger Prüfung und Freigabe ins Spiel.
        </p>
      )}

      <h3 className={h3}>Sind alle Zitate wörtlich echt?</h3>
      <p className={p}>
        Nein – und das sagen wir dazu. Jedes Zitat trägt eine Kennzeichnung, die zeigt, wie gut die
        Aussage belegt ist: <strong className={strong}>Belegt</strong> (wörtlich dokumentiert),{' '}
        <strong className={strong}>Belegt · übersetzt</strong> (dokumentiert, aber übersetzt –
        Formulierungen können abweichen), <strong className={strong}>Sinngemäß</strong> (Inhalt
        überliefert, Wortlaut nicht gesichert), <strong className={strong}>Zugeschrieben</strong>{' '}
        (häufig genannt, aber nicht sicher belegt) oder{' '}
        <strong className={strong}>Fiktion</strong> (aus einem fiktionalen Werk). Die Fundstelle
        zeigen wir, wo vorhanden, in der Auflösung der Runde an.
      </p>

      <h2 className={h2}>Was die fünf Kennzeichnungen bedeuten</h2>
      <ul className={ul}>
        <li>
          <strong className={strong}>Belegt</strong> – Diese Aussage ist in der angegebenen Quelle
          wörtlich dokumentiert.
        </li>
        <li>
          <strong className={strong}>Belegt · übersetzt</strong> – Diese Aussage ist belegt, wurde
          aber übersetzt. Übersetzungen geben den Sinn wieder – die Formulierung kann vom Original
          abweichen.
        </li>
        <li>
          <strong className={strong}>Sinngemäß</strong> – Diese Aussage ist sinngemäß überliefert.
          Der Wortlaut ist nicht gesichert.
        </li>
        <li>
          <strong className={strong}>Zugeschrieben</strong> – Diese Aussage wird der Person häufig
          zugeschrieben, ein gesicherter Beleg fehlt. Sie ist hier Teil eines Ratespiels – keine
          Tatsachenbehauptung.
        </li>
        <li>
          <strong className={strong}>Fiktion</strong> – Diese Zeile stammt aus einem fiktionalen
          Werk.
        </li>
      </ul>
      <p className={p}>
        Während der Rate-Phase bleibt die Kennzeichnung dezent, damit sie die Antwort nicht verrät.
        In der Auflösung erscheint sie zusammen mit der Fundstelle – zum Beispiel „One Piece,
        Kapitel 145“ oder „Der Fürst, Kapitel 17“.
      </p>

      <h3 className={h3}>Wie werden Zitate ausgewählt?</h3>
      <p className={p}>
        Wir arbeiten in Themen-Batches – etwa „Freiheit“, „Verrat“ oder „Träume“ –, damit beide
        Seiten eines Paares über dasselbe Thema sprechen und wirklich verwechselbar sind. Kandidaten
        dürfen aus KI-gestützter Recherche stammen, aber kein Zitat geht live, bevor ein Mensch die
        Fundstelle im Werk oder in der Originalquelle selbst nachgeschlagen und die Kennzeichnung
        gesetzt hat. Bei lebenden Personen gelten die strengsten Regeln: zwei voneinander
        unabhängige Quellen, keine sinnentstellende Verkürzung und eine Freigabe nach dem
        Vier-Augen-Prinzip – solange die nicht vorliegt, bleibt das Zitat aus dem Spiel. Zusätzlich
        prüft eine zweite Person jedes Paar auf Fairness und Ton, bevor es endgültig freigegeben
        wird.
      </p>

      <h3 className={h3}>Warum steht ein Anime-Charakter neben einer realen Person?</h3>
      <p className={p}>
        Das ist die Spielidee: Viele Gedanken – über Freiheit, Verlust, Mut – klingen aus dem Mund
        einer Manga-Figur genauso plausibel wie aus dem einer historischen Persönlichkeit. Die
        Gegenüberstellung ist ein Ratespiel und bedeutet nicht, dass wir Personen und Figuren
        vergleichen, gleichsetzen oder bewerten.
      </p>

      <h3 className={h3}>Ein Zitat ist falsch zugeordnet oder verletzt Rechte – was tun?</h3>
      <p className={p}>
        Nutze „Zitat melden“ direkt an der Runde oder schreib an {SITE.contactEmail}. Wir prüfen
        jede Meldung zeitnah und korrigieren oder entfernen Inhalte, wenn die Beanstandung
        berechtigt ist.
      </p>

      <h3 className={h3}>
        Steht ihr in Verbindung mit One Piece, Eiichirō Oda oder den dargestellten Personen?
      </h3>
      <p className={p}>
        Nein. Dieses Spiel ist ein unabhängiges Fan- und Unterhaltungsprojekt. Alle Namen dienen nur
        der Bezeichnung; die Rechte an den Werken liegen bei ihren Inhabern.
      </p>
    </LegalLayout>
  )
}

/* -------------------------------------------------------------------------- */
/* Impressum                                                                   */
/* -------------------------------------------------------------------------- */

export function ImpressumPage() {
  return (
    <LegalLayout title="Impressum">
      {!hasOperatorData && (
        <p className={p}>
          <strong className={strong}>
            ⚠ Achtung – dieses Impressum ist noch nicht vollständig. Betreibername, ladungsfähige
            Anschrift, Kontaktadresse und Verantwortlicher nach § 18 Abs. 2 MStV sind derzeit
            Platzhalter und müssen vor dem öffentlichen Launch eingetragen werden. Ein vollständiges
            Impressum ist nach § 5 DDG Pflicht, sobald das Angebot öffentlich erreichbar ist.
          </strong>
        </p>
      )}

      <h2 className={h2}>Angaben gemäß § 5 DDG</h2>
      <p className={p}>
        <strong className={strong}>{SITE.operatorName}</strong>
        {SITE.operatorAddress.map((line) => (
          <span key={line}>
            <br />
            {line}
          </span>
        ))}
      </p>
      <p className={p}>
        <strong className={strong}>Kontakt:</strong> {SITE.contactEmail}
      </p>

      <h2 className={h2}>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p className={p}>{SITE.responsibleForContent}</p>

      <h2 className={h2}>Inhaltlicher Hinweis</h2>
      <p className={p}>
        Dieses Angebot ist ein Unterhaltungs-Quiz. Zitate werden nach redaktioneller Prüfung
        zugeordnet und hinsichtlich ihrer Belegbarkeit gekennzeichnet (belegt / übersetzt /
        sinngemäß / zugeschrieben / Fiktion). Übersetzungen können vom Originalwortlaut abweichen.
        Das Angebot steht in keiner Verbindung zu den Rechteinhabern der dargestellten Werke oder zu
        den dargestellten Personen. Beanstandungen richten Sie bitte an {SITE.contactEmail};
        gemeldete Inhalte werden zeitnah geprüft und bei berechtigten Einwänden korrigiert oder
        entfernt.
      </p>

      <h2 className={h2}>Hosting</h2>
      <p className={p}>
        Das Angebot wird bereitgestellt über {SITE.hostingProvider}. Einzelheiten zur Verarbeitung
        von Server-Logfiles stehen in der Datenschutzerklärung.
      </p>
    </LegalLayout>
  )
}

/* -------------------------------------------------------------------------- */
/* Datenschutz                                                                 */
/* -------------------------------------------------------------------------- */

export function DatenschutzPage() {
  return (
    <LegalLayout title="Datenschutzerklärung">
      <p className={p}>
        {SITE.name} ist bewusst datenarm gebaut: Es gibt{' '}
        <strong className={strong}>kein Tracking, keine Analyse-Werkzeuge, keine Werbenetzwerke und
        keine Cookies</strong>. Dein Punktestand bleibt auf deinem Gerät. Eine Anmeldung oder ein
        Nutzerkonto gibt es nicht.
      </p>

      <h2 className={h2}>1. Verantwortlicher</h2>
      <p className={p}>
        Verantwortlich für die Datenverarbeitung auf dieser Seite ist {SITE.operatorName}. Die
        vollständigen Kontaktdaten stehen im Impressum. Fragen zum Datenschutz richtest du am besten
        an {SITE.contactEmail}.
      </p>

      <h2 className={h2}>2. Hosting und Server-Logfiles</h2>
      <p className={p}>
        Das Angebot wird bei {SITE.hostingProvider} gehostet. Beim Abruf der Seite verarbeitet der
        Anbieter technisch notwendige Zugriffsdaten in Server-Logfiles, insbesondere IP-Adresse,
        Datum und Uhrzeit des Abrufs, die abgerufene Datei, übertragene Datenmenge, Browsertyp und
        Betriebssystem. Diese Daten sind nötig, um die Seite auszuliefern und ihren stabilen,
        sicheren Betrieb zu gewährleisten; Rechtsgrundlage ist unser berechtigtes Interesse nach
        Art. 6 Abs. 1 lit. f DSGVO. Die Logfiles werden nach kurzer Zeit automatisch gelöscht; die
        konkrete Speicherdauer des Anbieters wird hier vor dem öffentlichen Launch ergänzt. Eine
        Zusammenführung dieser Daten mit anderen Datenquellen findet nicht statt.
      </p>

      <h2 className={h2}>3. Highscore im lokalen Speicher (localStorage)</h2>
      <p className={p}>
        Damit dein bester Punktestand beim nächsten Besuch noch da ist, speichert das Spiel ihn im{' '}
        <strong className={strong}>localStorage</strong> deines Browsers. Diese Speicherung ist
        funktional – sie ist für die von dir gewünschte Funktion unbedingt erforderlich und damit
        nach § 25 Abs. 2 TDDDG einwilligungsfrei. Wichtig:
      </p>
      <ul className={ul}>
        <li>Die Daten verlassen dein Gerät nicht und werden nicht an uns übertragen.</li>
        <li>Es handelt sich um einen reinen Zahlenwert, nicht um ein Cookie und kein Profil.</li>
        <li>
          Du kannst den Eintrag jederzeit selbst löschen, indem du die Websitedaten in deinen
          Browsereinstellungen entfernst.
        </li>
      </ul>

      <h2 className={h2}>4. Kein Tracking, keine Cookies</h2>
      <p className={p}>
        Wir setzen keine Cookies, keine Analyse- oder Reichweitenmessung, keine Werbe-IDs und keine
        Social-Media-Plugins ein. Es findet kein geräteübergreifendes Wiedererkennen und kein
        Profiling statt.
      </p>

      <h2 className={h2}>5. Kontaktaufnahme und Meldungen</h2>
      <p className={p}>
        Wenn du uns über {SITE.contactEmail} schreibst – etwa um ein Zitat zu melden –, verarbeiten
        wir deine E-Mail-Adresse und die Inhalte deiner Nachricht ausschließlich, um die Anfrage zu
        bearbeiten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Bearbeitung von Anfragen und
        Beanstandungen). Die Nachrichten werden gelöscht, sobald der Vorgang abgeschlossen ist und
        keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
      </p>

      <h2 className={h2}>6. Globales Leaderboard – derzeit nicht aktiv</h2>
      <p className={p}>
        Ein serverseitiges, globales Leaderboard gibt es aktuell{' '}
        <strong className={strong}>nicht</strong>. Es werden also keine Anzeigenamen, Punktestände
        oder sonstigen Spieldaten an uns übertragen oder veröffentlicht. Sollte ein solches
        Leaderboard eingeführt werden, wird diese Erklärung vorher um die dann verarbeiteten Daten,
        die Rechtsgrundlage, die Speicherdauer und den Löschweg erweitert.
      </p>

      <h2 className={h2}>7. Deine Rechte</h2>
      <p className={p}>Dir stehen nach der DSGVO insbesondere folgende Rechte zu:</p>
      <ul className={ul}>
        <li>Auskunft über die zu deiner Person verarbeiteten Daten (Art. 15 DSGVO)</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
        <li>Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>
          Widerspruch gegen Verarbeitungen, die auf einem berechtigten Interesse beruhen (Art. 21
          DSGVO)
        </li>
        <li>
          Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art. 77 DSGVO) – zuständig ist die
          Behörde deines Wohnorts oder die des Verantwortlichen
        </li>
      </ul>
      <p className={p}>
        Für die Ausübung dieser Rechte genügt eine formlose Nachricht an {SITE.contactEmail}. Da wir
        keine Nutzerkonten führen und keine Profile bilden, können wir dich anhand der oben
        genannten Daten in der Regel nicht identifizieren – wir bitten dich deshalb, dein Anliegen
        so konkret wie möglich zu beschreiben.
      </p>
    </LegalLayout>
  )
}

/* -------------------------------------------------------------------------- */
/* Nutzungsbedingungen                                                         */
/* -------------------------------------------------------------------------- */

export function NutzungsbedingungenPage() {
  return (
    <LegalLayout title="Nutzungsbedingungen">
      <p className={p}>
        Diese Bedingungen regeln die Nutzung von {SITE.name}. Mit dem Aufruf des Spiels erkennst du
        sie an.
      </p>

      <h2 className={h2}>1. Gegenstand</h2>
      <p className={p}>
        {SITE.name} ist ein kostenloses Unterhaltungs-Quiz. Ein Anspruch auf Verfügbarkeit oder auf
        bestimmte Inhalte besteht nicht.
      </p>

      <h2 className={h2}>2. Inhalte und Gewähr</h2>
      <p className={p}>
        Die Zuordnung von Zitaten erfolgt nach redaktioneller Prüfung und wird nach Belegbarkeit
        gekennzeichnet. Übersetzungen geben den Sinn wieder; Abweichungen vom Originalwortlaut sind
        möglich. Die Inhalte dienen ausschließlich der Unterhaltung und stellen keine
        Tatsachenbehauptungen über dargestellte Personen auf, die über die gekennzeichnete Zuordnung
        hinausgehen. Für historische oder wörtliche Genauigkeit wird keine Gewähr übernommen. Die
        Gegenüberstellung von fiktiven Figuren und realen Personen ist Spielmechanik und stellt
        keinen inhaltlichen Vergleich, keine Bewertung und keine Meinungsäußerung dar.
      </p>

      <h2 className={h2}>3. Rechte Dritter</h2>
      <p className={p}>
        Genannte Werk-, Marken- und Personennamen dienen nur der Bezeichnung. Der Betreiber steht in
        keiner Verbindung zu Rechteinhabern oder dargestellten Personen. Bildnachweise sind auf der
        Seite „Bildnachweise“ einsehbar.
      </p>

      <h2 className={h2}>4. Beanstandungen</h2>
      <p className={p}>
        Wer sich durch einen Inhalt in eigenen Rechten verletzt sieht, kann dies über „Zitat melden“
        oder per E-Mail an {SITE.contactEmail} anzeigen. Beanstandete Inhalte werden zeitnah geprüft
        und bei berechtigten Einwänden korrigiert oder entfernt; im Zweifel nehmen wir einen Inhalt
        zunächst offline und klären die Sache anschließend.
      </p>

      <h2 className={h2}>5. Leaderboard (sofern aktiv)</h2>
      <p className={p}>
        Gewählte Anzeigenamen dürfen keine Rechte Dritter verletzen und nicht beleidigend sein; der
        Betreiber kann Einträge entfernen. Ein globales Leaderboard ist derzeit nicht aktiv – diese
        Klausel gilt, sobald die Funktion eingeführt wird.
      </p>
    </LegalLayout>
  )
}

/* -------------------------------------------------------------------------- */
/* Bildnachweise                                                               */
/* -------------------------------------------------------------------------- */

export function BildnachweisePage() {
  return (
    <LegalLayout title="Bildnachweise">
      <h2 className={h2}>Aktueller Stand: eigene Avatare statt fremder Artworks</h2>
      <p className={p}>
        Alle Figuren- und Personendarstellungen in diesem Spiel sind derzeit{' '}
        <strong className={strong}>selbst generierte, abstrakte SVG-Avatare</strong> – Initialen auf
        einem Farbverlauf, im Code erzeugt. Es sind also keine Bilder Dritter im Einsatz, und es
        gibt an dieser Stelle noch nichts zu attribuieren.
      </p>
      <p className={p}>
        Bewusst verwenden wir <strong className={strong}>keine Artworks aus MyAnimeList oder der
        Jikan-API</strong>. Diese Bilder sind urheberrechtlich geschützte Werke der jeweiligen
        Studios und Verlage beziehungsweise Fan-Uploads davon. Dass eine API öffentlich abrufbar
        ist, räumt keinerlei Nutzungsrechte ein – eine offene Schnittstelle ist keine Lizenz.
        Deshalb bleibt es bis auf Weiteres bei eigenen Darstellungen.
      </p>

      <h2 className={h2}>Wie Fotos realer Personen künftig eingebunden werden</h2>
      <p className={p}>
        Fotos realer Personen werden ausschließlich aus{' '}
        <a
          className="underline"
          href="https://commons.wikimedia.org/"
          target="_blank"
          rel="noreferrer"
        >
          Wikimedia Commons
        </a>{' '}
        übernommen, und auch dort nur unter freien Lizenzen: Public Domain, CC0, CC BY oder CC BY-SA.
        Zu jedem Bild nennen wir dann Urheberin oder Urheber, die Lizenz mit Link auf den
        Lizenztext sowie einen Hinweis auf Bearbeitungen (zum Beispiel „zugeschnitten“). Sobald das
        erste Foto im Spiel ist, erscheint an dieser Stelle die vollständige, automatisch aus den
        Bilddaten erzeugte Liste der Bildnachweise – bis dahin bleibt sie leer.
      </p>
      <p className={p}>
        Wo kein Bild verfügbar oder die Lizenzlage ungeklärt ist, bleibt es beim Initialen-Avatar.
        Lieber kein Bild als ein ungeklärtes.
      </p>

      <h2 className={h2}>Verwendete Lizenzen</h2>
      <ul className={ul}>
        <li>
          <a
            className="underline"
            href="https://creativecommons.org/publicdomain/zero/1.0/deed.de"
            target="_blank"
            rel="noreferrer"
          >
            CC0 1.0 – Public Domain Dedication
          </a>
        </li>
        <li>
          <a
            className="underline"
            href="https://creativecommons.org/licenses/by/4.0/deed.de"
            target="_blank"
            rel="noreferrer"
          >
            CC BY 4.0 – Namensnennung
          </a>
        </li>
        <li>
          <a
            className="underline"
            href="https://creativecommons.org/licenses/by-sa/4.0/deed.de"
            target="_blank"
            rel="noreferrer"
          >
            CC BY-SA 4.0 – Namensnennung, Weitergabe unter gleichen Bedingungen
          </a>
        </li>
      </ul>

      <p className={p}>
        Sollte trotz dieser Sorgfalt ein Bild oder eine Darstellung Rechte verletzen, melde es bitte
        an {SITE.contactEmail}. Wir prüfen jede Meldung zeitnah und entfernen beanstandete Inhalte
        bei berechtigten Einwänden.
      </p>
    </LegalLayout>
  )
}
