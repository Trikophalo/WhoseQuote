import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ROUNDS, type Round } from '../content'
import { SITE } from '../config'
import { pickRound } from '../game/selection'
import { hasSeenIntro, loadHighscore, loadSeen, markIntroSeen, pushSeen, saveHighscore } from '../game/storage'
import { ChoiceCard } from './ChoiceCard'
import { SourceBadge } from './SourceBadge'
import { Intro } from './Intro'
import { navigate } from '../router'

type Phase = 'intro' | 'playing' | 'revealed' | 'gameover'
type Answer = 'character' | 'person'

export function Game() {
  const [phase, setPhase] = useState<Phase>(() => (hasSeenIntro() ? 'playing' : 'intro'))
  const [round, setRound] = useState<Round | null>(null)
  const [score, setScore] = useState(0)
  const [highscore, setHighscore] = useState(loadHighscore)
  const [selected, setSelected] = useState<Answer | null>(null)
  const [isRecord, setIsRecord] = useState(false)

  /** In diesem Lauf gespielte Paarungen — kein Paar zweimal pro Runde. */
  const playedThisRun = useRef<Set<string>>(new Set())

  const excluded = useMemo(() => new Set([...loadSeen(), ...playedThisRun.current]), [round])

  const nextRound = useCallback((streak: number) => {
    const exclude = new Set([...loadSeen(), ...playedThisRun.current])
    const next = pickRound(ROUNDS, streak, exclude)
    if (next) playedThisRun.current.add(next.id)
    setRound(next)
    setSelected(null)
  }, [])

  // Erste Runde ziehen, sobald das Spiel startet
  useEffect(() => {
    if ((phase === 'playing' || phase === 'revealed') && round === null) nextRound(score)
  }, [phase, round, score, nextRound])

  const answer = useCallback(
    (choice: Answer) => {
      if (phase !== 'playing' || !round) return
      setSelected(choice)
      setPhase('revealed')

      if (choice === round.answer) {
        const newScore = score + 1
        setScore(newScore)
        if (newScore > highscore) {
          setHighscore(newScore)
          saveHighscore(newScore)
          setIsRecord(true)
        }
      }
    },
    [phase, round, score, highscore],
  )

  const advance = useCallback(() => {
    if (phase !== 'revealed' || !round) return
    const wasCorrect = selected === round.answer
    pushSeen([round.id])

    if (wasCorrect) {
      setPhase('playing')
      nextRound(score)
    } else {
      setPhase('gameover')
    }
  }, [phase, round, selected, score, nextRound])

  const restart = useCallback(() => {
    playedThisRun.current = new Set()
    setScore(0)
    setIsRecord(false)
    setSelected(null)
    setRound(null)
    setPhase('playing')
  }, [])

  // Tastatursteuerung: ← Anime, → reale Person, Enter/Leertaste weiter
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (phase === 'playing') {
        if (event.key === 'ArrowLeft') answer('character')
        if (event.key === 'ArrowRight') answer('person')
      } else if (phase === 'revealed' && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        advance()
      } else if (phase === 'gameover' && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        restart()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, answer, advance, restart])

  if (phase === 'intro') {
    return (
      <Intro
        onStart={() => {
          markIntroSeen()
          setPhase('playing')
        }}
      />
    )
  }

  if (phase === 'gameover') {
    return <GameOver score={score} highscore={highscore} isRecord={isRecord} onRestart={restart} />
  }

  if (!round) {
    return (
      <div className="px-5 py-20 text-center text-slate-400">
        <p>Keine spielbaren Zitate gefunden.</p>
      </div>
    )
  }

  const revealed = phase === 'revealed'
  const wasCorrect = revealed && selected === round.answer
  const truth = round.answer

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-5 sm:px-5 sm:pt-8">
      <Scoreboard score={score} highscore={highscore} poolSize={ROUNDS.length} seenCount={excluded.size} />

      {/* Das Zitat — die Kennzeichnung erscheint bewusst erst in der Auflösung,
          sonst würde das Badge die Antwort verraten (docs/04-recht.md, 4.2). */}
      <blockquote key={round.id} className="animate-rise relative mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-7 text-center sm:px-8 sm:py-9">
        <span aria-hidden="true" className="absolute top-1 left-4 font-[Georgia] text-5xl leading-none text-slate-700 select-none">
          „
        </span>
        <p className="font-[Georgia] text-lg leading-relaxed text-balance text-slate-100 sm:text-2xl">{round.text}</p>
        {!revealed && (
          <button
            type="button"
            onClick={() => navigate('faq')}
            className="mt-4 text-[11px] text-slate-500 underline underline-offset-2 transition hover:text-slate-300"
          >
            ⓘ Zur Genauigkeit von Zitaten und Übersetzungen
          </button>
        )}
      </blockquote>

      <p className="mt-5 mb-3 text-center text-xs tracking-wide text-slate-500 uppercase">
        {revealed ? (wasCorrect ? '✓ Richtig' : '✗ Leider falsch') : 'Wer hat das gesagt?'}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <ChoiceCard
          side={round.character}
          hotkey="←"
          state={!revealed ? 'idle' : truth === 'character' ? 'correct' : selected === 'character' ? 'wrong' : 'muted'}
          onSelect={!revealed ? () => answer('character') : undefined}
        />
        <ChoiceCard
          side={round.person}
          hotkey="→"
          state={!revealed ? 'idle' : truth === 'person' ? 'correct' : selected === 'person' ? 'wrong' : 'muted'}
          onSelect={!revealed ? () => answer('person') : undefined}
        />
      </div>

      {revealed && <Reveal round={round} onContinue={advance} wasCorrect={wasCorrect} />}
    </div>
  )
}

