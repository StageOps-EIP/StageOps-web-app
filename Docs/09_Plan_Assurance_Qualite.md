# Plan d'Assurance Qualité (PAQ) — StageOps

**Projet :** StageOps — Plateforme de gestion technique multi-théâtres  
**Version :** 1.0  
**Date :** Mars 2026  
**Auteur :** Équipe StageOps / Epitech EIP

---

## 1. Introduction

### 1.1 Objectif du document

Ce Plan d'Assurance Qualité (PAQ) définit les processus, standards et responsabilités pour garantir la qualité du produit StageOps à toutes les étapes du cycle de développement. Il couvre :
- Les standards de qualité et critères d'acceptation
- Les processus de revue de code et validation
- Les métriques de qualité et leur suivi
- Les rôles et responsabilités de l'équipe
- La gestion des non-conformités et actions correctives

---

### 1.2 Portée

**Périmètre couvert :**
- Code source (frontend React, backend Go)
- Documentation technique et utilisateur
- Tests (unitaires, intégration, E2E, performance, sécurité)
- Déploiement et exploitation (Docker, CI/CD)
- Accessibilité et conformité réglementaire (WCAG 2.1 AA)

**Hors périmètre :**
- Qualité des données métier (responsabilité utilisateurs)
- Infrastructure serveur (responsabilité hébergeur)

---

## 2. Standards de qualité

### 2.1 Standards de développement

#### 2.1.1 Frontend (React + TypeScript)

**Convention de code :**
- ESLint configuré (`@typescript-eslint/recommended`, `react-hooks/recommended`)
- Prettier pour formatage automatique (2 espaces, single quotes, trailing commas)
- Règles spécifiques :
  - Pas de `any` TypeScript (sauf cas exceptionnels justifiés)
  - Hooks React : respecter les règles (`useEffect` cleanup, dépendances complètes)
  - Pas de `console.log` en production (utiliser logger structuré)

**Commande vérification :**
```bash
npm run lint       # Linter ESLint
npm run type-check # Vérification TypeScript (tsc --noEmit)
```

**Cible :** 0 erreur ESLint, 0 erreur TypeScript

---

#### 2.1.2 Backend (Go)

**Convention de code :**
- `gofmt` (formatage automatique Go)
- `golangci-lint` (agrégateur de linters)
- Règles spécifiques :
  - Tous les exports documentés (godoc)
  - Gestion explicite des erreurs (pas de `_` silencieux)
  - Pas de `panic` sauf cas exceptionnel (préférer `error`)

**Commande vérification :**
```bash
gofmt -l .                  # Vérifier formatage
golangci-lint run ./...     # Linter complet
go vet ./...                # Analyse statique Go
```

**Cible :** 0 issue golangci-lint

---

### 2.2 Standards de documentation

**Documentation code :**
- Tous les modules/fonctions publics documentés (JSDoc frontend, godoc backend)
- Exemples d'utilisation pour fonctions complexes
- Commentaires inline uniquement si logique non évidente

**Documentation technique :**
- Architecture : DAT (Dossier Architecture Technique) à jour
- API : Swagger/OpenAPI (futur) ou documentation Markdown
- Déploiement : Guide de déploiement à jour (versions, dépendances)

**Documentation utilisateur :**
- Manuel utilisateur complet (cf. `06_Manuel_Utilisateur.md`)
- Captures d'écran à jour (refaites après chaque redesign UI majeur)

---

### 2.3 Standards de tests

**Couverture cible :**
- Frontend : ≥ 80% couverture code (fonctions critiques 100%)
- Backend : ≥ 80% couverture code (handlers, middleware, auth)

**Types de tests requis par feature :**
1. **Tests unitaires** : Fonctions pures, helpers, logique métier
2. **Tests intégration** : API endpoints (backend ↔ CouchDB)
3. **Tests E2E** : Parcours utilisateur critiques (P0 uniquement)

**Critère de succès :**
- 100% tests passent en CI/CD avant merge sur `main`
- Aucun test flakey (échoue aléatoirement) toléré

---

### 2.4 Standards de sécurité

