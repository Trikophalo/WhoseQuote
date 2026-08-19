import { z } from 'zod'

/**
 * Datenmodell aus docs/02-datenmodell.md.
 *
 * Die Validierungsregeln V1–V9 sind hier bewusst als Schema und nicht als
 * Redaktionskonvention umgesetzt: Ein Datensatz, der die rechtlichen
 * Leitplanken verletzt, kann gar nicht erst gebaut werden.
 */

const slug = z.string().regex(/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/, 'Slug: nur a-z, 0-9, - und /')

/** Kennzeichnung der Belegbarkeit. Steuert Badge + Tooltip im Spiel. */
export const SOURCE_TYPES = ['verified', 'translated', 'paraphrased', 'attributed', 'fictional'] as const
export type SourceType = (typeof SOURCE_TYPES)[number]

/**
 * Risikoklasse realer Personen.
 * A = historisch (>= 70 Jahre verstorben) · B = verstorben < 70 Jahre
 * C = lebend, öffentliche Person · D = lebend + erhöhtes Risiko
 */
export const RISK_CLASSES = ['A', 'B', 'C', 'D'] as const
export type RiskClass = (typeof RISK_CLASSES)[number]

export const WORKFLOW_STATUS = ['draft', 'sourced', 'review', 'legal_check', 'approved', 'live', 'retired'] as const
export type WorkflowStatus = (typeof WORKFLOW_STATUS)[number]

/** Nur diese Lizenzen dürfen in den Build (Regel V7). */
export const LICENSE_WHITELIST = ['PD', 'CC0', 'CC-BY', 'CC-BY-SA', 'own-work'] as const

export const universeSchema = z.object({
  id: slug,
  name: z.string().min(1),
  mal_id: z.number().int().positive().nullable().default(null),
  status: z.enum(['active', 'planned']),
})

export const characterSchema = z.object({
  id: slug,
  universe_id: slug,
  name: z.string().min(1),
  mal_character_id: z.number().int().positive().nullable().default(null),
  blurb: z.string().min(1),
  popularity: z.enum(['mainstream', 'known', 'deep-cut']),
  media_id: slug.nullable().default(null),
  /** Akzentfarbe für den generierten Avatar (HSL-Hue 0-360). */
  hue: z.number().int().min(0).max(360),
  /**
   * Romaji-Name für die MyAnimeList-Suche (Jikan). Die Anzeige-Namen sind
   * deutsche Lokalisierungen („Lorenor Zorro“), die MAL nicht kennt.
   * null ⇒ kein Foto-Abruf, es bleibt bei der gezeichneten Darstellung.
   */
  search_name: z.string().nullable().default(null),
})

export const personSchema = z.object({
  id: slug,
  name: z.string().min(1),
  wikidata_qid: z.string().regex(/^Q\d+$/).nullable().default(null),
  born: z.string().nullable().default(null),
  died: z.string().nullable().default(null),
  risk_class: z.enum(RISK_CLASSES),
  blurb: z.string().min(1),
  controversy_note: z.string().nullable().default(null),
  media_id: slug.nullable().default(null),
  hue: z.number().int().min(0).max(360),
  /** Dokumentierte Einzelfreigabe — Voraussetzung für Klasse D (Regel V5). */
  legal_signoff: z.string().nullable().default(null),
  /**
   * Artikeltitel in der deutschen Wikipedia — Quelle für das Porträtfoto
   * (die deutsche Wikipedia hostet ausschließlich frei lizenzierte Bilder).
   * null ⇒ kein Foto-Abruf, es bleibt bei der gezeichneten Darstellung.
   */
  wiki_title: z.string().nullable().default(null),
})

