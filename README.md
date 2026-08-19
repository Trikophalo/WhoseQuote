# „Wer hat's gesagt?" — Anime vs. Realität

Ein Browserspiel nach dem Higher-Lower-Prinzip, gesetzt wie eine alte
Zitatensammlung: Oben steht ein Zitat, links eine Figur aus der Fiktion (Start:
One Piece), rechts eine reale — gern kontroverse, auch historische —
Persönlichkeit. Errate, von wem der Satz stammt. Richtig → Serie +1, falsch →
Partie vorbei, Rekord bleibt gespeichert. Der Reiz: Die Zitate sind thematisch
so gewählt (Freiheit, Verrat, Macht, Verlust …), dass echte Verwechslungsgefahr
besteht.

**Status:** Spielbares MVP mit 68 kuratierten Zitat-Paaren und 55 gezeichneten
Porträts. Die redaktionelle Quellenprüfung und die anwaltliche Abnahme der
Rechtstexte stehen noch aus — beides ist Voraussetzung für einen öffentlichen
Launch (siehe [Vor dem Launch](#vor-dem-launch)).

## Auf GitHub Pages veröffentlichen

Der Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
baut und veröffentlicht automatisch. **Ein Schritt muss von Hand passieren**,
weil der Workflow-Token keine Pages-Site anlegen darf:

1. **Pages aktivieren** (einmalig, ohne diesen Schritt schlägt jeder Deploy
   fehl): Repository → *Settings* → *Pages* → unter *Build and deployment* als
   **Source** `GitHub Actions` wählen.
2. **Deploy auslösen** — entweder durch einen Push auf den Standard-Branch des
   Repositorys, oder manuell über *Actions* → *Deploy auf GitHub Pages* →
   *Run workflow* (dort lässt sich auch ein anderer Branch wählen).
3. Die URL erscheint danach im Actions-Log und unter *Settings → Pages*, in der
   Form `https://<benutzername>.github.io/WhoseQuote/`.

Solange Schritt 1 fehlt, bricht der Workflow gleich zu Beginn mit dem Hinweis
„GitHub Pages ist noch nicht aktiviert" ab — statt später mit einer kryptischen
Fehlermeldung aus `configure-pages`.

Der Workflow prüft vor jeder Veröffentlichung den Content gegen die Regeln
V1–V9 — ein Datensatz, der die rechtlichen Leitplanken verletzt, wird nicht
deployt. Die Pfade sind relativ (`base: './'`) und der Router arbeitet mit
Hashes, deshalb läuft das Spiel auch im Unterverzeichnis eines Projekt-Pages.

## Lokal starten

```bash
npm install
npm run dev          # Entwicklungsserver
npm run build        # Content-Prüfung + Typecheck + Produktions-Build
npm test             # alles oben plus End-to-End-Rauchtest
```

| Befehl | Zweck |
|---|---|
| `npm run validate` | Prüft `content/` gegen Schema und die Regeln V1–V9. Bricht ab, wenn ein Datensatz die rechtlichen Leitplanken verletzt. |
| `npm run test:e2e` | Spielt das Spiel im Browser durch (einmalig `npx playwright install chromium`). |
| `npm run sync-assets` | Holt später Personenfotos von Wikimedia Commons inkl. Lizenznachweis. Braucht `wikidata_qid` in `content/persons.json`. |

## Wie es gebaut ist

Vite + React + TypeScript + Tailwind, **ohne Backend**. Der gesamte Content
liegt als geprüftes JSON in [`content/`](content/) und wandert zur Build-Zeit
ins Bundle; der Rekord bleibt im `localStorage`. Das Spiel ist damit eine rein
statische Seite — kein Server, keine Cookies, kein Tracking, keine Web-Fonts
von fremden Servern.

```
content/            Zitate, Figuren, Personen, Paarungen (Review via Pull Request)
src/art/            Porträt-Engine: Merkmalsvokabular, Zeichenroutinen, Zuordnung
src/content/        Zod-Schema + Regeln V1–V9, Kennzeichnungstexte, Laufzeit-Laden
src/game/           Rundenauswahl (Schwierigkeitskurve, No-Repeat) und lokaler Speicher
src/components/     Spiel-UI: Zitatsatz, Auswahlkarten, Kennzeichnungs-Badge
src/pages/          Rechtsseiten und Porträt-Galerie
scripts/            Content-Gate, Bild-Sync, End-to-End-Rauchtest
docs/               Die vollständige Projektplanung
```

## Bilder: gezeichnet statt geliehen

Jede Figur und jede Person bekommt ein **im Code gezeichnetes Porträt** — eine
Federzeichnung, die aus einem Merkmalsvorrat zusammengesetzt wird (Kopfform,
Frisur, Bart, Kopfbedeckung, Beiwerk). Erkennbar wird sie über die Silhouette:
Strohhut, Zweispitz, Lorbeerkranz, Walrossbart.

Das ist bewusst so und kein Notbehelf: MyAnimeList bzw. die Jikan-API liefern
urheberrechtlich geschützte Artworks, und eine öffentlich abrufbare API räumt
keine Nutzungsrechte ein. Die Zeichnungen sind eigene Abstraktionen, keine
Nachzeichnungen der Originalentwürfe.

Wer in [`src/art/specs.ts`](src/art/specs.ts) keine eigene Merkmalsliste hat,
bekommt automatisch ein aus der Kennung abgeleitetes Porträt — **es erscheint
also nie ein Platzhalter**. Der Rauchtest prüft genau das: über zwölf Runden
und in der Galerie muss auf jeder Seite ein gezeichnetes Porträt stehen.

Alle Porträts auf einen Blick: `#/portraets` (nicht im Menü verlinkt, gedacht
als Kontrollblatt für die Redaktion).

## Die rechtlichen Leitplanken sind Code, nicht Konvention

Das ist die zentrale Design-Entscheidung des Projekts: Was rechtlich nicht
ausgeliefert werden darf, soll gar nicht erst baubar sein. `npm run build` ruft
deshalb zuerst den Validator auf, und der bricht unter anderem ab, wenn

- einer **lebenden Person** ein nicht belegtes Zitat zugeordnet wird (Regel V4/V6),
- ein Zitat ohne Fundstelle den Entwurfsstatus verlässt (V2),
- eine Risikoklasse nicht zu den Lebensdaten passt (V3),
- ein Bild ohne freie Lizenz oder ohne Urheberangabe eingebunden wird (V7),
- eine freigegebene Paarung auf ungeprüften Content zeigt (V8).

Ebenso trägt **jedes** Zitat eine Kennzeichnung — *Belegt*, *Belegt · übersetzt*,
*Sinngemäß*, *Zugeschrieben* oder *Fiktion* —, die nach jeder Runde zusammen mit
der Fundstelle erscheint. Während der Rate-Phase bleibt sie bewusst verborgen,
weil sie sonst die Lösung verraten würde; auch das prüft der Rauchtest.

## Projekt-Dokumentation

| Dokument | Inhalt |
|---|---|
| [01 – Technische Architektur](docs/01-architektur.md) | Tech-Stack, Hosting, Bild-Handling, Ausbaustufen |
| [02 – Datenmodell](docs/02-datenmodell.md) | Entitäten, Workflow-Status, Validierungsregeln |
| [03 – Content-Pipeline](docs/03-content-pipeline.md) | Von der Zitat-Idee bis zum freigegebenen Paar |
| [04 – Rechtliche Absicherung](docs/04-recht.md) | Disclaimer, Kennzeichnung, Personen-Policy, Bildlizenzen |
| [05 – MVP & Roadmap](docs/05-mvp-roadmap.md) | Scope, Ausbaustufen, Zeit-/Aufwandsplan |
| [06 – Risiken & offene Punkte](docs/06-risiken.md) | Lücken im ursprünglichen Konzept |

## Vor dem Launch

Diese Punkte sind bewusst offen und blockieren die Veröffentlichung:

1. **Impressum ausfüllen.** Alle `TODO`-Werte in [`src/config.ts`](src/config.ts)
   ersetzen. Solange sie stehen, zeigt die Impressumsseite einen Warnhinweis.
   Ein vollständiges Impressum ist nach § 5 DDG Pflicht.
2. **Redaktionelle Quellenprüfung.** Der Zitat-Bestand stammt aus der
   Recherchephase und ist konservativ gekennzeichnet, aber `reviewed_by` ist
   überall leer — der Validator meldet das bei jedem Build. Schritt 3–5 der
   [Content-Pipeline](docs/03-content-pipeline.md) fehlt noch.
3. **Anwaltliche Abnahme** der Texte aus [Dok 04](docs/04-recht.md).
4. **Lebende Personen** sind derzeit komplett aus dem Spiel (ein Testfall steht
   auf `review`) — sie gehen erst nach Zwei-Quellen-Beleg und Vier-Augen-Freigabe
   live.
