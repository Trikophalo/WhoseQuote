import type { JSX } from 'react'
import {
  fallbackSpec,
  hashId,
  type Accessory,
  type Beard,
  type Collar,
  type Eyes,
  type FaceShape,
  type HairStyle,
  type Headwear,
  type Moustache,
  type PortraitSpec,
} from './vocabulary'

/**
 * Zeichnet ein Porträt als Federzeichnung — vollständig im Code erzeugt.
 *
 * Es werden bewusst keine Artworks aus MyAnimeList/Jikan und keine ungeprüften
 * Fotos eingebunden: Eine öffentliche API erteilt keine Nutzungsrechte
 * (docs/04-recht.md, 4.5). Die Darstellungen sind eigene Abstraktionen, die
 * über Silhouetten-Merkmale erkennbar werden, nicht über eine Nachzeichnung
 * der Originalentwürfe.
 *
 * Ebenen von hinten nach vorn:
 *   Beiwerk hinten → Kleidung → Haar hinten → Hals → Kopf (deckend) → Ohren
 *   → Schraffur → Haar vorn → Augen/Nase/Mund → Bart → Kopfbedeckung
 *   → Brille → Beiwerk vorn
 *
 * Der Kopf ist bewusst deckend gefüllt: Sonst scheinen Hals- und Haarlinien
 * durch das Gesicht.
 */

const INK = 'var(--ink, #2b2620)'
const SKIN = 'var(--paper, #f3ead8)'
const SHADE = { light: 0.13, mid: 0.4, dark: 0.66 } as const

// ---------------------------------------------------------------- Kopfformen

const FACE_PATHS: Record<FaceShape, string> = {
  oval: 'M100 44c22 0 37 19 37 44 0 27-16 46-37 46s-37-19-37-46c0-25 15-44 37-44z',
  round: 'M100 43c25 0 42 20 42 45 0 27-19 46-42 46s-42-19-42-46c0-25 17-45 42-45z',
  square: 'M65 64c0-13 15-21 35-21s35 8 35 21v38c0 19-14 33-35 33s-35-14-35-33V64z',
  long: 'M100 41c20 0 34 18 34 45 0 33-14 54-34 54s-34-21-34-54c0-27 14-45 34-45z',
  heart: 'M100 43c24 0 40 18 40 42 0 20-9 34-21 43l-19 15-19-15c-12-9-21-23-21-43 0-24 16-42 40-42z',
}

// ------------------------------------------------------------------ Frisuren

type Shade = 'light' | 'mid' | 'dark'

const hairProps = (shade: Shade) => ({
  fill: INK,
  fillOpacity: SHADE[shade],
  stroke: INK,
  strokeWidth: 2,
  strokeLinejoin: 'round' as const,
})

/** Haarmasse hinter dem Kopf — wird vom deckenden Gesicht überdeckt. */
function HairBack({ style, shade }: { style: HairStyle; shade: Shade }) {
  const props = hairProps(shade)
  switch (style) {
    case 'long':
    case 'longStraight':
      return (
        <path
          {...props}
          d="M54 98c0-40 21-60 46-60s46 20 46 60v62c-13 6-27 6-34 0-1-34-5-52-12-56-7 4-11 22-12 56-7 6-21 6-34 0z"
        />
      )
    case 'bob':
      return <path {...props} d="M56 96c0-38 20-58 44-58s44 20 44 58v30c-12 6-24 6-30 0-2-22-6-34-14-38-8 4-12 16-14 38-6 6-18 6-30 0z" />
    case 'mane':
      // Wilde Mähne: weiche Ausbuchtungen statt Zacken, sonst liest sie sich als Krone
      return (
        <g {...props}>
          <path d="M46 104c-6-48 22-72 54-72s60 24 54 72c-3 16-9 25-15 21-4-32-16-50-39-50s-35 18-39 50c-6 4-12-5-15-21z" />
          <path d="M48 76c-11-4-18-13-17-22 8 3 15 11 19 21zM152 76c11-4 18-13 17-22-8 3-15 11-19 21z" />
        </g>
      )
    case 'afro':
      return <path {...props} d="M100 20c29 0 50 21 50 46s-21 44-50 44-50-19-50-44 21-46 50-46z" />
    case 'ponytail':
      return <path {...props} d="M132 66c16 4 28 18 30 38 2 20-4 38-14 52-4-18-2-36-8-50-4-14-10-30-18-38z" />
    case 'bun':
      return <circle {...props} cx="100" cy="28" r="17" />
    case 'braids':
      return (
        <g {...props}>
          <path d="M60 92c-8 18-10 40-6 60 8 3 15 2 18-3-5-19-6-38-3-56zM140 92c8 18 10 40 6 60-8 3-15 2-18-3 5-19 6-38 3-56z" />
        </g>
      )
    case 'baroqueWig':
      // Die Seitenlocken müssen an der Perückenmasse hängen — freistehende
      // Kreise sehen aus wie Ohrenschützer.
      return (
        <g {...props}>
          <path d="M48 108c0-42 24-64 52-64s52 22 52 64c0 20-4 34-11 42-2-33-16-52-41-52s-39 19-41 52c-7-8-11-22-11-42z" />
          <ellipse cx="57" cy="104" rx="17" ry="13" />
          <ellipse cx="55" cy="128" rx="16" ry="12" />
          <ellipse cx="143" cy="104" rx="17" ry="13" />
          <ellipse cx="145" cy="128" rx="16" ry="12" />
        </g>
      )
    default:
      return null
  }
}

