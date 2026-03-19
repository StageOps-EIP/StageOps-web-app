# Stratégie de Tests — StageOps

**Projet :** StageOps — Plateforme de gestion technique multi-théâtres  
**Version :** 1.0  
**Date :** Mars 2026  
**Auteur :** Équipe StageOps / Epitech EIP

---

## 1. Vue d'ensemble

### 1.1 Objectifs de la stratégie de tests

Cette stratégie de tests définit l'approche complète pour garantir la qualité, la fiabilité et la robustesse de StageOps. Elle couvre :
- Tests unitaires (couverture minimum 80% des fonctions critiques)
- Tests d'intégration (API ↔ CouchDB)
- Tests end-to-end (parcours utilisateur complets)
- Tests de performance (charge, latence, FPS 3D)
- Tests d'accessibilité (WCAG 2.1 AA)
- Tests de sécurité (OWASP Top 10)

---

### 1.2 Pyramide de tests

```
                /\
               /  \
              / E2E \  ← Tests end-to-end (10%)
             /------\
            / Integ. \ ← Tests intégration (20%)
           /----------\
          /   Unit     \ ← Tests unitaires (70%)
         /--------------\
```

**Répartition cible :**
- **70% tests unitaires** : Fonctions pures, helpers, logique métier isolée
- **20% tests d'intégration** : API endpoints, communication DB
- **10% tests E2E** : Parcours utilisateur critiques (login, CRUD événements/incidents)

---

## 2. Tests unitaires (Frontend)

### 2.1 Technologies

**Framework :** Vitest 1.3+ (compatible Vite, plus rapide que Jest)  
**Bibliothèques :**
- `@testing-library/react` — Rendu composants React
- `@testing-library/user-event` — Simulation interactions utilisateur
- `@testing-library/jest-dom` — Matchers DOM étendus (toBeInTheDocument, etc.)

**Configuration :** `StageOps_Web/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.test.{ts,tsx}',
        'src/main.tsx',
      ],
    },
  },
})
```

---

### 2.2 Périmètre de tests unitaires

#### 2.2.1 Priorité P0 (Critique)

| Module | Fichiers à tester | Couverture cible |
|--------|-------------------|------------------|
| Validation | `src/lib/validation.ts` | 100% |
| Formatage dates | `src/lib/utils.ts` (fonctions date) | 100% |
| Client API | `src/lib/api.ts` | 80% |
| Services Events | `src/services/events.service.ts` | 80% |
| Services Incidents | `src/services/incidents.service.ts` | 80% |
| Services Equipment | `src/services/equipment.service.ts` | 80% |
| Hooks RBAC | `src/hooks/useRole.ts` | 100% |

#### 2.2.2 Priorité P1 (Important)

| Module | Fichiers à tester | Couverture cible |
|--------|-------------------|------------------|
| Services Team | `src/services/team.service.ts` | 80% |
| Scene Editor reducer | `src/components/scene-editor/editorReducer.ts` | 90% |
| Scene Editor history | `src/components/scene-editor/useHistory.ts` | 90% |

---

### 2.3 Exemples de tests unitaires

#### 2.3.1 Test de validation (src/lib/validation.test.ts)

```typescript
import { describe, it, expect } from 'vitest'
import { validateRequiredText, isDateRangeInvalid } from './validation'

describe('validateRequiredText', () => {
  it('retourne erreur si texte vide', () => {
    const result = validateRequiredText('', 'Nom')
    expect(result).toBe('Nom est requis')
  })

  it('retourne erreur si texte whitespace uniquement', () => {
    const result = validateRequiredText('   ', 'Nom')
    expect(result).toBe('Nom est requis')
  })

  it('retourne null si texte valide', () => {
    const result = validateRequiredText('Événement Test', 'Nom')
    expect(result).toBeNull()
  })
})

describe('isDateRangeInvalid', () => {
  it('retourne true si fin avant début', () => {
    const start = '2026-03-20T10:00'
    const end = '2026-03-19T10:00'
    expect(isDateRangeInvalid(start, end)).toBe(true)
  })

  it('retourne false si fin après début', () => {
    const start = '2026-03-20T10:00'
    const end = '2026-03-20T12:00'
    expect(isDateRangeInvalid(start, end)).toBe(false)
  })

  it('retourne false si fin égale début', () => {
    const start = '2026-03-20T10:00'
    const end = '2026-03-20T10:00'
    expect(isDateRangeInvalid(start, end)).toBe(false)
  })
})
```

