# Cahier des Charges Fonctionnel — StageOps

**Projet :** StageOps — Plateforme de gestion technique multi-théâtres  
**Version :** 1.0  
**Date :** Mars 2026  
**Auteur :** Équipe StageOps / Epitech EIP

---

## 1. Contexte et problématique

### 1.1 Situation actuelle

Les régies techniques et équipes de production événementielle gèrent actuellement leurs opérations à travers des outils fragmentés :
- Tableurs Excel pour les inventaires matériels
- Applications de messagerie instantanée pour la coordination
- Documents papier pour les check-ups techniques
- Communication orale pour les incidents urgents

Cette fragmentation entraîne :
- **Faible traçabilité** des actions et décisions
- **Risques opérationnels** (oublis, doublons, conflits d'usage matériel)
- **Perte de temps** lors des montages et démontages
- **Dépendance aux connaissances individuelles** (mémoire des techniciens expérimentés)

### 1.2 Problématique centrale

**Comment fournir aux régies techniques un centre de contrôle unifié qui améliore la fiabilité opérationnelle tout en restant simple, accessible et fonctionnel dans un environnement contraint (zones blanches, locaux techniques confinés) ?**

---

## 2. Objectifs du projet

### 2.1 Objectif général

Développer une plateforme web centralisée permettant de gérer l'ensemble du cycle opérationnel technique d'événements : planification, coordination matériel, incidents, équipe, avec une visualisation 3D optionnelle de la scène.

### 2.2 Objectifs spécifiques

1. **Centraliser l'information** : Dashboard unique avec vue d'ensemble opérationnelle
2. **Tracer les incidents** : Système de signalement avec sévérité, statut et résolution
3. **Gérer les équipements** : Inventaire centralisé avec état, localisation et historique
4. **Coordonner l'équipe** : Gestion des rôles et actions sensibles selon permissions
5. **Visualiser la scène** : Représentation 3D des équipements sur scène (optionnel)
6. **Assurer la robustesse** : Fonctionnement offline, retry automatique, logs d'audit

---

## 3. Périmètre fonctionnel

### 3.1 Modules prioritaires (P0 — Critique)

#### 3.1.1 Authentification et gestion de session
**Description :** Système d'authentification JWT permettant la connexion, l'enregistrement et la gestion de session utilisateur.

**Fonctionnalités :**
- Connexion avec email/mot de passe
- Enregistrement de nouveaux utilisateurs
- Récupération du profil utilisateur authentifié
- Déconnexion et invalidation de session
- Reset automatique du token sur erreur 401

**Routes :**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`

#### 3.1.2 Dashboard opérationnel
**Description :** Vue d'ensemble centralisée affichant les KPI et alertes opérationnelles en temps réel.

**Fonctionnalités :**
- Nombre total d'événements actifs
- Incidents en cours par sévérité (critique/élevée/moyenne/faible)
- Équipements nécessitant une attention (maintenance, panne)
- Événements à venir dans les 7 prochains jours
- Indicateurs de disponibilité équipe

**Route :**
- `GET /` (page principale)

#### 3.1.3 Gestion des événements
**Description :** Module de création, édition, suppression et suivi des événements techniques.

**Fonctionnalités :**
- Créer un nouvel événement (nom, dates début/fin, lieu, description)
- Lister tous les événements avec filtres (date, statut, lieu)
- Modifier un événement existant
- Supprimer un événement
- Validation cohérence des dates (début < fin)
- Statuts : Planifié / En cours / Terminé / Annulé

**Routes :**
- `GET /events` (liste)
- `POST /events` (création)
- `PUT /events/:id` (modification)
- `DELETE /events/:id` (suppression)

#### 3.1.4 Gestion des incidents
**Description :** Système de déclaration, suivi et résolution des incidents techniques.

**Fonctionnalités :**
- Déclarer un incident (titre, description, sévérité, équipement concerné)
- Affecter un incident à un membre de l'équipe
- Suivre le cycle de vie (Ouvert → En cours → Résolu → Fermé)
- Filtrer par sévérité (critique/élevée/moyenne/faible)
- Historique complet des changements de statut
- Commentaires et notes internes

**Routes :**
- `GET /incidents` (liste)
- `POST /incidents` (création)
- `PUT /incidents/:id` (mise à jour statut/assignation)
- `DELETE /incidents/:id` (suppression)

**Niveaux de sévérité :**
- **Critique** : Blocage complet de la production
- **Élevée** : Impact significatif sur les opérations
- **Moyenne** : Gêne opérationnelle sans blocage
- **Faible** : Inconfort mineur ou observation

---

### 3.2 Modules secondaires (P1 — Important)

#### 3.2.1 Gestion de l'équipe
**Description :** Administration des membres de l'équipe avec gestion des rôles et permissions.

**Fonctionnalités :**
- Ajouter un nouveau membre (nom, email, rôle, spécialités)
- Modifier les informations d'un membre
- Supprimer un membre
- Gérer les rôles : `rg` (régisseur général — admin), `tech` (technicien), `viewer` (observateur)
- Actions sensibles protégées par RBAC (ajout/suppression/modification sensible)

**Routes :**
- `GET /team` (liste)
- `POST /team` (ajout)
- `PUT /team/:id` (modification)
- `DELETE /team/:id` (suppression — réservé au rôle `rg`)

#### 3.2.2 Gestion des équipements
**Description :** Inventaire centralisé du matériel technique avec état, localisation et historique.

**Fonctionnalités :**
- Créer une fiche équipement (nom, catégorie, état, localisation, numéro de série)
- Modifier l'état d'un équipement (Disponible / En utilisation / Maintenance / Hors service)
- Suivre la localisation (zone de stockage, scène, en transit)
- Historique des mouvements et utilisations
- Alertes maintenance préventive (basé sur durée d'utilisation)
- Catégories : Éclairage, Son, Vidéo, Structure, Électricité, Autre

**Routes :**
- `GET /equipment` (liste avec filtres)
- `POST /equipment` (création)
- `PUT /equipment/:id` (modification)
- `DELETE /equipment/:id` (suppression)

---

### 3.3 Modules avancés (P2 — Optionnel)

#### 3.3.1 Vue scène 3D
**Description :** Visualisation 3D interactive de la scène avec positionnement des équipements.

**Fonctionnalités :**
- Rendu 3D de la scène avec Three.js
- Affichage des équipements positionnés sur scène
- Navigation caméra (orbite, zoom, pan)
- Détection de collisions visuelles (alerte superposition)
- Export de la vue en image

**Route :**
- `GET /stage` (page de visualisation)

#### 3.3.2 Éditeur de scène 3D
**Description :** Outil d'édition avancé pour placer, déplacer, et configurer les équipements sur la scène 3D.

**Fonctionnalités :**
- Mode édition : Translate / Rotate / Scale
- Ajout d'objets 3D (lumières, structures, équipements)
- Historique d'actions avec Undo/Redo
- Sauvegarde de la scène en localStorage
- Export/Import de configuration scène (JSON)

**Route :**
- `GET /editor` (page éditeur)

#### 3.3.3 Profil utilisateur et paramètres
**Description :** Gestion du profil personnel et préférences utilisateur.

**Fonctionnalités :**
- Modifier mot de passe
- Préférences d'affichage (thème clair/sombre — si implémenté)
- Notifications et alertes personnalisées
- Historique personnel des actions

**Routes :**
- `GET /profile` (page profil)
- `GET /settings` (page paramètres)

---

## 4. Exigences non fonctionnelles

### 4.1 Performance
- Temps de réponse API < 500ms pour 95% des requêtes
- FPS stable à 60 sur la vue 3D (sur navigateurs récents)
- Bundle JS frontend < 1 MB (gzippé)
- Temps de chargement initial < 3 secondes

### 4.2 Disponibilité et fiabilité
- Fonctionnement offline pour les opérations de consultation
- Retry automatique (2 tentatives) sur échec API critique
- Timeout API : 10 secondes
- Logs d'audit persistés localement en localStorage
- Synchronisation différée des actions offline (quand réseau revient)

### 4.3 Sécurité
- Authentification JWT avec expiration (24h)
- HTTPS obligatoire en production
- RBAC frontend pour actions sensibles
- Validation côté serveur de toutes les entrées
- Protection CSRF (tokens)
- Logs d'audit complets (qui/quoi/quand)

### 4.4 Accessibilité (WCAG 2.1 AA)
- Labels explicites sur tous les champs de formulaire
- Navigation clavier complète
- Contraste minimum 4.5:1 (texte normal)
- Modales avec focus trap et rôle ARIA
- Messages d'erreur avec `aria-live`
- Skip-links pour navigation rapide

### 4.5 Compatibilité
- Navigateurs modernes : Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Responsive design : Desktop (priorité), Tablette (support), Mobile (futur)
- Support écrans haute résolution (HiDPI)

---

## 5. Contraintes techniques identifiées (Audit M5)

### 5.1 Contraintes environnementales

| Contrainte | Impact sur architecture | Solution adoptée |
|------------|------------------------|------------------|
| Zones blanches / réseau instable | Impossibilité de dépendre du temps réel | Architecture offline-first, sync par deltas |
| Murs épais, locaux techniques confinés | Couverture réseau faible | CouchDB avec réplication incrémentale |
| Pratiques papier dominantes | Résistance au changement | UX simple, fiable, pas de complexité inutile |
| Faible luminosité en régie | Lisibilité réduite | Contraste WCAG AA, modes adaptatifs |

### 5.2 Retours utilisateurs terrain

**Points de douleur identifiés :**
1. **Inventaires papier incomplets ou non mis à jour** → Module équipement centralisé avec statut temps réel
2. **Check-ups techniques non standardisés** → Workflows guidés (futur)
3. **Maintenance réactive au lieu de préventive** → Alertes maintenance basées sur usage
4. **Communication informelle (oral)** → Incidents tracés avec historique

---

## 6. User stories principales

### US1 : Dashboard opérationnel
**En tant que** régisseur général,  
**Je veux** voir sur un seul écran les KPI critiques (événements actifs, incidents en cours, équipements en alerte),  
**Afin de** prendre des décisions rapides sans consulter plusieurs outils.

**Critères d'acceptation :**
- Affichage du nombre d'événements à venir dans les 7 jours
- Compteurs incidents par sévérité (critique/élevée/moyenne/faible)
- Liste des équipements nécessitant une attention (maintenance/panne)
- Temps de chargement < 2 secondes

---

### US2 : Signalement incident
**En tant que** technicien,  
**Je veux** déclarer un incident en spécifiant la sévérité et l'équipement concerné,  
**Afin que** l'équipe soit informée et que l'incident soit tracé jusqu'à résolution.

**Critères d'acceptation :**
- Formulaire avec titre, description, sévérité, équipement (optionnel)
- Validation des champs obligatoires
- Notification visuelle de succès après création
- Incident visible immédiatement dans la liste

---

### US3 : Gestion inventaire équipement
**En tant que** technicien,  
**Je veux** consulter l'état et la localisation de chaque équipement,  
**Afin de** savoir rapidement où trouver le matériel dont j'ai besoin.

**Critères d'acceptation :**
- Liste filtrable par catégorie, état, localisation
- Fiche détaillée avec historique des mouvements
- Modification de l'état et de la localisation en temps réel
- Alerte visuelle pour équipements nécessitant maintenance

---

### US4 : Gestion équipe avec RBAC
**En tant que** régisseur général (rôle `rg`),  
**Je veux** ajouter, modifier ou supprimer des membres de l'équipe,  
**Afin de** contrôler les accès aux fonctions sensibles.

**Critères d'acceptation :**
- Actions d'ajout/suppression réservées au rôle `rg`
- Modification de rôle avec confirmation explicite
- Message d'erreur clair si utilisateur non autorisé tente une action sensible
- Historique des modifications d'équipe (futur)

---

### US5 : Visualisation scène 3D
**En tant que** régisseur,  
**Je veux** voir une représentation 3D de la scène avec les équipements positionnés,  
**Afin de** planifier visuellement les montages et détecter les conflits d'espace.

**Critères d'acceptation :**
- Rendu 3D fluide (60 FPS)
- Navigation caméra intuitive (orbite/zoom/pan)
- Chargement de la scène < 3 secondes
- Détection visuelle des superpositions (alerte rouge si collision)

---

## 7. Scénarios d'usage typiques

### Scénario 1 : Préparation d'un événement
1. Le régisseur se connecte au dashboard
2. Il crée un nouvel événement "Concert 25 mars"
3. Il consulte la liste des équipements disponibles (catégorie Son + Éclairage)
4. Il identifie un équipement en maintenance et reporte son utilisation
5. Il visualise la scène 3D pour planifier le positionnement des enceintes
6. Il sauvegarde la configuration et partage le lien à l'équipe

### Scénario 2 : Gestion d'un incident en production
1. Un technicien repère un projecteur défaillant pendant une répétition
2. Il déclare un incident avec sévérité "Élevée" via son mobile
3. Le régisseur reçoit l'alerte sur le dashboard
4. Il assigne l'incident à un technicien spécialisé
5. Le technicien intervient, met à jour le statut "En cours" → "Résolu"
6. Le régisseur ferme l'incident et met l'équipement en "Maintenance préventive"

### Scénario 3 : Check-up post-événement
1. Le régisseur consulte l'historique de l'événement terminé
2. Il vérifie les incidents survenus pendant l'événement
3. Il consulte les équipements utilisés et leur état actuel
4. Il identifie 2 équipements nécessitant une maintenance
5. Il met à jour leur statut et déclenche les actions préventives
6. Il exporte un rapport de fin d'événement (futur)

---

## 8. Règles métier et validation

### 8.1 Événements
- La date de début doit être antérieure à la date de fin
- Un événement ne peut être supprimé que s'il n'a pas encore débuté (ou avec confirmation explicite)
- Le nom de l'événement est obligatoire (max 100 caractères)
- La description est optionnelle (max 500 caractères)

### 8.2 Incidents
- Sévérité obligatoire parmi : Critique / Élevée / Moyenne / Faible
- Titre obligatoire (max 100 caractères)
- Description obligatoire (min 10 caractères, max 1000 caractères)
- Un incident ne peut être supprimé que s'il est au statut "Fermé" ou par un utilisateur `rg`
- Historique des changements de statut conservé

### 8.3 Équipements
- Nom obligatoire (max 100 caractères)
- Catégorie obligatoire parmi liste prédéfinie
- État obligatoire parmi : Disponible / En utilisation / Maintenance / Hors service
- Localisation optionnelle (max 100 caractères)
- Numéro de série unique (si renseigné)

### 8.4 Équipe
- Email unique et validé (format email)
- Rôle obligatoire parmi : `rg` / `tech` / `viewer`
- Nom obligatoire (max 100 caractères)
- Un utilisateur ne peut pas supprimer son propre compte
- Seul le rôle `rg` peut supprimer des membres

---

## 9. Priorisation et planning

### Phase 1 : MVP (Milestone 1 — Mars 2026)
- ✅ Authentification JWT
- ✅ Dashboard de base
- ✅ Gestion événements (CRUD complet)
- ✅ Gestion incidents (CRUD complet)
- ✅ Gestion équipe (CRUD avec RBAC basique)

### Phase 2 : Consolidation (Milestone 2 — Avril 2026)
- ✅ Gestion équipements (CRUD complet + historique)
- ✅ Vue scène 3D opérationnelle
- ✅ Robustesse API (retry/timeout/logs)
- ✅ Accessibilité WCAG AA (labels, modales, contraste)

### Phase 3 : Avancé (Milestone 3 — Mai-Juin 2026)
- Éditeur 3D avec Undo/Redo
- Sync offline-first fonctionnelle (CouchDB)
- Workflows guidés (check-ups)
- Export rapports PDF

### Phase 4 : Industrialisation (Milestone 4 — Juillet 2026)
- Tests E2E complets (Playwright)
- CI/CD avec benchmarks automatiques
- Monitoring production (observabilité)
- Documentation utilisateur finale

---

## 10. Critères de succès

### Critères fonctionnels
- ✅ Tous les modules P0 et P1 opérationnels
- ✅ Workflows utilisateurs principaux testés et validés
- ✅ Pas de bugs critiques bloquants en production

### Critères techniques
- ✅ Performance API < 500ms p95
- ✅ FPS 3D stable à 60
- ✅ Accessibilité WCAG 2.1 AA validée
- ✅ Traçabilité complète (logs audit)

### Critères utilisateur
- Retours terrain positifs sur la simplicité d'usage
- Temps de formation < 30 minutes pour un utilisateur non technique
- Réduction mesurable du temps de préparation d'événement (cible : -20%)

---

## 11. Annexes

### Annexe A : Glossaire
- **Dashboard** : Vue d'ensemble centralisée des indicateurs opérationnels
- **Incident** : Événement non planifié nécessitant une intervention
- **Équipement** : Matériel technique utilisé pour les événements
- **RBAC** : Role-Based Access Control (contrôle d'accès par rôle)
- **JWT** : JSON Web Token (standard d'authentification)
- **P0/P1/P2** : Niveaux de priorité (0=critique, 1=important, 2=optionnel)

### Annexe B : Références
- Wiki GitHub — Audit Fonctionnel (M5) : https://github.com/StageOps-EIP/StageOps/wiki/01-Audit-Fonctionnel-(M5)
- Benchmark Frontend 3D (M1) : https://github.com/StageOps-EIP/StageOps/wiki/02-Benchmark-Frontend-3D-(M1)
- WCAG 2.1 Guidelines : https://www.w3.org/WAI/WCAG21/quickref/

---

**Fin du Cahier des Charges Fonctionnel**  
**Version 1.0 — Mars 2026**
