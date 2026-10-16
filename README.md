# StageOps Web

Frontend Web de StageOps pour superviser le matériel, les incidents et les opérations scéniques.

## Démarrer

Prérequis : Node 24 avec npm. Depuis la racine du dépôt :

```sh
cd StageOps_Web
npm ci
npm run dev
```

Vite démarre sur http://localhost:3000. Les requêtes /api sont relayées vers http://localhost:8080 ; VITE_API_URL permet de changer la cible du proxy. Les registres matériel/incidents utilisent actuellement un workspace local persistant. L’authentification utilise l’API existante ; la synchronisation distante du workspace n’est pas encore intégrée.

## Valider

```sh
cd StageOps_Web
npm run validate
```

Cette commande contrôle l’architecture, exécute les tests, le lint, les types application/tests et le build de production. La CI applique le même contrôle sur GitHub. Pour un aperçu du build : npm run preview.

## Architecture et contribution

- [ARCHITECTURE.md](ARCHITECTURE.md) : couches, responsabilités, données, navigation, limites et mesures.
- [ADR-001](docs/adr/001-web-architecture.md) : décision et compromis du refactoring.
- [AGENTS.md](AGENTS.md) : règles pour les interventions dans ce dépôt.
- [Méthodologie de l’équipe](https://github.com/StageOps-EIP/StageOps/blob/main/METHODOLOGIE_PROJET.md).
- [GitHub Project](https://github.com/orgs/StageOps-EIP/projects/2).

Stack réelle : React 18, TypeScript, React Router 7, Vite 7, Tailwind CSS et Three.js/React Three Fiber. Les pages sont chargées à la demande.

## Parcours documentés

- [Incidents et cohérence matériel/dashboard](PARCOURS_INCIDENT.md).
- [Exports CSV](EXPORT_CSV.md).
- [Wiki Architecture Web](https://github.com/StageOps-EIP/StageOps/wiki/Architecture-Web).

## État du produit

Le workspace matériel/incidents est validé, partagé entre les écrans et sauvegardé localement. La scène 3D (plateau et éditeur) suit le même découpage. Le conducteur, l’équipe et les préférences conservent des sources/adaptateurs historiques : leurs limites et la suite #25 sont recensées dans ARCHITECTURE.md. Le frontend local n’est pas une preuve de synchronisation multi-utilisateur.

Projet académique EIP.
