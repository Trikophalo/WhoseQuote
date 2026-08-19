# 02 — Datenmodell

## Design-Entscheidungen

1. **Zitat und Paarung sind getrennte Entitäten.** Ein Zitat hat genau einen
   wahren Sprecher. Welcher „Köder" (Decoy) daneben gezeigt wird, ist eine
   eigene, kuratierte Entscheidung — dieselbe Aussage kann mit verschiedenen
   Decoys verschieden schwer und verschieden heikel sein. Die Paarung trägt
   deshalb eigenen Freigabestatus und eigene Schwierigkeit.
2. **Die rechtliche Kennzeichnung ist ein Pflichtfeld, kein Freitext.**
   `source_type` (belegt / übersetzt / sinngemäß / zugeschrieben / fiktiv)
   steuert Badge, Tooltip-Text und die Validierungsregeln.
3. **Risikoklassen für reale Personen** steuern, welche `source_type`-Werte
   überhaupt erlaubt sind. Die Regel „lebende Person ⇒ niemals erfundenes
   Zitat" ist damit keine Redaktionskonvention, sondern ein Build-Fehler.
4. **Jedes Bild hat einen versionierten Lizenznachweis** (`media.json`).
   Ein Charakter/eine Person ohne geklärtes Bild ist zulässig (Fallback:
   Avatar/Initialen) — ein Bild ohne Nachweis ist es nicht.

## Entitäten

### `universe` — Anime-Universum
| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | slug | z. B. `one-piece` |
| `name` | string | Anzeigename |
| `mal_id` | int? | MyAnimeList-ID (Metadaten-Referenz) |
| `status` | enum | `active` \| `planned` |

