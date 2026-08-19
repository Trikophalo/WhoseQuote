# 03 — Content-Pipeline

Ziel: mehrere hundert Zitat-Paare, die (1) thematisch verwechselbar, (2) laufend
erweiterbar und (3) kuratiert statt ungeprüft generiert sind — bei vertretbarem
Redaktionsaufwand.

## Grundprinzip: Content-as-Code mit KI-Vorstufe und menschlichem Gate

KI beschleunigt **Suche, Vorauswahl und Formulierung**. Kein Datensatz erreicht
`approved` ohne menschliche Prüfung — und die Validierung (Dok 02, V1–V9)
erzwingt das technisch: Ein ungeprüfter Datensatz kann gar nicht deployt
werden, weil Pflichtfelder (Fundstelle, Reviewer, Kennzeichnung) fehlen.

## Datenquellen

### Zitate realer Personen
| Quelle | Nutzen | Vorsicht |
|---|---|---|
| **Wikiquote (de/en)** | Beste Startquelle — unterscheidet bereits „Belegt" / „Zugeschrieben" / „Fälschlich zugeschrieben". Diese Einteilung mappt fast 1:1 auf unser `source_type`. | Belege stichprobenartig nachprüfen; die „Fälschlich zugeschrieben"-Listen sind Gold, um peinliche Fehler zu vermeiden. |
| Wikidata | Lebensdaten, Normdaten, Bild (P18) | Kein Zitat-Ersatz |
| Primärquellen (Interviews, Reden, Bücher) | Pflicht bei Risikoklasse C (lebende Personen) | Archiv-Link (z. B. Wayback Machine) zusätzlich sichern, damit Belege nicht verrotten |
| Quotable u. ä. Zitat-APIs | Nur Ideengeber | Notorisch fehlerhafte Zuschreibungen — nie ungeprüft übernehmen |

**Zwei-Quellen-Regel für lebende Personen (Klasse C):** Ein Zitat gilt nur als
belegt, wenn zwei voneinander unabhängige, seriöse Quellen es tragen (z. B.
Interview-Video + Berichterstattung), mindestens eine davon primär oder
primärnah. Beide URLs kommen in `source_urls`.

