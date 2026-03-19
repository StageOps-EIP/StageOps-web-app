# Directives de Sécurité API — StageOps

**Projet :** StageOps — Plateforme de gestion technique multi-théâtres  
**Version :** 1.0  
**Date :** Mars 2026  
**Auteur :** Équipe StageOps / Epitech EIP

---

## 1. Introduction

### 1.1 Objectif du document

Ce document définit les directives de sécurité applicables à l'API backend de StageOps. Il couvre :
- L'authentification et l'autorisation
- La protection contre les vulnérabilités courantes (OWASP Top 10)
- La gestion des secrets et des configurations sensibles
- Les bonnes pratiques de logging et d'audit
- Les tests de sécurité et la gestion des vulnérabilités

### 1.2 Périmètre

**API concernée :**
- Backend Go Fiber (`StageOps-backend`)
- Toutes les routes `/api/*`
- Base de données CouchDB

**Menaces couvertes :**
- Injection (SQL/NoSQL, Command injection)
- Authentification et session brisées
- Exposition de données sensibles
- Contrôle d'accès défaillant
- Mauvaise configuration sécurité
- Cross-Site Scripting (XSS)
- Désérialisation non sécurisée
- Composants avec vulnérabilités connues
- Logging et monitoring insuffisants

---

## 2. Authentification et autorisation

### 2.1 Authentification JWT

#### 2.1.1 Génération du token

**Algorithme :** HMAC-SHA256 (HS256)  
**Durée de vie :** 24 heures  
**Secret :** Variable d'environnement `JWT_SECRET` (min 32 caractères)

**Payload JWT :**
```json
{
  "sub": "user_123",          // User ID (subject)
  "email": "user@example.com",
  "role": "rg",               // User role (rg, tech, viewer)
  "iat": 1711000000,          // Issued at (timestamp)
  "exp": 1711086400           // Expiration (24h après iat)
}
```

**Code Go (génération) :**
```go
import (
    "time"
    "github.com/golang-jwt/jwt/v4"
)

type Claims struct {
    UserID string `json:"sub"`
    Email  string `json:"email"`
    Role   string `json:"role"`
    jwt.RegisteredClaims
}

func GenerateToken(user User) (string, error) {
    claims := Claims{
        UserID: user.ID,
        Email:  user.Email,
        Role:   user.Role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}
```

#### 2.1.2 Validation du token

**Middleware JWT :**
```go
func JWTMiddleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        authHeader := c.Get("Authorization")
        if authHeader == "" {
            return c.Status(401).JSON(fiber.Map{"error": "Missing Authorization header"})
        }

        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        if tokenString == authHeader {
            return c.Status(401).JSON(fiber.Map{"error": "Invalid Authorization format"})
        }

        token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
            if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method")
            }
            return []byte(os.Getenv("JWT_SECRET")), nil
        })

        if err != nil || !token.Valid {
            return c.Status(401).JSON(fiber.Map{"error": "Invalid or expired token"})
        }

        claims, ok := token.Claims.(*Claims)
        if !ok {
            return c.Status(401).JSON(fiber.Map{"error": "Invalid token claims"})
        }

        // Injecter l'utilisateur dans le contexte
        c.Locals("user", claims)
        return c.Next()
    }
}
```

**Points de sécurité :**
- ✅ Vérification de la signature (HMAC-SHA256)
- ✅ Vérification de l'expiration automatique (`exp`)
- ✅ Vérification de la méthode de signature (prévention attaque "none")
- ✅ Pas de token en query string (uniquement header Authorization)

#### 2.1.3 Gestion des secrets

**Rotation du secret JWT :**
- Secret JWT changé tous les 3 mois (minimum)
- Utilisation de secrets forts (générés aléatoirement, min 32 caractères)
- Jamais commité dans le code source (`.env` en `.gitignore`)

**Génération secret sécurisé :**
```bash
openssl rand -base64 32
```

**Stockage :**
- Développement : Fichier `.env` local (non commité)
- Production : Variables d'environnement système ou gestionnaire de secrets (ex: AWS Secrets Manager, HashiCorp Vault)

---

### 2.2 Hachage des mots de passe

**Algorithme :** bcrypt  
**Cost factor :** 12 (équilibre sécurité/performance)

