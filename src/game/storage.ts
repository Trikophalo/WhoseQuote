/**
 * Lokaler Speicher — bewusst datenarm: Highscore und zuletzt gesehene Runden
 * bleiben auf dem Gerät und werden nie übertragen (docs/04-recht.md, 4.6).
 */
const KEYS = {
  highscore: 'wq.highscore',
  seen: 'wq.seen',
  introSeen: 'wq.intro',
} as const

/** Wie viele zuletzt gesehene Paarungen ausgeschlossen bleiben. */
export const SEEN_WINDOW = 30

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Privater Modus o. ä. — das Spiel funktioniert auch ohne Persistenz.
  }
}

export const loadHighscore = () => read<number>(KEYS.highscore, 0)
export const saveHighscore = (score: number) => write(KEYS.highscore, score)

export const loadSeen = () => read<string[]>(KEYS.seen, [])
export function pushSeen(ids: string[]) {
  const merged = [...loadSeen(), ...ids]
  write(KEYS.seen, merged.slice(-SEEN_WINDOW))
}

export const hasSeenIntro = () => read<boolean>(KEYS.introSeen, false)
export const markIntroSeen = () => write(KEYS.introSeen, true)
