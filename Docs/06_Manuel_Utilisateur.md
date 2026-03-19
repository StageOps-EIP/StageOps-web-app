# Manuel Utilisateur — StageOps

**Projet :** StageOps — Plateforme de gestion technique multi-théâtres  
**Version :** 1.0  
**Date :** Mars 2026  
**Public :** Régisseurs généraux, techniciens, observateurs

---

## 1. Introduction

### 1.1 Qu'est-ce que StageOps ?

StageOps est une plateforme web de gestion technique dédiée aux théâtres et salles de spectacle. Elle permet de :
- 📅 **Gérer les événements** (concerts, pièces, conférences) avec calendrier visuel
- 🚨 **Suivre les incidents** techniques avec tableau Kanban
- 🔧 **Inventorier les équipements** (son, lumière, plateau, vidéo)
- 👥 **Coordonner l'équipe** technique avec gestion des rôles
- 🎭 **Visualiser la scène 3D** pour planifier l'implantation matérielle

**Conçu pour le terrain :** StageOps fonctionne **hors ligne** (zones blanches, tunnels, sous-sols) et synchronise automatiquement quand le réseau revient.

---

### 1.2 Prérequis

**Navigateurs compatibles :**
- Chrome/Edge 100+ (recommandé)
- Firefox 90+
- Safari 15+

**Matériel minimal :**
- Ordinateur : 4 GB RAM, processeur Intel i3/AMD Ryzen 3 (2015+)
- Tablette : iPad Pro 2018+, Samsung Tab S6+
- Connexion internet : Wifi ou 4G (synchronisation), **fonctionne hors ligne** après premier chargement

**Comptes utilisateurs :**
- Créés par le régisseur général (rôle `rg`)
- 3 rôles disponibles : Régisseur général, Technicien, Observateur

---

## 2. Premiers pas

### 2.1 Connexion

1. Ouvrir l'URL StageOps : `https://stageops.votretheâtre.fr`
2. Page de connexion : entrer **email** + **mot de passe**
3. Cliquer **Se connecter**

**Premier login :**
- Email et mot de passe fournis par votre régisseur général
- Changez votre mot de passe dans **Profil** > **Changer le mot de passe**

**Mot de passe oublié :**
- Cliquer **Mot de passe oublié ?** sous le formulaire
- Entrer votre email
- Suivre les instructions dans l'email reçu

---

### 2.2 Interface principale

**Menu latéral (sidebar gauche) :**
- 🏠 **Tableau de bord** — Vue d'ensemble (événements du jour, incidents, stats)
- 📅 **Événements** — Calendrier et liste des événements
- 🚨 **Incidents** — Suivi des incidents techniques (Kanban/Liste)
- 🔧 **Équipements** — Inventaire complet du matériel
- 👥 **Équipe** — Gestion des membres (lecture seule pour `tech` et `viewer`)
- ⚙️ **Paramètres** — Configuration de l'application
- 👤 **Profil** — Informations personnelles

**Zone centrale :**
- Contenu de la page sélectionnée (tableau de bord, calendrier, etc.)

**Indicateur de synchronisation (bas du menu) :**
- 🟢 **En ligne** — Synchronisation active avec le serveur
- 🟠 **Hors ligne** — Travail local, synchronisation différée

---

## 3. Tableau de bord

### 3.1 Vue d'ensemble

Le tableau de bord affiche :

**Statistiques globales (4 cartes en haut) :**
- 📅 **Événements du mois** (total + à venir)
- 🚨 **Incidents actifs** (ouverts + en cours)
- 🔧 **Équipements HS** (hors service)
- 👥 **Membres d'équipe** (total)

**Événement du jour (carte bleue) :**
- Nom de l'événement en cours ou prochain aujourd'hui
- Horaires début-fin
- Bouton **Voir les détails** → ouvre la fiche événement

**Incidents récents (liste) :**
- 5 derniers incidents (tous statuts)
- Badge sévérité : 🟢 Faible, 🟡 Modérée, 🟠 Haute, 🔴 Critique
- Cliquer sur un incident → ouvre la fiche détaillée

