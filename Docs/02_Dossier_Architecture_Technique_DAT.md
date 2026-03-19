# Dossier d'Architecture Technique (DAT) — StageOps

**Projet :** StageOps — Plateforme de gestion technique multi-théâtres  
**Version :** 1.0  
**Date :** Mars 2026  
**Auteur :** Équipe StageOps / Epitech EIP

---

## 1. Vue d'ensemble de l'architecture

### 1.1 Objectif architectural

L'architecture de StageOps est conçue pour répondre à trois contraintes majeures identifiées lors de l'audit terrain :

1. **Fiabilité en environnement dégradé** : Zones blanches, réseau instable → Architecture offline-first
2. **Simplicité d'usage** : Pratiques papier dominantes → UX claire, pas de complexité inutile
3. **Performance 3D** : Rendu temps réel sur navigateurs → Stack 3D optimisée (Three.js)

### 1.2 Principes directeurs

- **Séparation des responsabilités** : Frontend (présentation), Backend (logique métier), Base de données (persistence)
- **API-first** : Toute interaction passe par une API REST typée et documentée
- **Offline-first** : Capacité de fonctionner en mode dégradé sans réseau
- **Traçabilité complète** : Logs d'audit frontend et backend
- **Accessibilité par défaut** : WCAG 2.1 AA intégré dès la conception

---

## 2. Architecture globale (High-level)

### 2.1 Schéma d'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVIGATEUR (Client)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  FRONTEND (React + TypeScript + Vite)                   │   │
│  │  • React Router (navigation)                            │   │
│  │  • Three.js + R3F (rendu 3D)                            │   │
│  │  • Context API (auth state)                             │   │
│  │  • localStorage (audit logs + session)                  │   │
│  └──────────────────┬──────────────────────────────────────┘   │
└────────────────────┼──────────────────────────────────────────┘
                      │
                      │ HTTPS (JWT Bearer)
                      │
