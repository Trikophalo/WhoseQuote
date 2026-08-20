#!/usr/bin/env node
/**
 * Löst die Profilbilder VOR dem Build fest auf und schreibt sie als Manifest
 * nach public/photos.json — der Client muss dann nicht mehr suchen.
 *
 * Läuft im Deploy-Workflow auf GitHub Actions (dort gibt es Internetzugang;
 * die Entwicklungs-Sandbox erreicht AniList/Wikipedia nicht). Quellen:
 *
 *  - Anime-Figuren: zuerst die komplette Charakterliste des Werks von AniList
 *    (per MAL-Media-ID) — dort MUSS jede Figur auftauchen, und ein
 *    serienfremder Treffer ist unmöglich. Erst danach Einzelsuche auf AniList
 *    und Jikan (MyAnimeList) als Ausweichquellen. Jede Auswahl wird geloggt
 *    und ist so im Workflow-Log nachprüfbar.
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
// Zeitbudget: lieber ein Teil-Manifest ausliefern als den Deploy zu blockieren.
// Fehlende Einträge holt der nächste (auch der tägliche) Lauf nach.
const DEADLINE = Date.now() + Number(process.env.RESOLVE_BUDGET_MS ?? 8 * 60 * 1000)
const outOfTime = () => Date.now() > DEADLINE
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const stripHtml = (v) => String(v ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

async function fetchJson(url, attempts = 4) {
  // Jikan antwortet von Cloud-IPs oft mit sporadischen 504ern, Wikimedia
  // drosselt sie mit 429 — beides ist mit Geduld überwindbar.
  const backoff = [2000, 5000, 12000]
  let lastError
  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'WhoseQuote-Build/0.1 (Zitate-Quiz; Bildmanifest; Kontakt siehe Repo)' },
      })
      if (res.ok) return await res.json()
      lastError = new Error(`HTTP ${res.status}`)
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after')) * 1000
        await sleep(Math.max(retryAfter || 0, backoff[Math.min(attempt, backoff.length - 1)]))
      } else if (res.status >= 500) {
        await sleep(backoff[Math.min(attempt, backoff.length - 1)])
      } else {
        throw lastError
      }
    } catch (error) {
      lastError = error
      await sleep(backoff[Math.min(attempt, backoff.length - 1)])
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError
}

async function fetchGraphql(url, body, attempts = 3) {
  const backoff = [2000, 5000]
  let lastError
  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'WhoseQuote-Build/0.1 (Zitate-Quiz; Bildmanifest; Kontakt siehe Repo)',
        },
        body: JSON.stringify(body),
      })
      if (res.ok) return await res.json()
      lastError = new Error(`HTTP ${res.status}`)
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after')) * 1000
        await sleep(Math.max(retryAfter || 0, backoff[Math.min(attempt, backoff.length - 1)]))
      } else if (res.status >= 500) {
        await sleep(backoff[Math.min(attempt, backoff.length - 1)])
      } else {
        throw lastError
      }
    } catch (error) {
      lastError = error
      await sleep(backoff[Math.min(attempt, backoff.length - 1)])
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError
}

// Kleinschreibung, Akzente weg (Bellemère → bellemere), an Nicht-Wortzeichen trennen.
const words = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)

/**
 * Lädt die komplette Charakterliste eines Werks von AniList (per MAL-Media-ID).
 *
 * Warum: Die Einzelsuche scheiterte für einzelne Namen (Sanji, Roger, Garp)
 * in zwei Läufen deterministisch. Gegen die Werksliste gematcht kann kein
 * Charakter mehr an einer kaputten Suche hängen — und ein serienfremder
 * Treffer ist konstruktionsbedingt unmöglich.
 */
async function fetchRoster(idMal) {
  const roster = []
  for (let page = 1; page <= 30; page++) {
    const data = await fetchGraphql('https://graphql.anilist.co', {
      query:
        'query($idMal:Int,$page:Int){Media(idMal:$idMal,type:ANIME){characters(page:$page,perPage:25,sort:FAVOURITES_DESC){pageInfo{hasNextPage}nodes{name{full alternative}image{large}siteUrl favourites}}}}',
      variables: { idMal, page },
    })
    const block = data.data?.Media?.characters
    roster.push(...(block?.nodes ?? []).filter((n) => n.image?.large))
    if (!block?.pageInfo?.hasNextPage) break
    await sleep(2200)
  }
  return roster
}

