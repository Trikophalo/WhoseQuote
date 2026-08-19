#!/usr/bin/env tsx
/**
 * Content-Gate: prüft alle Dateien in content/ gegen Schema und Regeln V1–V9
 * (docs/02-datenmodell.md). Läuft vor jedem Build.
 *
 * Exit-Code 1 bei Fehlern — damit kann kein Datensatz ausgeliefert werden,
 * der die rechtlichen Leitplanken verletzt.
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { contentSchema, checkRules, selectLiveContent, type ContentBundle } from '../src/content/schema.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (file: string) => JSON.parse(readFileSync(resolve(root, 'content', file), 'utf8'))

const raw = {
  universes: read('universes.json'),
  characters: read('characters.json'),
  persons: read('persons.json'),
  quotes: read('quotes.json'),
  pairings: read('pairings.json'),
  media_assets: read('media.json'),
}

const parsed = contentSchema.safeParse(raw)
if (!parsed.success) {
  console.error('\n❌ Schema-Fehler in content/:\n')
  for (const issue of parsed.error.issues) {
    console.error(`   ${issue.path.join('.')}: ${issue.message}`)
  }
  console.error(`\n   ${parsed.error.issues.length} Schema-Fehler.\n`)
  process.exit(1)
}

const content: ContentBundle = parsed.data
const { errors, warnings } = checkRules(content)

const { liveQuotes, livePairings } = selectLiveContent(content)
const byDifficulty = new Map<number, number>()
for (const p of livePairings) byDifficulty.set(p.difficulty, (byDifficulty.get(p.difficulty) ?? 0) + 1)

const bySourceType = new Map<string, number>()
for (const id of liveQuotes.keys()) {
  const q = liveQuotes.get(id)!
  bySourceType.set(q.source_type, (bySourceType.get(q.source_type) ?? 0) + 1)
}

const riskCounts = new Map<string, number>()
for (const p of content.persons) riskCounts.set(p.risk_class, (riskCounts.get(p.risk_class) ?? 0) + 1)

console.log('\n📚 Content-Prüfung\n')
console.log(`   Universen:        ${content.universes.length} (${content.universes.filter((u) => u.status === 'active').length} aktiv)`)
console.log(`   Charaktere:       ${content.characters.length}`)
console.log(`   Reale Personen:   ${content.persons.length}  ` + [...riskCounts.entries()].sort().map(([k, v]) => `${k}:${v}`).join(' '))
console.log(`   Zitate:           ${content.quotes.length} (${liveQuotes.size} live)`)
console.log(`   Paarungen:        ${content.pairings.length} (${livePairings.length} live)`)
console.log(`   Kennzeichnung:    ` + [...bySourceType.entries()].sort().map(([k, v]) => `${k}:${v}`).join(' '))
console.log(`   Schwierigkeit:    ` + [1, 2, 3, 4, 5].map((d) => `${d}★:${byDifficulty.get(d) ?? 0}`).join(' '))

if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} Hinweis(e):\n`)
  for (const w of warnings) console.log(`   [${w.rule}] ${w.id}: ${w.message}`)
}

if (errors.length > 0) {
  console.error(`\n❌ ${errors.length} Regelverstoß/-verstöße — Build gestoppt:\n`)
  for (const e of errors) console.error(`   [${e.rule}] ${e.id}: ${e.message}`)
  console.error('')
  process.exit(1)
}

if (livePairings.length === 0) {
  console.error('\n❌ Keine spielbaren Paarungen (status "live") — Build gestoppt.\n')
  process.exit(1)
}

console.log(`\n✅ Alle Regeln erfüllt. ${livePairings.length} Paarungen spielbar.\n`)