┌────────────────────▼──────────────────────────────────────────┐
│                    API BACKEND (Go Fiber)                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  ROUTES API                                             │  │
│  │  • /api/auth/*    (login, register, me)                │  │
│  │  • /api/events/*  (CRUD événements)                    │  │
│  │  • /api/incidents/* (CRUD incidents)                   │  │
│  │  • /api/equipment/* (CRUD équipements)                 │  │
│  │  • /api/team/*    (CRUD équipe + RBAC)                 │  │
│  └──────────────────┬──────────────────────────────────────┘  │
│                      │                                          │
│  ┌──────────────────▼──────────────────────────────────────┐  │
│  │  MIDDLEWARES                                            │  │
│  │  • JWT Validation                                       │  │
│  │  • CORS                                                 │  │
│  │  • Rate Limiting                                        │  │
│  │  • Request Logging                                      │  │
│  └──────────────────┬──────────────────────────────────────┘  │
└────────────────────┼──────────────────────────────────────────┘
                      │
                      │ HTTP (JSON API)
                      │
┌────────────────────▼──────────────────────────────────────────┐
│                    BASE DE DONNÉES (CouchDB)                   │
│  • Documents JSON (schemaless)                                 │
│  • Réplication incrémentale (sync offline-first)               │
│  • Views MapReduce pour agrégations                            │
│  • Révisions automatiques (historique)                         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Flux de données typique

**Exemple : Création d'un incident**

1. **Frontend** : Utilisateur remplit le formulaire `NewIncidentModal`
2. **Validation locale** : `src/lib/validation.ts` vérifie les champs obligatoires
3. **Appel API** : `src/services/incidents.service.ts` → `request<Incident>('POST', '/api/incidents/', body)`
4. **Réseau** : `src/lib/api.ts` injecte le JWT token, timeout 10s, retry 2x
5. **Backend** : Go Fiber valide le token JWT, parse le body, valide les champs serveur
6. **Base de données** : CouchDB insère le document incident avec révision automatique
7. **Réponse** : Backend renvoie l'incident créé (JSON)
8. **Frontend** : Service parse le JSON en modèle typé `Incident`, met à jour l'état React
9. **UI** : Liste des incidents se rafraîchit, notification de succès affichée
10. **Audit log** : `src/lib/logger.ts` enregistre l'action en localStorage

---

## 3. Architecture frontend

### 3.1 Stack technologique

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18.x | Framework UI, composants réactifs |
| TypeScript | 5.x | Typage statique, sécurité du code |
| Vite | 5.x | Build tool, HMR rapide |
| React Router | 7.x | Gestion du routing SPA |
| Three.js | 0.170.x | Moteur de rendu 3D WebGL |
| @react-three/fiber | 8.x | Wrapper React pour Three.js |
| @react-three/drei | 9.x | Helpers 3D (controls, lights, etc.) |

### 3.2 Structure des répertoires

```
StageOps_Web/
├── public/                  # Assets statiques
├── src/
│   ├── main.tsx            # Point d'entrée (ErrorBoundary, ThemeProvider, AuthProvider)
│   ├── routes.ts           # Configuration centralisée du routing
│   ├── components/         # Composants React réutilisables
│   │   ├── auth/           # Login, Register, ProtectedRoute
│   │   ├── events/         # NewEventModal, EventList, EventDetails
│   │   ├── incidents/      # NewIncidentModal, IncidentList, IncidentCard
│   │   ├── equipment/      # EquipmentList, EquipmentModal
│   │   ├── team/           # TeamList, TeamModal, RoleGuard
│   │   ├── stage3d/        # Stage3DCanvas, CameraControls, LightingSetup
│   │   ├── scene-editor/   # EditorToolbar, PropertiesPanel, SceneCanvas, reducer
│   │   └── ui/             # Button, Modal, Card, Layout (composants génériques)
│   ├── pages/              # Pages principales du router
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Events.tsx
│   │   ├── Incidents.tsx
│   │   ├── Equipment.tsx
│   │   ├── Team.tsx
│   │   ├── StageView.tsx
│   │   └── SceneEditor.tsx
│   ├── services/           # Couche d'accès API (isolation logique métier)
│   │   ├── auth.service.ts
│   │   ├── events.service.ts
│   │   ├── incidents.service.ts
│   │   ├── equipment.service.ts
│   │   └── team.service.ts
│   ├── hooks/              # Custom hooks React
│   │   ├── useAuth.ts      # Contexte d'authentification
│   │   └── useRole.ts      # Vérification rôle utilisateur (RBAC)
│   ├── lib/                # Utilitaires et helpers
│   │   ├── api.ts          # Wrapper request() avec JWT, timeout, retry
│   │   ├── logger.ts       # Logs d'audit localStorage
│   │   ├── types.ts        # Types TypeScript (Event, Incident, Equipment, User)
│   │   ├── validation.ts   # Helpers validation formulaires
│   │   └── formatters.ts   # Formatage dates, nombres, etc.
│   └── styles/             # Styles CSS (si nécessaire)
└── vite.config.ts          # Configuration Vite (alias @/, etc.)
```

### 3.3 Couche API centralisée (`src/lib/api.ts`)

**Rôle :** Point d'entrée unique pour toutes les requêtes HTTP. Garantit la cohérence (JWT, timeout, retry, logs).

**Signature :**
```typescript
export async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T>
```

**Fonctionnalités :**
- Injection automatique du token JWT depuis `localStorage.getItem('auth_token')`
- Header `Authorization: Bearer <token>`
- Timeout configurable (défaut 10s)
- Retry automatique (2 tentatives) sur erreur réseau
- Reset token automatique sur 401 Unauthorized
- Logs structurés via `logger.ts`
- Parsing JSON → modèle typé `T`

**Exemple d'usage :**
```typescript
import { request } from '@/lib/api';
import type { Incident } from '@/lib/types';

const newIncident = await request<Incident>(
  'POST',
  '/api/incidents/',
  { title: 'Projecteur en panne', severity: 'high' }
);
```

### 3.4 Architecture 3D (Three.js + R3F)

**Deux implémentations :**

#### 3.4.1 Vue scène 3D (lecture seule — `/stage`)
- **Composant principal** : `Stage3DCanvas.tsx`
- **Fonctionnalités** :
  - Rendu 3D des équipements positionnés
  - Caméra orbitale (OrbitControls)
  - Éclairage réaliste (AmbientLight + DirectionalLight)
  - Détection de collisions (Raycaster)
- **Performance** : FPS cible 60, optimisation avec `useMemo` et `React.memo`

#### 3.4.2 Éditeur scène 3D (édition — `/editor`)
- **Composant principal** : `SceneEditor.tsx` + `SceneCanvas.tsx`
- **Architecture reducer** : State management avec `useReducer`
- **Actions** :
  - `ADD_OBJECT` : Ajouter un objet 3D
  - `UPDATE_OBJECT` : Modifier position/rotation/scale
  - `DELETE_OBJECT` : Supprimer un objet
  - `UNDO` / `REDO` : Historique d'actions
- **Persistence** : Sauvegarde automatique en `localStorage` (clé `scene-state`)
- **Export/Import** : JSON de configuration scène

**Schéma state éditeur :**
```typescript
interface SceneState {
  objects: SceneObject[];
  selectedId: string | null;
  history: SceneState[];
  historyIndex: number;
}

type SceneAction =
  | { type: 'ADD_OBJECT'; object: SceneObject }
  | { type: 'UPDATE_OBJECT'; id: string; updates: Partial<SceneObject> }
  | { type: 'DELETE_OBJECT'; id: string }
  | { type: 'UNDO' }
  | { type: 'REDO' };
```

### 3.5 Gestion de l'authentification (Context API)

**Fichier :** `src/hooks/useAuth.ts`

**Contexte global :**
```typescript
interface AuthContext {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
```

**Flux d'authentification :**
1. Utilisateur soumet formulaire login
2. `authService.login(email, password)` → `POST /api/auth/login`
3. Backend valide les credentials, renvoie `{ token, user }`
4. Frontend stocke le token en `localStorage.setItem('auth_token', token)`
5. Context `AuthProvider` met à jour l'état `user` et `token`
6. Route `ProtectedRoute` vérifie `isAuthenticated` avant d'afficher les pages protégées

---

## 4. Architecture backend

### 4.1 Stack technologique

| Technologie | Version | Rôle |
|-------------|---------|------|
| Go | 1.26+ | Langage système, performances optimales |
| Fiber | 2.x | Framework web (Express-like pour Go) |
| JWT-Go | 4.x | Gestion tokens JWT |
| CouchDB Driver | 3.x | Client CouchDB pour Go |

### 4.2 Structure backend (anticipée)

```
StageOps-backend/
├── cmd/
│   └── server/
│       └── main.go         # Point d'entrée serveur
├── internal/
│   ├── api/
│   │   ├── handlers/       # Handlers HTTP (routes)
│   │   │   ├── auth.go
│   │   │   ├── events.go
│   │   │   ├── incidents.go
│   │   │   ├── equipment.go
│   │   │   └── team.go
│   │   ├── middleware/     # Middlewares (JWT, CORS, logging)
│   │   │   ├── auth.go
│   │   │   ├── cors.go
│   │   │   └── logger.go
│   │   └── router.go       # Configuration routes Fiber
│   ├── models/             # Modèles de données (structs Go)
│   │   ├── user.go
│   │   ├── event.go
│   │   ├── incident.go
│   │   ├── equipment.go
│   │   └── team.go
│   ├── database/           # Couche d'accès CouchDB
│   │   ├── couch.go        # Client CouchDB
│   │   └── repositories/   # Repositories par entité
│   │       ├── events.go
│   │       ├── incidents.go
│   │       └── equipment.go
│   └── utils/              # Utilitaires (validation, hashing, etc.)
│       ├── jwt.go
│       ├── hash.go
│       └── validator.go
├── config/
│   └── config.go           # Configuration (env vars)
├── go.mod
└── go.sum
```

### 4.3 Routes API

#### Authentification (`/api/auth`)
```go
POST   /api/auth/login      → Login (email + password → JWT token)
POST   /api/auth/register   → Register (email, password, name)
GET    /api/auth/me         → Get current user (JWT required)
POST   /api/auth/logout     → Logout (invalidate token)
```

#### Événements (`/api/events`)
```go
GET    /api/events/         → List all events (JWT required)
POST   /api/events/         → Create event (JWT required)
GET    /api/events/:id      → Get event by ID (JWT required)
PUT    /api/events/:id      → Update event (JWT required)
DELETE /api/events/:id      → Delete event (JWT required, role check)
```

#### Incidents (`/api/incidents`)
```go
GET    /api/incidents/      → List all incidents (JWT required)
POST   /api/incidents/      → Create incident (JWT required)
GET    /api/incidents/:id   → Get incident by ID (JWT required)
PUT    /api/incidents/:id   → Update incident (JWT required)
DELETE /api/incidents/:id   → Delete incident (JWT required)
```

#### Équipements (`/api/equipment`)
```go
GET    /api/equipment/      → List all equipment (JWT required)
POST   /api/equipment/      → Create equipment (JWT required)
GET    /api/equipment/:id   → Get equipment by ID (JWT required)
PUT    /api/equipment/:id   → Update equipment (JWT required)
DELETE /api/equipment/:id   → Delete equipment (JWT required, role check)
```

#### Équipe (`/api/team`)
```go
GET    /api/team/           → List all team members (JWT required)
POST   /api/team/           → Add team member (JWT required, role 'rg' only)
GET    /api/team/:id        → Get team member by ID (JWT required)
PUT    /api/team/:id        → Update team member (JWT required, role 'rg' only)
DELETE /api/team/:id        → Delete team member (JWT required, role 'rg' only)
```

### 4.4 Middleware pipeline

**Ordre d'exécution :**
```
Request → CORS → Logger → RateLimiter → JWT Validator → Handler → Response
```

**Détail des middlewares :**

1. **CORS** : Autorise les requêtes cross-origin depuis le frontend
   - Headers : `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, etc.
   
2. **Logger** : Logs structurés de chaque requête (méthode, endpoint, durée, statut)
   - Format : JSON pour ingestion dans systèmes d'observabilité

3. **Rate Limiter** : Limite le nombre de requêtes par IP (anti-DDoS basique)
   - Limite : 100 requêtes/minute par IP

4. **JWT Validator** : Vérifie le token JWT sur routes protégées
   - Parse le header `Authorization: Bearer <token>`
   - Valide la signature et l'expiration
   - Injecte l'utilisateur dans le contexte de la requête
   - Renvoie 401 Unauthorized si token invalide

### 4.5 Modèle de données (structs Go)

**Exemple : Incident**
```go
type Incident struct {
    ID          string    `json:"id" couchdb:"_id"`
    Rev         string    `json:"_rev,omitempty" couchdb:"_rev"`
    Title       string    `json:"title" validate:"required,min=3,max=100"`
    Description string    `json:"description" validate:"required,min=10,max=1000"`
    Severity    string    `json:"severity" validate:"required,oneof=critical high medium low"`
    Status      string    `json:"status" validate:"required,oneof=open in_progress resolved closed"`
    EquipmentID string    `json:"equipment_id,omitempty"`
    AssignedTo  string    `json:"assigned_to,omitempty"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
    CreatedBy   string    `json:"created_by"`
}
```

**Validation côté backend :**
- Utilisation de `go-playground/validator` pour validation automatique
- Règles : `required`, `min`, `max`, `oneof`, `email`, `url`, etc.
- Retour erreur 400 Bad Request avec détails si validation échoue

---

## 5. Architecture base de données (CouchDB)

### 5.1 Choix de CouchDB

**Justification (Benchmark M3) :**
- **Offline-first natif** : Réplication incrémentale, sync bidirectionnel
- **Schemaless** : Documents JSON, pas de migrations complexes
- **Révisions automatiques** : Historique des modifications intégré
- **MapReduce views** : Agrégations et requêtes complexes

### 5.2 Structure des documents

#### Document Event
```json
{
  "_id": "event_2026-03-25_concert",
  "_rev": "1-abc123...",
  "type": "event",
  "name": "Concert 25 mars",
  "start_date": "2026-03-25T20:00:00Z",
  "end_date": "2026-03-25T23:00:00Z",
  "location": "Théâtre de l'Alphabet",
  "description": "Concert de jazz",
  "status": "planned",
  "created_at": "2026-03-01T10:00:00Z",
  "updated_at": "2026-03-01T10:00:00Z",
  "created_by": "user_123"
}
```

#### Document Incident
```json
{
  "_id": "incident_12345",
  "_rev": "3-def456...",
  "type": "incident",
  "title": "Projecteur en panne",
  "description": "Projecteur zone scène droite ne s'allume plus",
  "severity": "high",
  "status": "in_progress",
  "equipment_id": "equipment_789",
  "assigned_to": "user_456",
  "created_at": "2026-03-15T14:30:00Z",
  "updated_at": "2026-03-15T15:00:00Z",
  "created_by": "user_123",
  "history": [
    {"status": "open", "timestamp": "2026-03-15T14:30:00Z", "user": "user_123"},
    {"status": "in_progress", "timestamp": "2026-03-15T15:00:00Z", "user": "user_456"}
  ]
}
```

### 5.3 Views CouchDB (MapReduce)

**View : Incidents par sévérité**
```javascript
// Map function
function(doc) {
  if (doc.type === 'incident') {
    emit(doc.severity, 1);
  }
}

// Reduce function
_count
```

**Requête :**
```
GET /_design/incidents/_view/by_severity?group=true
→ {"rows": [
    {"key": "critical", "value": 5},
    {"key": "high", "value": 12},
    {"key": "medium", "value": 23},
    {"key": "low", "value": 7}
  ]}
```

### 5.4 Stratégie de synchronisation offline-first

**Architecture :**
```
Frontend (PouchDB) ←→ Sync ←→ Backend (CouchDB)
```

**Fonctionnement :**
1. Frontend utilise **PouchDB** (CouchDB en browser)
2. Synchronisation bidirectionnelle avec CouchDB backend
3. **Mode offline** : PouchDB stocke les modifications localement (IndexedDB)
4. **Mode online** : Sync automatique des deltas (modifications incrémentales)
5. **Gestion des conflits** : CouchDB conserve toutes les révisions, résolution manuelle si nécessaire

**Stratégie de résolution de conflits :**
- **Last-Write-Wins (LWW)** : La modification la plus récente (timestamp) l'emporte
- Alternative : Intervention manuelle utilisateur si conflit critique

---

## 6. Sécurité

### 6.1 Authentification JWT

**Flux complet :**
1. Utilisateur envoie `POST /api/auth/login` avec `{email, password}`
2. Backend hash le password avec **bcrypt** (cost=12)
3. Backend vérifie hash vs hash stocké en base
4. Si valide, backend génère un JWT token avec payload :
   ```json
   {
     "sub": "user_123",
     "email": "user@example.com",
     "role": "rg",
     "exp": 1711036800  // Expiration 24h
   }
   ```
5. Token signé avec secret HMAC-SHA256
6. Backend renvoie `{token, user}`
7. Frontend stocke token en `localStorage`
8. Toutes les requêtes suivantes incluent `Authorization: Bearer <token>`

**Expiration et renouvellement :**
- Token valide 24h
- Après expiration : 401 Unauthorized → Frontend reset token → Redirect vers `/login`
- (Futur) Refresh token pour renouvellement automatique

### 6.2 RBAC (Role-Based Access Control)

**Rôles :**
- **`rg`** (régisseur général) : Accès complet, actions sensibles (suppression, gestion équipe)
- **`tech`** (technicien) : Accès lecture/écriture sur événements, incidents, équipements
- **`viewer`** (observateur) : Accès lecture seule

**Protection côté frontend :**
```typescript
// Hook useRole()
const { hasRole } = useRole();

if (!hasRole('rg')) {
  return <p>Accès refusé. Rôle régisseur requis.</p>;
}
```

**Protection côté backend :**
```go
func DeleteTeamMember(c *fiber.Ctx) error {
    user := c.Locals("user").(User)
    if user.Role != "rg" {
        return c.Status(403).JSON(fiber.Map{"error": "Forbidden: role 'rg' required"})
    }
    // ... logic suppression
}
```

### 6.3 Validation et sanitization

**Frontend :**
- Validation formulaires via `src/lib/validation.ts`
- Helpers : `validateRequiredText`, `isDateRangeInvalid`, `normalizeText`
- Pas d'exécution de code utilisateur (XSS protection native React)

**Backend :**
- Validation struct avec `go-playground/validator`
- Sanitization des entrées (trim, escape)
- Pas d'injection SQL (NoSQL + paramétrisé)
- Limites de taille (body max 10MB, champs max 1000 caractères)

### 6.4 HTTPS et CORS

**Production :**
- HTTPS obligatoire (certificat Let's Encrypt)
- CORS configuré pour autoriser uniquement le domaine frontend
- Headers de sécurité : `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`

**Développement :**
- HTTP localhost autorisé
- CORS `*` pour faciliter le développement

---

## 7. Performance et optimisation

### 7.1 Frontend

**Optimisations :**
- **Code splitting** : React.lazy() + Suspense pour routes
- **Tree shaking** : Vite élimine le code non utilisé
- **Minification** : Bundle JS/CSS minifié en production
- **Compression** : Gzip/Brotli activé sur serveur
- **Lazy loading images** : Pas d'images dans le MVP actuel (futur)

**Métriques cibles :**
- Bundle JS principal < 500 KB (gzippé)
- Bundle 3D < 300 KB (Three.js + R3F)
- First Contentful Paint (FCP) < 1.5s
- Time to Interactive (TTI) < 3s

### 7.2 Backend

**Optimisations :**
- **Go compiled** : Binaire natif, pas d'interpréteur
- **Connection pooling** : Pool de connexions CouchDB (max 100)
- **Caching** : Cache en mémoire pour données fréquemment lues (futur)
- **Compression réponses** : Gzip sur réponses > 1KB

**Métriques cibles (Benchmark M4) :**
- Latence p50 < 50ms
- Latence p95 < 200ms
- Latence p99 < 500ms
- Throughput > 10 000 req/s

### 7.3 Base de données

**Optimisations :**
- **Indexation** : Views CouchDB pour requêtes fréquentes
- **Compaction** : Compaction automatique des bases (libérer espace)
- **Sharding** : Si croissance importante (futur)

---

## 8. Déploiement et exploitation

### 8.1 Architecture de déploiement (Docker Compose)

**Fichier `docker-compose.yml` :**
```yaml
version: '3.8'

services:
  frontend:
    build: ./StageOps_Web
    ports:
      - "8080:80"
    environment:
      - VITE_API_URL=http://localhost:3000
    depends_on:
      - backend

  backend:
    build: ./StageOps-backend
    ports:
      - "3000:3000"
    environment:
      - COUCHDB_URL=http://couchdb:5984
      - JWT_SECRET=<secret>
    depends_on:
      - couchdb

  couchdb:
    image: couchdb:3.3
    ports:
      - "5984:5984"
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=<password>
    volumes:
      - couchdb-data:/opt/couchdb/data

volumes:
  couchdb-data:
```

**Commandes :**
```bash
# Build et démarrage
docker compose up --build

# Arrêt
docker compose down

# Logs
docker compose logs -f backend
```

### 8.2 Environnements

| Environnement | URL | Usage |
|---------------|-----|-------|
| Développement | http://localhost:8080 | Dev local |
| Staging | https://staging.stageops.io | Tests pré-prod |
| Production | https://app.stageops.io | Environnement live |

### 8.3 Observabilité

**Logs :**
- Frontend : `localStorage` (audit log) + erreurs console
- Backend : Logs structurés JSON (stdout)
- CouchDB : Logs natifs CouchDB

**Métriques (futur) :**
- Prometheus + Grafana pour métriques backend
- Sentry pour monitoring erreurs frontend

---

## 9. Tests et qualité

### 9.1 Stratégie de tests

**Frontend :**
- **Tests unitaires** : Vitest pour helpers, services, hooks
- **Tests composants** : React Testing Library (futur)
- **Tests E2E** : Playwright pour workflows critiques (futur)

**Backend :**
- **Tests unitaires** : Go test pour handlers, utils
- **Tests d'intégration** : Tests API avec base de test (futur)
- **Tests de charge** : k6 ou wrk (benchmark M4)

### 9.2 Pipeline qualité

```bash
# Lint frontend
cd StageOps_Web && npm run lint

# Tests frontend
cd StageOps_Web && npm run test

# Build frontend
cd StageOps_Web && npm run build

# Tests backend
cd StageOps-backend && go test ./...

# Build backend
cd StageOps-backend && go build -o server cmd/server/main.go
```

**CI/CD (futur) :**
- GitHub Actions : Lint + Test + Build sur chaque PR
- Déploiement automatique staging sur merge `main`
- Déploiement production manuel avec tag de version

---

## 10. Évolutions futures

### 10.1 Roadmap technique

**Phase 3 (Mai-Juin 2026) :**
- Sync offline-first fonctionnelle (PouchDB ↔ CouchDB)
- Workflows guidés (check-ups techniques standardisés)
- Export rapports PDF (événements, incidents)

**Phase 4 (Juillet 2026) :**
- Tests E2E complets (Playwright)
- CI/CD avec benchmarks automatiques
- Monitoring production (Prometheus + Grafana + Sentry)
- Documentation utilisateur finale (guides, vidéos)

**Phase 5 (Post-juillet 2026) :**
- Application mobile (React Native ou PWA)
- Notifications push temps réel (WebSocket ou SSE)
- Intégrations externes (calendriers, outils existants)
- IA prédictive (prévision pannes équipements basée sur historique)

### 10.2 Dette technique identifiée

- Pas de tests E2E actuellement → Priorité phase 4
- Pas de monitoring production → Priorité phase 4
- Sync offline-first pas implémentée → Priorité phase 3
- Refresh token pas implémenté → Sécurité à améliorer

---

## 11. Annexes

### Annexe A : Décisions architecturales (ADR)

**ADR-001 : Choix de Go Fiber pour le backend**
- **Contexte** : Besoin de performances optimales (latence, RAM)
- **Décision** : Go Fiber (vs Express.js, Django, Spring Boot)
- **Justification** : Benchmark M4 — meilleur compromis perf/latence/RAM
- **Conséquences** : Courbe d'apprentissage Go, mais gains perf significatifs

**ADR-002 : Architecture offline-first avec CouchDB**
- **Contexte** : Contraintes réseau (zones blanches, instabilité)
- **Décision** : CouchDB + PouchDB pour sync bidirectionnelle
- **Justification** : Benchmark M3 — meilleur pour offline-first
- **Conséquences** : Complexité sync, gestion conflits

**ADR-003 : Three.js + React Three Fiber pour 3D**
- **Contexte** : Besoin de rendu 3D performant en navigateur
- **Décision** : Three.js avec wrapper R3F
- **Justification** : Benchmark M1 — FPS stable, bundle optimisé
- **Conséquences** : Courbe d'apprentissage 3D, mais flexible

### Annexe B : Glossaire technique

- **JWT** : JSON Web Token (standard d'authentification)
- **RBAC** : Role-Based Access Control (contrôle d'accès par rôle)
- **CORS** : Cross-Origin Resource Sharing (partage de ressources cross-origin)
- **Offline-first** : Architecture privilégiant le fonctionnement sans réseau
- **HMR** : Hot Module Replacement (rechargement à chaud Vite)
- **MapReduce** : Modèle de programmation pour traitement distribué (CouchDB)
- **FCP** : First Contentful Paint (métrique performance web)
- **TTI** : Time to Interactive (métrique performance web)

### Annexe C : Références

- Go Fiber Documentation : https://docs.gofiber.io/
- CouchDB Documentation : https://docs.couchdb.org/
- Three.js Documentation : https://threejs.org/docs/
- React Three Fiber : https://docs.pmnd.rs/react-three-fiber/
- Benchmark M1 (Frontend 3D) : https://github.com/StageOps-EIP/StageOps/wiki/02-Benchmark-Frontend-3D-(M1)
- Benchmark M4 (Backend) : https://github.com/StageOps-EIP/StageOps/wiki/05-Benchmark-Backend-&-Débit-(M4)

---

**Fin du Dossier d'Architecture Technique**  
**Version 1.0 — Mars 2026**