/** Matcht einen Suchnamen gegen die Werksliste (Ganzwort, inkl. Alternativnamen). */
function pickFromRoster(roster, searchName) {
  const queryTokens = words(searchName).filter((t) => t.length > 2)
  if (queryTokens.length === 0) return null
  const nameWordSets = (node) => {
    const names = [node.name?.full, ...(node.name?.alternative ?? [])]
    return names.filter(Boolean).map((n) => new Set(words(n)))
  }
  // Stufe 1: alle Suchwörter kommen in einem der Namen vor.
  let hit = roster.find((node) => nameWordSets(node).some((set) => queryTokens.every((t) => set.has(t))))
  if (hit) return { node: hit, matched: true }
  // Stufe 2: nur der Rufname zählt — das LETZTE Suchwort („Monkey D. Garp“ →
  // „garp“, „Vinsmoke Sanji“ → „sanji“). Ein Familienname allein darf nie
  // entscheiden: Über „monkey“ bekäme Garp sonst das Gesicht des
  // beliebtesten Namensvetters — Ruffy. Genau das ist im ersten
  // Werkslisten-Lauf passiert.
  const givenName = queryTokens[queryTokens.length - 1]
  hit = roster.find((node) => nameWordSets(node).some((set) => set.has(givenName)))
  return hit ? { node: hit, matched: false } : null
}

/**
 * Primärquelle: AniList — stabil auch von Cloud-IPs, wo Jikan mit 504 abweist.
 *
 * Zwei Lehren aus dem ersten Lauf sind hier eingebaut:
 *  - Der Treffer MUSS aus der erwarteten Serie stammen (media-Titel), sonst
 *    gewinnt der beliebteste Namensvetter einer anderen Serie („Nami“ →
 *    Kento Nanami). Lieber kein Bild als das falsche Gesicht.
 *  - Namens-Vergleich auf Ganzwort-Basis — „Enel“ steckt sonst als Teilwort
 *    in „Penelope“.
 */
async function resolveCharacterAniList(searchName, franchise) {
  const data = await fetchGraphql('https://graphql.anilist.co', {
    query:
      'query($search:String){Page(perPage:10){characters(search:$search,sort:FAVOURITES_DESC){name{full}image{large}siteUrl favourites media(perPage:4){nodes{title{romaji english}}}}}}',
    variables: { search: searchName },
  })
  const want = franchise.toLowerCase()
  const candidates = (data.data?.Page?.characters ?? [])
    .filter((c) => c.image?.large)
    .filter((c) =>
      (c.media?.nodes ?? []).some((node) => {
        const title = `${node.title?.romaji ?? ''} ${node.title?.english ?? ''}`.toLowerCase()
        return title.includes(want)
      }),
    )
  if (candidates.length === 0) return null

  const queryTokens = words(searchName).filter((t) => t.length > 2)
  const exact = candidates.find((c) => {
    const nameWords = new Set(words(c.name?.full))
    return queryTokens.every((t) => nameWords.has(t))
  })
  const pick = exact ?? candidates[0]
  return {
    src: pick.image.large,
    name: pick.name?.full ?? searchName,
    pageUrl: pick.siteUrl ?? 'https://anilist.co',
    sourceLabel: 'AniList',
    artist: null,
    license: null,
    licenseUrl: null,
    ts: 0,
    v: 3,
    matched: Boolean(exact),
  }
}

