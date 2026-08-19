import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ROUNDS, type Round } from '../content'
import { SITE } from '../config'
import { pickRound } from '../game/selection'
import { hasSeenIntro, loadHighscore, loadSeen, markIntroSeen, pushSeen, saveHighscore } from '../game/storage'
import { ChoiceCard } from './ChoiceCard'
import { SourceBadge } from './SourceBadge'
import { Intro } from './Intro'
import { navigate } from '../router'
import { getCachedPhoto, type PhotoCredit } from '../media/photos'

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

  // Tastatursteuerung: ← Fiktion, → Wirklichkeit, Enter/Leertaste weiter
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
    return <p className="px-5 py-20 text-center text-[color:var(--ink-soft)]">Keine spielbaren Zitate gefunden.</p>
  }

  const revealed = phase === 'revealed'
  const wasCorrect = revealed && selected === round.answer
  const truth = round.answer

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-4 md:px-8 md:pt-7">
      <Masthead score={score} highscore={highscore} poolSize={ROUNDS.length} seenCount={excluded.size} />

      {/* Das Zitat. Die Kennzeichnung erscheint bewusst erst in der Auflösung,
          sonst würde „Zugeschrieben" sofort die reale Person verraten
          (docs/04-recht.md, 4.2). */}
      <blockquote key={round.id} className="animate-rise mx-auto mt-7 max-w-3xl px-2 text-center md:mt-9">
        <p className="font-serif text-2xl leading-[1.4] text-balance md:text-[2.1rem] md:leading-[1.35]">
          <span aria-hidden="true" className="text-[color:var(--rule)]">
            „
          </span>
          {round.text}
          <span aria-hidden="true" className="text-[color:var(--rule)]">
            “
          </span>
        </p>
      </blockquote>

      <p className="smallcaps mt-7 mb-4 text-center text-[11px] text-[color:var(--ink-soft)] md:mt-9 md:mb-5 md:text-xs">
        {revealed ? (wasCorrect ? 'Richtig geraten' : 'Danebengetippt') : 'Wer hat das gesagt?'}
      </p>

      <div className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-6">
        <ChoiceCard
          side={round.character}
          hotkey="←"
          state={!revealed ? 'idle' : truth === 'character' ? 'correct' : selected === 'character' ? 'wrong' : 'muted'}
          onSelect={!revealed ? () => answer('character') : undefined}
        />

        {/* Trennachse mit „oder" — nur auf dem Desktop, auf dem Handy fehlt der Platz */}
        <div className="hidden flex-col items-center justify-center gap-3 md:flex">
          <span className="w-px flex-1 bg-[color:var(--rule)]" />
          <span className="smallcaps text-[10px] text-[color:var(--ink-faint)]">oder</span>
          <span className="w-px flex-1 bg-[color:var(--rule)]" />
        </div>

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

