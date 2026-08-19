# „Wer hat's gesagt?" — Anime vs. Realität

Ein Browsergame nach dem Higher-Lower-Prinzip: Oben steht ein Zitat, links ein
Anime-Charakter (Start: One Piece), rechts eine reale — gern kontroverse,
auch historische — Persönlichkeit. Der Spieler rät, von wem das Zitat stammt.
Richtig → Serie +1, falsch → Serie zurück auf null, Rekord bleibt gespeichert.
Der Reiz: Zitate sind thematisch so gewählt (Freiheit, Verrat, Macht, Verlust …),
dass echte Verwechslungsgefahr besteht.

**Status:** Spielbares MVP mit 68 kuratierten Zitat-Paaren. Die abschließende
redaktionelle Quellenprüfung und die anwaltliche Abnahme der Rechtstexte stehen
noch aus — beides ist Voraussetzung für einen öffentlichen Launch (siehe
[Vor dem Launch](#vor-dem-launch)).

## Loslegen

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
statische Seite — kein Server, keine Cookies, kein Tracking.

```
content/            Zitate, Figuren, Personen, Paarungen (Review via Pull Request)
src/content/        Zod-Schema + Regeln V1–V9, Kennzeichnungstexte, Laufzeit-Laden
src/game/           Rundenauswahl (Schwierigkeitskurve, No-Repeat) und lokaler Speicher
src/components/     Spiel-UI: Zitatkarte, Auswahlkarten, Kennzeichnungs-Badge, Avatare
src/pages/legal.ts  FAQ, Impressum, Datenschutz, Nutzungsbedingungen, Bildnachweise
scripts/            Content-Gate, Bild-Sync, End-to-End-Rauchtest
docs/               Die vollständige Projektplanung
```

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
weil sie sonst die Lösung verraten würde; der Rauchtest prüft genau das.

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
4. **Bilder.** Aktuell laufen alle Figuren und Personen mit selbst generierten
   SVG-Avataren. Bewusst: MyAnimeList/Jikan liefert geschützte Artworks, und
   eine öffentliche API ist keine Lizenz.
5. **Lebende Personen** sind derzeit komplett aus dem Spiel (ein Testfall steht
   auf `review`) — sie gehen erst nach Zwei-Quellen-Beleg und Vier-Augen-Freigabe
   live.
