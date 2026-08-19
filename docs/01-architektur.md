# 01 — Technische Architektur

## Leitgedanke

Das Spiel ist mechanisch simpel (eine Frage, zwei Antwortmöglichkeiten, ein
Zähler). Die eigentliche Komplexität liegt im **Content** und im **Recht** —
also soll die Technik so schlank wie möglich sein und das Budget (Zeit wie
Geld) in Kuration fließen. Konkret: **MVP komplett ohne eigenes Backend**,
Ausbau erst, wenn ein globales Leaderboard oder ein Redaktions-CMS wirklich
gebraucht wird.

## Empfohlener Stack (MVP)

| Schicht | Empfehlung | Begründung |
|---|---|---|
| Frontend | **Vite + React + TypeScript** | Schnellste Iteration für eine SPA; TypeScript erzwingt das Datenmodell (Kennzeichnungspflichten!) im Code. Svelte/Vue gingen genauso — React hat das größte Ökosystem und die beste KI-Tooling-Unterstützung. |
| Styling | Tailwind CSS | Schnelles, konsistentes UI; Dark Mode trivial. |
| State | React-State + `localStorage` | Score, Highscore, „gesehene Paare" (No-Repeat-Fenster) lokal — keine personenbezogenen Daten, keine Cookies, minimale DSGVO-Fläche. |
| Content | **Statisches JSON im Repo** (`content/*.json`), zur Build-Zeit validiert | Content-as-Code: Jede Zitat-Änderung ist ein Git-Commit/PR → Review-Prozess und Audit-Trail gratis (wichtig für die rechtliche Dokumentation, siehe Dok 03/04). |
| Validierung | Zod-Schema + CI-Check | Build **bricht ab**, wenn ein Datensatz die Content-Regeln verletzt (z. B. lebende Person + nicht belegtes Zitat, fehlender Bildnachweis). Das macht die rechtlichen Leitplanken technisch durchsetzbar. |
| Hosting | **GitHub Pages** (umgesetzt), alternativ Cloudflare Pages | Statisch, kostenlos, direkt aus dem Repository. Der Workflow prüft vor jedem Deploy den Content. Relative Pfade (`base: './'`) und Hash-Routing, damit das Spiel auch im Unterverzeichnis eines Projekt-Pages läuft. |
| Analytics | Zunächst keine, später Plausible/Umami (cookielos) | Hält Datenschutzerklärung minimal; cookielose Tools brauchen kein Consent-Banner. |

**Warum kein Next.js/SSR im MVP?** Es gibt nichts zu rendern, was SEO braucht,
außer der Landingpage — die ist statisch. SSR bringt hier nur Betriebs- und
Deploykomplexität.

## Gestaltung: Papier statt Bildschirm (umgesetzt)

Das Spiel ist als **Desktop-Weberlebnis** gebaut und sieht aus wie eine alte
Zitatensammlung: Büttenpapier-Ton, Tinte, Serifensatz, Doppellinien im
Zeitungskopf, ein Stempel für Richtig/Falsch. Zwei Entscheidungen dahinter:

- **Keine Web-Fonts von fremden Servern.** Google Fonts & Co. würden bei jedem
  Aufruf die IP der Spielenden an Dritte übertragen — das gäbe die datenarme
  Linie aus Dok 04, 4.6 auf. Stattdessen ein System-Serifen-Stack.
- **Papierfaser als SVG-Rauschen**, inline als Data-URI. Keine Bilddatei, kein
  zusätzlicher Request.

Layout: zweispaltig ab `md` mit einer Trennachse zwischen den Karten, Zitat
groß über beiden. Auf schmalen Fenstern fallen Trennachse und Tastenhinweise
weg, die Karten rücken nebeneinander.

## Porträts: gezeichnet statt geliehen (umgesetzt)

Jede Figur und jede Person bekommt eine im Code erzeugte Federzeichnung
(`src/art/`). Aufbau:

- `vocabulary.ts` — Merkmalsvorrat (Kopfform, Frisur, Bart, Kopfbedeckung,
  Brille, Beiwerk, Kleidung) plus ein deterministischer Fallback aus der ID.