---

#### 2.3.2 Test de service API (src/services/events.service.test.ts)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createEvent, getEvents } from './events.service'
import * as api from '../lib/api'

// Mock du module api
vi.mock('../lib/api')

describe('events.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createEvent', () => {
    it('envoie requête POST avec payload correct', async () => {
      const mockEvent = {
        name: 'Concert Test',
        start_date: '2026-03-20T19:00',
        end_date: '2026-03-20T22:00',
        location: 'Salle principale',
        category: 'concert',
      }

      vi.mocked(api.request).mockResolvedValue({ id: 'evt_123', ...mockEvent })

      const result = await createEvent(mockEvent)

      expect(api.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/events/',
        data: mockEvent,
      })
      expect(result).toHaveProperty('id', 'evt_123')
    })

    it('gère erreur 400 (validation)', async () => {
      vi.mocked(api.request).mockRejectedValue({ status: 400, message: 'Invalid date' })

      await expect(createEvent({ name: '', start_date: '', end_date: '' }))
        .rejects.toThrow()
    })
  })

  describe('getEvents', () => {
    it('retourne liste événements parsée', async () => {
      const mockResponse = {
        rows: [
          { doc: { name: 'Event 1', start_date: '2026-03-20T10:00' } },
          { doc: { name: 'Event 2', start_date: '2026-03-21T14:00' } },
        ],
      }

      vi.mocked(api.request).mockResolvedValue(mockResponse)

      const result = await getEvents()

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('name', 'Event 1')
    })
  })
})
```

---

#### 2.3.3 Test de hook RBAC (src/hooks/useRole.test.tsx)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRole } from './useRole'
import * as authService from '../services/auth.service'

vi.mock('../services/auth.service')

describe('useRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne true si utilisateur a le rôle rg', () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ role: 'rg' })

    const { result } = renderHook(() => useRole('rg'))
    expect(result.current).toBe(true)
  })

  it('retourne false si utilisateur a rôle tech (requiert rg)', () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ role: 'tech' })

    const { result } = renderHook(() => useRole('rg'))
    expect(result.current).toBe(false)
  })

  it('retourne true si utilisateur a un des rôles autorisés', () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ role: 'tech' })

    const { result } = renderHook(() => useRole(['rg', 'tech']))
    expect(result.current).toBe(true)
  })
})
```

---

### 2.4 Exécution des tests

```bash
cd StageOps_Web/

# Lancer tous les tests unitaires
npm run test

# Lancer tests avec coverage
npm run test -- --coverage

# Lancer tests en mode watch (développement)
npm run test -- --watch

# Lancer un fichier de test spécifique
npm run test -- src/lib/validation.test.ts

# Lancer tests correspondant à un pattern
npm run test -- -t "validateRequiredText"
```

**Rapport de couverture :** `StageOps_Web/coverage/index.html`

---

## 3. Tests unitaires (Backend)

### 3.1 Technologies

**Framework :** Go standard `testing` + `testify/assert` (assertions riches)

**Commande :**
```bash
cd StageOps-backend/
go test ./... -v
go test ./... -cover
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out
```

---

### 3.2 Périmètre de tests backend

| Module | Fichiers à tester | Couverture cible |
|--------|-------------------|------------------|
| Authentification | `auth/auth.go` | 90% |
| Middleware JWT | `middleware/jwt.go` | 90% |
| Middleware RBAC | `middleware/rbac.go` | 90% |
| Handlers Events | `handlers/events.go` | 80% |
| Handlers Incidents | `handlers/incidents.go` | 80% |
| Handlers Equipment | `handlers/equipment.go` | 80% |
| Validation | `validators/*.go` | 100% |

