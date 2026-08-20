/**
 * Klangeffekte — vollständig im Code erzeugt (WebAudio-Oszillatoren).
 *
 * Bewusst keine Audiodateien und keine fremden Server: Das hält die
 * datenarme Linie aus docs/04-recht.md, 4.6 (nichts wird nachgeladen) und
 * das Bundle klein. Der Klang folgt der Papier-Ästhetik: kurze, weiche
 * Glockentöne wie von einer Tischglocke, keine Arcade-Fanfaren.
 *
 * Die Funktionen sind überall gefahrlos aufrufbar: Ohne WebAudio, bei
 * ausgeschaltetem Ton oder außerhalb einer Nutzergeste passiert einfach
 * nichts.
 */

const KEY = 'wq.sound'

export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== '"off"'
  } catch {
    return true
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? '"on"' : '"off"')
  } catch {
    // Privater Modus o. ä. — die Einstellung gilt dann nur für diese Sitzung.
  }
}

let ctx: AudioContext | null = null

/** Lazy anlegen — erst bei der ersten Antwort, die ist immer eine Nutzergeste. */
function context(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Ein glockenartiger Ton: Grundton plus leiser Oberton, weich ausklingend. */
function chime(audio: AudioContext, freq: number, at: number, duration: number, peak: number) {
  for (const [ratio, gainShare] of [
    [1, 1],
    [2.76, 0.22], // unharmonischer Oberton — das macht den Glockencharakter
  ] as const) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq * ratio
    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(peak * gainShare, at + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
    osc.connect(gain).connect(audio.destination)
    osc.start(at)
    osc.stop(at + duration + 0.05)
  }
}

/**
 * Richtige Antwort: zwei kleine Glockenschläge (Grundton + Quinte). Mit der
 * Serie steigt die Tonhöhe leicht an — Halbton für Halbton, gedeckelt bei
 * einer Oktave —, sodass eine lange Serie hörbar „klettert“.
 */
export function playCorrect(streak: number) {
  if (!isSoundOn()) return
  const audio = context()
  if (!audio) return
  const t = audio.currentTime
  const base = 523.25 * 2 ** (Math.min(Math.max(streak - 1, 0), 12) / 12 / 2)
  chime(audio, base, t, 0.5, 0.055)
  chime(audio, base * 1.5, t + 0.09, 0.6, 0.05)
  // Kleine Zäsur alle fünf Treffer: die Oktave obendrauf.
  if (streak > 0 && streak % 5 === 0) chime(audio, base * 2, t + 0.18, 0.7, 0.045)
}

/** Falsche Antwort: ein dumpfer, absinkender Ton — kurz und unaufgeregt. */
export function playWrong() {
  if (!isSoundOn()) return
  const audio = context()
  if (!audio) return
  const t = audio.currentTime
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(160, t)
  osc.frequency.exponentialRampToValueAtTime(62, t + 0.32)
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(0.07, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
  osc.connect(gain).connect(audio.destination)
  osc.start(t)
  osc.stop(t + 0.45)
}
