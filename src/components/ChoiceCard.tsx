import type { Side } from '../content'
import { Portrait } from '../art/Portrait'
import { PORTRAIT_SPECS } from '../art/specs'

type State = 'idle' | 'correct' | 'wrong' | 'muted'

const STATE_STYLES: Record<State, string> = {
  idle: 'border-[color:var(--rule)] hover:-translate-y-1 hover:shadow-[0_16px_28px_-14px_rgba(60,45,20,0.5)]',
  correct: 'border-[color:var(--stamp-green)] shadow-[0_0_0_3px_rgba(78,107,61,0.18)]',
  wrong: 'border-[color:var(--stamp-red)] shadow-[0_0_0_3px_rgba(157,59,44,0.18)]',
  muted: 'border-[color:var(--rule)] opacity-45',
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
      className={`sheet group flex h-full w-full cursor-default flex-col items-center px-4 pt-4 pb-5 text-center transition-all duration-200 md:px-6 md:pt-4 md:pb-4 ${STATE_STYLES[state]} ${
        interactive ? 'cursor-pointer' : ''
      }`}
    >
      <span className="smallcaps text-[10px] text-[color:var(--ink-faint)] md:text-[11px]">
        {isCharacter ? 'Aus der Fiktion' : 'Aus der Wirklichkeit'}
      </span>

      {/* Porträtrahmen wie eine Buchtafel */}
      <span
        className="mt-3 block w-full max-w-[190px] border border-[color:var(--rule)] bg-[color:var(--paper-deep)] p-1.5 md:max-w-[165px]"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.45)' }}
      >
        <Portrait
          id={side.id}
          spec={PORTRAIT_SPECS[side.id]}
          className="block h-auto w-full"
        />
      </span>

      <span className="mt-3 font-serif text-lg leading-tight font-semibold text-[color:var(--ink)] md:text-xl">{side.name}</span>

      <span className="mx-auto mt-2 block h-px w-10 bg-[color:var(--rule)]" />

      <span className="mt-2 text-xs leading-snug text-balance text-[color:var(--ink-soft)] md:text-sm">{side.blurb}</span>

      {side.universe && (
        <span className="smallcaps mt-2 text-[9px] text-[color:var(--ink-faint)] md:text-[10px]">{side.universe}</span>
      )}

      {/* mt-auto hält den Tastenhinweis auf beiden Karten auf gleicher Höhe,
          auch wenn nur die Fiktions-Karte eine Werkangabe trägt. */}
      {interactive && (
        <span className="smallcaps mt-auto hidden pt-3 text-[10px] text-[color:var(--ink-faint)] md:block">
          Taste{' '}
          <kbd className="rounded-sm border border-[color:var(--rule)] px-1.5 py-0.5 font-sans not-italic">{hotkey}</kbd>
        </span>
      )}
    </button>
  )
}
