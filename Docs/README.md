# Documentation Projet StageOps — Index

**Projet :** StageOps — Plateforme de gestion technique multi-théâtres  
**Version :** 1.0  
**Date :** Mars 2026  
**Auteur :** Équipe StageOps / Epitech EIP

---

## 📋 Vue d'ensemble

Ce dossier contient l'intégralité de la documentation technique et fonctionnelle du projet StageOps, conçue pour répondre aux exigences du **critère C3 du référentiel RNCP** (*Expert en architecture informatique*) : 

> *"Le dossier du candidat présente un corpus de documentations des spécifications techniques et fonctionnelles définissant le périmètre du projet considérant les contraintes identifiées durant l'audit."*

**Composition du corpus :**
- **9 documents principaux** (~6400 lignes, 216 KB)
- Couvre l'intégralité du cycle de vie du projet (spécifications → développement → déploiement → exploitation)
- Intègre les contraintes terrain (audits M1-M6) et les décisions techniques (benchmarks)

---

## 📚 Documents disponibles

### 1. Spécifications fonctionnelles

| Document | Taille | Description |
|----------|--------|-------------|
| **[01_Cahier_Des_Charges_Fonctionnel.md](./01_Cahier_Des_Charges_Fonctionnel.md)** | 456 lignes<br>20 KB | **Cahier des charges fonctionnel complet**<br>Contexte projet, objectifs métier, périmètre fonctionnel (P0/P1/P2), contraintes terrain (zones blanches, multi-théâtres), user stories, workflows, règles métier, critères d'acceptation. |

---

### 2. Spécifications techniques