**Code Go (hachage) :**
```go
import "golang.org/x/crypto/bcrypt"

func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
    return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
```

**Exigences mots de passe :**
- Longueur minimum : 8 caractères
- Au moins 1 majuscule, 1 minuscule, 1 chiffre
- Pas de mots du dictionnaire courants
- Pas de réutilisation des 3 derniers mots de passe (futur)

**Validation côté backend :**
```go
import "regexp"

func ValidatePassword(password string) error {
    if len(password) < 8 {
        return errors.New("password must be at least 8 characters")
    }
    if !regexp.MustCompile(`[a-z]`).MatchString(password) {
        return errors.New("password must contain at least one lowercase letter")
    }
    if !regexp.MustCompile(`[A-Z]`).MatchString(password) {
        return errors.New("password must contain at least one uppercase letter")
    }
    if !regexp.MustCompile(`[0-9]`).MatchString(password) {
        return errors.New("password must contain at least one digit")
    }
    return nil
}
```

---

### 2.3 Contrôle d'accès basé sur les rôles (RBAC)

#### 2.3.1 Rôles définis

| Rôle | Code | Permissions |
|------|------|-------------|
| Régisseur général | `rg` | Toutes permissions (CRUD complet, gestion équipe) |
| Technicien | `tech` | CRUD événements, incidents, équipements (lecture équipe) |
| Observateur | `viewer` | Lecture seule sur toutes entités |

#### 2.3.2 Middleware RBAC

```go
func RequireRole(allowedRoles ...string) fiber.Handler {
    return func(c *fiber.Ctx) error {
        user, ok := c.Locals("user").(*Claims)
        if !ok {
            return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
        }

        for _, role := range allowedRoles {
            if user.Role == role {
                return c.Next()
            }
        }

        return c.Status(403).JSON(fiber.Map{
            "error": fmt.Sprintf("Forbidden: role '%s' required", strings.Join(allowedRoles, "' or '")),
        })
    }
}
```

**Usage :**
```go
// Supprimer un membre d'équipe (rôle 'rg' uniquement)
app.Delete("/api/team/:id", JWTMiddleware(), RequireRole("rg"), handlers.DeleteTeamMember)

// Créer un événement (rôles 'rg' et 'tech')
app.Post("/api/events/", JWTMiddleware(), RequireRole("rg", "tech"), handlers.CreateEvent)

// Lire les événements (tous les rôles authentifiés)
app.Get("/api/events/", JWTMiddleware(), handlers.ListEvents)
```

---

## 3. Protection contre les injections

### 3.1 Injection NoSQL (CouchDB)

**Risque :** CouchDB est moins vulnérable que SQL car pas de requêtes dynamiques, mais reste exposé aux injections via views MapReduce mal construites.

**Bonnes pratiques :**
- ✅ Jamais construire des requêtes CouchDB avec de la concaténation de chaînes utilisateur
- ✅ Utiliser les requêtes paramétrées du client Go CouchDB
- ✅ Valider et sanitizer toutes les entrées utilisateur

**Code sécurisé (exemple Get By ID) :**
```go
func GetEventByID(db *kivik.DB, eventID string) (*Event, error) {
    // Validation ID (empêche injection caractères spéciaux)
    if !regexp.MustCompile(`^[a-zA-Z0-9_-]+$`).MatchString(eventID) {
        return nil, errors.New("invalid event ID format")
    }

    row := db.Get(context.TODO(), eventID)
    var event Event
    if err := row.ScanDoc(&event); err != nil {
        return nil, err
    }
    return &event, nil
}
```

**Code vulnérable (À ÉVITER) :**
```go
// ❌ NE JAMAIS FAIRE : Concaténation directe input utilisateur
query := fmt.Sprintf(`{"selector": {"name": "%s"}}`, userInput) // VULNÉRABLE
```

---

### 3.2 Command Injection

**Risque :** Exécution de commandes système avec input utilisateur.

**Règle :** **Jamais exécuter de commandes système avec input utilisateur non validé.**

**Si nécessaire (futur — export PDF, etc.) :**
- Utiliser une whitelist stricte de commandes autorisées
- Valider tous les paramètres (regex, longueur max)
- Utiliser `exec.Command()` avec arguments séparés (pas via shell)