**Équipements HS (liste) :**
- Matériel en panne ou en réparation
- Badge statut rouge ou violet
- Cliquer sur un équipement → ouvre la fiche détaillée

**Cercle de préparation :**
- Proportion d'événements **prêts** (statut "préparation complète") sur le total des événements à venir
- Indicateur visuel de l'avancement global

---

## 4. Gestion des événements

### 4.1 Vue calendrier

**Navigation :**
- Flèches **< >** : mois précédent/suivant
- Bouton **Aujourd'hui** : revenir au mois en cours

**Cases du calendrier :**
- Chaque case = 1 jour
- Badge(s) coloré(s) = événement(s) ce jour-là
- Couleur selon statut :
  - 🔵 Bleu : À venir
  - 🟢 Vert : En cours
  - ⚫ Gris : Passé

**Événements multi-jours :**
- Affichés sur toutes les cases concernées (du début à la fin inclus)

**Cliquer sur un événement :**
- Ouvre la fiche détaillée (modale)

---

### 4.2 Vue liste

**Affichage :**
- Tous les événements sous forme de cartes empilées
- Tri chronologique (prochains en premier)

**Filtres :**
- **Statut** : Tous / À venir / En cours / Passé
- **Recherche** : Filtrer par nom d'événement

**Informations affichées :**
- Nom de l'événement
- Dates et horaires (début et fin)
- Lieu
- Catégorie (concert, théâtre, conférence, etc.)
- Statut (badge coloré)

---

### 4.3 Créer un événement

**Qui peut créer :** Régisseur général (`rg`) et Technicien (`tech`)

**Procédure :**
1. Cliquer **+ Nouvel événement** (en haut à droite de la page Événements)
2. Remplir le formulaire :
   - **Nom*** (obligatoire) : Nom de l'événement
   - **Date de début*** : Date + heure de début
   - **Date de fin*** : Date + heure de fin (doit être >= début)
   - **Lieu*** : Nom de la salle (ex: "Salle principale", "Studio 2")
   - **Catégorie*** : Concert, Théâtre, Conférence, Spectacle, Répétition, Autre
   - **Description** (optionnel) : Détails supplémentaires
3. Cliquer **Créer l'événement**

**Validation :**
- Tous les champs avec * sont obligatoires
- Date de fin doit être après date de début
- Si erreur : message en rouge sous le champ concerné

---

### 4.4 Modifier un événement

**Qui peut modifier :** Régisseur général (`rg`) et Technicien (`tech`)

**Procédure :**
1. Cliquer sur l'événement (calendrier ou liste)
2. Fiche détaillée s'ouvre (modale)
3. Cliquer **Modifier** (en bas de la modale)
4. Mode édition activé : modifier les champs
5. Cliquer **Enregistrer** pour sauvegarder les modifications

---

### 4.5 Supprimer un événement

**Qui peut supprimer :** Régisseur général (`rg`) et Technicien (`tech`)

**Procédure :**
1. Ouvrir la fiche détaillée de l'événement
2. Cliquer **Supprimer** (bouton rouge en bas)
3. Confirmation : "Voulez-vous vraiment supprimer cet événement ?"
4. Cliquer **Confirmer** → Événement supprimé définitivement

**⚠️ Attention :** Suppression irréversible (pas de corbeille)

---

## 5. Gestion des incidents

### 5.1 Vue Kanban

**4 colonnes :**
1. **À traiter** : Incidents nouvellement signalés
2. **En cours** : Incidents en cours de résolution
3. **Résolu** : Incidents résolus (attente validation)
4. **Fermé** : Incidents terminés et archivés

**Cartes incident :**
- Titre de l'incident
- Badge sévérité : 🟢 Faible, 🟡 Modérée, 🟠 Haute, 🔴 Critique
- Équipement concerné (si lié)
- Date de création

