/**
 * Merkmals-Vokabular der Tinte-Porträts.
 *
 * Statt fremder Artworks (docs/04-recht.md, 4.5) zeichnet das Spiel jede Figur
 * und jede Person selbst: eine abstrahierte Federzeichnung, die aus wenigen
 * Merkmalen zusammengesetzt wird — Kopfform, Frisur, Bart, Kopfbedeckung,
 * Accessoire. Erkennbar wird sie über die Silhouette (Strohhut, Zweispitz,
 * Lorbeerkranz), nicht über eine Nachzeichnung des Originals.
 */

export const FACE_SHAPES = ['oval', 'round', 'square', 'long', 'heart'] as const
export const HAIR_STYLES = [
  'none',
  'bald',
  'receding',
  'short',
  'buzz',
  'wavy',
  'curly',
  'long',
  'longStraight',
  'ponytail',
  'bun',
  'afro',
  'spiky',
  'swoop',
  'mane',
  'topknot',
  'bob',
  'baroqueWig',
  'braids',
] as const
export const BROWS = ['normal', 'thick', 'angry', 'raised', 'curl'] as const
export const EYES = ['normal', 'intense', 'closed', 'wide', 'shadowed', 'hollow'] as const
export const NOSES = ['normal', 'long', 'aquiline', 'small'] as const
export const MOUTHS = ['neutral', 'smile', 'grin', 'stern', 'open', 'smirk'] as const
export const BEARDS = ['none', 'full', 'long', 'goatee', 'chinStrap', 'stubble', 'mutton', 'forked'] as const
export const MOUSTACHES = ['none', 'walrus', 'handlebar', 'thin', 'bushy', 'droop'] as const
export const HEADWEAR = [
  'none',
  'strawHat',
  'bicorne',
  'fedora',
  'beret',
  'laurel',
  'bandana',
  'cap',
  'helmet',
  'furHat',
  'hood',
  'tricorne',
  'topHat',
  'headscarf',
  'crown',
] as const
export const EYEWEAR = ['none', 'round', 'rect', 'monocle', 'shades'] as const
export const ACCESSORIES = [
  'none',
  'scarEye',
  'scarCheek',
  'eyepatch',
  'cigar',
  'cigarette',
  'swords',
  'antlers',
  'skull',
  'star',
  'earring',
  'feather',
  'bowTie',
  'gloves',
] as const
export const COLLARS = ['none', 'suit', 'robe', 'toga', 'uniform', 'openShirt', 'highCollar', 'coat', 'kimono', 'cloak'] as const

export type FaceShape = (typeof FACE_SHAPES)[number]
export type HairStyle = (typeof HAIR_STYLES)[number]
export type Brows = (typeof BROWS)[number]
export type Eyes = (typeof EYES)[number]
export type Nose = (typeof NOSES)[number]
export type Mouth = (typeof MOUTHS)[number]
export type Beard = (typeof BEARDS)[number]
export type Moustache = (typeof MOUSTACHES)[number]
export type Headwear = (typeof HEADWEAR)[number]
export type Eyewear = (typeof EYEWEAR)[number]
export type Accessory = (typeof ACCESSORIES)[number]
export type Collar = (typeof COLLARS)[number]

export type PortraitSpec = {
  face?: FaceShape
  hair?: HairStyle
  brows?: Brows
  eyes?: Eyes
  nose?: Nose
  mouth?: Mouth
  beard?: Beard
  moustache?: Moustache
  headwear?: Headwear
  eyewear?: Eyewear
  accessories?: Accessory[]
  collar?: Collar
  /** Tonwert der Haar-/Stofffläche: hell (weißes Haar) bis dunkel. */
  shade?: 'light' | 'mid' | 'dark'
}

/** Deterministischer Hash — damit auch ohne Spezifikation ein Bild entsteht. */
export function hashId(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

const pick = <T,>(options: readonly T[], seed: number, salt: number): T => options[(seed >> salt) % options.length]

/**
 * Fallback für Figuren ohne eigene Spezifikation. Damit gilt ausnahmslos:
 * Es wird immer ein Porträt gezeichnet, nie ein leerer Platzhalter.
 */
export function fallbackSpec(id: string): Required<Omit<PortraitSpec, 'accessories'>> & { accessories: Accessory[] } {
  const seed = hashId(id)
  return {
    face: pick(FACE_SHAPES, seed, 0),
    hair: pick(['short', 'wavy', 'curly', 'long', 'bob', 'receding', 'ponytail'] as const, seed, 3),
    brows: pick(BROWS, seed, 5),
    eyes: pick(['normal', 'intense', 'wide'] as const, seed, 7),
    nose: pick(NOSES, seed, 9),
    mouth: pick(['neutral', 'smile', 'stern', 'smirk'] as const, seed, 11),
    beard: pick(['none', 'none', 'stubble', 'goatee', 'full'] as const, seed, 13),
    moustache: 'none',
    headwear: 'none',
    eyewear: 'none',
    accessories: [],
    collar: pick(['suit', 'openShirt', 'coat', 'robe'] as const, seed, 15),
    shade: pick(['light', 'mid', 'dark'] as const, seed, 17),
  }
}