/** Sichtbarer Haaransatz vor dem Gesicht — deckt das Gesicht nie zu. */
function HairFront({ style, shade }: { style: HairStyle; shade: Shade }) {
  const props = hairProps(shade)

  switch (style) {
    case 'none':
    case 'bald':
      return null
    case 'receding':
      return (
        <g {...props}>
          <path d="M64 84c-1-19 5-31 16-36-5 11-6 22-5 32-4 1-8 2-11 4z" />
          <path d="M136 84c1-19-5-31-16-36 5 11 6 22 5 32 4 1 8 2 11 4z" />
        </g>
      )
    case 'buzz':
      return <path {...props} d="M63 84c0-27 15-42 37-42s37 15 37 42c-7-13-15-20-37-20s-30 7-37 20z" />
    case 'short':
    case 'long':
    case 'longStraight':
    case 'bob':
      return <path {...props} d="M62 88c-3-31 15-47 38-47s41 16 38 47c-6-17-14-25-38-25s-32 8-38 25z" />
    case 'wavy':
      return (
        <path
          {...props}
          d="M61 88c-4-32 14-49 39-49s43 17 39 49c-3-10-7-18-12-16-6 3-9-6-15-3-6 4-12-5-19-2-7 4-14-3-20 1-6 4-9 10-12 20z"
        />
      )
    case 'curly':
      return (
        <g {...props}>
          <path d="M62 88c-3-32 14-48 38-48s41 16 38 48c-5-6-4-14-11-13-6 1-6-9-13-9s-8 8-14 8-8-8-14-7c-7 1-6 10-12 10-6 1-6 6-12 11z" />
          <circle cx="70" cy="62" r="9" />
          <circle cx="88" cy="52" r="10" />
          <circle cx="112" cy="52" r="10" />
          <circle cx="130" cy="62" r="9" />
        </g>
      )
    case 'ponytail':
    case 'bun':
    case 'braids':
      return <path {...props} d="M62 86c-3-31 15-47 38-47s41 16 38 47c-6-16-14-24-38-24s-32 8-38 24z" />
    case 'afro':
      return <path {...props} d="M64 82c-1-24 15-38 36-38s37 14 36 38c-8-12-18-18-36-18s-28 6-36 18z" />
    case 'spiky':
      return (
        <path
          {...props}
          d="M62 88 60 58l14 14 4-24 12 18 10-26 10 26 12-18 4 24 14-14-2 30c-6-14-16-20-38-20s-32 6-38 20z"
        />
      )
    case 'swoop':
      // Kräftiger Seitenscheitel: die zweite Fläche fällt bewusst über ein Auge
      return (
        <g {...props}>
          <path d="M60 90c-4-34 15-51 40-51 23 0 39 13 40 33-12-7-25-10-38-8-16 3-28 11-35 22-2 4-4 7-6 7-2-1-1-2-1-3z" />
          <path d="M63 76c11-10 23-14 33-11 5 13-1 28-12 34-10 6-20 2-23-6-2-6-1-13 2-17z" />
        </g>
      )
    case 'mane':
      return <path {...props} d="M58 94c-6-40 14-58 42-58s48 18 42 58c-4-16-8-26-14-24-4-16-12-22-28-22s-24 6-28 22c-6-2-10 8-14 24z" />
    case 'topknot':
      return (
        <g {...props}>
          <path d="M66 74c2-22 16-33 34-33s32 11 34 33c-8-8-18-12-34-12s-26 4-34 12z" />
          <path d="M91 40c0-9 4-15 9-15s9 6 9 15c0 6-4 10-9 10s-9-4-9-10z" />
        </g>
      )
    case 'baroqueWig':
      return <path {...props} d="M63 84c-3-30 15-45 37-45s40 15 37 45c-6-14-13-21-37-21s-31 7-37 21z" />
  }
}

