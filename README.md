# „Wer hat's gesagt?" — Anime vs. Realität

Ein Browsergame nach dem Higher-Lower-Prinzip: Oben steht ein Zitat, links ein
Anime-Charakter (Start: One Piece), rechts eine reale — gern kontroverse,
auch historische — Persönlichkeit. Der Spieler rät, von wem das Zitat stammt.
Richtig → Score +1, nächste Runde. Falsch → Score-Reset, Highscore wird
gespeichert. Der Reiz: Zitate sind thematisch so gewählt (Freiheit, Verrat,
Macht, Verlust …), dass echte Verwechslungsgefahr besteht.

## Projekt-Dokumentation

Die vollständige Planung liegt in [`docs/`](docs/):

| Dokument | Inhalt |
|---|---|
| [01 – Technische Architektur](docs/01-architektur.md) | Tech-Stack, Hosting, Bild-Handling, Ausbaustufen |
| [02 – Datenmodell](docs/02-datenmodell.md) | Entitäten, Felder, Workflow-Status, JSON-Schema (MVP) und SQL-Skizze |
| [03 – Content-Pipeline](docs/03-content-pipeline.md) | Von der Zitat-Idee bis zum freigegebenen Paar; KI-Rolle vs. menschliche Prüfung |
| [04 – Rechtliche Absicherung](docs/04-recht.md) | Disclaimer-Texte, Kennzeichnungssystem, Impressum/AGB/FAQ-Bausteine, Regeln für lebende Personen, Bildlizenzen |
| [05 – MVP & Roadmap](docs/05-mvp-roadmap.md) | Realistischer erster Schritt, Ausbaustufen, Zeit-/Aufwandsplan |
| [06 – Risiken & offene Punkte](docs/06-risiken.md) | Aktive Hinweise auf Lücken im ursprünglichen Konzept |

Beispieldaten, die das Datenmodell demonstrieren: [`content/beispiel-daten.json`](content/beispiel-daten.json)

## Die drei wichtigsten Erkenntnisse vorab

1. **„Öffentliche API" ≠ Bildlizenz.** Jikan/MyAnimeList liefern urheberrechtlich
   geschützte Artworks ohne Nutzungsrecht für Dritte. Die Empfehlung ist ein
   eigener, stilisierter Avatar-Stil für Anime-Charaktere (Details in
   [Dok 04](docs/04-recht.md) und [Dok 06](docs/06-risiken.md)).
2. **Erfundene Zitate + lebende Personen schließen sich aus.** Kein Disclaimer
   heilt ein frei erfundenes Zitat, das einer lebenden realen Person zugeordnet
   wird. Harte Content-Regel: Lebenden Personen werden ausschließlich belegte
   (ggf. übersetzte) Aussagen zugeordnet — technisch im Datenmodell erzwungen
   (Build bricht sonst ab).
3. **„Vollständig abgesichert" gibt es nicht.** Die Planung minimiert Risiken
   systematisch (Kennzeichnung, Auswahl-Policy, Meldeprozess), ersetzt aber
   keine anwaltliche Prüfung vor Launch — die ist als fester Roadmap-Schritt
   eingeplant.

## Status

Planungsphase. Noch kein Code — die Umsetzung startet nach Freigabe des
MVP-Scopes gemäß [Dok 05](docs/05-mvp-roadmap.md).
