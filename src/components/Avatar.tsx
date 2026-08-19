import type { Side } from '../content'

/**
 * Generierter Avatar — bewusst eine eigene, abstrakte Darstellung.
 *
 * Es werden KEINE Artworks aus MyAnimeList/Jikan und keine ungeprüften Fotos
 * eingebunden: Eine öffentliche API erteilt keine Nutzungsrechte
 * (docs/04-recht.md, 4.5). Geometrie und Farbe leiten sich deterministisch aus
 * der ID ab, damit jede Figur wiedererkennbar bleibt.
 */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function initials(name: string): string {
  const words = name
    .replace(/[„“"'.]/g, '')
    .split(/[\s-]+/)
    .filter((w) => w.length > 0 && !/^(von|de|der|van|jr|d)$/i.test(w))
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export function Avatar({ side, size = 'md' }: { side: Side; size?: 'sm' | 'md' | 'lg' }) {
  const seed = hash(side.id)
  const hue = side.hue
  const dim = size === 'sm' ? 'h-12 w-12' : size === 'lg' ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-16 w-16 sm:h-20 sm:w-20'
  const text = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'

  // Figuren bekommen kantige Akzente, reale Personen weiche — subtile Bildsprache
  const isCharacter = side.kind === 'character'
  const rays = 3 + (seed % 3)

  return (
    <div
      className={`${dim} relative shrink-0 overflow-hidden ${isCharacter ? 'rounded-2xl' : 'rounded-full'} ring-1 ring-white/15`}
      style={{
        background: `linear-gradient(145deg, hsl(${hue} 65% 42%), hsl(${(hue + 40) % 360} 55% 22%))`,
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-45">
        {isCharacter ? (
          // Strahlenmuster („Speedlines") für Anime-Figuren
          Array.from({ length: rays }, (_, i) => {
            const offset = ((seed >> (i * 3)) % 60) + i * 22
            return (
              <line
                key={i}
                x1={offset}
                y1={-10}
                x2={offset - 40}
                y2={110}
                stroke={`hsl(${(hue + 180) % 360} 85% 78%)`}
                strokeWidth={2 + (i % 2)}
                opacity={0.5}
              />
            )
          })
        ) : (
          // Konzentrische Bögen für reale Personen
          Array.from({ length: rays }, (_, i) => (
            <circle
              key={i}
              cx={50 + (((seed >> (i * 4)) % 30) - 15)}
              cy={92 + i * 6}
              r={30 + i * 14}
              fill="none"
              stroke={`hsl(${(hue + 25) % 360} 70% 80%)`}
              strokeWidth="1.5"
              opacity={0.4}
            />
          ))
        )}
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center ${text} font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}>
        {initials(side.name)}
      </div>
    </div>
  )
}