// -------------------------------------------------------------- Gesichtszüge

function Eyes({ variant }: { variant: Eyes }) {
  const s = { stroke: INK, strokeWidth: 2.4, fill: 'none', strokeLinecap: 'round' as const }
  switch (variant) {
    case 'closed':
      return <path {...s} d="M77 92c4 5 12 5 16 0M107 92c4 5 12 5 16 0" />
    case 'intense':
      return (
        <g>
          <path {...s} d="M76 92h18M106 92h18" />
          <circle cx="85" cy="94" r="3.2" fill={INK} />
          <circle cx="115" cy="94" r="3.2" fill={INK} />
        </g>
      )
    case 'wide':
      return (
        <g>
          <circle cx="85" cy="92" r="7.5" {...s} fill={SKIN} />
          <circle cx="115" cy="92" r="7.5" {...s} fill={SKIN} />
          <circle cx="85" cy="92" r="3" fill={INK} />
          <circle cx="115" cy="92" r="3" fill={INK} />
        </g>
      )
    case 'shadowed':
      return (
        <g>
          <path {...s} d="M76 86c5-3 13-3 18 0M106 86c5-3 13-3 18 0" />
          <path {...s} d="M77 93c4-4 12-4 16 0-4 4-12 4-16 0zM107 93c4-4 12-4 16 0-4 4-12 4-16 0z" />
          <circle cx="85" cy="93" r="2.8" fill={INK} />
          <circle cx="115" cy="93" r="2.8" fill={INK} />
          <path d="M74 100c6 3 14 3 20 0M106 100c6 3 14 3 20 0" stroke={INK} strokeWidth={1.4} fill="none" opacity={0.6} />
        </g>
      )
    case 'hollow':
      return (
        <g>
          <ellipse cx="85" cy="93" rx="8.5" ry="7.5" fill={INK} fillOpacity={0.82} />
          <ellipse cx="115" cy="93" rx="8.5" ry="7.5" fill={INK} fillOpacity={0.82} />
        </g>
      )
    case 'normal':
      return (
        <g>
          <path {...s} d="M77 92c4-5 13-5 17 0-4 5-13 5-17 0zM106 92c4-5 13-5 17 0-4 5-13 5-17 0z" fill={SKIN} />
          <circle cx="85.5" cy="92" r="2.8" fill={INK} />
          <circle cx="114.5" cy="92" r="2.8" fill={INK} />
        </g>
      )
  }
}

function BeardShape({ variant, shade }: { variant: Beard; shade: Shade }) {
  const props = { fill: INK, fillOpacity: SHADE[shade] + 0.06, stroke: INK, strokeWidth: 2, strokeLinejoin: 'round' as const }
  switch (variant) {
    case 'none':
      return null
    case 'stubble':
      return <path d="M70 104c5 18 16 28 30 28s25-10 30-28c0 20-13 34-30 34s-30-14-30-34z" fill={INK} fillOpacity={0.2} stroke="none" />
    case 'full':
      return <path {...props} d="M68 100c-3 26 13 44 32 44s35-18 32-44c-5 19-15 28-32 28s-27-9-32-28z" />
    case 'long':
      return <path {...props} d="M68 100c-5 32 8 50 13 72 4 15 34 15 38 0 5-22 18-40 13-72-7 24-17 34-32 34s-25-10-32-34z" />
    case 'goatee':
      return <path {...props} d="M89 114h22c2 13-2 26-11 26s-13-13-11-26z" />
    case 'chinStrap':
      return <path {...props} d="M66 94c0 26 15 44 34 44s34-18 34-44c-3 7-6 12-9 14-3-18-12-25-25-25s-22 7-25 25c-3-2-6-7-9-14z" />
    case 'mutton':
      return <path {...props} d="M64 82c-3 24 2 38 13 45 5-15 5-31 2-46zM136 82c3 24-2 38-13 45-5-15-5-31-2-46z" />
    case 'forked':
      return <path {...props} d="M70 102c-3 22 6 35 13 46l6 18 5-24h12l5 24 6-18c7-11 16-24 13-46-7 22-17 31-30 31s-23-9-30-31z" />
  }
}

