// Captures d'écran datées d'une version de StageOps Web, pour docs/ux/vN/.
//
// Usage (hors du projet, Playwright n'est pas une dépendance de StageOps_Web) :
//   mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install chromium
//   cp <repo>/docs/ux/outils/capture-pages.mjs /tmp/pw/
//   # dans un autre terminal, depuis StageOps_Web de la version voulue : npx vite --port 5190 --strictPort
//   node capture-pages.mjs http://localhost:5190 <repo>/docs/ux/vN
//
// Chaque page est ouverte dans un contexte neuf : localStorage vide, donc données initiales du scénario.

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const [base, out] = process.argv.slice(2)
if (!base || !out) {
  console.error('Usage : node capture-pages.mjs <url de base> <dossier de sortie>')
  process.exit(1)
}
mkdirSync(out, { recursive: true })

const desktopPages = [
  ['01-connexion', '/login'],
  ['02-inscription', '/register'],
  ['03-vue-generale', '/'],
  ['04-plateau-3d', '/stage'],
  ['05-editeur-3d', '/editor'],
  ['06-parc-materiel', '/equipment'],
  ['07-conducteur', '/events'],
  ['08-incidents', '/incidents'],
  ['09-equipe', '/team'],
  ['10-parametres', '/settings'],
  ['11-profil', '/profile'],
  ['12-fiche-materiel-bmfl', '/equipment?equipment=eq-002'],
  ['13-detail-incident-bmfl', '/incidents?incident=inc-001'],
]
const mobilePages = [
  ['01-vue-generale', '/'],
  ['02-plateau-3d', '/stage'],
  ['03-parc-materiel', '/equipment'],
  ['04-incidents', '/incidents'],
  ['05-conducteur', '/events'],
  ['06-equipe', '/team'],
]

const browser = await chromium.launch({
  // Rendu WebGL logiciel pour que la 3D s'affiche sans carte graphique.
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})

async function shoot(prefix, viewport, isMobile, [name, path]) {
  const context = await browser.newContext({
    viewport,
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor: 1,
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(base + path, { waitUntil: 'networkidle' })
  if (path.startsWith('/stage') || path.startsWith('/editor')) {
    await page.waitForSelector('canvas', { timeout: 30000 }).catch(() => errors.push('canvas absent'))
    await page.waitForTimeout(8000)
  } else {
    await page.waitForTimeout(1200)
  }
  const file = `${out}/${prefix}-${name}.png`
  await page.screenshot({ path: file })
  console.log(file, errors.length ? `ERREURS : ${errors.join(' | ')}` : 'ok')
  await context.close()
}

for (const target of desktopPages) await shoot('bureau', { width: 1440, height: 900 }, false, target)
for (const target of mobilePages) await shoot('mobile', { width: 390, height: 844 }, true, target)
await browser.close()
