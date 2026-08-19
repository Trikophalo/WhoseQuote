import type { Character, Person, Pairing, Quote, SourceType, Universe } from './schema'

import universesJson from '../../content/universes.json'
import charactersJson from '../../content/characters.json'
import personsJson from '../../content/persons.json'
import quotesJson from '../../content/quotes.json'
import pairingsJson from '../../content/pairings.json'

/**
 * Der Content wird zur Build-Zeit von scripts/validate-content.ts gegen Schema
 * und Regeln V1–V9 geprüft (npm run build führt das aus). Zur Laufzeit wird
 * deshalb nur noch typisiert und gefiltert — kein Zod im Browser-Bundle.
 */
const universes = universesJson as unknown as Universe[]
const characters = charactersJson as unknown as Character[]
const persons = personsJson as unknown as Person[]
const quotes = quotesJson as unknown as Quote[]
const pairings = pairingsJson as unknown as Pairing[]

export const characterById = new Map(characters.map((c) => [c.id, c]))
export const personById = new Map(persons.map((p) => [p.id, p]))
export const universeById = new Map(universes.map((u) => [u.id, u]))

/** Eine Seite des Spielfelds — bewusst einheitlich für Figur und Person. */
export type Side = {
  kind: 'character' | 'person'
  id: string
  name: string
  blurb: string
  hue: number
  /** Nur bei Figuren: Herkunftswerk, wird in der Auflösung gezeigt. */
  universe?: string
}

function characterSide(id: string): Side | null {
  const c = characterById.get(id)
  if (!c) return null
  return { kind: 'character', id: c.id, name: c.name, blurb: c.blurb, hue: c.hue, universe: universeById.get(c.universe_id)?.name }
}

function personSide(id: string): Side | null {
  const p = personById.get(id)
  if (!p) return null
  return { kind: 'person', id: p.id, name: p.name, blurb: p.blurb, hue: p.hue }
}

/** Eine spielfertige Runde: links immer die Figur, rechts immer die reale Person. */
export type Round = {
  id: string
  text: string
  sourceType: SourceType
  sourceRef: string | null
  translationNote: string | null
  themes: string[]
  difficulty: number
  character: Side
  person: Side
  /** Welche Seite hat es gesagt? */
  answer: 'character' | 'person'
}

function buildRounds(): Round[] {
  const quoteById = new Map(quotes.map((q) => [q.id, q]))
  const rounds: Round[] = []

  for (const pairing of pairings) {
    // Regel V8: Nur freigegebene Paarungen mit freigegebenem Zitat werden gespielt.
    if (pairing.status !== 'live') continue
    const quote = quoteById.get(pairing.quote_id)
    if (!quote || quote.status !== 'live') continue

    const speakerIsCharacter = quote.speaker_type === 'character'
    const character = speakerIsCharacter ? characterSide(quote.speaker_id) : characterSide(pairing.decoy_id)
    const person = speakerIsCharacter ? personSide(pairing.decoy_id) : personSide(quote.speaker_id)
    if (!character || !person) continue

    rounds.push({
      id: pairing.id,
      text: quote.text.de,
      sourceType: quote.source_type,
      sourceRef: quote.source_ref,
      translationNote: quote.translation_note,
      themes: quote.themes,
      difficulty: pairing.difficulty,
      character,
      person,
      answer: quote.speaker_type,
    })
  }

  return rounds
}

export const ROUNDS: Round[] = buildRounds()

export const CONTENT_STATS = {
  rounds: ROUNDS.length,
  characters: new Set(ROUNDS.map((r) => r.character.id)).size,
  persons: new Set(ROUNDS.map((r) => r.person.id)).size,
  universes: universes.filter((u) => u.status === 'active').map((u) => u.name),
}
