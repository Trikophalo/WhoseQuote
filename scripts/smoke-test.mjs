#!/usr/bin/env node
/**
 * End-to-End-Rauchtest: startet den Preview-Server, spielt das Spiel durch und
 * prüft die Punkte, die nicht kaputtgehen dürfen — allen voran die rechtlichen:
 *
 *  - Die Kennzeichnung darf während der Rate-Phase NICHT sichtbar sein
 *    (sonst verrät „Zugeschrieben" sofort, dass es eine reale Person ist).
 *  - Die Auflösung MUSS Kennzeichnung, Fundstelle und Meldeweg zeigen.
 *  - Alle Pflichtseiten müssen erreichbar sein.
 *
 * Aufruf: npm run test:e2e
 * Voraussetzung: npx playwright install chromium (einmalig)
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const PORT = Number(process.env.SMOKE_PORT ?? 4187)
const BASE = `http://127.0.0.1:${PORT}`

let chromium
try {
  ;({ chromium } = await import('playwright'))
} catch {
  console.error('\n❌ Playwright fehlt. Einmalig einrichten:\n   npm i -D playwright && npx playwright install chromium\n')
  process.exit(1)
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
  stdio: 'ignore',
  detached: false,
})

const shutdown = () => {
  if (!server.killed) server.kill('SIGTERM')
}
process.on('exit', shutdown)
process.on('SIGINT', () => {
  shutdown()
  process.exit(130)
})

// Auf den Server warten, statt blind zu schlafen
let up = false
for (let i = 0; i < 40; i++) {
  try {
    const response = await fetch(BASE)
    if (response.ok) {
      up = true
      break
    }
  } catch {
    // noch nicht bereit
  }
  await sleep(250)
}
if (!up) {
  console.error(`\n❌ Preview-Server auf ${BASE} nicht erreichbar. Läuft "npm run build"?\n`)
  shutdown()
  process.exit(1)
}

const executablePath = process.env.CHROMIUM_PATH
const browser = await chromium.launch(executablePath ? { executablePath } : {})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const problems = []
page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
page.on('console', (message) => {
  if (message.type() !== 'error') return
  // Fehlgeschlagene Bild-/API-Abrufe (Jikan, Wikipedia) sind hier kein Defekt:
  // genau dafür existiert der Zeichnungs-Fallback, und die Testumgebung hat
  // keinen Zugang zu diesen Diensten. Echte Skriptfehler zählen weiterhin.
  if (message.text().startsWith('Failed to load resource')) return
  problems.push(`console: ${message.text()}`)
})

const ok = (message) => console.log(`   ✓ ${message}`)
const fail = (message) => {
  throw new Error(message)
}

try {
  console.log('\n🎮 Rauchtest\n')

  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Partie beginnen')
  ok('Titelseite mit Regeln')

  await page.click('text=Partie beginnen')
  await page.waitForSelector('blockquote')

  // Rechtliche Kernanforderung: Das Kennzeichnungs-Badge darf vor der Antwort
  // nicht im DOM stehen — „Zugeschrieben" verriete sofort die reale Person.
  // Geprüft wird das Badge-Element selbst, nicht der Seitentext: „Aus der
  // Fiktion" ist die Kartenbeschriftung und soll sichtbar sein.
  const badgesBefore = await page.locator('[data-source-badge]').count()
  if (badgesBefore > 0) fail(`${badgesBefore} Kennzeichnung(en) vor der Antwort sichtbar — verrät die Lösung`)
  ok('Kennzeichnung bleibt während der Rate-Phase verborgen')

  await page.keyboard.press('ArrowLeft')
  await page.waitForSelector('text=/Gesagt hat es/')
  const afterAnswer = await page.textContent('body')
  if ((await page.locator('[data-source-badge]').count()) !== 1) fail('Auflösung ohne Kennzeichnung')
  if (!afterAnswer.includes('Fundstelle:')) fail('Auflösung ohne Fundstelle')
  if (!afterAnswer.includes('Zitat melden')) fail('Auflösung ohne Meldeweg')
  ok('Auflösung zeigt Kennzeichnung, Fundstelle und Meldeweg')

  await page.click('button:has-text("ⓘ")')
  await page.waitForSelector('[role="tooltip"]')
  await page.keyboard.press('Escape')
  await page.waitForSelector('[role="tooltip"]', { state: 'detached' })
  ok('Kennzeichnungs-Hinweis öffnet und schließt per Escape')

  // Bis zum Spielende durchspielen
  let sawGameOver = false
  for (let i = 0; i < 40; i++) {
    const body = await page.textContent('body')
    if (body.includes('Noch eine Partie')) {
      sawGameOver = true
      break
    }
    if (body.includes('Gesagt hat es')) {
      await page.click('button:has-text("Weiter"), button:has-text("Ergebnis ansehen")')
    } else {
      await page.keyboard.press('ArrowLeft')
    }
    await page.waitForTimeout(100)
  }
  if (!sawGameOver) fail('Spielende nach 40 Interaktionen nicht erreicht')
  ok('Spielschleife bis zum Spielende')

  await page.click('text=Noch eine Partie')
  await page.waitForSelector('blockquote')
  ok('Neustart')

  for (const [route, expected] of [
    ['faq', 'Häufige Fragen'],
    ['impressum', 'Impressum'],
    ['datenschutz', 'Datenschutzerklärung'],
    ['nutzungsbedingungen', 'Nutzungsbedingungen'],
    ['bildnachweise', 'Bildnachweise'],
  ]) {
    await page.goto(`${BASE}/#/${route}`, { waitUntil: 'networkidle' })
    const heading = await page.textContent('h1')
    if (heading.trim() !== expected) fail(`Seite /${route}: erwartet „${expected}", gefunden „${heading}"`)
  }
  ok('Alle fünf Pflichtseiten erreichbar')

  // Bilder sind Pflicht: In jeder Runde muss auf beiden Seiten ein Porträt stehen.
  await page.goto(BASE, { waitUntil: 'networkidle' })
  let checked = 0
  for (let step = 0; step < 40 && checked < 12; step++) {
    // Erst den Endbildschirm abräumen — dort stehen zu Recht keine Porträts.
    if ((await page.textContent('body')).includes('Noch eine Partie')) {
      await page.click('text=Noch eine Partie')
      await page.waitForSelector('blockquote')
    }

    const drawn = await page.evaluate(() =>
      [...document.querySelectorAll('main svg[role="img"]')].map(
        (svg) => svg.querySelectorAll('path, circle, ellipse, line').length,
      ),
    )
    if (drawn.length !== 2) fail(`Runde ${checked + 1}: ${drawn.length} Porträt(s) statt 2`)
    if (drawn.some((count) => count < 6)) fail(`Runde ${checked + 1}: ein Porträt ist fast leer (${drawn.join(', ')} Formen)`)
    checked++

    await page.keyboard.press('ArrowLeft')
    await page.waitForSelector('text=/Gesagt hat es/')
    await page.click('button:has-text("Weiter"), button:has-text("Ergebnis ansehen")')
    await page.waitForTimeout(120)
  }
  if (checked < 12) fail(`Nur ${checked} Runden geprüft`)
  ok(`${checked} Runden geprüft — überall beidseitig ein gezeichnetes Porträt`)

  // Galerie: kein Eintrag ohne Bild
  await page.goto(`${BASE}/#/portraets`, { waitUntil: 'networkidle' })
  const gallery = await page.evaluate(() => {
    const items = [...document.querySelectorAll('li')]
    return { total: items.length, empty: items.filter((li) => !li.querySelector('svg')).length }
  })
  if (gallery.total < 50) fail(`Galerie zeigt nur ${gallery.total} Porträts`)
  if (gallery.empty > 0) fail(`${gallery.empty} Einträge ohne Bild`)
  ok(`Galerie vollständig: ${gallery.total} Porträts, keine Lücke`)

  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  if (overflows) fail('Seite scrollt horizontal')
  ok('Kein horizontaler Überlauf')

  if (problems.length > 0) fail(`Browser-Fehler:\n     ${problems.join('\n     ')}`)
  ok('Keine Browser-Konsolenfehler')

  console.log('\n✅ Rauchtest bestanden\n')
} catch (error) {
  console.error(`\n❌ ${error.message}\n`)
  process.exitCode = 1
} finally {
  await browser.close()
  shutdown()
}
