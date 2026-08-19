import type { Round } from '../content'

/**
 * Rundenauswahl mit ansteigender Schwierigkeit (docs/01-architektur.md).
 *
 * Ziel ist eine Kurve, die mit erschließbaren Paaren anfängt und mit der Serie
 * härter wird — ohne dass ein Spieler dasselbe Paar zweimal kurz hintereinander
 * sieht (dann rät er nicht mehr, er erinnert sich).
 */
export function difficultyWindow(streak: number): [number, number] {
  if (streak <= 1) return [1, 3]
  if (streak <= 4) return [2, 4]
  if (streak <= 8) return [3, 5]
  return [4, 5]
}

/**
 * Wählt die nächste Runde. `excluded` sind Paarungen aus dem No-Repeat-Fenster
 * plus alle bereits in diesem Lauf gespielten.
 *
 * Die Filter werden schrittweise gelockert, statt hart zu scheitern: erst das
 * Schwierigkeitsfenster aufgeben, dann das No-Repeat-Fenster. So bleibt das
 * Spiel auch bei kleinem Pool spielbar.
 */
export function pickRound(pool: Round[], streak: number, excluded: Set<string>, random = Math.random): Round | null {
  if (pool.length === 0) return null

  const [min, max] = difficultyWindow(streak)
  const unseen = pool.filter((r) => !excluded.has(r.id))

  const tiers: Round[][] = [
    unseen.filter((r) => r.difficulty >= min && r.difficulty <= max),
    // Fenster um je eine Stufe erweitern
    unseen.filter((r) => r.difficulty >= min - 1 && r.difficulty <= max + 1),
    unseen,
    // Notfall: No-Repeat-Fenster aufgeben, damit das Spiel nie stehen bleibt
    pool,
  ]

  for (const tier of tiers) {
    if (tier.length > 0) return tier[Math.floor(random() * tier.length)]
  }
  return null
}