### Anime-Zitate (One Piece)
- **Fundstelle ermitteln:** Fan-Wikis und Episodenlisten nur als *Wegweiser*
  („Kapitel 145, Hiluluks Rede") — die Fundstelle wird am Werk selbst
  verifiziert (Manga-Band/Episode).
- **Text formulieren:** **Eigene, sinngemäße Übersetzung** aus dem Kontext —
  nicht die offizielle deutsche Synchron-/Verlagsübersetzung kopieren (die
  Übersetzung ist selbst urheberrechtlich geschützt, siehe Dok 04). Das passt
  ohnehin zur gewünschten Kommunikation „Übersetzungen können abweichen" und
  wird als `translated`/`paraphrased` gekennzeichnet.
- Jikan/MAL liefert Charakter-Metadaten (Namen, IDs, Beschreibungen als
  Recherche-Einstieg) — keine Bilder ins Spiel (Dok 04).

## Der Workflow: von der Idee zum Live-Paar

Gearbeitet wird in **Themen-Batches** (z. B. „Freiheit", „Verrat", „Macht",
„Verlust", „Träume", „Gerechtigkeit") — das erzeugt automatisch die gewollte
Verwechselbarkeit, weil beide Seiten eines Batches zum selben Thema sprechen.

```
1. BATCH-PLANUNG      Thema wählen, Zielgröße (z. B. 20 Paare), Charaktere/Personen-Pool festlegen
2. KI-VORSTUFE        Kandidaten generieren lassen (siehe unten) → alles ist "draft"
3. QUELLEN-CHECK      Mensch: Fundstelle verifizieren, source_type festlegen,
                      Übersetzung erstellen/prüfen → "sourced"
4. PAIRING            Mensch (+ KI-Vorschläge): Decoy wählen, Schwierigkeit schätzen,
                      pairing_note schreiben („funktioniert, weil …")
5. REVIEW             Zweite Person: Beleg, Ton, Fairness, Kennzeichnung → "review" → ok?
6. LEGAL-CHECK        Nur Klasse C/D: Checkliste aus Dok 04 → "legal_check"
7. FREIGABE           Pull Request mergen = "approved"; Release-Tag = "live"
8. BEOBACHTEN         Spielstatistik (Stufe 2): difficulty_observed, Meldungen,
                      Re-Review-Zyklus
```

Bei Content-as-Code sind Schritte 5–7 schlicht der PR-Review: Der Diff zeigt
jedes neue Zitat mit allen Pflichtfeldern, die CI läuft die Validierung, der
Merge dokumentiert Freigeber und Zeitpunkt. **Audit-Trail gratis** — genau das,
was man vorlegen will, falls je eine Beanstandung kommt.

## Was die KI macht — und was nicht

| Schritt | KI-Rolle | Menschliche Prüfung (nicht delegierbar) |
|---|---|---|
| Kandidatensuche | „Nenne 30 belegbare Aussagen realer Persönlichkeiten zum Thema Verrat, mit Fundstellenhinweis" — Rohliste in Minuten statt Tagen | Jede Fundstelle real nachschlagen. KI-Fundstellen sind Hypothesen, keine Belege (Halluzinationsgefahr ist hier *das* Kernrisiko). |
| Anime-Recherche | Szenen/Kapitel-Hinweise, Charakter-Themen-Matrix („Welche One-Piece-Figuren sprechen über Freiheit?") | Szene im Werk verifizieren |
| Übersetzung | Erstfassung der sinngemäßen Übersetzung | Sprachliche + inhaltliche Abnahme; `translation_note` setzen |
| Pairing | Decoy-Vorschläge nach Themen-/Stil-Nähe; Schwierigkeitsschätzung | Fairness (ist es ratbar, ohne Insiderwissen? ist es *unmöglich*?), Geschmack/Ton |
| Ton-Screening | Vorwarnung: „Dieses Paar könnte als Verharmlosung/Gleichsetzung gelesen werden" | Endgültige Entscheidung; Auswahl-Policy Dok 04 |
| Meta | Themen-Tags, Blurbs, Alt-Texte vorschlagen | Stichprobe |

**Verbot:** KI erfindet keine Zitate für reale Personen. Für Anime-Charaktere
sind erfundene „Im Stil von"-Zeilen (Kennzeichnung `fictional`) eine spätere
Option — im MVP ausgeschaltet, weil echte Zeilen reichlich vorhanden sind und
die Kennzeichnungs-UX erst stehen soll.

## Redaktions-Checkliste (pro Paar, Kurzform)

1. Fundstelle geöffnet und Zitat dort wirklich gefunden? (`source_ref`)
2. `source_type` ehrlich gesetzt? (Im Zweifel eine Stufe „unsicherer" wählen —
   `attributed` statt `verified`.)
3. Klasse C: zwei Quellen? Aussage im Originalkontext nicht sinnentstellt?
   Nichts, was als neue Tatsachenbehauptung über die Person wirkt?
4. Übersetzung sinngemäß korrekt, `translation_note` gesetzt?
5. Paar fair? (Beide Antworten müssen plausibel sein — sonst kein Spielreiz;
   aber die richtige muss durch Stil/Weltwissen erschließbar bleiben.)
6. Ton ok? (Keine Gleichsetzung Anime-Held ↔ Gewaltherrscher als „Pointe";
  `tone_flags` gesetzt; Auswahl-Policy Dok 04 eingehalten.)
7. Blurbs beider Seiten neutral formuliert?
8. Bild vorhanden ⇒ `media_asset` `cleared`?

## Qualitäts-Feedback aus dem Spiel

- **Meldefunktion** („Zitat melden": falsch zugeschrieben / Übersetzung
  irreführend / unangemessen) — Pflichtbestandteil ab MVP, auch rechtlich
  relevant (Beanstandungsprozess, Dok 04).
- **Live-Schwierigkeit** (Stufe 2): Fehlerquote pro Paar → kalibriert
  `difficulty_observed`; Paare, die > 95 % oder < 5 % richtig beantwortet
  werden, fliegen in den Re-Review (langweilig oder unfair).
- **Re-Review-Zyklus:** Alle Klasse-C-Zitate spätestens alle 12 Monate prüfen
  (`last_checked_at`): Person verstorben? Kontext verändert? Quelle offline
  (→ Archivlink)?

## Aufwandsschätzung (realistisch)

- Mit KI-Vorstufe: **6–10 fertig geprüfte Paare pro Redaktionsstunde** bei
  Klasse-A/B-Personen; Klasse C eher 3–5/h (Zwei-Quellen-Regel).
- MVP-Ziel 50 Paare ≈ **1,5–2 Personentage** Redaktion + Review — das ist der
  Flaschenhals, aber ein gut machbarer.
- Laufender Betrieb: ein Batch (20 Paare) pro Monat ≈ ein halber Tag — hält
  das Spiel frisch, ohne zur Belastung zu werden.

## Skalierung auf „mehrere hundert"

1. Themen-Batches wiederholen (≈ 10 Themen × 30–50 Paare = 300–500).
2. Neue Universen (Dok 05) bringen jeweils neue Charakter-Pools; die
   Personen-Seite wird wiederverwendet (ein gutes Personen-Zitat kann mit
   Decoys aus mehreren Universen gepaart werden — deshalb Zitat ≠ Paarung).
3. Community-Einreichungen (Stufe 3) laufen durch **denselben** Workflow ab
   Schritt 3 — es gibt keinen zweiten, „schnelleren" Pfad an der Prüfung
   vorbei.
