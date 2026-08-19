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
    <footer className="mx-auto mt-12 w-full max-w-3xl px-5 pb-8 text-center">
      <span className="mx-auto mb-4 block h-px w-full max-w-xs bg-[color:var(--rule)]" />
      <p className="mb-3 text-[11px] leading-relaxed text-[color:var(--ink-faint)]">
        {FOOTER_DISCLAIMER}{' '}
        <button onClick={() => navigate('faq')} className="underline underline-offset-2 hover:text-[color:var(--ink-soft)]">
          Mehr dazu
        </button>
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {LINKS.map((link) => (
          <button
            key={link.route}
            onClick={() => navigate(link.route)}
            className="smallcaps text-[10px] text-[color:var(--ink-soft)] transition hover:text-[color:var(--ink)]"
          >
            {link.label}
          </button>
        ))}
      </nav>
    </footer>
  )
}