**Code sécurisé :**
```go
// ✅ Bon : Arguments séparés, pas de shell
cmd := exec.Command("convert", validatedInputPath, validatedOutputPath)
output, err := cmd.CombinedOutput()

// ❌ VULNÉRABLE : Shell avec input utilisateur
cmd := exec.Command("sh", "-c", fmt.Sprintf("convert %s %s", userInput, output)) // DANGEREUX
```

---

## 4. Protection contre XSS (Cross-Site Scripting)

### 4.1 Contexte

**Frontend React :**
- Protection XSS native : React échappe automatiquement le contenu dans JSX
- Risque résiduel : `dangerouslySetInnerHTML` (à éviter absolument)

**Backend API :**
- Pas de rendu HTML côté backend (API JSON pure)
- Risque faible, mais sanitization recommandée pour noms/descriptions

### 4.2 Sanitization des entrées

**Bibliothèque recommandée :** `bluemonday` (Go HTML sanitizer)

```bash
go get github.com/microcosm-cc/bluemonday
```

**Code :**
```go
import "github.com/microcosm-cc/bluemonday"

func SanitizeInput(input string) string {
    p := bluemonday.StrictPolicy()
    return p.Sanitize(input)
}

// Usage dans handlers
func CreateEvent(c *fiber.Ctx) error {
    var req CreateEventRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
    }

    // Sanitize inputs
    req.Name = SanitizeInput(req.Name)
    req.Description = SanitizeInput(req.Description)
    req.Location = SanitizeInput(req.Location)

    // ... suite logique
}
```

---

## 5. Protection CSRF (Cross-Site Request Forgery)

### 5.1 Stratégie

**Tokens CSRF non nécessaires avec JWT :**
- JWT stocké en `localStorage` (pas en cookie)
- Header `Authorization` requis pour chaque requête
- Attaque CSRF impossible car navigateur n'envoie pas automatiquement les headers custom

**Si migration vers cookies (futur) :**
- Utiliser le middleware Fiber CSRF
- Token CSRF dans cookie HttpOnly + SameSite=Strict
- Validation token côté backend

---

## 6. Rate Limiting et protection DoS

### 6.1 Middleware Rate Limiter

**Bibliothèque :** Fiber built-in limiter

```go
import "github.com/gofiber/fiber/v2/middleware/limiter"

app.Use(limiter.New(limiter.Config{
    Max:        100,               // 100 requêtes max
    Expiration: 1 * time.Minute,   // par minute
    KeyGenerator: func(c *fiber.Ctx) string {
        return c.IP() // Limite par IP
    },
    LimitReached: func(c *fiber.Ctx) error {
        return c.Status(429).JSON(fiber.Map{
            "error": "Too many requests. Please try again later.",
        })
    },
}))
```

**Limites recommandées :**
- Endpoints publics (login, register) : 10 requêtes/min par IP
- Endpoints authentifiés : 100 requêtes/min par IP
- Endpoints sensibles (suppression) : 20 requêtes/min par utilisateur

---

## 7. HTTPS et headers de sécurité

### 7.1 HTTPS obligatoire en production

**Configuration serveur (derrière reverse proxy Nginx/Caddy) :**
```go
// Rediriger HTTP → HTTPS
app.Use(func(c *fiber.Ctx) error {
    if c.Protocol() != "https" && os.Getenv("ENV") == "production" {
        return c.Redirect("https://" + c.Hostname() + c.OriginalURL())
    }
    return c.Next()
})
```

**Certificat SSL :**
- Production : Let's Encrypt (automatique avec Caddy)
- Staging : Let's Encrypt staging
- Développement : Self-signed (accepté uniquement localhost)

---

### 7.2 Headers de sécurité

**Middleware Helmet (équivalent Go) :**
```go
import "github.com/gofiber/fiber/v2/middleware/helmet"

app.Use(helmet.New(helmet.Config{
    XSSProtection:             "1; mode=block",
    ContentTypeNosniff:        "nosniff",
    XFrameOptions:             "DENY",
    HSTSMaxAge:                31536000,
    HSTSIncludeSubdomains:     true,
    ContentSecurityPolicy:     "default-src 'self'",
    ReferrerPolicy:            "no-referrer",
}))
```