export const quoteSchema = z.object({
  id: slug,
  speaker_type: z.enum(['character', 'person']),
  speaker_id: slug,
  text: z.object({ de: z.string().min(1), en: z.string().min(1).optional() }),
  original_lang: z.string().min(2).max(3),
  source_type: z.enum(SOURCE_TYPES),
  source_ref: z.string().nullable().default(null),
  source_urls: z.array(z.string().url()).default([]),
  themes: z.array(slug).min(1),
  tone_flags: z.array(slug).default([]),
  translation_note: z.string().nullable().default(null),
  status: z.enum(WORKFLOW_STATUS),
  created_by: z.string().min(1),
  reviewed_by: z.string().nullable().default(null),
  approved_by: z.string().nullable().default(null),
  last_checked_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const pairingSchema = z.object({
  id: slug,
  quote_id: slug,
  decoy_type: z.enum(['character', 'person']),
  decoy_id: slug,
  difficulty: z.number().int().min(1).max(5),
  difficulty_observed: z.number().min(0).max(1).nullable().default(null),
  status: z.enum(WORKFLOW_STATUS),
  pairing_note: z.string().nullable().default(null),
})

export const mediaAssetSchema = z.object({
  id: slug,
  kind: z.enum(['commons-photo', 'custom-avatar', 'placeholder']),
  storage_path: z.string().min(1),
  source_url: z.string().url().nullable().default(null),
  license: z.enum(LICENSE_WHITELIST),
  license_version: z.string().nullable().default(null),
  author: z.string().nullable().default(null),
  attribution_html: z.string().nullable().default(null),
  modifications: z.string().nullable().default(null),
  cleared: z.boolean(),
})

export const contentSchema = z.object({
  universes: z.array(universeSchema),
  characters: z.array(characterSchema),
  persons: z.array(personSchema),
  quotes: z.array(quoteSchema),
  pairings: z.array(pairingSchema),
  media_assets: z.array(mediaAssetSchema).default([]),
})

export type Universe = z.infer<typeof universeSchema>
export type Character = z.infer<typeof characterSchema>
export type Person = z.infer<typeof personSchema>
export type Quote = z.infer<typeof quoteSchema>
export type Pairing = z.infer<typeof pairingSchema>
export type MediaAsset = z.infer<typeof mediaAssetSchema>
export type ContentBundle = z.infer<typeof contentSchema>

export type Issue = { rule: string; id: string; message: string }

/**
 * Regeln V1–V9 aus docs/02-datenmodell.md.
 * `errors` blockieren den Build, `warnings` nicht (aber sie werden gemeldet).
 */
export function checkRules(content: ContentBundle): { errors: Issue[]; warnings: Issue[] } {
  const errors: Issue[] = []
  const warnings: Issue[] = []
  const err = (rule: string, id: string, message: string) => errors.push({ rule, id, message })
  const warn = (rule: string, id: string, message: string) => warnings.push({ rule, id, message })

  const universes = new Map(content.universes.map((u) => [u.id, u]))
  const characters = new Map(content.characters.map((c) => [c.id, c]))
  const persons = new Map(content.persons.map((p) => [p.id, p]))
  const quotes = new Map(content.quotes.map((q) => [q.id, q]))
  const media = new Map(content.media_assets.map((m) => [m.id, m]))

  const dupes = (ids: string[], kind: string) => {
    const seen = new Set<string>()
    for (const id of ids) {
      if (seen.has(id)) err('V1', id, `Doppelte ${kind}-ID`)
      seen.add(id)
    }
  }
  dupes(content.characters.map((c) => c.id), 'Charakter')
  dupes(content.persons.map((p) => p.id), 'Person')
  dupes(content.quotes.map((q) => q.id), 'Zitat')
  dupes(content.pairings.map((p) => p.id), 'Paarung')

  // V1: Referenzintegrität
  for (const c of content.characters) {
    if (!universes.has(c.universe_id)) err('V1', c.id, `Unbekanntes Universum: ${c.universe_id}`)
    if (c.media_id && !media.has(c.media_id)) err('V1', c.id, `Unbekanntes media_asset: ${c.media_id}`)
  }
  for (const p of content.persons) {
    if (p.media_id && !media.has(p.media_id)) err('V1', p.id, `Unbekanntes media_asset: ${p.media_id}`)
  }
  for (const q of content.quotes) {
    const exists = q.speaker_type === 'character' ? characters.has(q.speaker_id) : persons.has(q.speaker_id)
    if (!exists) err('V1', q.id, `Unbekannter Sprecher: ${q.speaker_type}/${q.speaker_id}`)
  }

  for (const q of content.quotes) {
    // V2: Fundstelle ist Pflicht, sobald das Zitat den Entwurfsstatus verlässt
    if (!q.source_ref && q.status !== 'draft' && q.source_type !== 'fictional') {
      err('V2', q.id, 'source_ref fehlt — ohne Fundstelle nur status "draft" zulässig')
    }

    if (q.speaker_type === 'person') {
      const person = persons.get(q.speaker_id)
      if (!person) continue

      // V6: Reale Personen bekommen im MVP nie erfundene Zitate
      if (q.source_type === 'fictional') {
        err('V6', q.id, 'source_type "fictional" ist für reale Personen nicht zulässig')
      }

      // V4: Lebende Personen (Klasse C) — belegt, zwei Quellen, Vier-Augen-Prinzip
      if (person.risk_class === 'C') {
        if (!['verified', 'translated'].includes(q.source_type)) {
          err('V4', q.id, `Klasse C erlaubt nur verified/translated, nicht "${q.source_type}"`)
        }
        // Zwei-Quellen-Regel und Vier-Augen-Prinzip greifen zur Freigabe:
        // Entwürfe dürfen unvollständig sein, sie dürfen nur nicht ausgeliefert werden.
        const isReleased = q.status === 'live' || q.status === 'approved'
        if (q.source_urls.length < 2) {
          const msg = `Klasse C verlangt mind. 2 unabhängige Quellen (hat ${q.source_urls.length})`
          if (isReleased) err('V4', q.id, msg)
          else warn('V4', q.id, `${msg} — vor Freigabe nachtragen`)
        }
        if (isReleased) {
          if (!q.approved_by) err('V4', q.id, 'Klasse C verlangt dokumentierte Freigabe (approved_by)')
          else if (q.approved_by === q.created_by) err('V4', q.id, 'Klasse C verlangt Vier-Augen-Prinzip (approved_by ≠ created_by)')
        }
      }

      // V5: Klasse B — "zugeschrieben" nur mit Fundstellen-Notiz
      if (person.risk_class === 'B' && q.source_type === 'attributed' && q.source_urls.length === 0 && !q.translation_note) {
        warn('V5', q.id, 'Klasse B + "attributed" ohne Beleg-Notiz — Fundstellenlage dokumentieren')
      }
    }
  }

  // V3 / V5: Personen-Stammdaten
  for (const p of content.persons) {
    if (p.died === null && !['C', 'D'].includes(p.risk_class)) {
      err('V3', p.id, `Lebende Person muss Risikoklasse C oder D haben (hat ${p.risk_class})`)
    }
    if (p.died !== null && ['C', 'D'].includes(p.risk_class)) {
      err('V3', p.id, `Verstorbene Person darf nicht Klasse ${p.risk_class} sein`)
    }
    if (p.died) {
      // Unterstützt "YYYY-MM-DD", "YYYY" und vorchristliche Daten als "-YYYY".
      const match = p.died.match(/^(-?)(\d{1,4})/)
      if (!match) {
        err('V3', p.id, `Sterbedatum nicht lesbar: "${p.died}"`)
        continue
      }
      const year = Number(match[2]) * (match[1] === '-' ? -1 : 1)
      const yearsAgo = new Date().getFullYear() - year
      const expected = yearsAgo >= 70 ? 'A' : 'B'
      if (p.risk_class !== expected) {
        err('V3', p.id, `Sterbejahr ${year} (vor ${yearsAgo} Jahren) ⇒ Klasse ${expected}, gesetzt ist ${p.risk_class}`)
      }
    }
    if (p.risk_class === 'D' && !p.legal_signoff) {
      err('V5', p.id, 'Klasse D ohne dokumentierte Einzelfreigabe (legal_signoff)')
    }
  }

  // V7: Bildlizenzen
  for (const m of content.media_assets) {
    if (m.kind === 'commons-photo') {
      if (!m.source_url) err('V7', m.id, 'Commons-Foto ohne source_url')
      if (['CC-BY', 'CC-BY-SA'].includes(m.license)) {
        if (!m.author) err('V7', m.id, `Lizenz ${m.license} verlangt Urheberangabe (author)`)
        if (!m.attribution_html) err('V7', m.id, `Lizenz ${m.license} verlangt fertigen Bildnachweis (attribution_html)`)
      }
    }
  }

  // V1 / V8: Paarungen
  for (const p of content.pairings) {
    const quote = quotes.get(p.quote_id)
    if (!quote) {
      err('V1', p.id, `Unbekanntes Zitat: ${p.quote_id}`)
      continue
    }
    const decoyExists = p.decoy_type === 'character' ? characters.has(p.decoy_id) : persons.has(p.decoy_id)
    if (!decoyExists) err('V1', p.id, `Unbekannter Decoy: ${p.decoy_type}/${p.decoy_id}`)
    if (p.decoy_type === quote.speaker_type) {
      err('V1', p.id, 'Decoy-Typ muss dem Sprecher-Typ entgegengesetzt sein (Anime vs. Realität)')
    }
    if (p.decoy_id === quote.speaker_id) err('V1', p.id, 'Decoy ist identisch mit dem Sprecher')

    // V8: Live-Paarungen dürfen nur auf live-taugliche Zitate zeigen
    if (p.status === 'live' && quote.status !== 'live') {
      err('V8', p.id, `Live-Paarung zeigt auf Zitat im Status "${quote.status}"`)
    }
    if (p.status === 'live' && p.decoy_type === 'person') {
      const decoy = persons.get(p.decoy_id)
      if (decoy?.risk_class === 'D' && !decoy.legal_signoff) {
        err('V5', p.id, 'Live-Paarung mit Klasse-D-Person ohne Einzelfreigabe')
      }
    }
  }

  // Medien ohne Freigabe dürfen nicht ausgeliefert werden (V7)
  for (const holder of [...content.characters, ...content.persons]) {
    if (!holder.media_id) continue
    const asset = media.get(holder.media_id)
    if (asset && !asset.cleared) {
      warn('V7', holder.id, `media_asset "${asset.id}" ist nicht freigegeben — Avatar-Fallback wird ausgeliefert`)
    }
  }

  // Redaktioneller Reifegrad: Live-Content ohne menschliche Prüfung ist zulässig,
  // aber wird sichtbar gemeldet (Pipeline-Schritt 5, docs/03-content-pipeline.md).
  const unreviewed = content.quotes.filter((q) => q.status === 'live' && !q.reviewed_by)
  if (unreviewed.length > 0) {
    warn('Pipeline', `${unreviewed.length} Zitate`, 'Live, aber ohne reviewed_by — menschliche Quellenprüfung ausstehend')
  }

  return { errors, warnings }
}

/** Nur was live ist, wird ins Spiel-Bundle geschrieben (V8). */
export function selectLiveContent(content: ContentBundle) {
  const liveQuotes = new Map(content.quotes.filter((q) => q.status === 'live').map((q) => [q.id, q]))
  const livePairings = content.pairings.filter((p) => p.status === 'live' && liveQuotes.has(p.quote_id))
  return { liveQuotes, livePairings }
}
