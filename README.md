# StageOps Web App

Interface desktop destinée au Régisseur Général.

Cette application fournit une vue globale du projet technique et permet la supervision centralisée des opérations scéniques.

## Fonctionnalités

- Dashboard global
- Gestion des projets
- Visualisation du parc matériel
- Monitoring temps réel
- Planification technique
- Visualisation 3D simplifiée de la scène

## Architecture

```text
src/
  components/
  modules/
    dashboard/
    projects/
    equipment/
    monitoring/
    scene-visualization/
  services/
  store/
  router/
```

## Stack technique

- React ou Vue.js
- API StageOps Backend
- Architecture SPA
- Visualisation 3D WebGL

## Installation

git clone <repo>
cd stageops-web-app
npm install

Configurer l’URL API.

### Lancement

npm run dev

Application disponible sur :
http://localhost:3000

## Objectif produit

Offrir un centre de contrôle technique centralisé pour la supervision scénique.

## Parcours incident

Le fonctionnement **création d’un incident → mise à jour du matériel → actualisation du dashboard → persistance locale** est décrit dans [PARCOURS_INCIDENT.md](PARCOURS_INCIDENT.md).

La méthode d’équipe, les statuts du GitHub Project et les règles de documentation sont centralisés dans le dépôt principal [StageOps](https://github.com/StageOps-EIP/StageOps/blob/main/METHODOLOGIE_PROJET.md).

## Licence

Projet académique.
