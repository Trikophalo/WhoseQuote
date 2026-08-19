import type { ReactNode } from 'react'
import { navigate } from '../router'

/** Gemeinsames Layout für alle Rechts-/Info-Seiten — gesetzt wie eine Buchseite. */
export function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8 md:py-12">
      <button
        onClick={() => navigate('game')}
        className="smallcaps mb-8 inline-flex items-center gap-2 border border-[color:var(--rule)] px-4 py-2 text-[10px] text-[color:var(--ink-soft)] transition hover:border-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
      >
        <span aria-hidden="true">←</span> Zurück zum Spiel
      </button>

      <div className="sheet px-6 py-8 md:px-12 md:py-12">
        <h1 className="font-serif text-3xl leading-tight font-bold md:text-4xl">{title}</h1>
        <span className="mt-4 mb-6 block h-px w-full bg-[color:var(--rule)]" />
        <article className="text-[15px] text-[color:var(--ink-soft)]">{children}</article>
      </div>
    </div>
  )
}

export const h2 = 'mt-8 mb-3 font-serif text-lg font-bold text-[color:var(--ink)] md:text-xl'
export const h3 = 'mt-7 mb-2 font-serif text-base font-bold text-[color:var(--ink)] md:text-lg'
export const p = 'mb-4 leading-relaxed'
export const ul = 'mb-4 list-disc space-y-2 pl-5 leading-relaxed marker:text-[color:var(--rule)]'
export const strong = 'font-semibold text-[color:var(--ink)]'