---

### 3.3 Exemples de tests backend

#### 3.3.1 Test authentification (auth/auth_test.go)

```go
package auth

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestHashPassword(t *testing.T) {
    password := "MonMotDePasse123"
    hashed, err := HashPassword(password)

    assert.NoError(t, err)
    assert.NotEmpty(t, hashed)
    assert.NotEqual(t, password, hashed) // Hash ne doit pas être le mot de passe en clair
}

func TestCheckPasswordHash(t *testing.T) {
    password := "MonMotDePasse123"
    hashed, _ := HashPassword(password)

    // Bon mot de passe
    assert.True(t, CheckPasswordHash(password, hashed))

    // Mauvais mot de passe
    assert.False(t, CheckPasswordHash("MauvaisMotDePasse", hashed))
}

func TestGenerateToken(t *testing.T) {
    user := User{
        ID:    "user_123",
        Email: "test@example.com",
        Role:  "rg",
    }

    token, err := GenerateToken(user)

    assert.NoError(t, err)
    assert.NotEmpty(t, token)

    // Vérifier que le token contient bien les claims
    claims, err := ValidateToken(token)
    assert.NoError(t, err)
    assert.Equal(t, "user_123", claims.UserID)
    assert.Equal(t, "rg", claims.Role)
}

func TestValidateToken_Expired(t *testing.T) {
    // Créer un token expiré (durée -1h pour forcer expiration)
    expiredToken := createTokenWithExpiration(-1 * time.Hour)

    _, err := ValidateToken(expiredToken)
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "expired")
}
```

---

#### 3.3.2 Test middleware RBAC (middleware/rbac_test.go)

```go
package middleware

import (
    "net/http/httptest"
    "testing"
    "github.com/gofiber/fiber/v2"
    "github.com/stretchr/testify/assert"
)

func TestRequireRole_Authorized(t *testing.T) {
    app := fiber.New()

    // Mock user avec rôle 'rg'
    app.Use(func(c *fiber.Ctx) error {
        c.Locals("user", &Claims{Role: "rg"})
        return c.Next()
    })

    app.Get("/test", RequireRole("rg"), func(c *fiber.Ctx) error {
        return c.SendString("OK")
    })

    req := httptest.NewRequest("GET", "/test", nil)
    resp, _ := app.Test(req)

    assert.Equal(t, 200, resp.StatusCode)
}

func TestRequireRole_Forbidden(t *testing.T) {
    app := fiber.New()

    // Mock user avec rôle 'tech'
    app.Use(func(c *fiber.Ctx) error {
        c.Locals("user", &Claims{Role: "tech"})
        return c.Next()
    })

    app.Delete("/test", RequireRole("rg"), func(c *fiber.Ctx) error {
        return c.SendString("OK")
    })

    req := httptest.NewRequest("DELETE", "/test", nil)
    resp, _ := app.Test(req)

    assert.Equal(t, 403, resp.StatusCode)
}
```

---

## 4. Tests d'intégration

### 4.1 Tests API (Backend → CouchDB)

**Objectif :** Vérifier que les endpoints API communiquent correctement avec CouchDB.

**Setup :**
- Base de données CouchDB de test (conteneur Docker temporaire)
- Fixtures de données (utilisateurs, événements, équipements test)

**Exemple de test (integration/events_test.go) :**

