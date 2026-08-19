import { useEffect, useState } from 'react'
import { SITE } from '../config'
import { characterById, personById, type Side } from '../content'

/**
 * Laufzeit-Abruf echter Bilder aus öffentlichen Quellen — Betreiber-Entscheidung
 * vom 19.08.2026 (docs/04-recht.md, 4.5):
 *
 *  - Anime-Charaktere: MyAnimeList über die Jikan-API (Suche per Romaji-Name).
 *  - Reale Personen: Artikelbild der deutschen Wikipedia (dort sind nur frei
 *    lizenzierte Bilder zulässig), Lizenz-Metadaten von Wikimedia Commons.
 *
 * Die Bilder werden im Browser der Spielenden direkt von den Quell-Servern
 * geladen (siehe Datenschutzerklärung). Die gezeichneten Porträts bleiben als
 * sofort sichtbare Ebene darunter — es gibt also in jeder Runde ein Bild,
 * auch wenn eine Quelle nicht erreichbar ist.
 *
 * `SITE.useRealImages` ist der Kill-Switch: auf false stellen, und das Spiel
 * zeigt ausschließlich die eigenen Zeichnungen (z. B. nach einer Beanstandung).
 */

export type PhotoCredit = {
  src: string
  /** Name laut Quelle — Kontrolle, ob die Suche das Richtige fand. */
  name: string
  /** Seite bei der Quelle (MAL-Charakterseite bzw. Commons-Dateiseite). */
  pageUrl: string
  sourceLabel: 'MyAnimeList' | 'Wikimedia Commons'
  artist: string | null
  license: string | null
  licenseUrl: string | null
  ts: number
}

const CACHE_PREFIX = 'wq.photo.'
const MISS_PREFIX = 'wq.photomiss.'
const CACHE_TTL = 7 * 24 * 3600 * 1000
const MISS_TTL = 3600 * 1000

function readStore<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Voller/gesperrter Speicher — dann eben ohne Cache.
  }
}

/** Synchroner Cache-Zugriff — für die Auflösung und die Bildnachweis-Seite. */
export function getCachedPhoto(sideId: string): PhotoCredit | null {
  if (!SITE.useRealImages) return null
  const hit = readStore<PhotoCredit>(CACHE_PREFIX + sideId)
  if (!hit) return null
  return Date.now() - hit.ts < CACHE_TTL ? hit : null
}

/** Alle bisher geladenen Bilder — für die generierte Bildnachweis-Liste. */
export function listCachedPhotos(): { id: string; credit: PhotoCredit }[] {
  const out: { id: string; credit: PhotoCredit }[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(CACHE_PREFIX)) continue
      const credit = readStore<PhotoCredit>(key)
      if (credit) out.push({ id: key.slice(CACHE_PREFIX.length), credit })
    }
  } catch {
    // Speicherzugriff verweigert — leere Liste.
  }
  return out.sort((a, b) => a.credit.name.localeCompare(b.credit.name))
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

