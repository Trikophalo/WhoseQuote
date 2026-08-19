import { CONTENT_STATS } from '../content'
import { SITE } from '../config'
import { navigate } from '../router'

/**
 * Einmalige Erklärkarte vor der ersten Runde (docs/04-recht.md, 4.3).
 * Sie erklärt die Regeln UND weist vorab auf die Kennzeichnung hin — der
 * Hinweis kommt vor dem Spiel, nicht erst im Kleingedruckten.
 */
export function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-rise mx-auto w-full max-w-md px-5 pt-12 text-center">
      <h1 className="font-[Georgia] text-3xl font-bold text-white sm:text-4xl">{SITE.name}</h1>
      <p className="mt-2 text-sm text-slate-400">{SITE.tagline}</p>

      <div className="mt-8 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left">
        <div className="flex gap-3">
          <span aria-hidden="true" className="text-lg">
            💬
          </span>
          <p className="text-sm leading-relaxed text-slate-300">
            Oben steht ein Zitat. Darunter zwei mögliche Urheber:{' '}
            <span className="font-semibold text-pink-300">links ein Anime-Charakter</span>,{' '}
            <span className="font-semibold text-sky-300">rechts eine reale Persönlichkeit</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <span aria-hidden="true" className="text-lg">
            🎯
          </span>
          <p className="text-sm leading-relaxed text-slate-300">
            Tippe auf die richtige Seite. Jede richtige Antwort verlängert deine Serie — ein Fehler setzt sie auf null zurück.
          </p>
        </div>
        <div className="flex gap-3">
          <span aria-hidden="true" className="text-lg">
            ⓘ
          </span>
          <p className="text-sm leading-relaxed text-slate-300">
            Manche Zitate sind übersetzt oder nur sinngemäß überliefert. Was genau belegt ist, zeigt dir die Kennzeichnung nach jeder
            Runde.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        autoFocus
        className="mt-7 w-full rounded-2xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-emerald-500 active:scale-[0.99]"
      >
        Los geht's
      </button>

      <p className="mt-5 text-xs text-slate-500">
        {CONTENT_STATS.rounds} kuratierte Zitat-Paare aus {CONTENT_STATS.universes.join(', ')} und der Weltgeschichte
      </p>

      {SITE.isBeta && (
        <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
          Beta: Die redaktionelle Quellenprüfung läuft noch.{' '}
          <button onClick={() => navigate('faq')} className="underline underline-offset-2 hover:text-slate-400">
            Wie wir Zitate kennzeichnen
          </button>
        </p>
      )}
    </div>
  )
}