```go
package integration

import (
    "testing"
    "net/http/httptest"
    "github.com/stretchr/testify/assert"
)

func TestCreateEvent_Integration(t *testing.T) {
    // Setup : Lancer CouchDB test + app
    db := setupTestDB(t)
    defer db.Cleanup()

    app := setupTestApp(db)

    // Créer un événement via API
    payload := `{
        "name": "Concert Test",
        "start_date": "2026-03-20T19:00",
        "end_date": "2026-03-20T22:00",
        "location": "Salle principale"
    }`

    req := httptest.NewRequest("POST", "/api/events/", strings.NewReader(payload))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+testToken)

    resp, _ := app.Test(req)

    assert.Equal(t, 201, resp.StatusCode)

    // Vérifier dans CouchDB
    var event Event
    db.Get(context.Background(), "events", &event)
    assert.Equal(t, "Concert Test", event.Name)
}
```

---

### 4.2 Tests frontend → backend

**Objectif :** Vérifier que le frontend appelle correctement le backend (mocks API).

**Exemple :**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dashboard } from './Dashboard'
import * as api from '../lib/api'

vi.mock('../lib/api')

describe('Dashboard - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche les événements récupérés depuis l'API', async () => {
    vi.mocked(api.request).mockResolvedValue({
      rows: [
        { doc: { name: 'Concert Rock', start_date: '2026-03-20T19:00' } },
      ],
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Concert Rock')).toBeInTheDocument()
    })
  })

  it('gère erreur API (état d'erreur)', async () => {
    vi.mocked(api.request).mockRejectedValue(new Error('Network error'))

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Erreur de chargement/i)).toBeInTheDocument()
    })
  })
})
```

---

## 5. Tests end-to-end (E2E)

### 5.1 Technologies

**Framework :** Playwright 1.40+  
**Navigateurs :** Chromium, Firefox, WebKit (Safari)

**Configuration :** `StageOps_Web/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

### 5.2 Scénarios E2E prioritaires

| ID | Scénario | Fichier test | Priorité |
|----|----------|--------------|----------|
| E2E-01 | Connexion utilisateur + navigation dashboard | `e2e/auth.spec.ts` | P0 |
| E2E-02 | Créer événement + vérifier affichage calendrier | `e2e/events.spec.ts` | P0 |
| E2E-03 | Créer incident + changer statut Kanban | `e2e/incidents.spec.ts` | P0 |
| E2E-04 | Ajouter équipement + vérifier dans tableau | `e2e/equipment.spec.ts` | P0 |
| E2E-05 | Navigation 3D + sélection équipement | `e2e/stage3d.spec.ts` | P1 |
| E2E-06 | Modifier profil utilisateur | `e2e/profile.spec.ts` | P1 |

---

### 5.3 Exemple de test E2E

#### 5.3.1 Test authentification (e2e/auth.spec.ts)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentification', () => {
  test('connexion utilisateur avec credentials valides', async ({ page }) => {
    // Aller sur page de login
    await page.goto('/login')

    // Remplir formulaire
    await page.fill('input[type="email"]', 'admin@test.fr')
    await page.fill('input[type="password"]', 'MotDePasse123')
    await page.click('button[type="submit"]')

    // Attendre redirection vers dashboard
    await expect(page).toHaveURL('/dashboard')

    // Vérifier que le dashboard s'affiche
    await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible()
  })

  test('affiche erreur si credentials invalides', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', 'invalid@test.fr')
    await page.fill('input[type="password"]', 'WrongPassword')
    await page.click('button[type="submit"]')

    // Vérifier message d'erreur
    await expect(page.getByText(/Email ou mot de passe incorrect/i)).toBeVisible()
  })
})
```

---

#### 5.3.2 Test création événement (e2e/events.spec.ts)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Gestion événements', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter avant chaque test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@test.fr')
    await page.fill('input[type="password"]', 'MotDePasse123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('créer un événement et vérifier affichage dans calendrier', async ({ page }) => {
    // Aller sur page événements
    await page.click('a[href="/events"]')
    await expect(page).toHaveURL('/events')

    // Ouvrir modal création
    await page.click('button:has-text("Nouvel événement")')

    // Remplir formulaire
    await page.fill('input[name="name"]', 'Concert Test E2E')
    await page.fill('input[name="start_date"]', '2026-03-20T19:00')
    await page.fill('input[name="end_date"]', '2026-03-20T22:00')
    await page.fill('input[name="location"]', 'Salle principale')
    await page.selectOption('select[name="category"]', 'concert')

    // Soumettre
    await page.click('button:has-text("Créer")')

    // Vérifier que l'événement apparaît dans le calendrier
    await expect(page.getByText('Concert Test E2E')).toBeVisible()
  })
})
```

