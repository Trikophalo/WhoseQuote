/**
 * Zentrale Platzhalter für den Betrieb.
 *
 * ACHTUNG: Vor dem öffentlichen Launch müssen alle Werte mit TODO ersetzt
 * werden — das Impressum ist nach § 5 DDG Pflicht, sobald das Spiel öffentlich
 * erreichbar ist (siehe docs/04-recht.md, 4.6).
 */
export const SITE = {
  name: "Wer hat's gesagt?",
  tagline: 'Anime oder Realität?',
  /** TODO vor Launch: echte Kontaktadresse eintragen. */
  contactEmail: 'TODO@example.org',
  /** TODO vor Launch: ladungsfähige Anschrift (§ 5 DDG). */
  operatorName: 'TODO — Name des Betreibers',
  operatorAddress: ['TODO — Straße und Hausnummer', 'TODO — PLZ und Ort', 'Deutschland'],
  /** TODO vor Launch: Verantwortlicher i.S.d. § 18 Abs. 2 MStV. */
  responsibleForContent: 'TODO — Name, Anschrift',
  hostingProvider: 'TODO — Hosting-Anbieter (z. B. Cloudflare Pages)',
  /** Beta-Kennzeichnung, solange die menschliche Quellenprüfung läuft. */
  isBeta: true,
} as const

/** Ist das Impressum vollständig ausgefüllt? Steuert den Launch-Blocker-Hinweis. */
export const hasOperatorData = !SITE.operatorName.startsWith('TODO')