**Déplacer un incident :**
- **Drag & drop** : cliquer-glisser la carte d'une colonne à l'autre
- **Ou** : ouvrir la fiche → changer le statut dans le sélecteur

---

### 5.2 Vue liste

**Affichage :**
- Tous les incidents sous forme de cartes empilées
- Tri par date de création (plus récents en premier)

**Filtres :**
- **Sévérité** : Tous / Faible / Modérée / Haute / Critique
- **Statut** : Tous / À traiter / En cours / Résolu / Fermé
- **Recherche** : Filtrer par titre d'incident

---

### 5.3 Créer un incident

**Qui peut créer :** Régisseur général (`rg`) et Technicien (`tech`)

**Procédure :**
1. Cliquer **+ Signaler un incident** (en haut à droite de la page Incidents)
2. Remplir le formulaire :
   - **Titre*** : Résumé court de l'incident (ex: "Micro HF 3 ne fonctionne plus")
   - **Description*** : Détails du problème (symptômes, circonstances)
   - **Sévérité*** : Faible / Modérée / Haute / Critique
     - **Critique** : Bloque un événement imminent (< 24h)
     - **Haute** : Impacte fortement un événement
     - **Modérée** : Gêne mais contournable
     - **Faible** : Mineur, pas d'urgence
   - **Équipement concerné** (optionnel) : Sélectionner dans la liste déroulante
3. Cliquer **Signaler**

**Notification :**
- L'incident apparaît dans la colonne "À traiter" (Kanban)
- Email envoyé au régisseur général (si notifications activées)

---

### 5.4 Modifier un incident

**Qui peut modifier :** Régisseur général (`rg`) et Technicien (`tech`)

**Procédure :**
1. Cliquer sur l'incident (Kanban ou liste)
2. Fiche détaillée s'ouvre (modale)
3. Modifier :
   - **Titre**, **Description** : cliquer sur le texte pour éditer
   - **Statut** : sélecteur déroulant (À traiter, En cours, Résolu, Fermé)
   - **Sévérité** : sélecteur déroulant
   - **Équipement** : sélecteur déroulant (peut être modifié ou retiré)
4. Modifications sauvegardées automatiquement en temps réel

---

### 5.5 Résoudre un incident

**Procédure :**
1. Ouvrir la fiche de l'incident
2. Changer le statut à **Résolu** (sélecteur)
3. Ajouter un commentaire de résolution (optionnel, futur)
4. Fermer la fiche → Incident passe dans la colonne "Résolu"

**Validation finale :**
- Le régisseur général valide la résolution
- Passe le statut à **Fermé** → Incident archivé

---

## 6. Gestion des équipements

### 6.1 Tableau des équipements

**Colonnes affichées :**
- **Nom** : Nom de l'équipement (ex: "Projecteur LED 1")
- **ID** : Identifiant unique (ex: "EQ-001")
- **Catégorie** : 🔊 Son, 💡 Lumière, 🎬 Plateau, 📹 Vidéo, 📦 Autre
- **Statut** : 🟢 OK, 🟡 À vérifier, 🔴 HS, 🟣 En réparation
- **Dernier entretien** : Date de la dernière maintenance
- **Actions** : Bouton "..." pour ouvrir la fiche détaillée

**Trier les colonnes :**
- Cliquer sur l'en-tête de colonne pour trier (nom, statut, etc.)

---

### 6.2 Rechercher et filtrer

**Barre de recherche :**
- Rechercher par nom ou ID
- Résultats filtrés en temps réel

**Filtres :**
- **Catégorie** : Toutes / Son / Lumière / Plateau / Vidéo / Autre
- **Statut** : Tous / OK / À vérifier / HS / En réparation

**Réinitialiser :**
- Cliquer **Réinitialiser les filtres** pour voir tous les équipements

---

### 6.3 Ajouter un équipement

**Qui peut ajouter :** Régisseur général (`rg`) et Technicien (`tech`)