---

### 5.4 Exécution des tests E2E

```bash
cd StageOps_Web/

# Installer Playwright (première fois)
npx playwright install

# Lancer tous les tests E2E
npx playwright test

# Lancer tests avec interface graphique (développement)
npx playwright test --ui

# Lancer tests dans un navigateur spécifique
npx playwright test --project=chromium

# Générer rapport HTML
npx playwright show-report
```

---

## 6. Tests de performance

### 6.1 Tests frontend (Lighthouse CI)

**Objectif :** Mesurer performance chargement, accessibilité, bonnes pratiques.

**Setup :**
```bash
npm install -g @lhci/cli

# Configuration lighthouserc.json
```

**Commande :**
```bash
lhci autorun --config=lighthouserc.json
```

**Métriques cibles :**
- Performance : ≥ 90
- Accessibilité : ≥ 90
- Best Practices : ≥ 90
- SEO : ≥ 80
- First Contentful Paint (FCP) : < 1.5s
- Time to Interactive (TTI) : < 3s

---

### 6.2 Tests backend (K6 load testing)

**Objectif :** Mesurer latence API sous charge (100+ utilisateurs concurrents).

**Installation :**
```bash
brew install k6  # macOS
# ou : https://k6.io/docs/getting-started/installation/
```

**Script de test (k6/load-test.js) :**
```javascript
import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '1m', target: 50 },   // Montée en charge : 50 users
    { duration: '3m', target: 100 },  // Plateau : 100 users
    { duration: '1m', target: 0 },    // Descente : 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],  // 95% requêtes < 200ms
    http_req_failed: ['rate<0.01'],    // < 1% erreurs
  },
}

export default function () {
  let token = 'Bearer eyJhbGc...'  // Token JWT test

  // Test GET /api/events/
  let res = http.get('http://localhost:5000/api/events/', {
    headers: { 'Authorization': token },
  })

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  })

  sleep(1)
}
```

**Exécution :**
```bash
k6 run k6/load-test.js
```

---

### 6.3 Tests 3D (FPS monitoring)

**Objectif :** Vérifier que le rendu 3D maintient 60 FPS sous charge (50+ équipements).

**Approche :**
- Hook `useFrame` de React Three Fiber pour mesurer FPS
- Benchmark automatisé avec Puppeteer + injection script FPS counter

**Exemple (benchmark/fps-test.js) :**
```javascript
const puppeteer = require('puppeteer')

async function testFPS() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto('http://localhost:8080/stage-view')

  // Injecter script FPS counter
  const fps = await page.evaluate(() => {
    let lastTime = performance.now()
    let frames = 0
    let avgFPS = 0

    return new Promise((resolve) => {
      function countFrames() {
        frames++
        const currentTime = performance.now()
        if (currentTime >= lastTime + 1000) {
          avgFPS = Math.round((frames * 1000) / (currentTime - lastTime))
          lastTime = currentTime
          frames = 0

          if (avgFPS > 0) {
            resolve(avgFPS)
          }
        }
        requestAnimationFrame(countFrames)
      }
      requestAnimationFrame(countFrames)
    })
  })

  console.log(`FPS moyen : ${fps}`)
  await browser.close()

  if (fps < 55) {
    throw new Error(`FPS trop faible : ${fps} (cible : 60)`)
  }
}

testFPS()
```

---

## 7. Tests d'accessibilité

### 7.1 Tests automatisés (axe-core)

**Bibliothèque :** `@axe-core/playwright`

**Installation :**
```bash
npm install --save-dev @axe-core/playwright
```