- `Portrait.tsx` — Zeichenroutinen, in festen Ebenen von hinten nach vorn:
  Beiwerk hinten → Kleidung → Haar hinten → Hals → Kopf (deckend) → Ohren →
  Schraffur → Haar vorn → Gesichtszüge → Bart → Kopfbedeckung → Brille →
  Beiwerk vorn. Der Kopf ist bewusst deckend gefüllt, sonst scheinen Hals- und
  Haarlinien durchs Gesicht.
- `specs.ts` — Merkmale je Figur und Person.

**Es entsteht immer ein Bild:** Fehlt eine Merkmalsliste, greift der Fallback.
Der Rauchtest prüft über zwölf Runden und in der Galerie (`#/portraets`), dass
auf beiden Seiten ein Porträt mit genug Formen steht.

## Echtbilder zur Laufzeit (Betreiber-Entscheidung, umgesetzt)

Über den Zeichnungen lädt das Spiel echte Bilder — im Browser der Spielenden,
direkt von den Quell-Servern (`src/media/photos.ts`):

- **Anime-Figuren:** Jikan-Suche (`/v4/characters?q=…`, sortiert nach
  Beliebtheit) mit dem Romaji-`search_name` aus `content/characters.json`;
  Anfragen sequenziell mit Abstand (Jikan erlaubt 3/s).
- **Reale Personen:** Artikelbild der deutschen Wikipedia (`pageimages` mit
  Weiterleitungen) über den `wiki_title` aus `content/persons.json` — die
  deutsche Wikipedia hostet nur frei lizenzierte Bilder. Urheber/Lizenz kommen
  per `extmetadata` von Commons und erscheinen als Bildnachweis.
- **Cache:** Ergebnisse (auch Fehlschläge) liegen im `localStorage`
  (7 Tage / 1 Stunde) — die Bildnachweis-Seite generiert daraus ihre Liste.
- **Fallback-Garantie:** Die Federzeichnung rendert sofort und bleibt stehen,
  bis ein Foto geladen ist; scheitert der Abruf, bleibt sie. Kein Bild-Ausfall,
  egal was die Quellen tun.
- **Kill-Switch:** `SITE.useRealImages` in `src/config.ts` — auf `false` läuft
  das Spiel wieder komplett mit Zeichnungen (z. B. nach einer Beanstandung).
- Diese Sandbox erreicht Jikan/Wikimedia nicht (Netzwerk-Policy) — lokal
  erscheinen deshalb die Zeichnungen; auf GitHub Pages laden die Fotos.

## Bild-Handling (technisch — Lizenzfragen in Dok 04)

Grundprinzip: **Niemals zur Laufzeit gegen fremde APIs/CDNs laden.**

1. **Build-Zeit-Sync statt Client-Hotlinking.** Ein Skript
   (`scripts/sync-assets.ts`) lädt freigegebene Bilder einmalig herunter,
   skaliert/beschneidet sie (WebP/AVIF, 2 Größen), legt sie unter
   `public/assets/` ab und schreibt die Pflicht-Metadaten (Autor, Lizenz,
   Quell-URL, Attributionstext) in `content/media.json`. Gründe:
   - Jikan ist ratelimitiert (~3 req/s, 60 req/min) und gelegentlich down —
     zur Laufzeit wäre das ein Ausfallrisiko.
   - Hotlinking auf das MAL-CDN oder Wikimedia ist unzuverlässig und bei MAL
     zusätzlich rechtlich heikel.
   - Nur so lässt sich pro Bild ein geprüfter, versionierter Lizenznachweis
     führen.
2. **Wikidata/Wikimedia-Pfad für reale Personen:** Wikidata-Property `P18`
   (Bild) → Commons-API → `extmetadata` (LicenseShortName, Artist, Credit).
   Das Sync-Skript **verweigert** Bilder ohne freie Lizenz (Whitelist: Public
   Domain, CC0, CC BY, CC BY-SA) und generiert den Attributionstext
   automatisch. „Non-free/Fair-Use"-Bilder aus der englischen Wikipedia werden
   nie übernommen (sie liegen nicht auf Commons — der Commons-Only-Pfad
   filtert sie strukturell aus).
3. **Anime-Charaktere:** Jikan wird nur für **Metadaten** genutzt (Name,
   MAL-ID, About-Text als Rechercheausgangspunkt), **nicht für Bilder im
   Spiel** — Begründung und Alternativen (eigener Avatar-Stil) in Dok 04/06.

## Spiel-Logik (Client)