function MoustacheShape({ variant }: { variant: Moustache }) {
  const props = { fill: INK, fillOpacity: 0.6, stroke: INK, strokeWidth: 1.8, strokeLinejoin: 'round' as const }
  switch (variant) {
    case 'none':
      return null
    case 'thin':
      return <path {...props} d="M84 108c6-3 10-3 16-3s10 0 16 3c-6 2-10 3-16 3s-10-1-16-3z" />
    case 'walrus':
      // Buschiger Schnauzer, der die Oberlippe komplett verdeckt
      return <path {...props} d="M68 104c9-6 20-8 32-8s23 2 32 8c-3 14-13 20-23 17-3-1-6-3-9-3s-6 2-9 3c-10 3-20-3-23-17z" />
    case 'bushy':
      return <path {...props} d="M75 104c7-4 16-6 25-6s18 2 25 6c-2 11-11 15-19 13-2 0-4-2-6-2s-4 2-6 2c-8 2-17-2-19-13z" />
    case 'handlebar':
      return (
        <path
          {...props}
          d="M100 102c9 0 17 2 23 5 7 3 13 0 15-5 1 10-6 17-16 15-6-1-14-4-22-4s-16 3-22 4c-10 2-17-5-16-15 2 5 8 8 15 5 6-3 14-5 23-5z"
        />
      )
    case 'droop':
      // Zwei herabhängende Strähnen mit Lücke — so bleibt der Mund sichtbar
      return (
        <g stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.72}>
          <path d="M85 106c-4 9-8 20-9 30-1 6-1 11 0 16" />
          <path d="M115 106c4 9 8 20 9 30 1 6 1 11 0 16" />
          <path d="M84 104c9-4 23-4 32 0" strokeWidth={6} />
        </g>
      )
  }
}

// -------------------------------------------------------------- Kopfbedeckung