**Procédure :**
1. Cliquer **+ Ajouter un équipement** (en haut à droite)
2. Remplir le formulaire :
   - **Nom*** : Nom descriptif (ex: "Console Yamaha QL5")
   - **ID*** : Identifiant unique (ex: "EQ-042", "SON-12")
   - **Catégorie*** : Cliquer sur l'icône correspondante (Son, Lumière, etc.)
   - **Statut*** : Cliquer sur le bouton (OK, À vérifier, HS, En réparation)
   - **Lieu de stockage** (optionnel) : Local, Régie, Salle, etc.
   - **Date d'achat** (optionnel)
   - **Date dernier entretien** (optionnel)
   - **Description** (optionnel) : Détails techniques, numéro de série, etc.
3. Cliquer **Ajouter l'équipement**

**Alertes automatiques :**
- Si statut = HS ou En réparation : message d'avertissement s'affiche

---

### 6.4 Modifier un équipement

**Qui peut modifier :** Régisseur général (`rg`) et Technicien (`tech`)

**Procédure :**
1. Cliquer sur l'équipement dans le tableau
2. Fiche détaillée s'ouvre (modale)
3. Cliquer **Modifier** (bouton en bas)
4. Mode édition activé : modifier les champs
5. Cliquer **Enregistrer**

---

### 6.5 Supprimer un équipement

**Qui peut supprimer :** Régisseur général (`rg`) uniquement

**Procédure :**
1. Ouvrir la fiche détaillée de l'équipement
2. Cliquer **Supprimer** (bouton rouge en bas)
3. Confirmation : "Voulez-vous vraiment supprimer cet équipement ?"
4. Cliquer **Confirmer** → Équipement supprimé définitivement

**⚠️ Attention :** Suppression irréversible

---

### 6.6 Maintenance préventive

**Planifier un entretien :**
1. Ouvrir la fiche équipement
2. Section **Maintenance** :
   - **Dernier entretien** : Date de la dernière maintenance
   - **Prochain entretien** : Date planifiée (calculée automatiquement selon fréquence)
3. Cliquer **Enregistrer un entretien** → met à jour la date

**Alertes maintenance :**
- Badge 🟡 "À vérifier" si entretien dépassé
- Notification automatique 7 jours avant échéance (futur)

---

## 7. Gestion de l'équipe

### 7.1 Liste des membres

**Affichage :**
- Cartes membres avec :
  - Avatar (initiales + couleur selon rôle)
  - Nom complet
  - Rôle : Régisseur général, Technicien, Observateur
  - Email
  - Téléphone
  - Permissions (badges)

**Rechercher :**
- Barre de recherche en haut : filtrer par nom, email, rôle

---

### 7.2 Ajouter un membre

**Qui peut ajouter :** Régisseur général (`rg`) uniquement