function Scoreboard({ score, highscore, poolSize, seenCount }: { score: number; highscore: number; poolSize: number; seenCount: number }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tabular-nums sm:text-3xl">{score}</span>
        <span className="text-xs text-slate-500">in Folge</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span title={`${poolSize} Zitat-Paare im Pool, ${seenCount} zuletzt gesehen`}>{poolSize} Paare</span>
        <span className="text-slate-700">·</span>
        <span>
          Rekord <span className="font-semibold text-amber-300 tabular-nums">{highscore}</span>
        </span>
      </div>
    </div>
  )
}

/** Auflösung inkl. Kennzeichnung, Fundstelle und Meldeweg. */
function Reveal({ round, onContinue, wasCorrect }: { round: Round; onContinue: () => void; wasCorrect: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const speaker = round.answer === 'character' ? round.character : round.person
  const reportSubject = encodeURIComponent(`Zitat melden: ${round.id}`)
  const reportBody = encodeURIComponent(
    `Paarung: ${round.id}\nZitat: „${round.text}“\nZugeordnet an: ${speaker.name}\n\nMein Hinweis (bitte ausfüllen):\n`,
  )

  // Auf hohen Karten liegt die Weiter-Schaltfläche sonst unter der Falz —
  // die wichtigste Aktion darf nach der Antwort nicht erst gesucht werden.
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [])

  return (
    <div ref={ref} className="animate-rise mt-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-center gap-2 text-center">
          <span className="text-sm text-slate-300">
            Gesagt hat es <span className="font-semibold text-white">{speaker.name}</span>
          </span>
          <SourceBadge sourceType={round.sourceType} note={round.translationNote} />
        </div>

        {round.sourceRef && <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">Fundstelle: {round.sourceRef}</p>}

        <div className="mt-4 flex items-center justify-center gap-4">
          <a
            href={`mailto:${SITE.contactEmail}?subject=${reportSubject}&body=${reportBody}`}
            className="text-[11px] text-slate-500 underline underline-offset-2 transition hover:text-slate-300"
          >
            Zitat melden
          </a>
          <span className="text-[11px] text-slate-700">·</span>
          <span className="text-[11px] text-slate-600">Schwierigkeit {'★'.repeat(round.difficulty)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        autoFocus
        className={`animate-pop mt-4 w-full rounded-2xl px-6 py-4 text-base font-semibold text-white transition active:scale-[0.99] ${
          wasCorrect ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'
        }`}
      >
        {wasCorrect ? 'Weiter' : 'Ergebnis ansehen'}
      </button>
    </div>
  )
}

function GameOver({ score, highscore, isRecord, onRestart }: { score: number; highscore: number; isRecord: boolean; onRestart: () => void }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const text = `${SITE.name} — ${score} Zitate in Folge erraten. Anime oder Realität? ${window.location.origin}${window.location.pathname}`
    try {
      if (navigator.share) await navigator.share({ text })
      else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // Nutzer hat abgebrochen oder die API ist nicht verfügbar — kein Fehlerfall.
    }
  }

  return (
    <div className="animate-rise mx-auto w-full max-w-md px-5 pt-14 text-center">
      <p className="text-sm tracking-wide text-slate-500 uppercase">Vorbei</p>
      <p className="mt-3 text-6xl font-bold text-white tabular-nums">{score}</p>
      <p className="mt-1 text-sm text-slate-400">{score === 1 ? 'Zitat richtig zugeordnet' : 'Zitate richtig zugeordnet'}</p>

      {isRecord ? (
        <p className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Neuer persönlicher Rekord!
        </p>
      ) : (
        <p className="mt-5 text-sm text-slate-500">
          Dein Rekord: <span className="font-semibold text-amber-300 tabular-nums">{highscore}</span>
        </p>
      )}

      <button
        type="button"
        onClick={onRestart}
        autoFocus
        className="mt-7 w-full rounded-2xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-emerald-500 active:scale-[0.99]"
      >
        Nochmal spielen
      </button>
      <button
        type="button"
        onClick={share}
        className="mt-3 w-full rounded-2xl border border-slate-700 px-6 py-3 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
      >
        {copied ? 'In die Zwischenablage kopiert' : 'Ergebnis teilen'}
      </button>
    </div>
  )
}
