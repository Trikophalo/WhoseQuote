import type { ReactNode } from 'react'
import { navigate } from '../router'

/** Gemeinsames Layout für alle Rechts-/Info-Seiten. */
export function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8">
      <button
        onClick={() => navigate('game')}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
      >
        <span aria-hidden="true">←</span> Zurück zum Spiel
      </button>
      <h1 className="mb-6 text-2xl font-bold text-white sm:text-3xl">{title}</h1>
      <article className="text-[15px] text-slate-300">{children}</article>
    </div>
  )
}

export const h2 = 'mt-8 mb-3 text-lg font-semibold text-white'
export const h3 = 'mt-6 mb-2 text-base font-semibold text-slate-100'
export const p = 'mb-4 leading-relaxed'
export const ul = 'mb-4 list-disc space-y-2 pl-5 leading-relaxed'
export const strong = 'font-semibold text-slate-100'
