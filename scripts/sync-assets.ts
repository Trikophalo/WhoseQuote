#!/usr/bin/env tsx
/**
 * Bild-Sync für reale Personen: Wikidata (P18) → Wikimedia Commons → lokale Datei
 * plus geprüften Lizenznachweis in content/media.json.
 *
 * Warum zur Build-Zeit und nicht im Browser (docs/01-architektur.md):
 *  - Hotlinking auf fremde CDNs koppelt die Verfügbarkeit des Spiels an sie,
 *  - und nur so lässt sich pro Bild ein versionierter Lizenznachweis führen.
 *
 * Es werden ausschließlich freie Lizenzen übernommen. Bilder ohne passende
 * Lizenz werden übersprungen, nie „vorsichtshalber“ mitgenommen. Jeder neue
 * Eintrag wird mit `cleared: false` angelegt — er wird erst ausgeliefert, wenn
 * ein Mensch ihn geprüft und freigegeben hat (Regel V7).
 *
 * Voraussetzung: In content/persons.json muss `wikidata_qid` gesetzt sein.
 * Die IDs werden in der redaktionellen Verifikationsrunde nachgetragen.
 *
 * Aufruf: npm run sync-assets [-- --dry-run]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MediaAsset, Person } from '../src/content/schema.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ASSET_DIR = resolve(root, 'public/assets/persons')
const DRY_RUN = process.argv.includes('--dry-run')
const UA = 'WhoseQuote/0.1 (Zitate-Quiz; Kontakt siehe Impressum)'

/** Lizenz-Whitelist (Regel V7). Alles andere wird verworfen. */
const LICENSE_MAP: { pattern: RegExp; license: MediaAsset['license']; version: string | null }[] = [
  { pattern: /^cc0/i, license: 'CC0', version: '1.0' },
  { pattern: /public\s*domain|^pd(-|$)/i, license: 'PD', version: null },
  { pattern: /^cc[ -]by[ -]sa[ -]?([\d.]+)?/i, license: 'CC-BY-SA', version: null },
  { pattern: /^cc[ -]by[ -]?([\d.]+)?/i, license: 'CC-BY', version: null },
]

function classifyLicense(shortName: string): { license: MediaAsset['license']; version: string | null } | null {
  for (const entry of LICENSE_MAP) {
    if (entry.pattern.test(shortName.trim())) {
      const version = shortName.match(/([\d]+\.[\d]+)/)?.[1] ?? entry.version
      return { license: entry.license, version }
    }
  }
  return null
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!response.ok) throw new Error(`HTTP ${response.status} für ${url}`)
  return response.json()
}

/** Dateiname des Bildes (Property P18) zu einer Wikidata-Entität. */
async function imageNameForQid(qid: string): Promise<string | null> {
  const data = (await fetchJson(
    `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&property=P18&format=json`,
  )) as { claims?: { P18?: { mainsnak?: { datavalue?: { value?: string } } }[] } }
  return data.claims?.P18?.[0]?.mainsnak?.datavalue?.value ?? null
}

type CommonsInfo = { url: string; descriptionUrl: string; licenseShortName: string; artist: string | null }