function HeadwearShape({ variant, shade }: { variant: Headwear; shade: Shade }) {
  const fillOpacity = SHADE[shade]
  const props = { fill: INK, fillOpacity, stroke: INK, strokeWidth: 2.2, strokeLinejoin: 'round' as const }

  switch (variant) {
    case 'none':
      return null
    case 'strawHat':
      return (
        <g {...props}>
          <path d="M100 20c17 0 27 15 29 32 23 4 37 10 37 17 0 8-30 13-66 13s-66-5-66-13c0-7 14-13 37-17 2-17 12-32 29-32z" />
          <path d="M69 54c19 5 43 5 62 0" fill="none" strokeWidth={2.6} />
        </g>
      )
    case 'bicorne':
      return (
        <g {...props}>
          <path d="M100 24c27 0 54 15 62 32-15-7-27-9-31-4-7 6-17 9-31 9s-24-3-31-9c-4-5-16-3-31 4 8-17 35-32 62-32z" />
          <path d="M100 24v14" fill="none" />
        </g>
      )
    case 'tricorne':
      return (
        <g {...props}>
          <path d="M100 22c25 0 44 17 48 36 7 4 5 11-8 11H60c-13 0-15-7-8-11 4-19 23-36 48-36z" />
          <path d="M65 58c23 6 47 6 70 0" fill="none" />
        </g>
      )
    case 'fedora':
      return (
        <g {...props}>
          <path d="M100 24c19 0 29 11 31 31 19 2 29 6 29 11 0 6-27 9-60 9s-60-3-60-9c0-5 10-9 29-11 2-20 12-31 31-31z" />
          <path d="M69 54c19 5 43 5 62 0" fill="none" strokeWidth={2.6} />
        </g>
      )
    case 'beret':
      return (
        <g {...props}>
          <path d="M63 58c-2-21 15-33 37-33s39 12 37 33c-10 6-31 8-37 8s-27-2-37-8z" />
          <path d="M133 32c9-4 13-2 13 3s-6 6-13 6" />
        </g>
      )
    case 'laurel':
      return (
        <g fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round">
          <path d="M61 80c-5-17 2-30 13-36M139 80c5-17-2-30-13-36" />
          <g fill={INK} fillOpacity={0.32}>
            <path d="M65 67c-7-2-10-8-9-13 6 1 10 6 11 12zM71 54c-7-2-9-9-7-14 6 2 9 7 9 13zM81 44c-6-3-7-10-4-14 5 3 7 9 6 14zM135 67c7-2 10-8 9-13-6 1-10 6-11 12zM129 54c7-2 9-9 7-14-6 2-9 7-9 13zM119 44c6-3 7-10 4-14-5 3-7 9-6 14z" />
          </g>
        </g>
      )
    case 'crown':
      return (
        <g {...props}>
          <path d="M63 52 59 24l17 13 12-19 12 19 12-19 12 19 17-13-4 28z" />
          <path d="M63 52h74v9H63z" />
        </g>
      )
    case 'bandana':
      return (
        <g {...props}>
          <path d="M61 74c-2-19 15-31 39-31s41 12 39 31c-17-9-61-9-78 0z" />
          <path d="M139 62c11 2 17 9 21 17-8-2-15-2-21 0z" />
        </g>
      )
    case 'cap':
      return (
        <g {...props}>
          <path d="M63 68c-2-23 15-35 37-35s39 12 37 35c-17-6-57-6-74 0z" />
          <path d="M137 66c15 0 23 4 25 10-10 3-21 3-25 1z" />
        </g>
      )
    case 'helmet':
      return (
        <g {...props}>
          <path d="M61 82c-2-29 15-45 39-45s41 16 39 45c-4-4-9-6-13-6-2-15-10-23-26-23s-24 8-26 23c-4 0-9 2-13 6z" />
          <path d="M100 18v20" strokeWidth={3} />
          <circle cx="100" cy="14" r="5" />
        </g>
      )
    case 'furHat':
      return (
        <g {...props}>
          <path d="M59 76c-4-27 17-43 41-43s45 16 41 43c-6-6-14-8-20-6-4-13-11-19-21-19s-17 6-21 19c-6-2-14 0-20 6z" />
          <path d="M55 74c15-8 75-8 90 0 6 4 4 13-6 13H61c-10 0-12-9-6-13z" fillOpacity={Math.min(fillOpacity + 0.16, 0.85)} />
        </g>
      )
    case 'hood':
      return (
        <g {...props}>
          <path d="M100 26c27 0 45 23 45 52 0 14-4 26-10 35l-11-7c4-10 6-21 6-31 0-23-12-35-30-35s-30 12-30 35c0 10 2 21 6 31l-11 7c-6-9-10-21-10-35 0-29 18-52 45-52z" />
        </g>
      )
    case 'topHat':
      return (
        <g {...props}>
          <path d="M73 56V14h54v42z" />
          <path d="M55 56h90v9H55z" />
          <path d="M73 44h54" fill="none" strokeWidth={1.6} opacity={0.6} />
        </g>
      )
    case 'headscarf':
      return (
        <g {...props}>
          <path d="M59 88c-4-33 15-51 41-51s45 18 41 51c-6-4-10-4-14-2 2-21-8-33-27-33s-29 12-27 33c-4-2-8-2-14 2z" />
          <path d="M59 88c-4 19-2 35 4 47 8-6 13-17 13-31z" />
        </g>
      )
  }
}

// ---------------------------------------------------------------- Accessoires