**Procédure :**
1. Cliquer **+ Ajouter un membre** (en haut à droite)
2. Remplir le formulaire :
   - **Nom complet*** : Prénom + Nom
   - **Email*** : Adresse email (servira d'identifiant de connexion)
   - **Téléphone** (optionnel)
   - **Rôle*** : Régisseur général / Technicien / Observateur
   - **Permissions** (checkboxes) :
     - Gérer événements
     - Gérer incidents
     - Gérer équipements
     - Voir l'équipe
     - Gérer l'équipe (réservé `rg`)
3. Cliquer **Ajouter**

**Email d'invitation :**
- Email automatique envoyé avec mot de passe temporaire
- Membre doit changer son mot de passe à la première connexion

---

### 7.3 Modifier un membre

**Qui peut modifier :** Régisseur général (`rg`) uniquement

**Procédure :**
1. Cliquer sur la carte du membre
2. Fiche détaillée s'affiche
3. Cliquer **Modifier**
4. Modifier nom, email, rôle, permissions
5. Cliquer **Enregistrer**

---

### 7.4 Supprimer un membre

**Qui peut supprimer :** Régisseur général (`rg`) uniquement

**Procédure :**
1. Ouvrir la fiche du membre
2. Cliquer **Supprimer** (bouton rouge en bas)
3. Confirmation : "Voulez-vous vraiment supprimer ce membre ?"
4. Cliquer **Confirmer** → Membre supprimé, accès révoqué immédiatement

**⚠️ Attention :** Suppression définitive (pas de réactivation possible)

---

### 7.5 Rôles et permissions

| Rôle | Permissions |
|------|-------------|
| **Régisseur général** (`rg`) | Toutes permissions (CRUD sur toutes entités + gestion équipe) |
| **Technicien** (`tech`) | CRUD événements, incidents, équipements (lecture seule équipe) |
| **Observateur** (`viewer`) | Lecture seule sur toutes entités (pas de création/modification) |

**Permissions détaillées :**
- **Gérer événements** : Créer, modifier, supprimer événements
- **Gérer incidents** : Signaler, modifier, résoudre incidents
- **Gérer équipements** : Ajouter, modifier, supprimer équipements
- **Voir l'équipe** : Consulter la liste des membres
- **Gérer l'équipe** : Ajouter, modifier, supprimer membres (réservé `rg`)

---

## 8. Vue Scène 3D (futur)

### 8.1 Navigation 3D

**Contrôles caméra :**
- **Rotation** : Clic gauche + glisser
- **Zoom** : Molette de la souris (ou pinch sur tablette)
- **Pan** : Clic droit + glisser (ou 2 doigts sur tablette)
- **Réinitialiser vue** : Bouton "Reset caméra" en haut à droite

**Grille de sol :**
- Grille 30x30m (dimensions scène standard)
- Graduations tous les 1m

---

### 8.2 Affichage des équipements

**Équipements 3D :**
- Cubes colorés selon catégorie :
  - 🔊 Son : Bleu
  - 💡 Lumière : Jaune
  - 🎬 Plateau : Vert
  - 📹 Vidéo : Rouge

**Sélection :**
- Cliquer sur un équipement → Surbrillance (outline blanc)
- Panneau détails s'affiche à droite (nom, ID, statut)

---

### 8.3 Éditeur de scène (régisseur uniquement)

**Mode édition :**
- Cliquer **Mode édition** (bouton en haut)
- Ajouter équipements : Cliquer sur la grille → sélectionner équipement dans la liste
- Déplacer : Sélectionner équipement → gizmo de translation (flèches XYZ)
- Supprimer : Sélectionner équipement → touche **Suppr**

**Sauvegarde scène :**
- Cliquer **Enregistrer la scène** (bouton en haut)
- Scène sauvegardée et synchronisée

**Undo/Redo :**
- **Ctrl+Z** : Annuler la dernière action
- **Ctrl+Y** : Refaire l'action annulée

---

## 9. Paramètres

### 9.1 Général

**Paramètres disponibles :**
- **Nom de l'organisation** : Nom de votre théâtre/salle
- **Langue** : Français, Anglais (futur)
- **Fuseau horaire** : Europe/Paris, etc.
- **Format de date** : JJ/MM/AAAA, MM/JJ/AAAA, etc.

**Sauvegarder :**
- Modifications sauvegardées automatiquement

---

### 9.2 Sécurité

**Changer le mot de passe :**
1. Section **Sécurité**
2. Entrer **Mot de passe actuel**
3. Entrer **Nouveau mot de passe** (min 8 caractères)
4. Confirmer le nouveau mot de passe
5. Cliquer **Mettre à jour le mot de passe**

**Exigences mot de passe :**
- Au moins 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre

---

### 9.3 Notifications

**Types de notifications :**
- **Email** : Incidents critiques, événements du jour
- **Push** : Notifications navigateur (futur, si PWA installé)

**Activer/désactiver :**
- Toggles par type de notification
- Sauvegardé automatiquement

---

### 9.4 Synchronisation

**Statut :**
- 🟢 **En ligne** : Synchronisation active
- 🟠 **Hors ligne** : Données stockées localement, sync différée
- 🔴 **Erreur** : Problème de connexion (vérifier réseau)

**Forcer la synchronisation :**
- Cliquer **Synchroniser maintenant** (bouton en bas)
- Utile après longue période hors ligne

**Effacer les données locales :**
- Bouton **Effacer le cache local** (en bas, bouton rouge)
- ⚠️ Supprime toutes les données non synchronisées (utiliser avec précaution)

---

## 10. Profil utilisateur

### 10.1 Informations personnelles

**Affichage :**
- Avatar (initiales + couleur rôle)
- Nom complet
- Email
- Rôle (badge)
- Permissions (liste de badges)

**Modifier :**
1. Cliquer **Modifier le profil**
2. Champs éditables : Nom, Email
3. Cliquer **Enregistrer**

---

### 10.2 Changer le mot de passe

**Procédure :**
1. Section **Sécurité** dans le profil
2. Cliquer **Changer le mot de passe**
3. Formulaire : Ancien mot de passe + Nouveau + Confirmation
4. Cliquer **Mettre à jour**

---

### 10.3 Déconnexion

**Procédure :**
1. Cliquer sur votre **avatar/nom** (en bas du menu latéral)
2. Cliquer **Déconnexion**
3. Redirection vers page de connexion

**Déconnexion automatique :**
- Après 24h d'inactivité (expiration token JWT)
- Message : "Session expirée, veuillez vous reconnecter"

---

## 11. Travail hors ligne

### 11.1 Comment ça marche ?

StageOps utilise une base de données locale dans votre navigateur (**CouchDB/PouchDB**). Toutes les données sont dupliquées localement :
- Événements
- Incidents
- Équipements
- Membres de l'équipe

**Quand vous êtes hors ligne :**
- Toutes les fonctionnalités restent disponibles
- Créations/modifications stockées localement
- Indicateur 🟠 **Hors ligne** affiché en bas du menu

**Quand vous revenez en ligne :**
- Synchronisation automatique (bidirectionnelle)
- Vos modifications locales sont envoyées au serveur
- Modifications des autres utilisateurs sont récupérées
- Indicateur 🟢 **En ligne** affiché

---

### 11.2 Résolution de conflits

**Qu'est-ce qu'un conflit ?**
- Deux utilisateurs modifient le même élément hors ligne
- Ex: Alice change le titre d'un événement, Bob change la date du même événement

**Comment StageOps résout les conflits :**
- Stratégie **"Last Write Wins"** (dernière écriture gagne)
- La modification la plus récente (selon horodatage serveur) est conservée
- Les autres modifications sont écrasées

**Bonnes pratiques :**
- Synchroniser régulièrement (bouton "Synchroniser maintenant" dans Paramètres)
- Éviter les modifications simultanées du même élément

---

## 12. Accessibilité

### 12.1 Navigation au clavier

**Raccourcis principaux :**
- **Tab** : Aller au champ/bouton suivant
- **Shift+Tab** : Revenir au champ/bouton précédent
- **Entrée** : Activer un bouton, valider un formulaire
- **Échap** : Fermer une modale/menu
- **Flèches** : Naviguer dans les sélecteurs, calendrier

**Skip-link :**
- Appuyer **Tab** dès le chargement → Lien "Aller au contenu principal"
- Permet de sauter le menu latéral

---

### 12.2 Lecteurs d'écran

**Compatibilité :**
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS, iOS)
- TalkBack (Android)

