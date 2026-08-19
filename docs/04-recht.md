# 04 — Rechtliche Absicherung

> **Wichtiger Rahmen:** Dieses Dokument ist sorgfältig recherchierte
> Projektplanung, aber **keine Rechtsberatung**. „Rechtlich vollständig
> abgesichert" kann kein Disclaimer der Welt leisten — was Disclaimer,
> Kennzeichnung und Auswahl-Policy leisten, ist eine **systematische
> Risikominimierung** plus eine gute Verteidigungsposition. Vor dem
> öffentlichen Launch ist eine anwaltliche Prüfung (Medien-/IT-Recht) der
> Texte in diesem Dokument fest eingeplant (Roadmap, Dok 05). Budget:
> überschaubar, da alle Entwürfe fertig vorliegen.

## 4.1 Die Risikolandkarte

| Risiko | Betrifft | Schwere | Kernmaßnahme |
|---|---|---|---|
| Persönlichkeitsrecht: falsches/verfälschtes Zitat einer **lebenden** Person | Personen Klasse C/D | **hoch** | Harte Regel: nur belegte Aussagen (V4/V6 in Dok 02); Kennzeichnung; Kontext „Ratespiel" |
| Urheberrecht: **Anime-Bilder** (MAL/Jikan) | Charakterdarstellung | **hoch** | Keine MAL-Artworks im Spiel; eigener Avatar-Stil (4.5) |
| Urheberrecht: Zitattexte (Anime-Dialog, offizielle Übersetzungen) | Zitate | mittel | Kurze Einzelsätze, eigene sinngemäße Übersetzung, nie Synchro-/Verlagstext kopieren |
| Bildlizenz/Bildnisrecht reale Personen | Fotos | mittel | Commons-only, freie Lizenzen, Attribution; kein entstellender Kontext |
| Postmortales Persönlichkeitsrecht | Klasse B | mittel | Keine grobe Entstellung des Lebensbildes; belegte Zitate |
| Marken (One Piece, Logos) | Branding | niedrig–mittel | Namen nur beschreibend nutzen, keine Logos/Schriftzüge, klare Nicht-Affiliation |
| Impressum/DSGVO | Betrieb | mittel | Impressum ab Tag 1, cookielose Architektur, Datenschutzerklärung |
| Jugendschutz/Ton („kontrovers") | Auswahl | mittel | Auswahl-Policy 4.4, `tone_flags`, Meldefunktion |

## 4.2 Kennzeichnung direkt am Zitat (Badge + Tooltip)

Jedes Zitat trägt sichtbar ein Badge (Mapping aus `source_type`, Dok 02).
Vorgeschlagene Texte:

| `source_type` | Badge | Tooltip-Text |
|---|---|---|
| `verified` | **Belegt** | „Diese Aussage ist in der angegebenen Quelle wörtlich dokumentiert." |
| `translated` | **Belegt · übersetzt** | „Diese Aussage ist belegt, wurde aber übersetzt. Übersetzungen geben den Sinn wieder — die Formulierung kann vom Original abweichen." |
| `paraphrased` | **Sinngemäß** | „Diese Aussage ist sinngemäß überliefert. Der Wortlaut ist nicht gesichert." |
| `attributed` | **Zugeschrieben** | „Diese Aussage wird der Person häufig zugeschrieben, ein gesicherter Beleg fehlt. Sie ist hier Teil eines Ratespiels — keine Tatsachenbehauptung." |
| `fictional` | **Fiktion** | „Diese Zeile stammt aus einem fiktionalen Werk." / (spätere Stil-Zitate:) „Frei erfunden im Stil der Figur — wurde so nie gesagt." |

UI-Regeln:
- Badge erscheint **in der Auflösung jeder Runde** (nach der Antwort) samt
  Fundstelle („One Piece, Kapitel 145" / „Interview, CBS 60 Minutes, 2012").
  Während der Rate-Phase genügt ein dezentes ⓘ, damit das Badge die Antwort
  nicht verrät.
- Tooltip auf Touch-Geräten als Tap-Sheet, nicht nur Hover.
- In der Auflösung steht bei realen Personen zusätzlich der neutrale Blurb
  („Politiker, 1874–1965") — Einordnung statt bloßem Namen.

## 4.3 Sichtbare Hinweistexte im Spiel

**Startscreen/Footer (Kurz-Disclaimer, immer erreichbar):**

> Wer hat's gesagt? ist ein Unterhaltungs-Quiz. Zitate werden nach bestem
> Wissen zugeordnet und gekennzeichnet (belegt, übersetzt, sinngemäß oder
> zugeschrieben). Übersetzungen können in der Formulierung vom Original
> abweichen; für historische Wortgenauigkeit wird keine Gewähr übernommen.
> Die Gegenüberstellung von fiktiven Figuren und realen Personen ist
> Spielmechanik und stellt keinen inhaltlichen Vergleich, keine Bewertung und
> keine Meinungsäußerung dar. Fehler gefunden? → [Zitat melden]

**Erste-Spiel-Hinweis (einmalige Interstitial-Karte vor Runde 1):**

> So funktioniert's: Ein Zitat, zwei mögliche Urheber — tippe auf die richtige
> Seite! Hinweis: Manche Zitate sind übersetzt oder sinngemäß überliefert.
> Was genau belegt ist, zeigt dir das Info-Symbol nach jeder Runde.

**FAQ-Einträge (eigene Seite, verlinkt aus Footer):**

> **Sind alle Zitate wörtlich echt?**
> Nein — und das sagen wir dazu. Jedes Zitat trägt eine Kennzeichnung:
> *Belegt* (wörtlich dokumentiert), *Belegt · übersetzt* (dokumentiert, aber
> übersetzt — Formulierungen können abweichen), *Sinngemäß* (Inhalt
> überliefert, Wortlaut nicht gesichert), *Zugeschrieben* (häufig genannt,
> aber nicht sicher belegt) oder *Fiktion* (aus einem fiktionalen Werk). Die
> Fundstelle zeigen wir, wo vorhanden, in der Auflösung an.
>
> **Warum steht ein Anime-Charakter neben einer realen Person?**
> Das ist die Spielidee: Viele Gedanken — über Freiheit, Verlust, Mut — klingen
> aus dem Mund einer Manga-Figur genauso plausibel wie aus dem einer
> historischen Persönlichkeit. Die Gegenüberstellung ist ein Ratespiel und
> bedeutet nicht, dass wir Personen und Figuren vergleichen, gleichsetzen oder
> bewerten.
>
> **Ein Zitat ist falsch zugeordnet / verletzt Rechte — was tun?**
> Nutze „Zitat melden" direkt an der Runde oder schreib an
> [kontakt@domain]. Wir prüfen jede Meldung zeitnah und korrigieren oder
> entfernen Inhalte, wenn die Beanstandung berechtigt ist.
>
> **Steht ihr in Verbindung mit One Piece / Eiichirō Oda / den abgebildeten
> Personen?**
> Nein. Dieses Spiel ist ein unabhängiges Fan- und Unterhaltungsprojekt. Alle
> Namen dienen nur der Bezeichnung; Rechte an den Werken liegen bei ihren
> Inhabern.

## 4.4 Lebende und kontroverse Personen — Policy

**Die zentrale Korrektur am Ausgangskonzept:** Der Wunsch „Zitate müssen nur
sinngemäß plausibel im Stil sein" ist für **Anime-Figuren und lange
verstorbene Personen** tragfähig — für **lebende Personen nicht**. Ein
erfundenes, aber echt wirkendes Zitat einer lebenden Person kann deren
Persönlichkeitsrecht verletzen (in der deutschen Rechtsprechung gilt das
Unterschieben eines nicht getanen Zitats als besonders schwerer Eingriff —
Stichwort „Erfundenes Interview"). **Ein Disclaimer im Footer heilt das
nicht**, weil es auf den Gesamteindruck beim Publikum ankommt. Deshalb:

**Regelwerk (technisch erzwungen, siehe Dok 02 V3–V6):**
1. Lebende Personen (Klasse C): **nur** `verified`/`translated`, zwei
   unabhängige Quellen, Vier-Augen-Freigabe, Fundstelle wird im Spiel
   angezeigt.
2. Keine sinnentstellende Verkürzung: Das Zitat darf im Spiel nichts anderes
   aussagen als im Originalkontext. Im Zweifel: raus.
3. Keine Zitate, die (aus dem Kontext gerissen) wie das Eingeständnis einer
   Straftat, eine Diffamierung Dritter oder eine vom Betreiber übernommene
   Meinung wirken.
4. Klasse D (lebend + hohes Prozess-/Reputationsrisiko, z. B. Personen mit
   bekannt aggressiver Rechtsdurchsetzung): standardmäßig **nicht aufnehmen**.
5. Verstorbene (Klasse B): postmortaler Achtungsanspruch beachten — keine
   grobe Entstellung des Lebensbildes; belegte Zitate, respektvolle Blurbs.
6. Extremismus-Leitplanke: Keine Zitate, die menschenverachtende Ideologie als
   „Pointe" transportieren oder NS-Größen als quizfähige Popkultur normalisieren.
   Historische Diktatoren sind nicht pauschal tabu, aber: nur mit
   `tone_flags: [politik-sensibel]`, nie gegen „sympathische" Heldenfiguren
   gepaart, wenn die Pointe eine Gleichsetzung wäre, und im Zweifel
   Redaktionskonferenz. (Auch an Plattform-Richtlinien denken, falls später
   App-Stores oder Werbenetzwerke dazukommen.)
7. **Beanstandungsprozess:** Meldung → Prüfung binnen weniger Werktage →
   im Zweifel sofort offline nehmen (`retired`), dann klären. Dokumentierte
   Reaktionsbereitschaft ist praktisch der beste Schutz gegen Eskalation.

## 4.5 Bilder

### Anime-Charaktere — die unbequeme Wahrheit
Jikan ist nur ein API-Wrapper um MyAnimeList; die ausgelieferten Bilder sind
**urheberrechtlich geschützte Artworks** (Toei Animation/Shueisha bzw.
Fan-Uploads davon). Dass eine API öffentlich ist, erzeugt **keine Lizenz** —
und die One-Piece-Rechteinhaber setzen ihre Rechte aktiv durch. Optionen:

| Option | Bewertung |
|---|---|
| **Eigene stilisierte Avatare** (beauftragte oder selbst erstellte Original-Illustrationen: markante Silhouette, Farbpalette, Attribute — ohne 1:1-Kopie des Charakterdesigns) | **Empfehlung.** Einmalkosten (10–15 Motive fürs MVP), einheitlicher Look, echter Brand-USP, skaliert auf weitere Universen. Wichtig: eigenständige Schöpfung, nicht bloßes Nachzeichnen des Originals. |
| Text-only (Name + Blurb + Initialen-Avatar) | Risikofrei, sofort machbar — gutes MVP-Fallback, bis Avatare vorliegen. |
| Offizielle Artworks lizenzieren | Für ein Indie-Projekt unrealistisch (Aufwand/Kosten). |
| MAL-Bilder „einfach nutzen" | **Nein.** Abmahnrisiko, gerade bei kommerzieller Nutzung. |

> Randnotiz: Auch stilisierte Avatare bewegen sich in einer Grauzone
> (Charakterdesigns können geschützt sein). Je eigenständiger der Stil, desto
> besser die Position; das gehört mit auf die Liste für die anwaltliche Prüfung.

### Reale Personen — Commons-Pfad
1. Bildquelle **ausschließlich Wikimedia Commons** (via Wikidata P18);
   Lizenz-Whitelist: Public Domain, CC0, CC BY, CC BY-SA. „Non-free"-Bilder
   der englischen Wikipedia sind damit strukturell ausgeschlossen.
2. **Attribution ist Pflicht** bei CC BY/BY-SA: Urheber, Lizenz + Link,
   Bearbeitungshinweis („zugeschnitten"). Umsetzung: ⓘ am Bild → Credit-Sheet
   pro Bild **und** zentrale Seite „Bildnachweise" (aus `media.json`
   generiert).
3. **Bildnisrecht (§§ 22, 23 KUG):** Fotos von Personen der Zeitgeschichte in
   ihrer öffentlichen Rolle sind grundsätzlich nutzbar; keine entstellenden,
   herabwürdigenden oder werblichen Kontexte. Die neutrale Quiz-Darstellung
   (Porträt + Name + neutraler Blurb) bleibt in diesem Rahmen — die
   Auswahl-Policy 4.4 verhindert herabwürdigende Kontexte.
4. Kein Bild verfügbar/geklärt → Initialen-Avatar. Lieber kein Bild als ein
   ungeklärtes.

### Zitattexte selbst
- Einzelne kurze Sätze erreichen oft keine urheberrechtliche Schutzhöhe — aber
  darauf allein verlassen wir uns nicht: **eigene sinngemäße Übersetzungen**
  statt Kopien offizieller deutscher Fassungen (Synchron- und
  Verlagsübersetzungen sind eigene geschützte Werke), knappe Länge (1–2 Sätze),
  Quellenangabe.
- Ein förmliches Zitatrecht (§ 51 UrhG) trägt ein Quiz nicht (kein
  Belegzweck) — deshalb ist die Kombination „kurz + paraphrasiert + gekennzeichnet"
  die tragende Säule.

## 4.6 Impressum, Datenschutz, Nutzungsbedingungen — Bausteine

**Impressum (§ 5 DDG):** Pflicht, sobald das Spiel öffentlich betrieben wird
(geschäftsmäßig ist schnell erfüllt, mit Werbung/Monetarisierung ohnehin).
Inhalte: Name, ladungsfähige Anschrift, E-Mail; bei redaktionellen Inhalten
Verantwortlicher i. S. d. § 18 Abs. 2 MStV. **Empfehlung:** ernst nehmen, dass
das Projekt bewusst kontroverse Personen zeigt — ein Impressum mit echter
Anschrift ist unvermeidlich; wer das scheut, kann ein Impressum-Service-
Postfach nutzen.

Zusatzabsatz fürs Impressum (unmittelbar unter den Pflichtangaben):

> **Inhaltlicher Hinweis:** Dieses Angebot ist ein Unterhaltungs-Quiz. Zitate
> werden nach redaktioneller Prüfung zugeordnet und hinsichtlich ihrer
> Belegbarkeit gekennzeichnet (belegt / übersetzt / sinngemäß / zugeschrieben /
> Fiktion). Übersetzungen können vom Originalwortlaut abweichen. Das Angebot
> steht in keiner Verbindung zu den Rechteinhabern der dargestellten Werke
> oder zu den dargestellten Personen. Beanstandungen richten Sie bitte an
> [kontakt@domain]; gemeldete Inhalte werden zeitnah geprüft und bei
> berechtigten Einwänden korrigiert oder entfernt.

**Datenschutzerklärung (DSGVO):** Das MVP ist bewusst datenarm — Highscore nur
in `localStorage` (keine Übertragung), kein Tracking, keine Cookies →
Datenschutzerklärung deckt ab: Hosting-Logfiles (Anbieter nennen,
Speicherdauer), localStorage-Nutzung (funktional, keine Einwilligung nötig),
Kontakt/Meldung per E-Mail. Ab Stufe 2 ergänzen: Leaderboard
(Nickname = ggf. personenbezogen; Löschweg anbieten), cookielose Analytics.

**Nutzungsbedingungen — Kernklauseln (Entwurf):**

> **1. Gegenstand.** [Name] ist ein kostenloses Unterhaltungs-Quiz. Ein
> Anspruch auf Verfügbarkeit oder bestimmte Inhalte besteht nicht.
>
> **2. Inhalte und Gewähr.** Die Zuordnung von Zitaten erfolgt nach
> redaktioneller Prüfung und wird nach Belegbarkeit gekennzeichnet.
> Übersetzungen geben den Sinn wieder; Abweichungen vom Originalwortlaut sind
> möglich. Die Inhalte dienen ausschließlich der Unterhaltung und stellen
> keine Tatsachenbehauptungen über dargestellte Personen auf, die über die
> gekennzeichnete Zuordnung hinausgehen. Für historische oder wörtliche
> Genauigkeit wird keine Gewähr übernommen.
>
> **3. Rechte Dritter.** Genannte Werk-, Marken- und Personennamen dienen nur
> der Bezeichnung. Der Betreiber steht in keiner Verbindung zu Rechteinhabern
> oder dargestellten Personen. Bildnachweise sind unter [Bildnachweise]
> einsehbar.
>
> **4. Beanstandungen.** Wer sich durch einen Inhalt in eigenen Rechten
> verletzt sieht, kann dies über [Zitat melden] oder [kontakt@domain]
> anzeigen. Beanstandete Inhalte werden zeitnah geprüft und bei berechtigten
> Einwänden korrigiert oder entfernt.
>
> **5. Leaderboard (sofern aktiv).** Gewählte Anzeigenamen dürfen keine
> Rechte Dritter verletzen und nicht beleidigend sein; der Betreiber kann
> Einträge entfernen. *(+ übliche Schlussklauseln — anwaltlich finalisieren.)*

## 4.7 Checkliste „Legal-Check" (Workflow-Schritt für Klasse C/D)

1. `source_type` ∈ {verified, translated}? Zwei unabhängige Quellen verlinkt
   und archiviert?
2. Originalkontext gelesen — Aussage nicht sinnentstellt verkürzt?
3. Enthält das Zitat Aussagen über **Dritte**? (Dann besondere Vorsicht —
   das Spiel verbreitet die Aussage weiter.)
4. Wirkt die Paarung herabwürdigend/gleichsetzend? (Policy 4.4 Nr. 6)
5. Bild: Commons, freie Lizenz, Attribution generiert, nicht entstellend?
6. Blurb neutral, keine Wertung?
7. Freigabe durch zweite Person dokumentiert (`approved_by`)?