async function commonsInfo(fileName: string): Promise<CommonsInfo | null> {
  const title = encodeURIComponent(`File:${fileName}`)
  const data = (await fetchJson(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${title}&prop=imageinfo&iiprop=url|extmetadata`,
  )) as {
    query?: {
      pages?: Record<
        string,
        {
          imageinfo?: {
            url: string
            descriptionurl: string
            extmetadata?: Record<string, { value?: string }>
          }[]
        }
      >
    }
  }

  const page = Object.values(data.query?.pages ?? {})[0]
  const info = page?.imageinfo?.[0]
  if (!info) return null

  const meta = info.extmetadata ?? {}
  return {
    url: info.url,
    descriptionUrl: info.descriptionurl,
    licenseShortName: stripHtml(meta.LicenseShortName?.value ?? ''),
    artist: meta.Artist?.value ? stripHtml(meta.Artist.value) : null,
  }
}

async function main() {
  const persons = JSON.parse(readFileSync(resolve(root, 'content/persons.json'), 'utf8')) as Person[]
  const media = JSON.parse(readFileSync(resolve(root, 'content/media.json'), 'utf8')) as MediaAsset[]
  const mediaById = new Map(media.map((m) => [m.id, m]))

  const withQid = persons.filter((p) => p.wikidata_qid)
  console.log(`\n🖼  Bild-Sync für ${withQid.length} von ${persons.length} Personen mit Wikidata-ID\n`)

  if (withQid.length === 0) {
    console.log('   Keine wikidata_qid gesetzt — nichts zu tun.')
    console.log('   Die IDs werden in der redaktionellen Verifikationsrunde nachgetragen')
    console.log('   (siehe docs/03-content-pipeline.md).\n')
    return
  }

  if (!DRY_RUN && !existsSync(ASSET_DIR)) mkdirSync(ASSET_DIR, { recursive: true })

  let added = 0
  let skipped = 0

  for (const person of withQid) {
    const mediaId = `photo-${person.id}`
    if (mediaById.has(mediaId)) {
      console.log(`   ⏭  ${person.name}: bereits erfasst`)
      continue
    }

    try {
      const fileName = await imageNameForQid(person.wikidata_qid!)
      if (!fileName) {
        console.log(`   ⏭  ${person.name}: kein Bild (P18) hinterlegt`)
        skipped++
        continue
      }

      const info = await commonsInfo(fileName)
      if (!info) {
        console.log(`   ⏭  ${person.name}: Datei auf Commons nicht gefunden`)
        skipped++
        continue
      }

      const classified = classifyLicense(info.licenseShortName)
      if (!classified) {
        // Bewusst kein Fallback: unklare Lizenz heißt kein Bild.
        console.log(`   ⛔ ${person.name}: Lizenz „${info.licenseShortName}“ nicht in der Whitelist — übersprungen`)
        skipped++
        continue
      }

      const extension = fileName.split('.').pop()?.toLowerCase() ?? 'jpg'
      const storagePath = `public/assets/persons/${person.id}.${extension}`

      if (!DRY_RUN) {
        const image = await fetch(info.url, { headers: { 'User-Agent': UA } })
        if (!image.ok) throw new Error(`Bild-Download fehlgeschlagen: HTTP ${image.status}`)
        writeFileSync(resolve(root, storagePath), Buffer.from(await image.arrayBuffer()))
      }

      const needsAttribution = classified.license === 'CC-BY' || classified.license === 'CC-BY-SA'
      const licenseLink =
        classified.license === 'CC-BY-SA'
          ? `https://creativecommons.org/licenses/by-sa/${classified.version ?? '4.0'}/`
          : `https://creativecommons.org/licenses/by/${classified.version ?? '4.0'}/`

      const asset: MediaAsset = {
        id: mediaId,
        kind: 'commons-photo',
        storage_path: storagePath,
        source_url: info.descriptionUrl,
        license: classified.license,
        license_version: classified.version,
        author: info.artist,
        attribution_html: needsAttribution
          ? `Foto: ${info.artist ?? 'unbekannt'}, <a href="${licenseLink}">${info.licenseShortName}</a>, via Wikimedia Commons`
          : `Foto: ${info.artist ?? 'unbekannt'}, ${info.licenseShortName}, via Wikimedia Commons`,
        modifications: null,
        // Menschliche Freigabe steht noch aus — bis dahin greift der Avatar-Fallback.
        cleared: false,
      }

      media.push(asset)
      added++
      console.log(`   ✓  ${person.name}: ${classified.license}${classified.version ? ` ${classified.version}` : ''} — zur Prüfung vorgemerkt`)
    } catch (error) {
      console.log(`   ⚠  ${person.name}: ${(error as Error).message}`)
      skipped++
    }

    // Wikimedia-Etikette: nicht hämmern.
    await new Promise((r) => setTimeout(r, 350))
  }

  if (!DRY_RUN && added > 0) {
    writeFileSync(resolve(root, 'content/media.json'), JSON.stringify(media, null, 2) + '\n')
  }

  console.log(`\n   ${added} neu erfasst, ${skipped} übersprungen.`)
  if (added > 0) {
    console.log('   Nächster Schritt: Einträge in content/media.json prüfen, Zuschnitt vermerken')
    console.log('   und cleared auf true setzen. Erst dann werden die Bilder ausgeliefert.')
  }
  if (DRY_RUN) console.log('   (Testlauf — es wurde nichts geschrieben.)')
  console.log('')
}

main().catch((error) => {
  console.error('\n❌ Sync fehlgeschlagen:', (error as Error).message, '\n')
  process.exit(1)
})
