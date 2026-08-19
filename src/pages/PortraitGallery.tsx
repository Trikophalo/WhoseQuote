import { characterById, personById } from '../content'
import { Portrait } from '../art/Portrait'
import { PORTRAIT_SPECS } from '../art/specs'
import { LegalLayout } from '../components/LegalLayout'

/**
 * Kontrollblatt für die Redaktion: zeigt alle gezeichneten Porträts auf einen
 * Blick. Nicht im Footer verlinkt, aber unter #/portraets erreichbar — gedacht
 * zum Prüfen, ob jede Figur erkennbar ist und ob überall ein Bild entsteht.
 */
export function PortraitGalleryPage() {
  const characters = [...characterById.values()]
  const persons = [...personById.values()]
  const withoutSpec = [...characters, ...persons].filter((entry) => !PORTRAIT_SPECS[entry.id])

  return (
    <LegalLayout title="Porträt-Galerie">
      <p className="mb-6 leading-relaxed">
        Alle Darstellungen sind im Code gezeichnet — keine fremden Artworks, keine Fotos. Figuren ohne eigene Merkmalsliste
        bekommen ein aus ihrer Kennung abgeleitetes Porträt, damit nie ein Platzhalter erscheint.
      </p>

      <p className="mb-8 text-sm">
        <strong className="font-semibold text-[color:var(--ink)]">{characters.length + persons.length}</strong> Porträts,
        davon <strong className="font-semibold text-[color:var(--ink)]">{withoutSpec.length}</strong> automatisch abgeleitet.
      </p>

      <Section title="Figuren" entries={characters} />
      <Section title="Reale Personen" entries={persons} />
    </LegalLayout>
  )
}

function Section({ title, entries }: { title: string; entries: { id: string; name: string }[] }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 font-serif text-lg font-bold text-[color:var(--ink)]">
        {title} <span className="text-sm font-normal text-[color:var(--ink-faint)]">({entries.length})</span>
      </h2>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {entries.map((entry) => (
          <li key={entry.id} className="text-center">
            <span className="block border border-[color:var(--rule)] bg-[color:var(--paper-deep)] p-1">
              <Portrait id={entry.id} spec={PORTRAIT_SPECS[entry.id]} className="block h-auto w-full" />
            </span>
            <span className="mt-1.5 block text-[11px] leading-tight">{entry.name}</span>
            {!PORTRAIT_SPECS[entry.id] && (
              <span className="smallcaps mt-0.5 block text-[8px] text-[color:var(--ink-faint)]">abgeleitet</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
