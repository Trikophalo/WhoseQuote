import { useState } from 'react'
import type { Side } from '../content'
import { Portrait } from '../art/Portrait'
import { PORTRAIT_SPECS } from '../art/specs'
import { usePhoto } from '../media/photos'

/**
 * Das Bild einer Spielseite: immer zuerst die eigene Federzeichnung, darüber —
 * sobald geladen — das echte Foto/Artwork aus der öffentlichen Quelle.
 *
 * So ist garantiert, dass in jeder Runde ein Bild steht, auch offline oder
 * wenn Jikan/Wikipedia gerade nicht antworten. Der Sepia-Filter zieht die
 * Fotos in die Papier-Optik des Spiels.
 */
export function SidePicture({ side }: { side: Side }) {
  const photo = usePhoto(side)
  const [broken, setBroken] = useState(false)
  const showPhoto = photo !== null && !broken

  return (
    <span className="relative block w-full overflow-hidden" style={{ aspectRatio: '200 / 215' }}>
      <Portrait id={side.id} spec={PORTRAIT_SPECS[side.id]} className="absolute inset-0 h-full w-full" />
      {showPhoto && (
        <img
          key={photo.src}
          src={photo.src}
          alt={`Bild von ${side.name}`}
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className="animate-rise absolute inset-0 h-full w-full object-cover object-top"
          style={{ filter: 'sepia(0.22) contrast(0.97) brightness(1.01)' }}
        />
      )}
    </span>
  )
}