/** Jikan erlaubt 3 Anfragen/Sekunde — wir schicken sie brav nacheinander. */
let jikanChain: Promise<unknown> = Promise.resolve()
function queueJikan<T>(task: () => Promise<T>): Promise<T> {
  const next = jikanChain.then(() => new Promise((r) => setTimeout(r, 450))).then(task)
  jikanChain = next.catch(() => {})
  return next
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

type JikanCharacter = {
  name?: string
  url?: string
  favorites?: number
  images?: { jpg?: { image_url?: string } }
}

async function loadCharacterPhoto(searchName: string): Promise<PhotoCredit | null> {
  const url = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(searchName)}&order_by=favorites&sort=desc&limit=10`
  const data = (await queueJikan(() => fetchJson(url))) as { data?: JikanCharacter[] }
  const candidates = (data.data ?? []).filter((c) => {
    const img = c.images?.jpg?.image_url ?? ''
    return img && !img.includes('questionmark') && !img.includes('icon-')
  })
  if (candidates.length === 0) return null

  // Bevorzugt den Treffer, dessen Name alle Suchwörter enthält — bei sehr
  // generischen Namen („Brook“) entscheidet sonst die Beliebtheit, und die
  // One-Piece-Figuren führen diese Sortierung ohnehin an.
  const tokens = searchName.toLowerCase().split(/\s+/)
  const exact = candidates.find((c) => {
    const name = (c.name ?? '').toLowerCase()
    return tokens.every((t) => name.includes(t))
  })
  const pick = exact ?? candidates[0]

  return {
    src: pick.images!.jpg!.image_url!,
    name: pick.name ?? searchName,
    pageUrl: pick.url ?? 'https://myanimelist.net',
    sourceLabel: 'MyAnimeList',
    artist: null,
    license: null,
    licenseUrl: null,
    ts: Date.now(),
  }
}

async function loadPersonPhoto(wikiTitle: string): Promise<PhotoCredit | null> {
  // Schritt 1: Artikelbild der deutschen Wikipedia (folgt Weiterleitungen).
  const queryUrl =
    'https://de.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1' +
    `&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=640&titles=${encodeURIComponent(wikiTitle)}`
  const data = (await fetchJson(queryUrl)) as {
    query?: { pages?: Record<string, { title?: string; thumbnail?: { source?: string }; pageimage?: string }> }
  }
  const page = Object.values(data.query?.pages ?? {}).find((p) => p.thumbnail?.source)
  if (!page?.thumbnail?.source) return null

  const credit: PhotoCredit = {
    src: page.thumbnail.source,
    name: page.title ?? wikiTitle,
    pageUrl: page.pageimage
      ? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(page.pageimage)}`
      : `https://de.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}`,
    sourceLabel: 'Wikimedia Commons',
    artist: null,
    license: null,
    licenseUrl: null,
    ts: Date.now(),
  }

  // Schritt 2 (best effort): Urheber und Lizenz von Commons für den Bildnachweis.
  if (page.pageimage) {
    try {
      const metaUrl =
        'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
        `&titles=File:${encodeURIComponent(page.pageimage)}&prop=imageinfo&iiprop=extmetadata` +
        '&iiextmetadatafilter=Artist%7CLicenseShortName%7CLicenseUrl'
      const meta = (await fetchJson(metaUrl)) as {
        query?: { pages?: Record<string, { imageinfo?: { extmetadata?: Record<string, { value?: string }> }[] }> }
      }
      const info = Object.values(meta.query?.pages ?? {})[0]?.imageinfo?.[0]?.extmetadata
      if (info) {
        credit.artist = info.Artist?.value ? stripHtml(info.Artist.value).slice(0, 80) : null
        credit.license = info.LicenseShortName?.value ? stripHtml(info.LicenseShortName.value) : null
        credit.licenseUrl = info.LicenseUrl?.value ?? null
      }
    } catch {
      // Ohne Metadaten bleibt der generische Nachweis mit Link zur Dateiseite.
    }
  }

  return credit
}

/** Lädt das Bild einer Spielseite; Ergebnisse (auch Fehlschläge) werden gecacht. */
export async function loadPhoto(side: Pick<Side, 'kind' | 'id'>): Promise<PhotoCredit | null> {
  if (!SITE.useRealImages) return null

  const cached = getCachedPhoto(side.id)
  if (cached) return cached
  const miss = readStore<number>(MISS_PREFIX + side.id)
  if (miss && Date.now() - miss < MISS_TTL) return null

  try {
    let credit: PhotoCredit | null = null
    if (side.kind === 'character') {
      const searchName = characterById.get(side.id)?.search_name
      if (searchName) credit = await loadCharacterPhoto(searchName)
    } else {
      const wikiTitle = personById.get(side.id)?.wiki_title
      if (wikiTitle) credit = await loadPersonPhoto(wikiTitle)
    }

    if (credit) writeStore(CACHE_PREFIX + side.id, credit)
    else writeStore(MISS_PREFIX + side.id, Date.now())
    return credit
  } catch {
    writeStore(MISS_PREFIX + side.id, Date.now())
    return null
  }
}

/** React-Hook: liefert sofort den Cache-Stand und lädt bei Bedarf nach. */
export function usePhoto(side: Pick<Side, 'kind' | 'id'>): PhotoCredit | null {
  const [photo, setPhoto] = useState<PhotoCredit | null>(() => getCachedPhoto(side.id))

  useEffect(() => {
    let alive = true
    setPhoto(getCachedPhoto(side.id))
    if (SITE.useRealImages) {
      loadPhoto(side).then((credit) => {
        if (alive && credit) setPhoto(credit)
      })
    }
    return () => {
      alive = false
    }
    // side.kind ändert sich nie ohne id-Wechsel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side.id])

  return photo
}