**Headers appliqués :**
- `X-XSS-Protection: 1; mode=block` — Protection XSS navigateur
- `X-Content-Type-Options: nosniff` — Empêche MIME sniffing
- `X-Frame-Options: DENY` — Empêche clickjacking
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` — Force HTTPS
- `Content-Security-Policy: default-src 'self'` — Limite sources de contenu
- `Referrer-Policy: no-referrer` — Pas de fuite referrer

---

## 8. Logging et audit

### 8.1 Logs structurés

**Format :** JSON (compatible outils d'observabilité : ELK, Datadog, etc.)

**Middleware Logger :**
```go
import "github.com/gofiber/fiber/v2/middleware/logger"

app.Use(logger.New(logger.Config{
    Format:     `{"time":"${time}","method":"${method}","path":"${path}","status":${status},"latency":"${latency}","ip":"${ip}","user_agent":"${ua}"}\n`,
    TimeFormat: "2006-01-02T15:04:05Z07:00",
    Output:     os.Stdout,
}))
```

**Exemple log :**
```json
{
  "time": "2026-03-19T10:30:00Z",
  "method": "POST",
  "path": "/api/events/",
  "status": 201,
  "latency": "45ms",
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

---

### 8.2 Audit trail (actions sensibles)

**Actions à logger :**
- ✅ Connexion/déconnexion utilisateur
- ✅ Création/modification/suppression entités
- ✅ Changement de rôle utilisateur
- ✅ Tentatives de connexion échouées (brute-force detection)
- ✅ Accès refusés (403 Forbidden)

**Structure log audit :**
```json
{
  "timestamp": "2026-03-19T10:30:00Z",
  "action": "delete_event",
  "user_id": "user_123",
  "user_email": "admin@example.com",
  "user_role": "rg",
  "resource_type": "event",
  "resource_id": "event_456",
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "result": "success"
}
```

**Code Go (audit log) :**
```go
func AuditLog(action, userID, resourceType, resourceID, result string) {
    log := map[string]interface{}{
        "timestamp":     time.Now().Format(time.RFC3339),
        "action":        action,
        "user_id":       userID,
        "resource_type": resourceType,
        "resource_id":   resourceID,
        "result":        result,
    }
    jsonLog, _ := json.Marshal(log)
    fmt.Println(string(jsonLog)) // Ou écriture fichier/service externe
}

// Usage
AuditLog("delete_event", user.ID, "event", eventID, "success")
```

---

## 9. Gestion des vulnérabilités

### 9.1 Scan de dépendances

**Outils :**
- `go list -m all` — Liste toutes dépendances
- `govulncheck` — Scan vulnérabilités Go (officiel)
- `snyk` — Scan vulnérabilités multi-langages
- Dependabot (GitHub) — Alertes automatiques

**Commande scan :**
```bash
go install golang.org/x/vuln/cmd/govulncheck@latest
govulncheck ./...
```

**Fréquence :**
- Scan automatique hebdomadaire (CI/CD)
- Scan manuel avant chaque release
- Mise à jour dépendances critiques sous 48h après CVE

---

### 9.2 Gestion des CVE

**Process :**
1. **Alerte** : Dependabot ou govulncheck détecte CVE
2. **Évaluation** : Vérifier si vulnérabilité impacte notre usage
3. **Priorité** :
   - Critique/Haute : Patch immédiat (< 24h)
   - Moyenne : Patch sous 7 jours
   - Faible : Patch dans prochaine release
4. **Mise à jour** : `go get -u <package>@<version>`
5. **Test** : Suite de tests complète avant déploiement
6. **Déploiement** : Staging → Production

---

## 10. Tests de sécurité

### 10.1 Tests unitaires sécurité

**Exemples tests :**
```go
func TestJWTValidation_ExpiredToken(t *testing.T) {
    expiredToken := generateExpiredToken()
    req := httptest.NewRequest("GET", "/api/events/", nil)
    req.Header.Set("Authorization", "Bearer "+expiredToken)

    resp, _ := app.Test(req)
    assert.Equal(t, 401, resp.StatusCode)
}

func TestRBAC_UnauthorizedRole(t *testing.T) {
    techToken := generateTokenWithRole("tech")
    req := httptest.NewRequest("DELETE", "/api/team/123", nil)
    req.Header.Set("Authorization", "Bearer "+techToken)

    resp, _ := app.Test(req)
    assert.Equal(t, 403, resp.StatusCode)
}

func TestPasswordValidation_WeakPassword(t *testing.T) {
    err := ValidatePassword("weak")
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "at least 8 characters")
}
```

---

### 10.2 Tests de pénétration (Pentesting)

**Outils recommandés :**
- **OWASP ZAP** — Scan automatique vulnérabilités web
- **Burp Suite** — Proxy HTTP pour tests manuels
- **SQLMap** — Test injection SQL/NoSQL (futur si changement DB)

**Scénarios à tester :**
1. **Authentification bypass** :
   - Token JWT modifié
   - Token expiré
   - Pas de token

2. **Élévation de privilèges** :
   - Utilisateur `tech` tente action `rg`
   - Modification du rôle dans payload JWT

3. **Injection** :
   - Caractères spéciaux dans champs texte
   - Payload NoSQL dans filtres

4. **Rate limiting** :
   - Brute-force login (100+ requêtes/min)

5. **CORS** :
   - Requêtes depuis origine non autorisée

**Fréquence :**
- Pentest automatique (ZAP) : Hebdomadaire en CI/CD
- Pentest manuel : Avant chaque release majeure
- Pentest externe (audit) : Annuellement

---

## 11. Checklist sécurité pré-déploiement

### 11.1 Avant chaque release

- [ ] Scan vulnérabilités dépendances (`govulncheck`)
- [ ] Tests unitaires sécurité passés (100% OK)
- [ ] Pentest automatique ZAP sans vulnérabilité critique/haute
- [ ] Secrets jamais committés (vérification `.env`, `.gitignore`)
- [ ] HTTPS activé en production
- [ ] Headers de sécurité configurés (Helmet)
- [ ] Rate limiting activé
- [ ] Logs audit fonctionnels
- [ ] Backup base de données configuré
- [ ] Plan de réponse incident documenté

---

## 12. Réponse aux incidents de sécurité

### 12.1 Process

1. **Détection** : Alerte automatique (logs, monitoring) ou signalement utilisateur
2. **Isolation** : Bloquer accès attaquant (IP ban, révocation token si nécessaire)
3. **Évaluation** : Analyser logs, déterminer impact (données compromises ?)
4. **Remédiation** : Patch vulnérabilité, reset tokens si nécessaire
5. **Communication** : Informer utilisateurs affectés (si données compromises)
6. **Post-mortem** : Documentation incident, amélioration process

### 12.2 Contacts

**Responsable sécurité :** [email protected]  
**Hotline incidents :** +33 X XX XX XX XX (24/7 si production)

---

## 13. Annexes

### Annexe A : OWASP Top 10 (2021)

| Rang | Vulnérabilité | Couverture StageOps |
|------|---------------|---------------------|
| A01 | Broken Access Control | ✅ RBAC strict, middleware RequireRole |
| A02 | Cryptographic Failures | ✅ bcrypt (password), JWT (sessions), HTTPS |
| A03 | Injection | ✅ Validation inputs, requêtes paramétrées CouchDB |
| A04 | Insecure Design | ✅ Architecture sécurisée par design (offline-first, RBAC) |
| A05 | Security Misconfiguration | ✅ Headers sécurité (Helmet), HTTPS forcé |
| A06 | Vulnerable Components | ✅ Scan dépendances automatique (govulncheck) |
| A07 | Authentication Failures | ✅ JWT robuste, bcrypt, validation mdp stricte |
| A08 | Software and Data Integrity | ✅ Validation inputs, pas de désérialisation non sécurisée |
| A09 | Logging and Monitoring Failures | ✅ Logs structurés, audit trail |
| A10 | Server-Side Request Forgery | ✅ Pas de requêtes sortantes avec input utilisateur |

### Annexe B : Références

- OWASP Top 10 : https://owasp.org/www-project-top-ten/
- OWASP API Security : https://owasp.org/www-project-api-security/
- Go Security Cheat Sheet : https://github.com/OWASP/Go-SCP
- JWT Best Practices : https://tools.ietf.org/html/rfc8725
- bcrypt Specification : https://en.wikipedia.org/wiki/Bcrypt

---

**Fin des Directives de Sécurité API**  
**Version 1.0 — Mars 2026**
