import type { SourceType } from './schema'

/**
 * Kennzeichnungssystem aus docs/04-recht.md, 4.2.
 *
 * Diese Texte sind kein Beiwerk: Sie sind die sichtbare Umsetzung der
 * rechtlichen Leitplanke, dass im Spiel nie der Eindruck einer
 * Tatsachenbehauptung entsteht. Änderungen hier bitte nur zusammen mit
 * docs/04-recht.md.
 */
export const SOURCE_LABELS: Record<SourceType, { badge: string; tooltip: string; tone: 'solid' | 'soft' | 'loose' }> = {
  verified: {
    badge: 'Belegt',
    tooltip: 'Diese Aussage ist in der angegebenen Quelle wörtlich dokumentiert.',
    tone: 'solid',
  },
  translated: {
    badge: 'Belegt · übersetzt',
    tooltip:
      'Diese Aussage ist belegt, wurde aber übersetzt. Übersetzungen geben den Sinn wieder — die Formulierung kann vom Original abweichen.',
    tone: 'solid',
  },
  paraphrased: {
    badge: 'Sinngemäß',
    tooltip: 'Diese Aussage ist sinngemäß überliefert. Der genaue Wortlaut ist nicht gesichert.',
    tone: 'soft',
  },
  attributed: {
    badge: 'Zugeschrieben',
    tooltip:
      'Diese Aussage wird der Person häufig zugeschrieben, ein gesicherter Beleg fehlt. Sie ist hier Teil eines Ratespiels — keine Tatsachenbehauptung.',
    tone: 'loose',
  },
  fictional: {
    badge: 'Fiktion',
    tooltip: 'Diese Zeile stammt aus einem fiktionalen Werk.',
    tone: 'soft',
  },
}

/**
 * Kurz-Disclaimer für den Footer (docs/04-recht.md, 4.3). Die ausführliche
 * Fassung steht in der FAQ — hier bewusst knapp, damit sie auf jeder Runde
 * mitläuft, ohne das Spielfeld zu erdrücken.
 */
export const FOOTER_DISCLAIMER =
  'Unterhaltungs-Quiz. Zitate sind nach Belegbarkeit gekennzeichnet, Übersetzungen können vom Original abweichen. Die Gegenüberstellung ist Spielmechanik und stellt keinen Vergleich und keine Bewertung dar.'