/** Kopfzeile im Zeitungskopf-Stil. */
function Masthead({ score, highscore, poolSize, seenCount }: { score: number; highscore: number; poolSize: number; seenCount: number }) {
  return (
    <header className="rule-double flex items-end justify-between gap-4 py-2.5">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-3xl leading-none font-bold tabular-nums md:text-4xl">{score}</span>
        <span className="smallcaps text-[10px] text-[color:var(--ink-soft)]">in Folge</span>
      </div>

      <button
        onClick={() => navigate('game')}
        className="smallcaps hidden text-center text-xs text-[color:var(--ink)] md:block"
      >
        {SITE.name}
      </button>

      <div className="flex items-baseline gap-2">
        <span className="smallcaps text-[10px] text-[color:var(--ink-soft)]" title={`${poolSize} Paare im Bestand, ${seenCount} zuletzt gezeigt`}>
          Rekord
        </span>
        <span className="font-serif text-3xl leading-none font-bold tabular-nums text-[color:var(--gold)] md:text-4xl">{highscore}</span>
      </div>
    </header>
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

  // Auf schmalen Fenstern liegt die Weiter-Schaltfläche sonst unter der Falz.
  // Auf dem Desktop passt meist alles — dann bleibt die Seite bewusst ruhig.
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const { bottom } = element.getBoundingClientRect()
    if (bottom > window.innerHeight) element.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [])

  return (
    <div ref={ref} className="animate-rise mt-5 md:mt-7">
      <div className="sheet relative px-4 py-4 md:px-8 md:py-5">
        <div
          className={`animate-stamp smallcaps absolute -top-4 right-4 bg-[color:var(--paper)] text-[11px] font-bold md:right-8 md:text-xs stamp`}
          style={{ color: wasCorrect ? 'var(--stamp-green)' : 'var(--stamp-red)' }}
        >
          {wasCorrect ? 'Richtig' : 'Falsch'}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
          <span className="font-serif text-base md:text-lg">
            Gesagt hat es <span className="font-semibold">{speaker.name}</span>
          </span>
          <SourceBadge sourceType={round.sourceType} note={round.translationNote} />
        </div>

        {round.sourceRef && (
          <p className="mt-2.5 text-center text-xs leading-relaxed text-[color:var(--ink-soft)] md:text-sm">
            Fundstelle: {round.sourceRef}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <a
            href={`mailto:${SITE.contactEmail}?subject=${reportSubject}&body=${reportBody}`}
            className="text-[11px] text-[color:var(--ink-soft)] underline underline-offset-2 hover:text-[color:var(--ink)]"
          >
            Zitat melden
          </a>
          <span className="text-[color:var(--rule)]">·</span>
          <span className="smallcaps text-[10px] text-[color:var(--ink-faint)]">
            Schwierigkeit {'✦'.repeat(round.difficulty)}
            <span className="opacity-30">{'✦'.repeat(5 - round.difficulty)}</span>
          </span>
        </div>

        <ImageCredits round={round} />
      </div>

      <button
        type="button"
        onClick={onContinue}
        autoFocus
        className="mt-4 w-full border border-[color:var(--ink)] bg-[color:var(--ink)] px-6 py-3.5 font-serif text-base font-semibold text-[color:var(--paper)] transition hover:bg-[color:var(--ink-soft)] md:mx-auto md:block md:max-w-sm md:text-lg"
      >
        {wasCorrect ? 'Weiter' : 'Ergebnis ansehen'}
        <span className="smallcaps ml-3 hidden text-[10px] opacity-60 md:inline">Enter</span>
      </button>
    </div>
  )
}

/**
 * Bildquellen der aktuellen Runde (docs/04-recht.md, 4.5): Wer das Bild
 * geliefert hat, steht sichtbar in der Auflösung — mit Link auf die Quellseite
 * und, bei Commons-Fotos, mit Urheber und Lizenz. Die vollständige Liste
 * aller geladenen Bilder führt die Bildnachweis-Seite.
 */
function ImageCredits({ round }: { round: Round }) {
  const credits = [
    { side: round.character, credit: getCachedPhoto(round.character.id) },
    { side: round.person, credit: getCachedPhoto(round.person.id) },
  ].filter((entry): entry is { side: Round['character']; credit: PhotoCredit } => entry.credit !== null)

  if (credits.length === 0) return null

  return (
    <p className="mt-2 text-center text-[10px] leading-relaxed text-[color:var(--ink-faint)]">
      {'Bildquellen: '}
      {credits.map(({ side, credit }, index) => (
        <span key={side.id}>
          {index > 0 && ' · '}
          <a href={credit.pageUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[color:var(--ink-soft)]">
            {side.name}: {credit.artist ? `${credit.artist}, ` : ''}
            {credit.license ? `${credit.license}, ` : ''}
            {credit.sourceLabel}
          </a>
        </span>
      ))}
    </p>
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
      // Abbruch durch die Nutzerin oder API nicht verfügbar — kein Fehlerfall.
    }
  }

  return (
    <div className="animate-rise mx-auto w-full max-w-lg px-5 pt-12 text-center md:pt-20">
      <div className="sheet px-8 py-10">
        <p className="smallcaps text-[11px] text-[color:var(--ink-soft)]">Partie beendet</p>
        <p className="mt-4 font-serif text-7xl leading-none font-bold tabular-nums md:text-8xl">{score}</p>
        <p className="mt-3 font-serif text-sm text-[color:var(--ink-soft)]">
          {score === 1 ? 'Zitat richtig zugeordnet' : 'Zitate richtig zugeordnet'}
        </p>

        <span className="mx-auto mt-6 block h-px w-24 bg-[color:var(--rule)]" />

        {isRecord ? (
          <p className="smallcaps mt-6 text-xs text-[color:var(--gold)]">Neuer persönlicher Rekord</p>
        ) : (
          <p className="mt-6 text-sm text-[color:var(--ink-soft)]">
            Dein Rekord: <span className="font-semibold text-[color:var(--gold)] tabular-nums">{highscore}</span>
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onRestart}
        autoFocus
        className="mt-6 w-full border border-[color:var(--ink)] bg-[color:var(--ink)] px-6 py-3.5 font-serif text-lg font-semibold text-[color:var(--paper)] transition hover:bg-[color:var(--ink-soft)]"
      >
        Noch eine Partie
      </button>
      <button
        type="button"
        onClick={share}
        className="mt-3 w-full border border-[color:var(--rule)] px-6 py-3 font-serif text-sm text-[color:var(--ink-soft)] transition hover:border-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
      >
        {copied ? 'In die Zwischenablage kopiert' : 'Ergebnis teilen'}
      </button>
    </div>
  )
}