**Exemple de test (e2e/accessibility.spec.ts) :**
```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibilité', () => {
  test('dashboard respecte WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/dashboard')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
```

---

### 7.2 Tests manuels (checklist WCAG)

**Vérifications manuelles** (cf. `Docs_Projet/03_Referentiel_Accessibilite_WCAG.md`) :
- Navigation clavier complète (Tab, Shift+Tab, Enter, Échap)
- Focus trap dans les modaux (Dialog)
- Skip-links fonctionnels
- Contrastes couleurs ≥ 4.5:1 (texte normal) et ≥ 3:1 (texte large)
- Labels formulaires explicites (tous champs)
- Lecteur d'écran (NVDA, JAWS, VoiceOver) : test 2 parcours complets

---

## 8. Tests de sécurité

### 8.1 Scan vulnérabilités dépendances

**Frontend (npm audit) :**
```bash
cd StageOps_Web/
npm audit
npm audit fix
```

**Backend (govulncheck) :**
```bash
cd StageOps-backend/
go install golang.org/x/vuln/cmd/govulncheck@latest
govulncheck ./...
```

---

### 8.2 Tests de pénétration (OWASP ZAP)

**Installation :**
```bash
docker pull zaproxy/zap-stable
```

**Scan automatique :**
```bash
docker run -t zaproxy/zap-stable zap-baseline.py -t http://localhost:8080 -r zap-report.html
```

**Scénarios à tester manuellement :**
- Injection SQL/NoSQL (dans filtres, recherche)
- XSS (dans champs texte : nom événement, description)
- CSRF (tentative requête depuis domaine externe)
- Brute-force login (100+ tentatives)
- Élévation de privilèges (utilisateur `tech` tente action `rg`)

---

## 9. CI/CD - Intégration continue

### 9.1 GitHub Actions (exemple workflow)

Fichier `.github/workflows/tests.yml` :

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd StageOps_Web && npm ci
      - run: cd StageOps_Web && npm run test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./StageOps_Web/coverage/lcov.info

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v4
        with:
          go-version: '1.22'
      - run: cd StageOps-backend && go test ./... -cover

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd StageOps_Web && npm ci
      - run: npx playwright install --with-deps
      - run: cd StageOps_Web && npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: StageOps_Web/playwright-report/
```

---

## 10. Métriques et rapports

### 10.1 KPIs de qualité

| Métrique | Cible | Mesure |
|----------|-------|--------|
| Couverture tests unitaires | ≥ 80% | Vitest coverage report |
| Taux de réussite tests E2E | 100% | Playwright report |
| Performance Lighthouse | ≥ 90/100 | Lighthouse CI |
| Latence API (p95) | < 200ms | K6 load test |
| FPS rendu 3D | ≥ 55 FPS | Benchmark FPS |
| Vulnérabilités critiques | 0 | govulncheck + npm audit |
| Score accessibilité axe | 0 violations WCAG 2.1 AA | axe-core Playwright |

---

### 10.2 Dashboard de tests (futur)

**Outils recommandés :**
- Codecov (couverture de code)
- Percy (tests visuels snapshots)
- Datadog CI Visibility (dashboard centralisé tests)

---

## 11. Annexes

### Annexe A : Commandes récapitulatives

```bash
# Frontend
cd StageOps_Web/
npm run test               # Tests unitaires
npm run test -- --coverage # Avec couverture
npx playwright test        # Tests E2E
lhci autorun               # Tests performance

# Backend
cd StageOps-backend/
go test ./... -v           # Tests unitaires
go test ./... -cover       # Avec couverture
k6 run k6/load-test.js     # Tests charge

# Sécurité
npm audit                  # Scan vulnérabilités frontend
govulncheck ./...          # Scan vulnérabilités backend
docker run -t zaproxy/zap-stable zap-baseline.py -t http://localhost:8080
```

---

**Fin de la Stratégie de Tests**  
**Version 1.0 — Mars 2026**
