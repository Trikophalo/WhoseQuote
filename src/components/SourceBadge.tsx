import { useEffect, useState } from 'react'
import type { SourceType } from '../content/schema'
import { SOURCE_LABELS } from '../content/labels'

const TONE_STYLES: Record<'solid' | 'soft' | 'loose', string> = {
  solid: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  soft: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
  loose: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
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
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition hover:brightness-125 ${TONE_STYLES[label.tone]}`}
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
          <div
            role="tooltip"
            className="animate-rise absolute left-1/2 z-20 mt-2 w-72 max-w-[80vw] -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-900 p-3 text-left text-xs leading-relaxed text-slate-300 shadow-xl"
          >
            {label.tooltip}
            {note && <p className="mt-2 border-t border-slate-800 pt-2 text-slate-400">{note}</p>}
          </div>
        </>
      )}
    </div>
  )
}
