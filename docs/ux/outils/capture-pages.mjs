// Captures d'écran datées d'une version de StageOps Web, pour docs/ux/vN/.
//
// Usage (hors du projet, Playwright n'est pas une dépendance de StageOps_Web) :
//   mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install chromium
//   cp <repo>/docs/ux/outils/capture-pages.mjs /tmp/pw/
//   # dans un autre terminal, depuis StageOps_Web de la version voulue : npx vite --port 5190 --strictPort
//   node capture-pages.mjs http://localhost:5190 <repo>/docs/ux/vN [--session-factice] [--ouvrir-par-clic]
//
// Chaque page est ouverte dans un contexte neuf : localStorage vide, donc données initiales du scénario.
//
// Options pour les versions anciennes (prototype de septembre 2026) :
//   --session-factice  l'application exige une connexion vérifiée par l'API Go (/api/auth/me).
//                      Le script place un jeton factice et répond lui-même à /api/auth/me avec un
//                      compte fictif, sans backend. Le code de l'application n'est pas modifié.
//   --ouvrir-par-clic  les liens ?equipment= et ?incident= n'existent pas encore : la fiche et le
//                      détail sont ouverts en cliquant sur l'élément dans la liste.

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const args = process.argv.slice(2)
const fakeSession = args.includes('--session-factice')
const openByClick = args.includes('--ouvrir-par-clic')
const [base, out] = args.filter((arg) => !arg.startsWith('--'))
if (!base || !out) {
  console.error('Usage : node capture-pages.mjs <url de base> <dossier de sortie> [options]')
  process.exit(1)
}
mkdirSync(out, { recursive: true })

const FAKE_USER = {
  id: 'capture',
  email: 'regie@exemple.fr',
  role: 'admin',
  created_at: '2026-01-01T00:00:00Z',
}

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
  openByClick
    ? ['12-fiche-materiel-bmfl', '/equipment', 'Projecteur LED Robe BMFL']
    : ['12-fiche-materiel-bmfl', '/equipment?equipment=eq-002'],
  openByClick
    ? ['13-detail-incident-bmfl', '/incidents', 'Panne projecteur BMFL']
    : ['13-detail-incident-bmfl', '/incidents?incident=inc-001'],
]
const publicPaths = ['/login', '/register']
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

async function shoot(prefix, viewport, isMobile, [name, path, clickText]) {
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
  if (fakeSession && !publicPaths.includes(path)) {
    await context.addInitScript(() => localStorage.setItem('auth_token', 'capture-factice'))
    await context.route('**/api/auth/me', (route) => route.fulfill({ json: FAKE_USER }))
  }
  await page.goto(base + path, { waitUntil: 'networkidle' })
  if (clickText) {
    await page.waitForTimeout(800)
    // Dans un tableau, la fiche s'ouvre par le bouton « Détails » de la ligne ; sinon on clique le texte.
    const rowButton = page
      .locator('tr', { hasText: clickText })
      .getByRole('button', { name: 'Détails' })
    const target = (await rowButton.count())
      ? rowButton.first()
      : page.getByText(clickText, { exact: true }).first()
    await target
      .click()
      .catch((error) => errors.push(`clic « ${clickText} » : ${error.message.split('\n')[0]}`))
  }
  if (path.startsWith('/stage') || path.startsWith('/editor')) {
    await page.waitForSelector('canvas', { timeout: 30000 }).catch(() => errors.push('canvas absent'))
    await page.waitForTimeout(8000)
  } else {
    await page.waitForTimeout(1200)
  }
  const file = `${out}/${prefix}-${name}.png`
  await page
    .screenshot({ path: file, animations: 'disabled', timeout: 90000 })
    .catch((error) => errors.push(`capture : ${error.message.split('\n')[0]}`))
  console.log(file, errors.length ? `ERREURS : ${errors.join(' | ')}` : 'ok')
  await context.close()
}

for (const target of desktopPages) await shoot('bureau', { width: 1440, height: 900 }, false, target)
for (const target of mobilePages) await shoot('mobile', { width: 390, height: 844 }, true, target)
await browser.close()