**Checklist pré-release :**
- [ ] Scan vulnérabilités dépendances (`npm audit`, `govulncheck`) : 0 critique/haute
- [ ] Secrets jamais committés (vérification `.env`, `.gitignore`)
- [ ] HTTPS forcé en production
- [ ] Headers sécurité configurés (Helmet backend)
- [ ] Rate limiting activé (endpoints login, API)
- [ ] JWT sécurisé (HMAC-SHA256, secret fort, expiration 24h)
- [ ] Mots de passe hachés (bcrypt, cost 12)
- [ ] RBAC appliqué (frontend + backend)

---

## 3. Processus de développement

### 3.1 Workflow Git

**Branches :**
- `main` : Production (toujours stable, déployable)
- `develop` : Intégration continue (features merged ici)
- `feature/<nom>` : Développement feature (branche depuis `develop`)
- `fix/<nom>` : Corrections bugs urgents (branche depuis `main`)

**Cycle de vie feature :**
```
1. Créer branche depuis develop
   git checkout develop
   git pull
   git checkout -b feature/nom-feature

2. Développer + tests + commits
   git add .
   git commit -m "feat: description feature"

3. Push + ouvrir Pull Request vers develop
   git push origin feature/nom-feature

4. Code review (≥1 approbation requise)

5. Merge si CI/CD vert + approbation
```

---

### 3.2 Commits conventionnels

**Format :** `<type>(<scope>): <description>`

**Types autorisés :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation uniquement
- `style`: Formatage (pas de changement logique)
- `refactor`: Refactoring (pas de changement fonctionnel)
- `test`: Ajout/modification tests
- `chore`: Maintenance (deps, config)

**Exemples :**
```
feat(events): add multi-day events display in calendar
fix(incidents): resolve Kanban drag-and-drop issue on mobile
docs(readme): update installation instructions
test(validation): add edge cases for date range validator
```

**Règle :** Tous les commits sur `main` et `develop` doivent suivre ce format (vérification pre-commit hook).

---

### 3.3 Code review

**Objectifs :**
- Garantir qualité du code (lisibilité, maintenabilité)
- Détecter bugs/régressions avant merge
- Partager connaissance technique (pair programming asynchrone)
- Vérifier conformité aux standards

**Checklist reviewer :**
- [ ] Code conforme aux conventions (ESLint/golangci-lint passent)
- [ ] Tests écrits et passent (couverture adéquate)
- [ ] Pas de `TODO` ou `FIXME` non justifiés
- [ ] Pas de code mort (commentaires, imports inutilisés)
- [ ] Gestion d'erreur explicite (pas de silencieux)
- [ ] Documentation à jour si changement API/fonctionnalité
- [ ] Pas de régression (tests existants passent)
- [ ] Performance acceptable (pas de boucles O(n²) évitables, etc.)

**Process :**
1. Reviewer ouvre PR, examine diff
2. Commentaires inline si améliorations nécessaires
3. Statut : **Approve** (OK) / **Request changes** (modifications requises) / **Comment** (questions)
4. Auteur corrige si nécessaire, push nouveau commit
5. Reviewer re-vérifie
6. Merge si ≥ 1 approbation + CI/CD vert

---

### 3.4 CI/CD (Intégration continue)

**Pipeline GitHub Actions** (`.github/workflows/ci.yml`) :

```yaml
name: CI/CD

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  # Job 1 : Lint + Type-check frontend
  frontend-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd StageOps_Web && npm ci
      - run: cd StageOps_Web && npm run lint
      - run: cd StageOps_Web && npm run type-check

  # Job 2 : Tests unitaires frontend
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd StageOps_Web && npm ci
      - run: cd StageOps_Web && npm run test -- --coverage
      - name: Coverage report
        uses: codecov/codecov-action@v3

  # Job 3 : Tests backend
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v4
        with:
          go-version: '1.22'
      - run: cd StageOps-backend && go test ./... -cover

  # Job 4 : Tests E2E (Playwright)
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

  # Job 5 : Scan sécurité
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd StageOps_Web && npm audit --audit-level=high
      - uses: actions/setup-go@v4
        with:
          go-version: '1.22'
      - run: go install golang.org/x/vuln/cmd/govulncheck@latest
      - run: cd StageOps-backend && govulncheck ./...
```

**Critères de passage :**
- Tous les jobs verts (exit code 0)
- Pas de régression de couverture (≥ couverture précédente)
- Aucune vulnérabilité critique/haute

---

## 4. Métriques de qualité

### 4.1 Métriques de code