**Bonnes pratiques :**
- Tous les formulaires ont des labels explicites
- Tous les boutons ont des descriptions accessibles
- Messages d'erreur lus automatiquement (aria-live)

---

### 12.3 Contrastes et couleurs

**Conformité WCAG 2.1 AA :**
- Contrastes texte/fond ≥ 4.5:1 (texte normal)
- Contrastes texte/fond ≥ 3:1 (texte large)
- Ne pas se fier uniquement aux couleurs (badges ont icônes + texte)

**Mode sombre :**
- Activé par défaut (moins de fatigue oculaire en régies sombres)
- Mode clair disponible dans Paramètres (futur)

---

## 13. Résolution de problèmes

### 13.1 Problèmes de connexion

**Impossible de se connecter :**
- Vérifier email et mot de passe (attention majuscules/minuscules)
- Vérifier connexion internet (icône 🟢/🟠 en bas)
- Vider le cache navigateur (Ctrl+Shift+Suppr)
- Contacter votre régisseur général si problème persiste

**Session expirée :**
- Message "Session expirée, veuillez vous reconnecter"
- Se reconnecter avec email + mot de passe
- Token JWT valide 24h (expiration normale)

---

### 13.2 Problèmes de synchronisation

**Données non synchronisées :**
1. Vérifier connexion internet (🟢/🟠)
2. Aller dans **Paramètres** > **Synchronisation**
3. Cliquer **Synchroniser maintenant**
4. Si erreur persiste : noter le message d'erreur et contacter l'administrateur