- Rundenauswahl: gewichteter Zufall aus dem freigegebenen Pool, mit
  No-Repeat-Fenster (zuletzt gesehene ~30 Paare ausgeschlossen, in
  `localStorage`), ansteigende Schwierigkeit über die Streak (leichte Paare in
  Runde 1–3, schwere ab Runde ~8).
- Preloading: nächstes Paar + Bilder werden während der aktuellen Runde
  vorgeladen → keine Wartezeiten, keine „Antwort erraten am Ladeverhalten".
- Der komplette Pool wird als ein JSON-Bundle geladen (bei 500 Paaren Text +
  Referenzen: deutlich unter 500 KB, gzip ~100 KB) — kein Paging nötig.
- **Wichtig:** Die Auflösung („Richtig! Das sagte …") zeigt immer die
  Quellen-/Kennzeichnungsinfo des Zitats an (Badge + Fußnote, siehe Dok 04) —
  die rechtliche Kennzeichnung ist Teil der Kern-UI, kein verstecktes Kleingedrucktes.

## Ausbaustufe: Backend (erst ab Stufe 2, siehe Dok 05)

Sobald ein **globales Leaderboard** oder **Live-Schwierigkeitskalibrierung**
gewünscht ist:

- **Option A (empfohlen): Supabase** — Postgres, anonyme Auth, Row Level
  Security, REST/RPC out of the box. Passt exakt auf das SQL-Modell in Dok 02.
- **Option B: Cloudflare Workers + D1** — wenn ohnehin auf Cloudflare Pages
  gehostet wird; minimalste Betriebskosten.

Endpoints (bewusst klein):
- `POST /api/runs` — abgeschlossene Runde melden (Score, Antwort-Log).
- `GET /api/leaderboard` — Top N + eigener Rang.
- `POST /api/report` — Zitat-Meldung (Beanstandungsprozess, siehe Dok 04).
- `GET /api/content` — später, wenn Content aus DB statt JSON kommt.

**Anti-Cheat (Pflicht, sobald es ein öffentliches Leaderboard gibt):** Ein rein
clientseitiges Spiel kann jeden Score POSTen. Mindestmaßnahmen:
1. Server vergibt pro Spielsitzung ein signiertes Token; jede Antwort wird
   einzeln gemeldet (Server kennt das richtige Ergebnis und führt den Score
   selbst) — nicht der Client meldet am Ende „Score: 94".
2. Plausibilitätsprüfung (minimale Antwortzeit pro Runde, Rate-Limits pro IP).
3. Leaderboard-Namen: freies Textfeld = Moderationsfläche → Wortfilter +
   Meldefunktion, oder generierte Namen („EifrigerErdbeerhut42").

## Repository-Struktur (Ziel)

```
/
├── content/            # Zitate, Paarungen, Personen, Charaktere (JSON, reviewt via PR)
│   ├── universes.json
│   ├── characters.json
│   ├── persons.json
│   ├── quotes.json
│   ├── pairings.json
│   └── media.json      # Bild-Lizenznachweise (generiert + geprüft)
├── scripts/
│   ├── validate-content.ts   # Schema- + Rechtsregeln-Check (CI-Gate)
│   └── sync-assets.ts        # Build-Zeit-Bildsync inkl. Lizenz-Metadaten
├── src/                # Vite + React App
├── public/assets/      # Synchronisierte, geprüfte Bilder
└── docs/               # Diese Planung + Redaktionshandbuch
```

## Nicht-funktionale Anforderungen

- **Desktop zuerst:** Gespielt wird am PC im Browser; Zielauflösung 1440×900,
  alles ohne Scrollen erreichbar. Schmale Fenster bleiben bedienbar (die Karten
  rücken zusammen, Trennachse und Tastenhinweise entfallen).
- **Performance:** Statisch + Preloading → Time-to-Interactive < 2 s auf 3G.
- **Barrierefreiheit:** Antwort per Tastatur (←/→), ausreichende Kontraste,
  Bilder mit Alt-Texten; Farbwahl nie alleiniger Informationsträger.
- **i18n-vorbereitet:** Alle UI-Strings und Zitattexte mit Sprachschlüssel
  (`de`, später `en`) — das Datenmodell (Dok 02) trägt Übersetzungen von
  Anfang an, auch wenn das MVP nur Deutsch ausliefert.