| Métrique | Outil | Cible | Fréquence mesure |
|----------|-------|-------|------------------|
| Couverture tests unitaires | Vitest, Go cover | ≥ 80% | Chaque PR |
| Complexité cyclomatique | ESLint, gocyclo | ≤ 10 par fonction | Hebdomadaire |
| Duplication code | SonarQube (futur) | < 5% | Mensuelle |
| Dette technique | SonarQube (futur) | < 5 jours | Mensuelle |
| Issues linter | ESLint, golangci-lint | 0 | Chaque PR |

---

### 4.2 Métriques de performance

| Métrique | Outil | Cible | Fréquence mesure |
|----------|-------|-------|------------------|
| Temps chargement initial (FCP) | Lighthouse | < 1.5s | Hebdomadaire |
| Taille bundle JS | Vite build stats | < 500 KB gzip | Hebdomadaire |
| Latence API (p95) | K6 load test | < 200ms | Hebdomadaire |
| FPS rendu 3D | Benchmark custom | ≥ 55 FPS | Hebdomadaire |
| Consommation RAM backend | Docker stats | < 256 MB | Hebdomadaire |

---

### 4.3 Métriques de tests

| Métrique | Outil | Cible | Fréquence mesure |
|----------|-------|-------|------------------|
| Taux réussite tests unitaires | Vitest, Go test | 100% | Chaque PR |
| Taux réussite tests E2E | Playwright | 100% | Chaque PR |
| Tests flakey | Playwright retry analysis | 0 | Hebdomadaire |
| Durée exécution tests E2E | Playwright report | < 5 min | Hebdomadaire |

---

### 4.4 Métriques de sécurité

| Métrique | Outil | Cible | Fréquence mesure |
|----------|-------|-------|------------------|
| Vulnérabilités critiques/hautes | npm audit, govulncheck | 0 | Hebdomadaire |
| Score OWASP ZAP | ZAP baseline scan | 0 alerte haute | Mensuelle |
| Rotation secrets (JWT_SECRET) | Manuel | ≤ 90 jours | Trimestrielle |

---

### 4.5 Dashboard de suivi

**Outils recommandés :**
- **SonarQube** : Dette technique, duplication, complexité, couverture
- **Codecov** : Couverture de code + évolution
- **Datadog CI Visibility** : Dashboard centralisé tests + métriques build
- **GitHub Insights** : Pull requests, code review time, throughput

**KPIs clés à suivre (hebdomadaire) :**
1. Couverture de code (frontend + backend)
2. Nombre de vulnérabilités ouvertes (critique/haute)
3. Temps moyen de résolution bug
4. Taux de réussite CI/CD (% builds verts)

---

## 5. Gestion des non-conformités

### 5.1 Classification des anomalies

**Sévérité :**
- **Bloquant** : Crash application, perte de données, faille sécurité critique
- **Majeur** : Fonctionnalité P0 inopérante, régression importante
- **Mineur** : Bug UI, erreur console, comportement incorrect non bloquant
- **Cosmétique** : Typo, alignement, couleur non conforme

**Priorité de résolution :**
- **Bloquant** : Hotfix immédiat (< 4h), release patch
- **Majeur** : Correction sous 48h, intégré prochaine release
- **Mineur** : Correction sous 1 semaine, backlog sprint
- **Cosmétique** : Backlog, prochaine release mineure

---

### 5.2 Processus de remontée d'anomalie

**Canal :** GitHub Issues avec template structuré

**Template issue bug :**
```markdown
### Description du bug
[Description claire et concise]

### Étapes de reproduction
1. Aller sur '...'
2. Cliquer sur '....'
3. Observer '....'

### Comportement attendu
[Ce qui devrait se passer]

### Comportement observé
[Ce qui se passe réellement]

### Environnement
- OS : [Windows 11, macOS 14, Ubuntu 22.04]
- Navigateur : [Chrome 120, Firefox 110, Safari 17]
- Version app : [1.0.2]

### Captures d'écran / Logs
[Si applicable, joindre captures d'écran ou logs console]

### Sévérité proposée
- [ ] Bloquant
- [ ] Majeur
- [ ] Mineur
- [ ] Cosmétique
```