### `character` — Anime-Charakter
| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | slug | z. B. `one-piece/zoro` |
| `universe_id` | ref | → `universe` |
| `name` | string | Anzeigename |
| `mal_character_id` | int? | Jikan/MAL-Referenz (nur Metadaten) |
| `blurb` | string | 1 Satz Einordnung für die Auflösung („Schwertkämpfer der Strohhutbande") |
| `popularity` | enum | `mainstream` \| `known` \| `deep-cut` — fließt in Schwierigkeit ein |
| `media_id` | ref? | → `media_asset` (eigener Avatar, siehe Dok 04) |

### `person` — Reale Persönlichkeit
| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | slug | z. B. `marcus-aurelius` |
| `name` | string | Anzeigename |
| `wikidata_qid` | string | z. B. `Q1430` — Quelle für Lebensdaten + Bild (P18) |
| `born` / `died` | date? | `died = null` ⇒ gilt als lebend |
| `risk_class` | enum | siehe unten |
| `blurb` | string | 1 Satz neutrale Einordnung („Römischer Kaiser und Stoiker, 121–180") |
| `controversy_note` | string? | Interne Redaktionsnotiz, warum die Person heikel ist |
| `media_id` | ref? | → `media_asset` (Commons, freie Lizenz) |

**Risikoklassen (`risk_class`):**

| Klasse | Definition | Zulässige `source_type` | Zusatzregeln |
|---|---|---|---|
| `A` | Historisch, ≥ 70 Jahre verstorben | alle außer `fictional` | — |
| `B` | Verstorben < 70 Jahre (aktive Erben/Nachlass denkbar) | `verified`, `translated`, `paraphrased`, `attributed` | `attributed` nur mit Fundstellen-Notiz |
| `C` | Lebend, öffentliche Person | nur `verified`, `translated` | Quell-URL Pflicht; Vier-Augen-Freigabe Pflicht; Zwei-Quellen-Regel (Dok 03) |
| `D` | Lebend + erhöhtes Prozess-/Reputationsrisiko | keine (Person nicht aufnehmen) oder Einzelfreigabe nach anwaltlicher Rücksprache | Redaktionskonferenz-Beschluss dokumentieren |

### `quote` — Zitat
| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | slug | z. B. `q-hiluluk-vergessen` |
| `speaker_type` | enum | `character` \| `person` |
| `speaker_id` | ref | → `character` oder `person` |
| `text` | map | `{ "de": "…", "en": "…" }` — mind. eine Sprache |
| `original_lang` | string | z. B. `ja`, `en`, `de` |
| `source_type` | enum | siehe Kennzeichnungssystem unten |
| `source_ref` | string | Fundstelle: Episode/Kapitel, Interview-URL, Buch + Seite. **Pflicht** außer bei `fictional` |
| `source_urls` | string[] | Belege (bei `risk_class C`: min. 2, siehe Dok 03) |
| `themes` | slug[] | z. B. `freiheit`, `verrat`, `macht`, `verlust`, `traeume`, `gerechtigkeit` |
| `tone_flags` | slug[] | z. B. `gewalt`, `politik-sensibel` — steuert Auswahl-Policy/Filter |
| `translation_note` | string? | z. B. „Eigene Übersetzung aus dem Japanischen, sinngemäß" |
| `status` | enum | Workflow, siehe unten |
| `created_by` / `reviewed_by` / `approved_by` | string | Audit-Trail (bei Content-as-Code ergänzt Git das) |
| `last_checked_at` | date | Re-Review-Zyklus (Dok 03) |

**Kennzeichnungssystem (`source_type`)** — steuert das Badge am Zitat (UI-Texte in Dok 04):

| Wert | Bedeutung | Badge (Spieler sieht) |
|---|---|---|
| `verified` | Wörtlich belegt in Originalsprache | „Belegt" |
| `translated` | Belegt, aber übersetzt — Formulierung kann abweichen | „Belegt · übersetzt" |
| `paraphrased` | Sinngemäß überliefert/verdichtet | „Sinngemäß" |
| `attributed` | Wird der Person häufig zugeschrieben, Beleg unsicher | „Zugeschrieben, nicht gesichert" |
| `fictional` | Fiktive Zeile (Anime-Figur) bzw. bewusst erfundenes Stil-Zitat | „Fiktion" / „Im Stil von" |

> Anime-Zitate sind fast immer `translated` oder `paraphrased` (Fundstelle =
> Kapitel/Episode). `fictional` für reale Personen ist **nur** für Klasse A
> denkbar und im MVP komplett deaktiviert (Validierungsregel V6).

### `pairing` — Spielrunde (Zitat + Decoy)
| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | slug | z. B. `p-hiluluk-vs-seneca` |
| `quote_id` | ref | → `quote` |
| `decoy_type` / `decoy_id` | ref | Die falsche Antwortmöglichkeit (immer der jeweils andere Typ: Charakter-Zitat ⇒ Person als Decoy und umgekehrt) |
| `difficulty` | 1–5 | Redaktionelle Ersteinschätzung |
| `difficulty_observed` | float? | Live-Quote „falsch beantwortet" (Stufe 2, überschreibt Einschätzung) |
| `status` | enum | Workflow, siehe unten |
| `pairing_note` | string? | Warum das Paar funktioniert (intern, für Review) |

### `media_asset` — Bild inkl. Lizenznachweis
| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | slug | |
| `kind` | enum | `commons-photo` \| `custom-avatar` \| `placeholder` |
| `storage_path` | string | `public/assets/…` |
| `source_url` | string? | Commons-Dateiseite (bei `commons-photo` Pflicht) |
| `license` | enum | `PD` \| `CC0` \| `CC-BY` \| `CC-BY-SA` \| `own-work` |
| `license_version`| string? | z. B. `4.0` |
| `author` | string? | Urheber laut Commons (bei CC-BY/-SA Pflicht) |
| `attribution_html` | string? | Fertiger Bildnachweis-Text (generiert, geprüft) |
| `modifications` | string? | z. B. „zugeschnitten, Farbkorrektur" (bei CC-BY-SA anzugeben) |
| `cleared` | bool | Redaktionell geprüft — nur `cleared: true` wird gebaut |

### `run` / `answer` — Spielstatistik (erst Stufe 2, serverseitig)
`run(id, started_at, score, client_hash)` und
`answer(run_id, pairing_id, correct, answer_ms)` — Basis für Leaderboard und
`difficulty_observed`. Keine Accounts, anonyme Session-IDs; Aufbewahrung
begrenzen (DSGVO-Hinweis in Dok 04).

## Workflow-Status (für `quote` und `pairing`)

```
draft → sourced → review → (legal_check) → approved → live → retired
                              ↑ nur Pflicht bei risk_class C/D
```

- `draft`: Idee erfasst (auch KI-Vorschlag) — nie im Build.
- `sourced`: Fundstelle(n) eingetragen und geprüft.
- `review`: Zweitperson prüft Quelle, Übersetzung, Ton, Fairness des Paars.
- `legal_check`: nur Klasse C/D — Checkliste aus Dok 04 abgearbeitet.
- `approved`: freigegeben, wartet auf Release.
- `live`: im Spiel. `retired`: entfernt (z. B. nach Beanstandung) — bleibt mit
  Begründung im Datenbestand (Audit-Trail).

## Validierungsregeln (CI bricht bei Verstoß ab)

| # | Regel |
|---|---|
| V1 | Jede Referenz (`speaker_id`, `decoy_id`, `media_id`) existiert; Decoy-Typ ≠ Sprecher-Typ. |
| V2 | `source_ref` fehlt ⇒ nur `status: draft` zulässig (Ausnahme: `fictional`). |
| V3 | Person mit `died = null` ⇒ `risk_class` ∈ {C, D}; Klasse laut Tabelle konsistent mit Lebensdaten. |
| V4 | `risk_class C` ⇒ `source_type` ∈ {`verified`, `translated`} **und** ≥ 2 `source_urls` **und** `approved_by` ≠ `created_by`. |
| V5 | `risk_class D` ⇒ Build-Fehler, außer Datensatz trägt dokumentierte Einzelfreigabe (`legal_signoff`-Feld). |
| V6 | `speaker_type: person` + `source_type: fictional` ⇒ Build-Fehler (MVP; spätere Lockerung nur für Klasse A). |
| V7 | `media_asset` mit `kind: commons-photo` braucht `license` aus Whitelist, `source_url`, bei CC-BY/-SA `author` + `attribution_html`. `cleared: false` ⇒ nicht im Build. |
| V8 | Nur `status: live`-Paarungen landen im ausgelieferten Bundle; ein `live`-Paar darf nur auf `live`-taugliche Zitate/Sprecher zeigen. |
| V9 | Pflicht-Badge: jedes Zitat hat `source_type`; UI-Bundle enthält für jeden Wert einen Tooltip-Text (Dok 04). |

## MVP-Umsetzung vs. Stufe 2

- **MVP:** alles als JSON-Dateien in `content/` (Beispiel:
  [`content/beispiel-daten.json`](../content/beispiel-daten.json)), Zod-Schema
  in `scripts/validate-content.ts`, Review via Pull Request.
- **Stufe 2 (Supabase/Postgres):** gleiche Entitäten als Tabellen
  (`universes`, `characters`, `persons`, `quotes`, `pairings`, `media_assets`,
  `runs`, `answers`); Enums als Postgres-Enums, damit die Regeln V3–V6 als
  `CHECK`-Constraints und Trigger weiterleben. Der JSON-Stand wird per
  Seed-Skript migriert — deshalb sind die Feldnamen von Anfang an SQL-tauglich.
