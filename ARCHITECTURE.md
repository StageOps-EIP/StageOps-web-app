# Architecture du frontend Web StageOps

État au 15 octobre 2026. Cette architecture concerne uniquement le dépôt Web.

## But

Pouvoir ajouter une fonctionnalité, changer le stockage ou charger une page lourde sans mélanger ces responsabilités. Le workspace matériel/incidents est le premier périmètre migré ; les autres domaines restent visibles dans la liste de dette ci-dessous.

## Organisation réelle

```text
StageOps_Web/
  src/
    app/                   composition des providers, routes, erreurs de navigation
    application/           store workspace, commandes, persistance via un port
    domain/                modèles, règles pures, interface WorkspaceRepository
    infrastructure/
      workspace/           adaptateur localStorage, validation, données initiales
    contexts/              adaptation des stores à React et contexte auth existant
    hooks/                 accès aux contextes, filtres et comportements de présentation
    pages/                 écrans et assemblage des parcours
    components/
      design-system/       éléments UI partagés
      equipment/           UI matériel
      incidents/           UI incidents
      events/              UI conducteur
      scene-editor/        éditeur 3D existant
    lib/                   utilitaires, styles et points de compatibilité historiques
    services/              anciens stubs, pas une API persistante
  scripts/                 contrôle des dépendances
  tests/                   règles métier, repository, store, CSV et architecture
```

## Responsabilités et dépendances

| Couche | Responsabilité | Dépendances autorisées pour le workspace |
| --- | --- | --- |
| Domaine | Modèles, règles et contrat de stockage | Domaine uniquement |
| Application | Commandes, snapshots, sauvegarde et abonnements | Application et domaine |
| Infrastructure | Lecture/écriture et validation des données externes | Domaine et fixtures existantes |
| Présentation | Rendu, interactions, accessibilité | Application, domaine, composants et hooks |
| App | Choix des adaptateurs et composition | Toutes les couches |

Le contrôleur analyse les imports statiques, réexports et imports dynamiques TypeScript. Il vérifie les frontières domaine/application/infrastructure/présentation, les imports locaux résolus et l’absence de cycles dans tout `src`. Domaine et application ne peuvent pas utiliser `window`, `document`, `localStorage`, `sessionStorage` ou `fetch`.

Il ne constitue pas une analyse de sécurité ni une preuve de qualité totale : les appels calculés et les dépendances cachées derrière un service historique demandent aussi une revue humaine.

## Parcours d’une modification

1. La page appelle une commande du contexte.
2. Le store applique `workspaceReducer`, une fonction pure.
3. Matériel et incidents sont modifiés dans la même transition.
4. Le store sauvegarde via `WorkspaceRepository`.
5. Un snapshot stable est publié à React avec `useSyncExternalStore`.
6. Les écrans affichent les mêmes données et, si nécessaire, une alerte de sauvegarde.

La persistance ne se produit pas pendant le rendu React ni dans un updater imbriqué. Le provider ne connaît ni localStorage ni les fixtures. Les doublons d’identifiants sont ignorés lors d’un ajout ; une modification d’incident inconnu ne change pas le registre.

## Règles incidents et matériel

- `open` et `in-progress` sont actifs ; `resolved` et `closed` sont terminés.
- Un incident actif lié signale un équipement opérationnel comme `to-check`.
- Résolution/fermeture ne libère le matériel que si aucun autre incident actif ne reste lié.
- Les états explicites `hs` et `repair` sont conservés.
- Réaffecter un incident réconcilie l’ancien et le nouvel équipement.
- Le modèle ne stocke pas encore la provenance d’un état `to-check` ; distinguer plusieurs causes simultanées demandera une évolution métier explicite.

## Persistance et migration

La clé `stageops.workspace.v1` reste compatible. L’adaptateur accepte l’ancienne clé `stageops.demo.workspace.v1` sans filtrer des incidents à partir de leur titre.

À la lecture : JSON considéré comme inconnu, contrôle des champs/énumérations/identifiants et reconstruction des dates. À la prochaine modification réussie : écriture de la clé courante puis suppression de la clé historique.

Si une donnée est invalide, le payload original est conservé ; la session affiche les données initiales avec une alerte et ne peut pas écraser le stockage. Si la lecture est refusée, les écritures sont également bloquées pour préserver une éventuelle donnée inaccessible. Si le quota est atteint, la modification reste en mémoire et une alerte recommande d’exporter avant de recharger.

Le repository est synchrone parce que localStorage l’est. Une future API asynchrone devra ajouter explicitement états de chargement, concurrence et erreurs ; ce contrat ne prétend pas déjà gérer la synchronisation distante.

## Navigation et 3D

Les pages sont chargées avec `route.lazy`. Le layout et les providers restent stables pendant la navigation. Une indication accessible est affichée au chargement ; les erreurs de route et les adresses inconnues proposent un retour à StageOps.

Mesure du build de production local :

| Mesure | Avant | Après |
| --- | --- | --- |
| Entrée JavaScript minifiée | 1 434,86 Ko | environ 292,45 Ko |
| Entrée compressée gzip | 390,19 Ko | environ 94,27 Ko |
| Moteur/Canvas 3D | dans le chargement global | chunk séparé, environ 985,70 Ko |

Cela réduit l’entrée d’environ 80 %. Ce n’est pas une mesure du temps de chargement réseau et les pages ajoutent leurs propres chunks. Le chunk 3D reste lourd ; l’avertissement Vite est conservé.

## Validation et CI

Prérequis : Node 24, fixé par `.node-version`, `engines` et le Dockerfile Web.

```sh
cd StageOps_Web
npm ci
npm run validate
```

La validation exécute architecture, tests Node, ESLint, types de l’application et des tests, puis build Vite. La CI applique la même commande sur les pushes et pull requests. Elle dispose uniquement de `contents: read`. Aucun changement de protection de branche n’est effectué par ce refactoring.

## Ajouter une feature

1. Issue Web du Project avec besoin, critères, responsable, estimation et milestone.
2. Modèle/règles dans `domain` si la feature modifie le métier.
3. Orchestration dans `application`, accès externe derrière un port.
4. Adaptateur dans `infrastructure`, choisi uniquement dans `app`.
5. Rendu dans les pages/composants, avec le design system existant.
6. Tests des règles et des erreurs importantes, `npm run validate`.
7. Documentation et ADR si la décision change les responsabilités.
8. PR liée à l’issue ; `In review` jusqu’à revue et intégration.

## Dette connue et prochaine étape

- [#25 — Unifier conducteur et équipe](https://github.com/StageOps-EIP/StageOps/issues/25) : pages et composants lisent encore des fixtures séparées ; les anciens services ne sont pas persistants.
- Authentification, thème, préférences et éditeur 3D conservent leurs adaptateurs historiques. Leur extraction devra suivre le même contrat de responsabilité, avec migration de leurs données.
- Pas de synchronisation multi-utilisateur ni arbitrage des écritures entre onglets.
- Des tests de parcours navigateur automatisés restent à ajouter ; les tests unitaires ne les remplacent pas.

## Traçabilité

- [#22 — Workspace](https://github.com/StageOps-EIP/StageOps/issues/22)
- [#23 — Routes et 3D](https://github.com/StageOps-EIP/StageOps/issues/23)
- [#24 — Contrôles et documentation](https://github.com/StageOps-EIP/StageOps/issues/24)
- [Décision ADR-001](docs/adr/001-web-architecture.md)
- [Wiki Architecture Web](https://github.com/StageOps-EIP/StageOps/wiki/Architecture-Web)
