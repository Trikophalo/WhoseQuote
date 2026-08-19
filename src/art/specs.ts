import type { PortraitSpec } from './vocabulary'

/**
 * Merkmale je Figur und Person.
 *
 * Ziel ist Wiedererkennbarkeit über die Silhouette — Strohhut, Zweispitz,
 * Lorbeerkranz, Walrossbart —, nicht die Nachzeichnung einer Vorlage. Für
 * Anime-Figuren ist das bewusst so gewählt: abstrahierte Attribute statt
 * einer Kopie des Originaldesigns (docs/04-recht.md, 4.5).
 *
 * Wer hier fehlt, bekommt automatisch ein aus der ID abgeleitetes Porträt —
 * es wird also immer ein Bild gezeichnet.
 */
export const PORTRAIT_SPECS: Record<string, PortraitSpec> = {
  // ------------------------------------------------------------ One Piece
  'one-piece/luffy': {
    face: 'round', hair: 'short', shade: 'dark', brows: 'thick', eyes: 'wide',
    mouth: 'grin', headwear: 'strawHat', collar: 'openShirt', accessories: ['scarCheek'],
  },
  'one-piece/zoro': {
    face: 'square', hair: 'buzz', shade: 'mid', brows: 'angry', eyes: 'intense',
    mouth: 'stern', headwear: 'bandana', collar: 'kimono', accessories: ['swords', 'scarEye'],
  },
  'one-piece/sanji': {
    face: 'long', hair: 'swoop', shade: 'light', brows: 'curl', eyes: 'normal',
    mouth: 'smirk', collar: 'suit', accessories: ['cigarette'],
  },
  'one-piece/nico-robin': {
    face: 'oval', hair: 'longStraight', shade: 'dark', brows: 'normal', eyes: 'normal',
    mouth: 'smile', collar: 'highCollar',
  },
  'one-piece/usopp': {
    face: 'oval', hair: 'curly', shade: 'dark', brows: 'raised', eyes: 'wide',
    nose: 'long', mouth: 'open', headwear: 'bandana', collar: 'openShirt',
  },
  'one-piece/jinbe': {
    face: 'square', hair: 'topknot', shade: 'dark', brows: 'thick', eyes: 'intense',
    beard: 'mutton', mouth: 'stern', collar: 'kimono',
  },
  'one-piece/hiluluk': {
    face: 'long', hair: 'mane', shade: 'mid', brows: 'raised', eyes: 'normal',
    nose: 'long', beard: 'full', mouth: 'smile', collar: 'coat',
  },
  'one-piece/whitebeard': {
    face: 'square', hair: 'none', shade: 'light', brows: 'thick', eyes: 'intense',
    moustache: 'droop', mouth: 'stern', headwear: 'bandana', collar: 'cloak',
  },
  'one-piece/gol-d-roger': {
    face: 'square', hair: 'short', shade: 'dark', brows: 'thick', eyes: 'intense',
    moustache: 'handlebar', mouth: 'grin', headwear: 'tricorne', collar: 'coat',
  },
  'one-piece/doflamingo': {
    face: 'long', hair: 'spiky', shade: 'light', eyes: 'shadowed', mouth: 'smirk',
    eyewear: 'shades', collar: 'cloak', accessories: ['feather'],
  },
  'one-piece/shanks': {
    face: 'oval', hair: 'long', shade: 'mid', brows: 'normal', eyes: 'normal',
    mouth: 'smile', collar: 'cloak', accessories: ['scarEye'],
  },
  'one-piece/rayleigh': {
    face: 'oval', hair: 'long', shade: 'light', brows: 'thick', eyes: 'normal',
    beard: 'full', mouth: 'smile', eyewear: 'round', collar: 'coat',
  },
  'one-piece/ace': {
    face: 'oval', hair: 'short', shade: 'dark', brows: 'normal', eyes: 'normal',
    mouth: 'grin', headwear: 'cap', collar: 'openShirt',
  },
  'one-piece/crocodile': {
    face: 'square', hair: 'buzz', shade: 'dark', brows: 'angry', eyes: 'shadowed',
    mouth: 'stern', collar: 'coat', accessories: ['scarEye', 'cigar'],
  },
  'one-piece/kuzan': {
    face: 'long', hair: 'short', shade: 'dark', beard: 'stubble', mouth: 'neutral',
    eyewear: 'shades', collar: 'coat',
  },
  'one-piece/law': {
    face: 'long', hair: 'short', shade: 'dark', brows: 'angry', eyes: 'shadowed',
    beard: 'goatee', mouth: 'smirk', headwear: 'furHat', collar: 'coat',
  },
  'one-piece/vivi': {
    face: 'heart', hair: 'long', shade: 'mid', brows: 'normal', eyes: 'normal',
    mouth: 'smile', collar: 'robe',
  },
  'one-piece/bellemere': {
    face: 'oval', hair: 'bob', shade: 'mid', brows: 'raised', eyes: 'normal',
    mouth: 'smirk', collar: 'openShirt', accessories: ['cigarette'],
  },
  'one-piece/kaido': {
    face: 'square', hair: 'mane', shade: 'dark', brows: 'angry', eyes: 'intense',
    moustache: 'droop', mouth: 'stern', collar: 'cloak', accessories: ['antlers'],
  },
  'one-piece/rob-lucci': {
    face: 'long', hair: 'short', shade: 'dark', brows: 'angry', eyes: 'shadowed',
    beard: 'goatee', mouth: 'neutral', headwear: 'topHat', collar: 'suit',
  },
  'one-piece/chopper': {
    face: 'round', hair: 'short', shade: 'mid', brows: 'raised', eyes: 'wide',
    nose: 'small', mouth: 'smile', headwear: 'cap', collar: 'none', accessories: ['antlers'],
  },
  'one-piece/brook': {
    face: 'long', hair: 'afro', shade: 'dark', eyes: 'hollow', mouth: 'neutral',
    collar: 'suit', accessories: ['skull', 'bowTie'],
  },

  // -------------------------------------------------------- Reale Personen
  'marc-aurel': {
    face: 'oval', hair: 'curly', shade: 'mid', brows: 'normal', eyes: 'normal',
    beard: 'full', mouth: 'neutral', headwear: 'laurel', collar: 'toga',
  },
  seneca: {
    face: 'long', hair: 'receding', shade: 'mid', brows: 'normal', eyes: 'normal',
    nose: 'aquiline', beard: 'chinStrap', mouth: 'stern', collar: 'toga',
  },
  sunzi: {
    face: 'square', hair: 'none', shade: 'dark', brows: 'angry', eyes: 'intense',
    beard: 'forked', moustache: 'droop', mouth: 'stern', headwear: 'helmet', collar: 'robe',
  },
  laozi: {
    face: 'oval', hair: 'long', shade: 'light', brows: 'normal', eyes: 'closed',
    beard: 'long', moustache: 'droop', mouth: 'neutral', collar: 'robe',
  },
  konfuzius: {
    face: 'long', hair: 'none', shade: 'dark', brows: 'normal', eyes: 'normal',
    beard: 'long', moustache: 'thin', mouth: 'neutral', headwear: 'cap', collar: 'robe',
  },
  sokrates: {
    face: 'round', hair: 'bald', shade: 'mid', brows: 'thick', eyes: 'normal',
    nose: 'small', beard: 'full', mouth: 'smile', collar: 'toga',
  },
  'julius-caesar': {
    face: 'long', hair: 'receding', shade: 'mid', brows: 'angry', eyes: 'intense',
    nose: 'aquiline', mouth: 'stern', headwear: 'laurel', collar: 'toga',
  },
  'dschingis-khan': {
    face: 'square', hair: 'braids', shade: 'dark', brows: 'angry', eyes: 'intense',
    moustache: 'droop', beard: 'goatee', mouth: 'stern', headwear: 'furHat', collar: 'cloak',
  },
  'miyamoto-musashi': {
    face: 'square', hair: 'topknot', shade: 'dark', brows: 'angry', eyes: 'intense',
    beard: 'stubble', mouth: 'stern', collar: 'kimono', accessories: ['swords'],
  },
  machiavelli: {
    face: 'long', hair: 'short', shade: 'dark', brows: 'normal', eyes: 'intense',
    nose: 'long', mouth: 'smirk', headwear: 'cap', collar: 'highCollar',
  },
  voltaire: {
    face: 'long', hair: 'baroqueWig', shade: 'light', brows: 'raised', eyes: 'normal',
    nose: 'aquiline', mouth: 'smirk', collar: 'highCollar',
  },
  robespierre: {
    face: 'oval', hair: 'baroqueWig', shade: 'light', brows: 'normal', eyes: 'intense',
    mouth: 'stern', collar: 'highCollar',
  },
  kant: {
    face: 'oval', hair: 'baroqueWig', shade: 'light', brows: 'normal', eyes: 'normal',
    nose: 'small', mouth: 'neutral', collar: 'suit',
  },
  napoleon: {
    face: 'oval', hair: 'short', shade: 'dark', brows: 'angry', eyes: 'intense',
    mouth: 'stern', headwear: 'bicorne', collar: 'uniform',
  },
  goethe: {
    face: 'oval', hair: 'wavy', shade: 'mid', brows: 'raised', eyes: 'normal',
    nose: 'long', mouth: 'neutral', collar: 'highCollar',
  },
  'karl-marx': {
    face: 'round', hair: 'mane', shade: 'dark', brows: 'thick', eyes: 'normal',
    beard: 'long', moustache: 'bushy', mouth: 'neutral', collar: 'suit',
  },
  dostojewski: {
    face: 'long', hair: 'receding', shade: 'mid', brows: 'normal', eyes: 'shadowed',
    beard: 'full', mouth: 'stern', collar: 'suit',
  },
  'frederick-douglass': {
    face: 'oval', hair: 'mane', shade: 'light', brows: 'thick', eyes: 'intense',
    beard: 'full', mouth: 'stern', collar: 'suit',
  },
  nietzsche: {
    face: 'oval', hair: 'short', shade: 'mid', brows: 'thick', eyes: 'intense',
    moustache: 'walrus', mouth: 'neutral', collar: 'suit',
  },
  'mark-twain': {
    face: 'oval', hair: 'wavy', shade: 'light', brows: 'thick', eyes: 'normal',
    moustache: 'walrus', mouth: 'smirk', collar: 'suit', accessories: ['bowTie'],
  },
  'rosa-luxemburg': {
    face: 'round', hair: 'bun', shade: 'dark', brows: 'normal', eyes: 'normal',
    mouth: 'neutral', collar: 'highCollar',
  },
  gandhi: {
    face: 'oval', hair: 'bald', shade: 'light', brows: 'normal', eyes: 'normal',
    moustache: 'thin', mouth: 'smile', eyewear: 'round', collar: 'robe',
  },
  'al-capone': {
    face: 'round', hair: 'short', shade: 'dark', brows: 'thick', eyes: 'shadowed',
    mouth: 'smirk', headwear: 'fedora', collar: 'suit', accessories: ['cigar', 'scarCheek'],
  },
  churchill: {
    face: 'round', hair: 'bald', shade: 'light', brows: 'thick', eyes: 'intense',
    mouth: 'stern', collar: 'suit', accessories: ['cigar', 'bowTie'],
  },
  'malcolm-x': {
    face: 'long', hair: 'buzz', shade: 'dark', brows: 'normal', eyes: 'intense',
    beard: 'goatee', mouth: 'neutral', eyewear: 'rect', collar: 'suit',
  },
  'che-guevara': {
    face: 'oval', hair: 'long', shade: 'dark', brows: 'thick', eyes: 'intense',
    beard: 'full', mouth: 'neutral', headwear: 'beret', collar: 'uniform', accessories: ['star'],
  },
  'martin-luther-king': {
    face: 'oval', hair: 'buzz', shade: 'dark', brows: 'normal', eyes: 'normal',
    moustache: 'thin', mouth: 'smile', collar: 'suit',
  },
  'bruce-lee': {
    face: 'heart', hair: 'bob', shade: 'dark', brows: 'angry', eyes: 'intense',
    mouth: 'stern', collar: 'openShirt',
  },
  'hannah-arendt': {
    face: 'oval', hair: 'wavy', shade: 'dark', brows: 'raised', eyes: 'normal',
    mouth: 'smirk', collar: 'suit', accessories: ['cigarette'],
  },
  'steve-jobs': {
    face: 'oval', hair: 'buzz', shade: 'light', brows: 'normal', eyes: 'normal',
    beard: 'stubble', mouth: 'smile', eyewear: 'round', collar: 'highCollar',
  },
  'nelson-mandela': {
    face: 'round', hair: 'short', shade: 'light', brows: 'normal', eyes: 'normal',
    mouth: 'smile', collar: 'robe',
  },
  'muhammad-ali': {
    face: 'oval', hair: 'short', shade: 'dark', brows: 'thick', eyes: 'intense',
    mouth: 'grin', collar: 'none', accessories: ['gloves'],
  },
  'elon-musk': {
    face: 'oval', hair: 'short', shade: 'dark', brows: 'normal', eyes: 'normal',
    mouth: 'neutral', collar: 'suit',
  },

  // --------------------------------------------- Erweiterung 19.08.2026
  'one-piece/nami': {
    face: 'heart', hair: 'long', shade: 'mid', brows: 'raised', eyes: 'normal',
    mouth: 'smirk', collar: 'openShirt', accessories: ['earring'],
  },
  'one-piece/franky': {
    face: 'square', hair: 'spiky', shade: 'mid', brows: 'thick', eyes: 'normal',
    nose: 'small', mouth: 'grin', eyewear: 'shades', collar: 'openShirt',
  },
  'one-piece/sabo': {
    face: 'oval', hair: 'wavy', shade: 'light', brows: 'normal', eyes: 'intense',
    mouth: 'stern', headwear: 'topHat', collar: 'coat', accessories: ['scarEye'],
  },
  'one-piece/garp': {
    face: 'square', hair: 'buzz', shade: 'light', brows: 'thick', eyes: 'intense',
    beard: 'chinStrap', mouth: 'grin', collar: 'uniform', accessories: ['scarEye'],
  },
  'one-piece/hancock': {
    face: 'heart', hair: 'longStraight', shade: 'dark', brows: 'raised', eyes: 'shadowed',
    mouth: 'smirk', collar: 'robe', accessories: ['earring'],
  },
  'one-piece/katakuri': {
    face: 'square', hair: 'spiky', shade: 'dark', brows: 'angry', eyes: 'intense',
    mouth: 'stern', collar: 'highCollar', accessories: ['scarCheek'],
  },
  'one-piece/akainu': {
    face: 'square', hair: 'buzz', shade: 'dark', brows: 'angry', eyes: 'shadowed',
    mouth: 'stern', headwear: 'cap', collar: 'uniform',
  },
  'one-piece/oden': {
    face: 'square', hair: 'topknot', shade: 'dark', brows: 'thick', eyes: 'wide',
    beard: 'stubble', mouth: 'grin', collar: 'kimono', accessories: ['swords'],
  },
  'one-piece/corazon': {
    face: 'long', hair: 'swoop', shade: 'light', brows: 'raised', eyes: 'normal',
    mouth: 'smile', collar: 'cloak', accessories: ['cigarette'],
  },
  'one-piece/zeff': {
    face: 'round', hair: 'receding', shade: 'light', brows: 'thick', eyes: 'intense',
    moustache: 'handlebar', mouth: 'stern', collar: 'suit',
  },
  'one-piece/kureha': {
    face: 'long', hair: 'longStraight', shade: 'light', brows: 'raised', eyes: 'normal',
    mouth: 'smirk', eyewear: 'shades', collar: 'openShirt', accessories: ['earring'],
  },
  'one-piece/fisher-tiger': {
    face: 'square', hair: 'mane', shade: 'dark', brows: 'thick', eyes: 'intense',
    beard: 'stubble', mouth: 'stern', collar: 'openShirt', accessories: ['scarCheek'],
  },
  'one-piece/otohime': {
    face: 'heart', hair: 'long', shade: 'light', brows: 'normal', eyes: 'normal',
    mouth: 'smile', collar: 'robe',
  },
  'one-piece/eneru': {
    face: 'long', hair: 'none', shade: 'light', brows: 'raised', eyes: 'shadowed',
    mouth: 'smirk', headwear: 'headscarf', collar: 'none', accessories: ['earring'],
  },

  stalin: {
    face: 'square', hair: 'short', shade: 'dark', brows: 'thick', eyes: 'shadowed',
    moustache: 'bushy', mouth: 'stern', collar: 'uniform',
  },
  mao: {
    face: 'round', hair: 'receding', shade: 'dark', brows: 'normal', eyes: 'normal',
    mouth: 'neutral', collar: 'uniform',
  },
  'louis-xiv': {
    face: 'long', hair: 'baroqueWig', shade: 'dark', brows: 'raised', eyes: 'normal',
    nose: 'aquiline', moustache: 'thin', mouth: 'smirk', collar: 'cloak',
  },
  'marie-antoinette': {
    face: 'heart', hair: 'baroqueWig', shade: 'light', brows: 'raised', eyes: 'normal',
    mouth: 'smirk', collar: 'highCollar', accessories: ['earring'],
  },
  bismarck: {
    face: 'round', hair: 'bald', shade: 'light', brows: 'thick', eyes: 'intense',
    moustache: 'walrus', mouth: 'stern', headwear: 'helmet', collar: 'uniform',
  },
  diogenes: {
    face: 'round', hair: 'mane', shade: 'light', brows: 'thick', eyes: 'closed',
    beard: 'long', mouth: 'smirk', collar: 'toga',
  },
  einstein: {
    face: 'round', hair: 'mane', shade: 'light', brows: 'thick', eyes: 'normal',
    moustache: 'bushy', mouth: 'smile', collar: 'suit',
  },
  'oscar-wilde': {
    face: 'long', hair: 'swoop', shade: 'dark', brows: 'raised', eyes: 'normal',
    mouth: 'smirk', collar: 'suit', accessories: ['bowTie', 'feather'],
  },
  thatcher: {
    face: 'oval', hair: 'wavy', shade: 'light', brows: 'normal', eyes: 'intense',
    mouth: 'stern', collar: 'highCollar', accessories: ['earring'],
  },
  castro: {
    face: 'long', hair: 'short', shade: 'dark', brows: 'thick', eyes: 'intense',
    beard: 'long', mouth: 'neutral', headwear: 'cap', collar: 'uniform', accessories: ['cigar'],
  },
  trump: {
    face: 'round', hair: 'swoop', shade: 'light', brows: 'angry', eyes: 'normal',
    mouth: 'open', collar: 'suit',
  },
  'mike-tyson': {
    face: 'square', hair: 'buzz', shade: 'dark', brows: 'angry', eyes: 'intense',
    moustache: 'thin', mouth: 'stern', collar: 'none', accessories: ['gloves', 'scarEye'],
  },
  'teddy-roosevelt': {
    face: 'round', hair: 'short', shade: 'mid', brows: 'thick', eyes: 'normal',
    moustache: 'walrus', mouth: 'grin', eyewear: 'round', collar: 'suit',
  },
  freud: {
    face: 'long', hair: 'receding', shade: 'light', brows: 'normal', eyes: 'intense',
    beard: 'full', mouth: 'neutral', eyewear: 'round', collar: 'suit', accessories: ['cigar'],
  },
  'jeanne-d-arc': {
    face: 'heart', hair: 'bob', shade: 'dark', brows: 'normal', eyes: 'intense',
    mouth: 'stern', headwear: 'helmet', collar: 'uniform',
  },
  beauvoir: {
    face: 'oval', hair: 'bun', shade: 'dark', brows: 'raised', eyes: 'intense',
    mouth: 'neutral', collar: 'highCollar', accessories: ['earring'],
  },
}