| Document | Taille | Description |
|----------|--------|-------------|
| **[02_Dossier_Architecture_Technique_DAT.md](./02_Dossier_Architecture_Technique_DAT.md)** | 814 lignes<br>32 KB | **Dossier d'Architecture Technique (DAT)**<br>Architecture globale (frontend/backend/DB), stack technique (React 18, Go Fiber, CouchDB), patterns offline-first, sécurité (JWT, RBAC, bcrypt), performance (optimisations bundle, latence API), déploiement Docker, ADRs (Architecture Decision Records). |
| **[04_Directives_Securite_API.md](./04_Directives_Securite_API.md)** | 698 lignes<br>20 KB | **Directives de sécurité API**<br>Authentification JWT (HMAC-SHA256, expiration 24h), hachage bcrypt (cost 12), RBAC (rg/tech/viewer), protection injections (NoSQL, Command), rate limiting, headers sécurité (Helmet), HTTPS, audit trail, gestion CVE, OWASP Top 10. |
| **[03_Referentiel_Accessibilite_WCAG.md](./03_Referentiel_Accessibilite_WCAG.md)** | 636 lignes<br>20 KB | **Référentiel accessibilité WCAG 2.1 AA**<br>Conformité WCAG (Perceptible, Operable, Understandable, Robust), checklist composants (formulaires, modaux, navigation), tests automatisés (axe-core), tests manuels (lecteurs d'écran), plan d'action (skip-links, aria-live). |

---

### 3. Traçabilité et validation

| Document | Taille | Description |
|----------|--------|-------------|
| **[05_Matrice_Traçabilite_C3.md](./05_Matrice_Traçabilite_C3.md)** | 420 lignes<br>32 KB | **Matrice de traçabilité C3**<br>Traçabilité complète : exigences → implémentation → tests. 95 exigences (85 implémentées, 7 partielles, 3 futures), couverture par module (Dashboard, Events, Incidents, Equipment, Auth, Team, Settings, Profile, 3D), contraintes non fonctionnelles (performance, accessibilité, sécurité, offline-first), traçabilité audits M1-M6. |
| **[08_Strategie_Tests.md](./08_Strategie_Tests.md)** | 1015 lignes<br>28 KB | **Stratégie de tests complète**<br>Pyramide de tests (70% unitaires, 20% intégration, 10% E2E), périmètre (Vitest frontend, Go test backend, Playwright E2E), exemples de tests, benchmarks performance (Lighthouse, K6, FPS 3D), tests accessibilité (axe-core), tests sécurité (OWASP ZAP, govulncheck), CI/CD. |
| **[09_Plan_Assurance_Qualite.md](./09_Plan_Assurance_Qualite.md)** | 653 lignes<br>20 KB | **Plan d'Assurance Qualité (PAQ)**<br>Standards qualité (conventions code, couverture tests ≥80%, 0 vulnérabilité critique), processus (Git workflow, commits conventionnels, code review, CI/CD), métriques (KPIs qualité, performance, sécurité), gestion non-conformités, rôles/responsabilités (RACI), amélioration continue (rétrospectives, audits). |

---

### 4. Documentation utilisateur et déploiement

| Document | Taille | Description |
|----------|--------|-------------|
| **[06_Manuel_Utilisateur.md](./06_Manuel_Utilisateur.md)** | 827 lignes<br>24 KB | **Manuel utilisateur complet**<br>Guide pas-à-pas pour régisseurs et techniciens : connexion, navigation interface, gestion événements (calendrier, création, modification), gestion incidents (Kanban, signalement), gestion équipements (filtres, maintenance), gestion équipe (rôles, permissions), travail hors ligne, accessibilité (navigation clavier, lecteurs d'écran), troubleshooting. |
| **[07_Guide_Deploiement.md](./07_Guide_Deploiement.md)** | 869 lignes<br>20 KB | **Guide de déploiement**<br>Déploiement Docker Compose (configuration, variables env, Nginx reverse proxy, SSL Let's Encrypt), déploiement manuel (frontend Vite, backend Go, CouchDB), monitoring (logs, Prometheus/Grafana, Uptime), backups CouchDB (automatiques cron), mises à jour (rollback, migrations), sécurité production (firewall UFW, Fail2Ban), troubleshooting. |

---

## 🎯 Usage par rôle

### Pour les **évaluateurs RNCP (C3)** :

**Critère C3 : Corpus de spécifications techniques et fonctionnelles**

1. **Spécifications fonctionnelles** :
   - Consulter `01_Cahier_Des_Charges_Fonctionnel.md` (contexte, objectifs, scope P0/P1/P2, contraintes terrain)
   
2. **Spécifications techniques** :
   - Consulter `02_Dossier_Architecture_Technique_DAT.md` (architecture, stack, sécurité, performance)
   - Consulter `04_Directives_Securite_API.md` (JWT, RBAC, OWASP Top 10)
   
3. **Traçabilité** :
   - Consulter `05_Matrice_Traçabilite_C3.md` (95 exigences → code → tests)
   
4. **Intégration des contraintes audit** :
   - Section 6 de `05_Matrice_Traçabilite_C3.md` : Traçabilité audits M1-M6 (Three.js, CouchDB offline-first, Go Fiber latence, accessibilité)

---

### Pour les **développeurs** :

1. **Comprendre l'architecture** : `02_Dossier_Architecture_Technique_DAT.md`
2. **Conventions code et qualité** : `09_Plan_Assurance_Qualite.md` (section 2)
3. **Écrire des tests** : `08_Strategie_Tests.md`
4. **Standards sécurité** : `04_Directives_Securite_API.md`
5. **Process Git/PR** : `09_Plan_Assurance_Qualite.md` (section 3)

---

### Pour les **utilisateurs finaux** (régisseurs, techniciens) :

1. **Guide complet** : `06_Manuel_Utilisateur.md` (connexion, gestion événements/incidents/équipements, offline, accessibilité)

---

### Pour les **administrateurs système** :

1. **Déploiement** : `07_Guide_Deploiement.md` (Docker Compose, Nginx, SSL, backups)
2. **Sécurité production** : `04_Directives_Securite_API.md` (section 7, 9, 10)
3. **Monitoring** : `07_Guide_Deploiement.md` (section 4)

---

### Pour les **QA / testeurs** :

1. **Stratégie de tests** : `08_Strategie_Tests.md` (unitaires, E2E, performance, sécurité)
2. **Checklist validation** : `09_Plan_Assurance_Qualite.md` (section 6.1)
3. **Gestion bugs** : `09_Plan_Assurance_Qualite.md` (section 5)

---

## 📊 Statistiques du corpus

**Volume :**
- **9 documents** principaux
- **6 388 lignes** totales
- **216 KB** (texte brut Markdown)

**Couverture :**
- ✅ Spécifications fonctionnelles (P0/P1/P2) : 100%
- ✅ Spécifications techniques (architecture, sécurité, accessibilité) : 100%
- ✅ Traçabilité exigences → code : 95 exigences mappées (89% implémentées)
- ✅ Contraintes audit : 6 audits (M1-M6) intégrés et tracés
- ✅ Documentation utilisateur : Guide complet 14 chapitres
- ✅ Documentation déploiement : Docker Compose + manuel + troubleshooting
- ✅ Tests : Stratégie complète (unitaires, E2E, perf, sécu, a11y)
- ✅ Qualité : PAQ complet (standards, métriques, process, amélioration continue)

---

## 🔗 Documents complémentaires

**Hors dossier `Docs_Projet/` mais référencés :**

1. **Benchmark C3** :
   - `StageOps_Web/benchmark/c3-specifications.md` — Corpus C3 auto-généré (scope fonctionnel, stack, accessibilité, traçabilité)
   - `StageOps_Web/benchmark/latest.json` — Métriques techniques (bundle, latence API, FPS 3D)

2. **GitHub Wiki** :
   - https://github.com/StageOps-EIP/StageOps/wiki
   - Pages M1-M6 : Audits techniques avec décisions benchmarkées

3. **Plan d'action solution** :
   - `INNOVATION_TRACK_ACTION_PLAN.md` (racine projet) — Contexte EIP, user stories, milestones

4. **Code source commenté** :
   - `StageOps_Web/src/` — Frontend React (composants, services, hooks)
   - `StageOps-backend/` — Backend Go (handlers, middleware, auth)

---

## 🛠️ Maintenance de la documentation

**Responsabilité :** Lead Dev + Lead QA

**Fréquence de mise à jour :**
- **À chaque release majeure** (1.x) : Revue complète DAT, matrice traçabilité, manuel utilisateur
- **À chaque release mineure** (1.x.y) : Mise à jour guide déploiement si changements infra/config
- **Hebdomadaire** : Mise à jour matrice traçabilité si nouvelles features/exigences

**Process de mise à jour :**
1. Modification document → PR dédiée (label `documentation`)
2. Review par Lead Dev + Lead QA
3. Merge sur `main`
4. Génération PDF si nécessaire (via Pandoc ou LaTeX)

---

## 📝 Génération PDF (optionnel)

**Commande Pandoc (exemple pour DAT) :**
```bash
pandoc 02_Dossier_Architecture_Technique_DAT.md \
  -o 02_DAT.pdf \
  --toc \
  --toc-depth=3 \
  --metadata title="Dossier Architecture Technique - StageOps" \
  --metadata author="Équipe StageOps / Epitech EIP" \
  --metadata date="Mars 2026" \
  -V geometry:margin=2cm \
  -V documentclass=report \
  -V fontsize=11pt
```

**Ou via LaTeX (si template custom) :**
```bash
pandoc 02_Dossier_Architecture_Technique_DAT.md \
  -o 02_DAT.tex
pdflatex 02_DAT.tex
```

---

## 📧 Contact

**Pour questions sur la documentation :**
- **Lead Dev** : [email protected]
- **Lead QA** : [email protected]
- **Responsable EIP** : [email protected]

**Pour signaler erreur/coquille :**
- Ouvrir issue GitHub avec label `documentation`
- Ou créer PR avec corrections (suivre convention commits)

---

## 📜 Historique des versions

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0 | Mars 2026 | Création initiale du corpus complet (9 documents, 6388 lignes) |

---

**Fin de l'Index de Documentation**  
**StageOps — Version 1.0 — Mars 2026**