**Workflow :**
1. Utilisateur/QA crée issue avec template
2. Lead dev valide et assigne sévérité/priorité
3. Issue assignée à un dev (sprint planning ou hotfix)
4. Dev corrige → ouvre PR avec référence issue (`fix #123`)
5. Code review + tests
6. Merge → Issue auto-close (via `fix #123` dans commit)
7. QA vérifie correction en staging
8. Déploiement production

---

### 5.3 Métriques de gestion des bugs

| Métrique | Cible | Fréquence mesure |
|----------|-------|------------------|
| Temps moyen résolution (bloquant) | < 4h | Mensuelle |
| Temps moyen résolution (majeur) | < 48h | Mensuelle |
| Taux de réouverture bugs | < 5% | Mensuelle |
| Nombre bugs bloquants en production | 0 | Hebdomadaire |

---

## 6. Processus de validation

### 6.1 Validation pré-release

**Checklist avant release en staging :**
- [ ] Tous les tests passent (unitaires, intégration, E2E)
- [ ] Couverture de code ≥ cible (80%)
- [ ] Aucune vulnérabilité critique/haute ouverte
- [ ] Linter propre (0 erreur)
- [ ] Documentation à jour (changelog, manuel utilisateur si changements)
- [ ] Benchmark performance exécuté (pas de régression > 10%)
- [ ] Tests accessibilité axe-core (0 violation WCAG 2.1 AA)

**Checklist avant release en production :**
- [ ] Toutes vérifications staging OK
- [ ] Tests manuels exploratory (régisseur + 1 tech)
- [ ] Backup base de données effectué
- [ ] Rollback plan documenté (commit hash stable précédent)
- [ ] Monitoring activé (Uptime, Datadog, etc.)
- [ ] Annonce utilisateurs (email/notification si changements breaking)

---

### 6.2 Tests d'acceptation utilisateur (UAT)

**Phase UAT (avant release 1.0) :**
1. **Recrutement testeurs** : 3 régisseurs généraux + 5 techniciens de théâtres partenaires
2. **Formation** : Session 1h présentation app + guide utilisateur
3. **Tests libres** : 2 semaines d'utilisation en conditions réelles (théâtre test)
4. **Scénarios guidés** :
   - Créer 5 événements, vérifier calendrier
   - Signaler 3 incidents, changer statuts
   - Ajouter 10 équipements, filtrer par catégorie/statut
   - Tester offline-first : couper réseau, créer événement, reconnecter
5. **Feedback** : Questionnaire SUS (System Usability Scale) + interviews
6. **Corrections** : Bugs critiques/majeurs corrigés avant release

**Critères de succès UAT :**
- Score SUS ≥ 70/100 (acceptable)
- 0 bug bloquant/majeur signalé
- Fonction offline validée par 100% testeurs
- Taux satisfaction ≥ 80% (scale 1-5 : ≥ 4)

---

## 7. Rôles et responsabilités

### 7.1 Équipe qualité

| Rôle | Responsabilités | Personne |
|------|-----------------|----------|
| **Lead QA** | - Définir stratégie tests<br>- Piloter métriques qualité<br>- Valider releases<br>- Gérer non-conformités | [Nom] |
| **QA Engineer** | - Écrire/maintenir tests E2E<br>- Exécuter tests manuels<br>- Reporter bugs<br>- Valider corrections | [Nom] |
| **Lead Dev** | - Code review<br>- Valider PRs<br>- Garantir standards code<br>- Mentor équipe dev | [Nom] |
| **Développeurs** | - Écrire tests unitaires<br>- Corriger bugs assignés<br>- Participer code reviews<br>- Documenter code | Équipe |

---

### 7.2 Matrice RACI

| Activité | Lead QA | QA Engineer | Lead Dev | Devs |
|----------|---------|-------------|----------|------|
| Définition stratégie tests | **R** | C | C | I |
| Écriture tests E2E | C | **R** | I | I |
| Écriture tests unitaires | I | C | C | **R** |
| Code review | C | I | **R** | A |
| Validation release | **A** | R | C | I |
| Correction bugs | I | C | C | **R** |
| Suivi métriques qualité | **R** | C | C | I |

**Légende :**
- **R** : Responsible (réalise)
- **A** : Accountable (responsable final)
- **C** : Consulted (consulté)
- **I** : Informed (informé)

---

## 8. Formation et montée en compétence

### 8.1 Formation initiale (onboarding)