function AccessoryMark({ variant }: { variant: Accessory }) {
  const line = { stroke: INK, strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const }
  switch (variant) {
    case 'none':
      return null
    case 'scarEye':
      return <path {...line} d="M77 76l-3 26M73 84h8" />
    case 'scarCheek':
      return <path {...line} d="M120 104l7 10M124 103l-4 11" />
    case 'eyepatch':
      return (
        <g>
          <path d="M103 82h24c3 0 4 2 4 5v11c0 4-2 6-5 6h-23z" fill={INK} fillOpacity={0.85} stroke={INK} strokeWidth={2} />
          <path {...line} d="M66 76l70-6" />
        </g>
      )
    case 'cigar':
      return (
        <g>
          <path d="M113 116h32v9h-32z" fill={INK} fillOpacity={0.4} stroke={INK} strokeWidth={2} />
          <path {...line} d="M149 114c5-6 3-11-2-13" strokeWidth={1.6} />
        </g>
      )
    case 'cigarette':
      return (
        <g>
          <path d="M112 117h24v5h-24z" fill={SKIN} stroke={INK} strokeWidth={2} />
          <path {...line} d="M140 113c3-5 1-10-2-12" strokeWidth={1.6} />
        </g>
      )
    case 'swords':
      // Gekreuzte Klingen hinter dem Kopf, Griffe außen unten — Wappen-Motiv
      return (
        <g stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round">
          <path d="M30 198 152 38M170 198 48 38" />
          <path d="M22 206l14-12M178 206l-14-12" strokeWidth={6} />
          <path d="M32 182l14 12M168 182l-14 12" strokeWidth={3} />
        </g>
      )
    case 'antlers':
      return (
        <g stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round">
          <path d="M76 48 58 20M62 30l-13 3M64 22l-4-13M124 48l18-28M138 30l13 3M136 22l4-13" />
        </g>
      )
    case 'skull':
      return (
        <g>
          <path stroke={INK} strokeWidth={2} fill="none" d="M78 116c9 5 35 5 44 0" />
          <path stroke={INK} strokeWidth={2} d="M88 110v12M100 110v12M112 110v12" />
        </g>
      )
    case 'star':
      return <path d="m100 44 4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill={SKIN} stroke={INK} strokeWidth={1.8} />
    case 'earring':
      return <circle cx="62" cy="108" r="5" {...line} />
    case 'feather':
      return (
        <g {...line}>
          <path d="M142 44c15-12 26-11 32-6-7 10-19 15-29 15" />
          <path d="M148 46c6 2 12 2 18 0" strokeWidth={1.4} />
        </g>
      )
    case 'bowTie':
      return (
        <g stroke={INK} strokeWidth={2} fill={INK} fillOpacity={0.45}>
          <path d="M100 170 76 159v22zM100 170l24-11v22z" />
          <circle cx="100" cy="170" r="4.5" />
        </g>
      )
    case 'gloves':
      // Boxhandschuhe in Deckung — mit Daumen und Bündchen, sonst wirken sie wie Kreise
      return (
        <g stroke={INK} strokeWidth={2.4} fill={INK} fillOpacity={0.45} strokeLinejoin="round">
          <path d="M62 215c-17 0-29-12-29-27 0-14 13-24 29-24s29 10 29 24c0 15-12 27-29 27z" />
          <path d="M36 178c-8 0-12 6-11 12 1 6 7 9 13 8" />
          <path d="M42 195c12 5 28 5 40 0" fill="none" strokeWidth={1.8} />
          <path d="M138 215c17 0 29-12 29-27 0-14-13-24-29-24s-29 10-29 24c0 15 12 27 29 27z" />
          <path d="M164 178c8 0 12 6 11 12-1 6-7 9-13 8" />
          <path d="M118 195c12 5 28 5 40 0" fill="none" strokeWidth={1.8} />
        </g>
      )
  }
}

// -------------------------------------------------------------------- Kleidung

