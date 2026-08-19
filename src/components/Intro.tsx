import { CONTENT_STATS } from '../content'
import { SITE } from '../config'
import { navigate } from '../router'
import { Portrait } from '../art/Portrait'
import { PORTRAIT_SPECS } from '../art/specs'

/**
 * Titelseite vor der ersten Runde (docs/04-recht.md, 4.3).
 * Erklärt die Regeln UND weist vorab auf die Kennzeichnung hin — der Hinweis
 * kommt vor dem Spiel, nicht erst im Kleingedruckten.
 */
const RULES: { mark: string; text: React.ReactNode }[] = [
  {
    mark: 'I.',
    text: (
      <>
        Oben steht ein Zitat, darunter zwei mögliche Urheber: <em>links</em> eine Figur aus der Fiktion,{' '}
        <em>rechts</em> eine reale Persönlichkeit.
      </>
    ),
  },
  {
    mark: 'II.',
    text: (
      <>
        Wähle mit Klick oder den Pfeiltasten. Jede richtige Antwort verlängert die Serie — ein Fehler beendet die Partie.
      </>
    ),
  },
  {
    mark: 'III.',
    text: (
      <>
        Manche Zitate sind übersetzt oder nur sinngemäß überliefert. Was belegt ist, steht nach jeder Runde am Zitat.
      </>
    ),
  },
]

export function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-rise mx-auto w-full max-w-3xl px-5 pt-8 md:pt-14">
      <div className="sheet px-6 py-8 text-center md:px-14 md:py-12">
        <p className="smallcaps text-[10px] text-[color:var(--ink-faint)] md:text-[11px]">Ein Zitatenrätsel</p>

        <h1 className="mt-3 font-serif text-4xl leading-tight font-bold md:text-6xl">{SITE.name}</h1>

        <div className="rule-double mx-auto mt-5 w-full max-w-md py-1">
          <p className="smallcaps text-[11px] text-[color:var(--ink-soft)]">{SITE.tagline}</p>
        </div>

        {/* Zwei Beispielporträts als Schaubild — links Fiktion, rechts Wirklichkeit */}
        <div className="mt-7 flex items-end justify-center gap-6 md:gap-12">
          <figure className="w-24 md:w-32">
            <span className="block border border-[color:var(--rule)] bg-[color:var(--paper-deep)] p-1.5">
              <Portrait id="one-piece/luffy" spec={PORTRAIT_SPECS['one-piece/luffy']} className="block h-auto w-full" />
            </span>
            <figcaption className="smallcaps mt-2 text-[9px] text-[color:var(--ink-faint)]">Fiktion</figcaption>
          </figure>
          <span className="smallcaps pb-8 text-xs text-[color:var(--ink-faint)]">oder</span>
          <figure className="w-24 md:w-32">
            <span className="block border border-[color:var(--rule)] bg-[color:var(--paper-deep)] p-1.5">
              <Portrait id="marc-aurel" spec={PORTRAIT_SPECS['marc-aurel']} className="block h-auto w-full" />
            </span>
            <figcaption className="smallcaps mt-2 text-[9px] text-[color:var(--ink-faint)]">Wirklichkeit</figcaption>
          </figure>
        </div>

        <ol className="mx-auto mt-8 max-w-xl space-y-3 text-left md:mt-10">
          {RULES.map((rule) => (
            <li key={rule.mark} className="flex gap-3">
              <span className="font-serif text-sm font-bold text-[color:var(--gold)] md:text-base">{rule.mark}</span>
              <p className="text-sm leading-relaxed text-[color:var(--ink-soft)] md:text-base">{rule.text}</p>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={onStart}
          autoFocus
          className="mt-9 w-full max-w-sm border border-[color:var(--ink)] bg-[color:var(--ink)] px-6 py-3.5 font-serif text-lg font-semibold text-[color:var(--paper)] transition hover:bg-[color:var(--ink-soft)]"
        >
          Partie beginnen
        </button>

        <p className="mt-6 text-xs text-[color:var(--ink-soft)]">
          {CONTENT_STATS.rounds} kuratierte Zitat-Paare aus {CONTENT_STATS.universes.join(', ')} und der Weltgeschichte
        </p>

        {SITE.isBeta && (
          <p className="mt-2 text-[11px] leading-relaxed text-[color:var(--ink-faint)]">
            Beta: Die redaktionelle Quellenprüfung läuft noch.{' '}
            <button onClick={() => navigate('faq')} className="underline underline-offset-2 hover:text-[color:var(--ink-soft)]">
              Wie wir Zitate kennzeichnen
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
