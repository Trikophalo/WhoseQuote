#!/usr/bin/env node
/**
 * Löst die Profilbilder VOR dem Build fest auf und schreibt sie als Manifest
 * nach public/photos.json — der Client muss dann nicht mehr suchen.
 *
 * Läuft im Deploy-Workflow auf GitHub Actions (dort gibt es Internetzugang;
 * die Entwicklungs-Sandbox erreicht Jikan/Wikipedia nicht). Quellen:
 *
 *  - Anime-Figuren: Jikan-Suche (MyAnimeList) über den Romaji-search_name,
 *    nach Beliebtheit sortiert — die Auswahl wird geloggt und ist so im
 *    Workflow-Log nachprüfbar.
 *  - Reale Personen: Artikelbild der deutschen Wikipedia (nur freie Lizenzen)
 *    plus Urheber/Lizenz von Wikimedia Commons.
 *
 * Der Client nutzt das Manifest zuerst; für Einträge, die hier nicht
 * aufgelöst werden konnten, bleibt die Laufzeit-Suche im Browser als zweite
 * Stufe und die Federzeichnung als letzte. Deshalb: Dieses Skript bricht den
 * Build NIE ab — es liefert so viel wie möglich und meldet den Rest.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'public/photos.json')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const stripHtml = (v) => String(v ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

async function fetchJson(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'WhoseQuote-Build/0.1 (Zitate-Quiz; Bildmanifest)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function resolveCharacter(searchName) {
  const url = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(searchName)}&order_by=favorites&sort=desc&limit=10`
  const data = await fetchJson(url)
  const candidates = (data.data ?? []).filter((c) => {
    const img = c.images?.jpg?.image_url ?? ''
    return img && !img.includes('questionmark') && !img.includes('icon-')
  })
  if (candidates.length === 0) return null

  const tokens = searchName.toLowerCase().split(/\s+/)
  const exact = candidates.find((c) => {
    const name = (c.name ?? '').toLowerCase()
    return tokens.every((t) => name.includes(t))
  })
  const pick = exact ?? candidates[0]
  return {
    src: pick.images.jpg.image_url,
    name: pick.name ?? searchName,
    pageUrl: pick.url ?? 'https://myanimelist.net',
    sourceLabel: 'MyAnimeList',
    artist: null,
    license: null,
    licenseUrl: null,
    ts: 0,
    matched: Boolean(exact),
  }
}

async function resolvePerson(wikiTitle) {
  const queryUrl =
    'https://de.wikipedia.org/w/api.php?action=query&format=json&redirects=1' +
    `&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=640&titles=${encodeURIComponent(wikiTitle)}`
  const data = await fetchJson(queryUrl)
  const page = Object.values(data.query?.pages ?? {}).find((p) => p.thumbnail?.source)
  if (!page?.thumbnail?.source) return null

  const credit = {
    src: page.thumbnail.source,
    name: page.title ?? wikiTitle,
    pageUrl: page.pageimage
      ? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(page.pageimage)}`
      : `https://de.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}`,
    sourceLabel: 'Wikimedia Commons',
    artist: null,
    license: null,
    licenseUrl: null,
    ts: 0,
  }

  if (page.pageimage) {
    try {
      const metaUrl =
        'https://commons.wikimedia.org/w/api.php?action=query&format=json' +
        `&titles=File:${encodeURIComponent(page.pageimage)}&prop=imageinfo&iiprop=extmetadata` +
        '&iiextmetadatafilter=Artist%7CLicenseShortName%7CLicenseUrl'
      const meta = await fetchJson(metaUrl)
      const info = Object.values(meta.query?.pages ?? {})[0]?.imageinfo?.[0]?.extmetadata
      if (info) {
        credit.artist = info.Artist?.value ? stripHtml(info.Artist.value).slice(0, 80) : null
        credit.license = info.LicenseShortName?.value ? stripHtml(info.LicenseShortName.value) : null
        credit.licenseUrl = info.LicenseUrl?.value ?? null
      }
    } catch {
      // Ohne Metadaten bleibt der Link zur Dateiseite als Nachweis.
    }
  }
  return credit
}

const characters = JSON.parse(readFileSync(resolve(root, 'content/characters.json'), 'utf8'))
const persons = JSON.parse(readFileSync(resolve(root, 'content/persons.json'), 'utf8'))

const manifest = {}
let okChars = 0
let okPersons = 0
const missing = []

console.log(`\n🖼  Bildmanifest: ${characters.length} Figuren (Jikan), ${persons.length} Personen (Wikipedia)\n`)

for (const character of characters) {
  if (!character.search_name) continue
  try {
    const credit = await resolveCharacter(character.search_name)
    if (credit) {
      const { matched, ...entry } = credit
      manifest[character.id] = entry
      okChars++
      console.log(`   ✓ ${character.id} → „${entry.name}“${matched ? '' : ' (bester Treffer, Name weicht ab — prüfen!)'}`)
    } else {
      missing.push(character.id)
      console.log(`   ✗ ${character.id}: kein brauchbares Bild gefunden`)
    }
  } catch (error) {
    missing.push(character.id)
    console.log(`   ⚠ ${character.id}: ${error.message}`)
  }
  // Jikan erlaubt 3 Anfragen/Sekunde — großzügig drosseln.
  await sleep(700)
}

for (const person of persons) {
  if (!person.wiki_title) continue
  try {
    const credit = await resolvePerson(person.wiki_title)
    if (credit) {
      manifest[person.id] = credit
      okPersons++
      console.log(`   ✓ ${person.id} → ${credit.license ?? 'Lizenz siehe Dateiseite'}`)
    } else {
      missing.push(person.id)
      console.log(`   ✗ ${person.id}: Artikel ohne Bild`)
    }
  } catch (error) {
    missing.push(person.id)
    console.log(`   ⚠ ${person.id}: ${error.message}`)
  }
  await sleep(200)
}

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n')
console.log(`\n   ${okChars}/${characters.length} Figuren, ${okPersons}/${persons.length} Personen aufgelöst → public/photos.json`)
if (missing.length > 0) {
  console.log(`   Ohne Manifest-Eintrag (Laufzeit-Suche + Zeichnung greifen): ${missing.join(', ')}`)
}
console.log('')
// Bewusst immer Erfolg: Ein leeres/teilweises Manifest ist kein Deploy-Blocker.
process.exit(0)