function CollarShape({ variant, shade }: { variant: Collar; shade: Shade }) {
  const props = {
    fill: INK,
    fillOpacity: SHADE[shade] * 0.5,
    stroke: INK,
    strokeWidth: 2.2,
    strokeLinejoin: 'round' as const,
  }
  switch (variant) {
    case 'none':
      return <path {...props} d="M74 150c-16 6-28 16-34 30l-4 25h128l-4-25c-6-14-18-24-34-30z" fillOpacity={0.06} />
    case 'suit':
      return (
        <g {...props}>
          <path d="M74 150c-18 6-30 16-36 30l-4 25h132l-4-25c-6-14-18-24-36-30z" />
          <path d="M74 150l26 22 26-22" fill="none" />
          <path d="M96 176h8l6 29H90z" fillOpacity={0.7} />
        </g>
      )
    case 'coat':
      return (
        <g {...props}>
          <path d="M72 150c-20 6-34 16-40 30l-4 25h144l-4-25c-6-14-20-24-40-30z" />
          <path d="M72 150 100 180 128 150M100 180v25" fill="none" />
        </g>
      )
    case 'openShirt':
      return (
        <g {...props}>
          <path d="M74 150c-18 6-30 16-36 30l-4 25h132l-4-25c-6-14-18-24-36-30z" />
          <path d="M80 152 100 186 120 152" fill="none" />
        </g>
      )
    case 'highCollar':
      return (
        <g {...props}>
          <path d="M74 150c-18 6-30 16-36 30l-4 25h132l-4-25c-6-14-18-24-36-30z" />
          <path d="M78 148c-2 14 8 24 22 24s24-10 22-24" fill="none" strokeWidth={2.6} />
        </g>
      )
    case 'uniform':
      return (
        <g {...props}>
          <path d="M72 150c-20 6-34 16-40 30l-4 25h144l-4-25c-6-14-20-24-40-30z" />
          <path d="M100 152v53" fill="none" />
          <circle cx="88" cy="180" r="3" fillOpacity={0.9} />
          <circle cx="88" cy="194" r="3" fillOpacity={0.9} />
          <circle cx="112" cy="180" r="3" fillOpacity={0.9} />
          <circle cx="112" cy="194" r="3" fillOpacity={0.9} />
          <path d="M34 178h22v10H36zM144 178h22v10h-20z" fillOpacity={0.75} />
        </g>
      )
    case 'robe':
      return (
        <g {...props}>
          <path d="M70 150c-22 8-36 18-42 32l-4 23h152l-4-23c-6-14-20-24-42-32z" />
          <path d="M84 152c4 18 10 30 16 53M116 152c-4 18-10 30-16 53" fill="none" />
        </g>
      )
    case 'toga':
      return (
        <g {...props}>
          <path d="M72 150c-20 6-34 16-40 30l-4 25h144l-4-25c-6-14-20-24-40-30z" />
          <path d="M76 152c14 12 34 22 60 26M80 170c14 12 32 20 52 24" fill="none" />
        </g>
      )
    case 'kimono':
      return (
        <g {...props}>
          <path d="M72 150c-20 6-34 16-40 30l-4 25h144l-4-25c-6-14-20-24-40-30z" />
          <path d="M78 152 100 178l22-26M100 178l-14 27M100 178l14 27" fill="none" />
        </g>
      )
    case 'cloak':
      return (
        <g {...props}>
          <path d="M70 148c-24 8-40 20-46 34l-4 23h160l-4-23c-6-14-22-26-46-34z" />
          <circle cx="100" cy="162" r="7" fillOpacity={0.8} />
          <path d="M84 152c-4 18-4 36 0 53M116 152c4 18 4 36 0 53" fill="none" />
        </g>
      )
  }
}

function Eyewear({ variant }: { variant: 'round' | 'rect' | 'monocle' | 'shades' }): JSX.Element {
  const line = { stroke: INK, strokeWidth: 2.4, fill: 'none' as const }
  switch (variant) {
    case 'round':
      return (
        <g {...line}>
          <circle cx="85" cy="92" r="12" />
          <circle cx="115" cy="92" r="12" />
          <path d="M97 92h6M73 90l-10-3M127 90l10-3" />
        </g>
      )
    case 'rect':
      return (
        <g {...line}>
          <path d="M71 84h28v16H71zM101 84h28v16h-28zM99 90h2M71 86l-9-2M129 86l9-2" />
        </g>
      )
    case 'monocle':
      return (
        <g {...line}>
          <circle cx="115" cy="92" r="13" />
          <path d="M124 102c4 8 4 16 2 22" strokeWidth={1.6} />
        </g>
      )
    case 'shades':
      return (
        <g>
          <path d="M69 84h27v18H69zM104 84h27v18h-27z" fill={INK} fillOpacity={0.82} stroke={INK} strokeWidth={2.2} />
          <path d="M96 88h8M69 86l-8-2M131 86l8-2" {...line} />
        </g>
      )
  }
}

// -------------------------------------------------------------------- Porträt

/** Beiwerk, das hinter die Figur gehört. */
const BEHIND: Accessory[] = ['swords', 'antlers']
/** Beiwerk, das vor die Kleidung gehört. */
const IN_FRONT: Accessory[] = ['gloves', 'bowTie']