**Nouveaux développeurs :**
- Jour 1 : Setup environnement (Docker, IDE, extensions)
- Jour 2 : Architecture app (présentation DAT, codebase tour)
- Jour 3 : Standards qualité (conventions code, process PR, tests)
- Jour 4-5 : Première feature guidée (pair programming avec lead dev)

**Ressources :**
- Documentation projet complète (`Docs_Projet/`)
- Session enregistrée présentation architecture
- Checklist onboarding (GitHub wiki)

---

### 8.2 Formation continue

**Veille technologique (mensuelle) :**
- 1 présentation tech par un membre de l'équipe (30 min)
- Sujets : nouvelle bibliothèque, pattern architecture, retour d'expérience

**Formations externes (recommandées) :**
- Accessibilité web (WCAG 2.1) : Formation 2 jours
- Sécurité web (OWASP) : Formation 2 jours
- Tests automatisés (Playwright, Vitest) : Formation 1 jour

---

## 9. Amélioration continue

### 9.1 Rétrospectives sprint (bi-hebdomadaires)

**Format :**
1. **What went well** (5 min) : Positif du sprint
2. **What didn't go well** (5 min) : Difficultés, bugs
3. **What can we improve** (10 min) : Actions concrètes
4. **Action items** (5 min) : Assignation actions (1-2 max)

**Exemple action items :**
- "Temps CI/CD trop long (12 min) → Optimiser cache npm (assigné : Dev A)"
- "Tests E2E flakey → Ajouter retry + attentes explicites (assigné : QA Engineer)"

---

### 9.2 Revue qualité trimestrielle

**Agenda (2h) :**
1. Revue métriques qualité (30 min)
   - Évolution couverture de code
   - Évolution dette technique
   - Bugs en production (nombre, sévérité, temps résolution)
2. Revue process (30 min)
   - Efficacité code review (temps moyen, blocages)
   - Taux de succès CI/CD
3. Bilan sécurité (30 min)
   - Vulnérabilités corrigées
   - Pentest externe (si réalisé)
4. Actions d'amélioration (30 min)
   - Définir 2-3 actions prioritaires
   - Assigner responsables + deadline

---

### 9.3 Audit externe (annuel)

**Périmètre :**
- Audit code (qualité, maintenabilité) par consultant externe
- Pentest sécurité (OWASP Top 10) par expert sécurité
- Audit accessibilité (WCAG 2.1 AA) par auditeur certifié

**Livrables :**
- Rapport d'audit avec score/note
- Liste des non-conformités (priorisées)
- Plan d'action correctif (timeline 6 mois)

---

## 10. Annexes

### Annexe A : Outils qualité

| Catégorie | Outil | Usage |
|-----------|-------|-------|
| Tests unitaires | Vitest, Go test | Frontend + Backend |
| Tests E2E | Playwright | Parcours utilisateur |
| Couverture code | Vitest coverage, Go cover | Métriques couverture |
| Linter | ESLint, golangci-lint | Conventions code |
| Formatage | Prettier, gofmt | Formatage automatique |
| Sécurité | npm audit, govulncheck, OWASP ZAP | Scan vulnérabilités |
| Performance | Lighthouse, K6 | Chargement, charge API |
| Accessibilité | axe-core, WAVE | Conformité WCAG |
| CI/CD | GitHub Actions | Pipeline automatisé |
| Monitoring | Datadog, UptimeRobot | Production |

---

### Annexe B : Références

**Standards :**
- Clean Code (Robert C. Martin)
- WCAG 2.1 Level AA : https://www.w3.org/WAI/WCAG21/quickref/
- OWASP Top 10 : https://owasp.org/www-project-top-ten/

**Bonnes pratiques :**
- Google Engineering Practices : https://google.github.io/eng-practices/
- Conventional Commits : https://www.conventionalcommits.org/
- Testing Best Practices (Kent C. Dodds) : https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

### Annexe C : Templates

**Template PR (Pull Request) :**
```markdown
## Description
[Description des changements]

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Refactoring
- [ ] Documentation

## Checklist
- [ ] Tests écrits/mis à jour
- [ ] Linter passe
- [ ] Documentation mise à jour
- [ ] Tests E2E ajoutés (si applicable)
- [ ] Revue accessibilité (si changements UI)

## Screenshots (si UI)
[Captures d'écran avant/après]
```

---

**Fin du Plan d'Assurance Qualité**  
**Version 1.0 — Mars 2026**
