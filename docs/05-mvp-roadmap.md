# 05 — MVP-Scope & Roadmap

## Leitidee für den Schnitt

Der Flaschenhals ist Content + Recht, nicht Code. Also: **kleinster Build, der
die Kern-Wette testet** — nämlich ob „Anime-Zitat oder echte Person?" wirklich
den Verwechslungs-Reiz erzeugt — bei von Tag 1 an sauberer Kennzeichnung.
Alles, was skaliert (Backend, CMS, weitere Universen), kommt erst, wenn die
Wette aufgeht.

## Umsetzungsstand (Stand: aktueller Branch)

Das MVP ist gebaut und spielbar. Was steht:

| Bereich | Stand |
|---|---|
| Kernloop, Schwierigkeitskurve, No-Repeat-Fenster, Rekord | ✅ umgesetzt |
| Content | ✅ 68 Paarungen, 22 Figuren, 33 Personen — über dem Zielkorridor von 50–60 |
| Kennzeichnung am Zitat (Badge, Tooltip, Fundstelle) | ✅ umgesetzt, per Rauchtest abgesichert |
| Pflichtseiten (FAQ, Impressum, Datenschutz, AGB, Bildnachweise) | ✅ Texte stehen, Betreiberdaten sind Platzhalter |
| Validierung V1–V9 als Build-Gate | ✅ umgesetzt (`npm run validate`) |
| Meldefunktion | ✅ als vorbefüllte E-Mail |
| Porträts | ✅ 55 eigene Federzeichnungen im Code, Fallback für neue Einträge |
| Papier-Optik, Desktop-Layout | ✅ umgesetzt |
| Veröffentlichung | ✅ GitHub-Pages-Workflow inkl. Content-Gate |
| Redaktionelle Quellenprüfung (Pipeline-Schritt 3–5) | ❌ offen — Voraussetzung für Launch |
| Anwaltliche Abnahme | ❌ offen — Voraussetzung für Launch |
| Lebende Personen | ⏸ bewusst deaktiviert, ein Testfall steht auf `review` |

Damit sind die Wochen 1–3 der Roadmap unten erledigt; der nächste Schritt ist
Woche 4 (Politur + anwaltliche Prüfung) bzw. der Redaktionsdurchlauf.

## MVP (Stufe 1) — „One Piece, 50 Paare, kein Backend"

**Inhalt**
- Nur One Piece: 10–14 Charaktere (Mix aus Mainstream und Kennern bekannt).
- 12–16 reale Personen, **überwiegend Klasse A/B** (historisch/verstorben) —
  bewusst nur 2–4 lebende Personen (Klasse C) mit wasserdicht belegten
  Zitaten, um den Legal-Check-Prozess einmal komplett zu erproben, ohne das
  MVP davon abhängig zu machen.
- **50–60 freigegebene Paarungen** über 5–6 Themen (Freiheit, Verrat, Macht,
  Verlust, Träume, Gerechtigkeit) in 3 Schwierigkeitsstufen.
- Darstellung: Initialen-/Silhouetten-Avatare für Charaktere (eigener
  Avatar-Stil als frühes Stufe-2-Upgrade), Commons-Fotos für Personen.

**Features**
- Kernloop: Zitat → Wahl links/rechts → Auflösung mit Badge + Fundstelle +
  Blurbs → Score/Streak; falsch → Reset, Highscore in `localStorage`.
- Schwierigkeitskurve über die Streak, No-Repeat-Fenster.
- „Zitat melden"-Funktion (mailto oder simples Form).
- Pflichtseiten: Startscreen-Hinweis, FAQ, Impressum, Datenschutz,
  Bildnachweise, Nutzungsbedingungen (Texte aus Dok 04).
- Teilen des Highscores als Text/Emoji-Snippet (kein Bild-Rendering nötig).

**Explizit NICHT im MVP:** Accounts, globales Leaderboard, weitere Animes,
Kategorien-Wahl durch Spieler, Daily Challenge, Admin-UI, Englisch,
`fictional`-Stil-Zitate.

**Erfolgskriterien (nach 2–4 Wochen Beta):** Median-Session > 3 Minuten,
Wiederkehrer-Quote > 20 %, Fehlerquote pro Paar zwischen 20 % und 80 %
(= Paare sind weder trivial noch reines Münzwerfen), < 2 % gemeldete Paare.

## Stufe 2 — „Es macht Spaß, jetzt Tiefe"