export function Portrait({ id, spec, className }: { id: string; spec?: PortraitSpec; className?: string }) {
  const base = fallbackSpec(id)
  const s = { ...base, ...spec }
  const accessories = spec?.accessories ?? base.accessories
  const seed = hashId(id)

  const behind = accessories.filter((a) => BEHIND.includes(a))
  const front = accessories.filter((a) => IN_FRONT.includes(a))
  const onFace = accessories.filter((a) => !BEHIND.includes(a) && !IN_FRONT.includes(a))

  const line = { stroke: INK, strokeWidth: 2.4, fill: 'none', strokeLinecap: 'round' as const }

  const brows: Record<string, string> = {
    normal: 'M76 80c5-4 13-4 18-1M106 79c5-3 13-3 18 1',
    thick: 'M75 79c6-6 15-5 20-1M105 78c5-4 14-5 20 1',
    angry: 'M76 76l18 7M124 76l-18 7',
    raised: 'M76 78c6-6 14-6 18-2M106 76c4-4 12-4 18 2',
    curl: 'M76 80c5-5 14-4 18 0M106 79c4-4 12-5 18 0c-3 4-8 2-9-1',
  }

  const noses: Record<string, string> = {
    normal: 'M100 96v11l-6 4',
    long: 'M100 94v18l-7 4',
    aquiline: 'M100 94c3 8 4 14 2 17l-7 2',
    small: 'M100 99v6l-5 3',
  }

  const mouths: Record<string, string> = {
    neutral: 'M89 118h22',
    smile: 'M87 116c6 7 20 7 26 0',
    grin: 'M84 114c8 12 24 12 32 0-8 4-24 4-32 0z',
    stern: 'M87 120c6-4 20-4 26 0',
    open: 'M90 114c4-3 16-3 20 0-2 10-18 10-20 0z',
    smirk: 'M88 119c8 4 18 2 24-4',
  }

  const filledMouth = s.mouth === 'grin' || s.mouth === 'open'

  return (
    <svg viewBox="0 0 200 215" className={className} role="img" aria-label="Gezeichnetes Porträt" style={{ color: INK }}>
      {behind.map((accessory) => (
        <AccessoryMark key={accessory} variant={accessory} />
      ))}

      <CollarShape variant={s.collar} shade={s.shade} />

      <HairBack style={s.hair} shade={s.shade} />

      {/* Hals — liegt hinter dem deckenden Kopf, sichtbar bleibt nur der Teil unterhalb des Kinns */}
      <path d="M85 112h30v40h-30z" fill={SKIN} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />

      {/* Kopf: deckend gefüllt, sonst scheinen Hals- und Haarlinien durchs Gesicht */}
      <path d={FACE_PATHS[s.face]} fill={SKIN} stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />

      {/* Ohren */}
      <path {...line} d="M63 88c-5-1-8 3-7 8s5 8 9 7M137 88c5-1 8 3 7 8s-5 8-9 7" strokeWidth={2.2} />

      {/* Schraffur für Tiefe auf der rechten Gesichtshälfte */}
      <g stroke={INK} strokeWidth={1.2} opacity={0.25} strokeLinecap="round">
        <path d={`M${127 + (seed % 3)} 98l5 9M${125 + (seed % 3)} 108l5 9M${121 + (seed % 3)} 117l4 8`} />
      </g>

      <HairFront style={s.hair} shade={s.shade} />

      {s.eyes !== 'hollow' && <path {...line} d={brows[s.brows]} />}
      <Eyes variant={s.eyes} />
      <path {...line} d={noses[s.nose]} strokeWidth={2.2} />
      <path
        {...line}
        d={mouths[s.mouth]}
        fill={filledMouth ? INK : 'none'}
        fillOpacity={filledMouth ? 0.2 : undefined}
      />

      <BeardShape variant={s.beard} shade={s.shade} />
      <MoustacheShape variant={s.moustache} />

      <HeadwearShape variant={s.headwear} shade={s.shade} />

      {s.eyewear !== 'none' && <Eyewear variant={s.eyewear} />}

      {onFace.map((accessory) => (
        <AccessoryMark key={accessory} variant={accessory} />
      ))}
      {front.map((accessory) => (
        <AccessoryMark key={accessory} variant={accessory} />
      ))}
    </svg>
  )
}