**Conflit de données :**
- Message : "Conflit détecté, dernière version conservée"
- Vérifier que vos modifications sont bien présentes
- Si données perdues : contacter l'administrateur (possibilité de restauration backup)

---

### 13.3 Problèmes d'affichage 3D

**Écran noir dans la vue scène 3D :**
- Vérifier que WebGL est activé dans votre navigateur :
  - Chrome : `chrome://settings/` → Paramètres avancés → Système → "Utiliser l'accélération matérielle"
  - Firefox : `about:config` → `webgl.disabled` = false
- Mettre à jour les pilotes de votre carte graphique
- Si WebGL indisponible : Mode fallback Canvas 2D activé automatiquement

**Performance faible (< 30 FPS) :**
- Réduire le nombre d'équipements affichés (filtres)
- Fermer les autres onglets/applications
- Vérifier utilisation CPU/RAM (Chrome Task Manager : Shift+Échap)

---

### 13.4 Contact support

**Assistance utilisateur :**
- Email : [email protected]
- Téléphone : +33 X XX XX XX XX (Lun-Ven 9h-18h)
- Formulaire web : `https://stageops.votretheâtre.fr/support`

**Informations à fournir :**
- Description du problème
- Actions effectuées avant l'erreur
- Message d'erreur exact (capture d'écran si possible)
- Navigateur et version (Chrome 120, Firefox 110, etc.)
- Système d'exploitation (Windows 11, macOS 14, etc.)

---

## 14. Annexes

### Annexe A : Glossaire

| Terme | Définition |
|-------|------------|
| **CRUD** | Create, Read, Update, Delete (créer, lire, modifier, supprimer) |
| **JWT** | JSON Web Token (token d'authentification) |
| **Offline-first** | Architecture permettant de travailler hors ligne, avec synchronisation différée |
| **WebGL** | Web Graphics Library (technologie 3D dans le navigateur) |
| **RBAC** | Role-Based Access Control (contrôle d'accès basé sur les rôles) |
| **Sync** | Synchronisation (mise à jour des données entre local et serveur) |

### Annexe B : Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| **Ctrl+Z** | Annuler (éditeur 3D) |
| **Ctrl+Y** | Refaire (éditeur 3D) |
| **Suppr** | Supprimer élément sélectionné (éditeur 3D) |
| **Échap** | Fermer modale/menu |
| **Tab** | Champ suivant |
| **Shift+Tab** | Champ précédent |
| **Entrée** | Valider formulaire |

### Annexe C : Codes couleurs

**Statuts événements :**
- 🔵 Bleu : À venir
- 🟢 Vert : En cours
- ⚫ Gris : Passé

**Sévérités incidents :**
- 🟢 Vert : Faible
- 🟡 Jaune : Modérée
- 🟠 Orange : Haute
- 🔴 Rouge : Critique

**Statuts équipements :**
- 🟢 Vert : OK
- 🟡 Jaune : À vérifier
- 🔴 Rouge : HS (hors service)
- 🟣 Violet : En réparation

---

**Fin du Manuel Utilisateur**  
**Version 1.0 — Mars 2026**

Pour toute question : [email protected]