- **Eigener Avatar-Stil** für Charaktere (10–15 Motive beauftragen).
- **Globales Leaderboard** (Supabase oder Workers+D1) inkl. Anti-Cheat
  (Dok 01) und Nickname-Moderation; Datenschutzerklärung erweitern.
- **Live-Schwierigkeit** (`difficulty_observed`) + automatischer Re-Review-
  Trigger für Ausreißer-Paare.
- **Daily Challenge** (täglich dieselben 10 Paare für alle, Share-Grafik im
  Wordle-Stil) — stärkster Retention-/Viralitäts-Hebel dieses Genres.
- Content-Ausbau auf ~150 Paare; erste Kategorien-Filter („Nur Freiheit &
  Verrat").

## Stufe 3 — „Skalieren"

- **Weitere Universen** (z. B. Naruto, Attack on Titan, Berserk — Auswahl nach
  Zitat-Ergiebigkeit: philosophisch schwere Serien funktionieren am besten).
  Personen-Zitate werden gegen neue Charakter-Pools wiederverwendet (Dok 03).
- **Redaktions-Tooling:** erst wenn > 2 Personen kuratieren — leichtes
  Admin-UI oder Decap CMS auf den JSON-Dateien; vorher reicht der PR-Workflow.
- Community-Einreichungen (durch denselben Review-Workflow, Dok 03).
- Englisch (i18n ist im Datenmodell vorbereitet); ggf. `fictional`-Stil-Zitate
  für Charaktere und Klasse-A-Personen mit eigener Badge-UX.
- Monetarisierung **erst hier entscheiden** (siehe Dok 06 — sie verschärft
  mehrere Rechtsfragen und gehört daher bewusst ans Ende, nicht an den Anfang).

## Roadmap mit Aufwandsschätzung

Annahme: 1 Person, Teilzeit (~10–15 h/Woche), KI-gestützt. In Klammern:
reine Personentage (PT).

| Woche | Meilenstein | Inhalt | Aufwand |
|---|---|---|---|
| 1 | **Technisches Skelett** | Vite/React/Tailwind-Setup, Datenmodell als Zod-Schema, `validate-content.ts`, CI, Kernloop mit 5 Dummy-Paaren spielbar | 3 PT |
| 2 | **Content-Sprint 1** | 2 Themen-Batches (≈ 25 Paare) durch die volle Pipeline; Wikidata/Commons-Sync-Skript; Bildnachweis-Seite generiert | 3 PT |
| 3 | **Content-Sprint 2 + Recht** | Weitere ≈ 30 Paare; alle Rechtstexte (Dok 04) eingebaut; Kennzeichnungs-UX (Badges, Tooltips, Auflösung) fertig | 3 PT |
| 4 | **Politur + anwaltliche Prüfung** | Schwierigkeitskurve, Preloading, A11y, Mobile-Feinschliff; parallel: Anwalt prüft Texte + Avatar-Frage | 2 PT (+ extern) |
| 5–6 | **Closed Beta** | 20–50 Tester (Anime-Communities), Meldungen & Metriken auswerten, 10–20 % der Paare nachschärfen | 2 PT |
| 7 | **Launch Stufe 1** | Domain, Impressum live, Soft-Launch (Reddit/Discord-Communities) | 1 PT |
| 8–12 | **Stufe 2** | Avatare (extern, parallel), Leaderboard, Daily Challenge, Content → 150 | 6–8 PT |

**Gesamtaufwand bis Launch: ≈ 14 Personentage** über ~7 Wochen Teilzeit.
Externe Kosten: Domain/Hosting ≈ 0–20 €/Jahr (Free Tiers), anwaltliche
Erstprüfung (einmalig, dreistellig bis niedrig vierstellig), Avatar-Illustration
Stufe 2 (je nach Stil, ~20–60 €/Motiv bei Einzelbeauftragung).

## Entscheidungs-Gates (bewusste Stopp-Punkte)

1. **Nach Woche 1:** Fühlt sich der Kernloop mit Dummy-Content gut an?
   (Wenn nicht: Mechanik variieren — z. B. „3 Leben" statt Hard-Reset — bevor
   Content-Zeit investiert wird.)
2. **Nach der Beta:** Erfolgskriterien erreicht? Erst dann Stufe-2-Aufwand
   (Backend, Avatare) freigeben.
3. **Vor Monetarisierung:** erneuter Rechts-Check (Dok 06, Punkt 8).