async function resolveCharacterJikan(searchName) {
  // Bewusst ohne order_by: sortierte Jikan-Suchen provozieren 504er.
  // Nach Beliebtheit sortieren wir selbst.
  const url = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(searchName)}&limit=15`
  const data = await fetchJson(url)
  const candidates = (data.data ?? [])
    .slice()
    .sort((a, b) => (b.favorites ?? 0) - (a.favorites ?? 0))
    .filter((c) => {
    const img = c.images?.jpg?.image_url ?? ''
    return img && !img.includes('questionmark') && !img.includes('icon-')
  })
  if (candidates.length === 0) return null

  const queryTokens = words(searchName).filter((t) => t.length > 2)
  const exact = candidates.find((c) => {
    const nameWords = new Set(words(c.name))
    return queryTokens.every((t) => nameWords.has(t))
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

// Basis: das zuletzt veröffentlichte Manifest. So konvergiert die Bildliste
// über Deploys hinweg — ein schlechter API-Tag wirft keine Treffer weg.
let manifest = {}
const repoSlug = process.env.GITHUB_REPOSITORY ?? ''
if (repoSlug.includes('/')) {
  const [owner, repo] = repoSlug.split('/')
  const liveUrl = `https://${owner.toLowerCase()}.github.io/${repo}/photos.json`
  try {
    const previous = await fetchJson(liveUrl, 2)
    if (previous && typeof previous === 'object') {
      manifest = previous
      console.log(`   Basis: ${Object.keys(manifest).length} Einträge aus dem letzten Deploy (${liveUrl})`)
    }
  } catch {
    console.log('   Kein vorheriges Manifest erreichbar — starte leer.')
  }
}
let okChars = 0
let okPersons = 0
const missing = []

console.log(`\n🖼  Bildmanifest: ${characters.length} Figuren (Jikan), ${persons.length} Personen (Wikipedia)\n`)

for (const person of persons) {
  if (!person.wiki_title) continue
  if (manifest[person.id]?.src) {
    okPersons++
    continue
  }
  if (outOfTime()) {
    missing.push(person.id)
    continue
  }
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
  await sleep(700)
}

const universes = JSON.parse(readFileSync(resolve(root, 'content/universes.json'), 'utf8'))
const universeName = new Map(universes.map((u) => [u.id, u.name]))

// Werkslisten einmal pro Universum laden (One Piece: MAL-ID 21).
const rosters = new Map()
for (const universe of universes) {
  if (universe.status !== 'active' || !universe.mal_id) continue
  if (characters.every((c) => c.universe_id !== universe.id || (manifest[c.id]?.src && manifest[c.id]?.v >= 3))) continue
  try {
    const roster = await fetchRoster(universe.mal_id)
    rosters.set(universe.id, roster)
    console.log(`   Werksliste ${universe.name}: ${roster.length} Charaktere von AniList`)
  } catch (error) {
    console.log(`   ⚠ Werksliste ${universe.name}: ${error.message} — falle auf Einzelsuche zurück`)
  }
}

for (const character of characters) {
  if (!character.search_name) continue
  // v3-Eintraege sind rufnamen-verifiziert; alles Aeltere wird neu aufgeloest,
  // damit die Fehlgriffe frueherer Laeufe aus dem Manifest verschwinden
  // (v2 hatte Garp das Gesicht von Ruffy gegeben).
  if (manifest[character.id]?.src && manifest[character.id]?.v >= 3) {
    okChars++
    continue
  }
  if (outOfTime()) {
    missing.push(character.id)
    continue
  }
  try {
    const franchise = universeName.get(character.universe_id) ?? 'One Piece'
    let credit = null

    // Stufe 1: Werksliste — garantiert seriengetreu, keine Suche nötig.
    const roster = rosters.get(character.universe_id)
    if (roster) {
      const found = pickFromRoster(roster, character.search_name)
      if (found) {
        credit = {
          src: found.node.image.large,
          name: found.node.name?.full ?? character.search_name,
          pageUrl: found.node.siteUrl ?? 'https://anilist.co',
          sourceLabel: 'AniList',
          artist: null,
          license: null,
          licenseUrl: null,
          ts: 0,
          v: 3,
          matched: found.matched,
        }
      }
    }

    // Stufe 2/3: Einzelsuche AniList, dann Jikan.
    if (!credit) credit = await resolveCharacterAniList(character.search_name, franchise).catch(() => null)
    if (!credit) credit = await resolveCharacterJikan(character.search_name)
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
  // Kurze Pause nur der Höflichkeit halber — Roster-Treffer machen keine Anfrage.
  await sleep(150)
}

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n')
console.log(`\n   ${okChars}/${characters.length} Figuren, ${okPersons}/${persons.length} Personen aufgelöst → public/photos.json`)
if (missing.length > 0) {
  console.log(`   Ohne Manifest-Eintrag (Laufzeit-Suche + Zeichnung greifen): ${missing.join(', ')}`)
}
console.log('')
// Bewusst immer Erfolg: Ein leeres/teilweises Manifest ist kein Deploy-Blocker.
process.exit(0)
