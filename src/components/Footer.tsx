import { FOOTER_DISCLAIMER } from '../content/labels'
import { navigate, type Route } from '../router'

const LINKS: { route: Route; label: string }[] = [
  { route: 'faq', label: 'FAQ' },
  { route: 'impressum', label: 'Impressum' },
  { route: 'datenschutz', label: 'Datenschutz' },
  { route: 'nutzungsbedingungen', label: 'Nutzungsbedingungen' },
  { route: 'bildnachweise', label: 'Bildnachweise' },
]

/**
 * Kurz-Disclaimer und Pflichtseiten sind von jeder Runde aus erreichbar
 * (docs/04-recht.md, 4.3) — nicht versteckt hinter einem Menü.
 */
export function Footer() {
  return (
    <footer className="mx-auto mt-10 w-full max-w-2xl px-5 pb-10 text-center">
      <p className="mb-4 text-[11px] leading-relaxed text-slate-500">
        {FOOTER_DISCLAIMER}{' '}
        <button onClick={() => navigate('faq')} className="underline underline-offset-2 transition hover:text-slate-300">
          Mehr dazu
        </button>
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {LINKS.map((link) => (
          <button
            key={link.route}
            onClick={() => navigate(link.route)}
            className="text-[11px] text-slate-400 underline underline-offset-2 transition hover:text-slate-200"
          >
            {link.label}
          </button>
        ))}
      </nav>
    </footer>
  )
}
