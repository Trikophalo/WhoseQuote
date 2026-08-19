import type { Side } from '../content'
import { Avatar } from './Avatar'

type State = 'idle' | 'correct' | 'wrong' | 'muted'

const STATE_STYLES: Record<State, string> = {
  idle: 'border-slate-700 bg-slate-900/70 hover:border-slate-500 hover:bg-slate-800/70 active:scale-[0.98]',
  correct: 'border-emerald-500 bg-emerald-950/50 ring-2 ring-emerald-500/40',
  wrong: 'border-rose-500 bg-rose-950/50 ring-2 ring-rose-500/40',
  muted: 'border-slate-800 bg-slate-900/40 opacity-55',
}

export function ChoiceCard({
  side,
  state,
  onSelect,
  hotkey,
}: {
  side: Side
  state: State
  onSelect?: () => void
  hotkey: string
}) {
  const isCharacter = side.kind === 'character'
  const interactive = state === 'idle' && onSelect !== undefined

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onSelect}
      className={`flex h-full w-full flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-200 sm:gap-3 sm:p-5 ${STATE_STYLES[state]} ${
        interactive ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <span
        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
          isCharacter ? 'bg-pink-500/15 text-pink-300' : 'bg-sky-500/15 text-sky-300'
        }`}
      >
        {isCharacter ? 'Anime' : 'Realität'}
      </span>

      <Avatar side={side} size="lg" />

      <span className="text-sm leading-snug font-bold text-white sm:text-base">{side.name}</span>
      <span className="text-[11px] leading-snug text-slate-400 sm:text-xs">{side.blurb}</span>

      {side.universe && <span className="text-[10px] text-slate-500">{side.universe}</span>}

      {/* mt-auto hält den Tastenhinweis auf beiden Karten auf gleicher Höhe,
          auch wenn nur die Anime-Karte eine Werkangabe trägt. */}
      {interactive && (
        <span className="mt-auto hidden pt-1 text-[10px] text-slate-600 sm:block">
          Taste <kbd className="rounded border border-slate-700 px-1">{hotkey}</kbd>
        </span>
      )}
    </button>
  )
}
