import { useEffect, useState } from 'react'
import type { SourceType } from '../content/schema'
import { SOURCE_LABELS } from '../content/labels'

const TONE_STYLES: Record<'solid' | 'soft' | 'loose', string> = {
  solid: 'border-[color:var(--stamp-green)] text-[color:var(--stamp-green)]',
  soft: 'border-[color:var(--ink-soft)] text-[color:var(--ink-soft)]',
  loose: 'border-[color:var(--stamp-red)] text-[color:var(--stamp-red)]',
}

/**
 * Kennzeichnung direkt am Zitat (docs/04-recht.md, 4.2).
 *
 * Auf Touch-Geräten öffnet der Tap eine Erklärkarte statt eines Hover-Tooltips —
 * der Hinweis muss überall erreichbar sein, nicht nur mit Maus.
 */
export function SourceBadge({ sourceType, note }: { sourceType: SourceType; note?: string | null }) {
  const [open, setOpen] = useState(false)
  const label = SOURCE_LABELS[sourceType]

  // Der Hinweis liegt über der Weiter-Schaltfläche — er muss sich ohne Maus
  // wieder schließen lassen, sonst blockiert er das Spiel für Tastaturnutzer.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        // Marker für den Rauchtest: Er prüft, dass kein Badge vor der Antwort
        // im DOM steht — es würde die Lösung verraten.
        data-source-badge={sourceType}
        className={`smallcaps inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] transition hover:bg-[color:var(--paper-deep)] ${TONE_STYLES[label.tone]}`}
      >
        {label.badge}
        <span aria-hidden="true" className="opacity-70">
          ⓘ
        </span>
        <span className="sr-only">Was bedeutet diese Kennzeichnung?</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Hinweis schließen"
            onClick={() => setOpen(false)}
          />
          <span
            role="tooltip"
            className="sheet animate-rise absolute left-1/2 z-20 mt-2 block w-72 max-w-[80vw] -translate-x-1/2 p-3 text-left font-sans text-xs leading-relaxed text-[color:var(--ink-soft)]"
          >
            {label.tooltip}
            {note && <span className="mt-2 block border-t border-[color:var(--rule)] pt-2 text-[color:var(--ink-faint)]">{note}</span>}
          </span>
        </>
      )}
    </span>
  )
}
