# Architecture du frontend Web StageOps

État au 16 octobre 2026 (scène 3D, conduite et rendu). Cette architecture concerne uniquement le dépôt Web.

## But

Pouvoir ajouter une fonctionnalité, changer le stockage ou charger une page lourde sans mélanger ces responsabilités. Le workspace matériel/incidents et la scène 3D sont migrés ; les autres domaines restent visibles dans la liste de dette ci-dessous.

## Organisation réelle

```text
StageOps_Web/
  src/
    app/                   composition des providers, routes, erreurs de navigation, route scène lazy
    application/           stores workspace et scène, commandes, persistance via un port
    domain/                modèles, règles pures, interfaces WorkspaceRepository et SceneRepository
    infrastructure/
      workspace/           adaptateur localStorage, validation, données initiales
      scene/               adaptateur localStorage de la scène, migration, identifiants
    contexts/              adaptation des stores à React et contexte auth existant
    hooks/                 accès aux contextes, filtres et comportements de présentation
    pages/                 écrans et assemblage des parcours
    components/
      design-system/       éléments UI partagés
      equipment/           UI matériel
      incidents/           UI incidents
      events/              UI conducteur
      scene-editor/        rendu Three.js du plateau et panneaux de l’éditeur
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

## Scène 3D

Le plateau (`/stage`) et l’éditeur (`/editor`) suivent le même découpage que le workspace :

- `domain/scene-models.ts` : objets, lumières, surfaces, préférences d’affichage, dimensions du plateau, matériaux et fabriques d’éléments ;
- `domain/scene.ts` : `sceneReducer` pur, sélection, mode Décor/Conduite et historique annuler/rétablir ;
- `domain/timeline.ts` : conduite (cues, transitions) et calcul de l’état de la scène à un instant ;
- `application/scene-store.ts` : commandes, snapshot stable, sauvegarde via `SceneRepository` ;
- `infrastructure/scene/` : validation, migration de l’ancien format et génération d’identifiants ;
- `app/scene-workspace.tsx` : route lazy qui crée un seul store pour le plateau et l’éditeur ;
- `components/scene-editor/` : rendu et interactions, uniquement via `useSceneEditor()`.

Règles de l’historique :

- une modification hors geste crée une étape ; un geste (glisser le gizmo, curseur, saisie d’un champ, sélecteur de couleur) crée une seule étape, quelle que soit la quantité de mises à jour ;
- rétablir revient à l’état annulé ; une nouvelle modification vide la pile « rétablir » ; 50 étapes maximum ;
- sélection, mode de transformation et préférences d’affichage ne sont pas annulables ;
- une modification sans effet ou visant un identifiant inconnu ne crée pas d’étape ;
- la sélection est retirée si l’élément n’existe plus après suppression, annulation ou rétablissement.

Persistance : seule la scène est sauvegardée (`stageops.scene.v1`, format `{ version: 1, objects, lights, surfaces, timeline, rendering }` ; `timeline` absent = conduite vide). L’ancienne clé `stageops-scene`, qui contenait tout l’état React, est lue puis supprimée après la première sauvegarde réussie. Les mêmes garanties que pour le workspace s’appliquent : payload invalide conservé et jamais écrasé, stockage indisponible signalé, échec de quota visible. Le store reste en mémoire pendant la session : l’historique est conservé en passant du plateau à l’éditeur.

## Conduite (#27)

Le régisseur saisit sa conduite comme sur papier : un **cue** = minute de la pièce + numéro (12, 12.5…) + libellé + note. Un cue fixe l’état **atteint** à cette minute par certains éléments (personnes et objets : position, orientation, posture, visibilité ; projecteurs : position, cible, intensité, température, couleur, angle, visibilité).

- Transition par élément et par cue : **coupe** (état précédent conservé puis changement à la minute du cue) ou **progressive** (sur N secondes avant le cue, ou depuis le cue précédent de l’élément si la durée est vide).
- Avant le premier cue, la scène est dans son état de base (**Décor**).
- `evaluateScene(scene, t)` est une fonction pure : interpolation linéaire des nombres, vecteurs et couleurs ; une entrée en scène est visible dès le début de son mouvement ; posture et disparition au cue.
- En mode **Conduite**, toute modification d’un réglage animable est enregistrée dans le cue à l’instant courant (créé et numéroté automatiquement s’il n’existe pas) et met la lecture en pause ; les autres réglages (nom, matériau, dimensions) modifient le Décor.
- La position de lecture est publiée sur un canal séparé du store : pendant la lecture, seuls le canvas, la ligne de temps et le panneau Propriétés se mettent à jour à chaque image.

## Rendu 3D (#34)

Three.js et React Three Fiber sont conservés (benchmark M1) ; seule la couche de rendu de `components/scene-editor/` a été réécrite.

| Choix | Pourquoi |
| --- | --- |
| Rendu à la demande (`frameloop="demand"`) | aucune image calculée quand rien ne bouge |
| Budget de lumières temps réel (Éco 4, Standard 8, HD 16 ; la lumière sélectionnée d’abord) | le coût de chaque pixel augmente avec le nombre de lumières ; les autres projecteurs sont simulés par leur faisceau et une tache au sol |
| Budget d’ombres parmi les lumières réelles (0 / 2 / 4) | chaque ombre redessine la scène |
| Géométries fusionnées et partagées ; fauteuils et porteuses instanciés | moins d’appels de dessin |
| Lambert en Éco ; post-traitement et reflets HD chargés à la demande | coût par pixel et poids du bundle |
| Qualité **Auto** | part de Standard, suit le nombre d’images par seconde réel, puis rendu à 75 % en dernier recours |

Le plateau est une scène à l’italienne construite autour du volume éditable (24 × 18 m, gril à 10 m) : nez de scène à 1 m, cadre de scène, trois paires de pendrillons et frises (désactivables), porteuses, salle en gradins. Les cinq surfaces modifiables ne sont visibles que de l’intérieur (vue de dessus en coupe). Les intensités 0–10 de l’éditeur sont converties en unités physiques. Vues caméra : Ensemble, Salle, Régie, Dessus.

Mesures sur une scène lourde (20 personnes, 50 chaises, 6 tables, 30 projecteurs), build de production, Chromium avec rendu logiciel SwiftShader (bien plus lent qu’une puce graphique réelle : seules les comparaisons comptent) :

| Mesure | Avant | Éco | Standard | HD |
| --- | --- | --- | --- | --- |
| Images calculées par seconde à l’arrêt | 2,3 (continu) | 0 | 0 | 0 |
| Appels de dessin par image | 2 744 | 201 | 223 | 228 |
| Textures GPU créées | 111 | 6 | 27 | 34 |
| Images/s pendant une rotation de caméra | 2,3 | 2,9 | 1,9 | 0,8 |

Effet du nombre de projecteurs réellement calculés (Éco, sans faisceaux) : 30 → 1 image/s, 6 → 3,3, 0 → 11,5, d’où le budget de lumières.

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
| Moteur/Canvas 3D | dans le chargement global | chunk séparé, environ 939,44 Ko (990,54 Ko avant #34) |
| Post-traitement / reflets HD | dans le chunk 3D | chunks à la demande, environ 68,11 Ko / 53,80 Ko |
| Store et adaptateur de la scène | — | chunk `scene-workspace` séparé, environ 8,62 Ko |

Cela réduit l’entrée d’environ 80 %. La refonte de la scène (#26) laisse l’entrée à environ 292,95 Ko : le code de scène n’est chargé qu’avec la première route 3D. Ce n’est pas une mesure du temps de chargement réseau et les pages ajoutent leurs propres chunks. Le chunk 3D reste lourd ; l’avertissement Vite est conservé.

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
- Authentification, thème et préférences conservent leurs adaptateurs historiques. Leur extraction devra suivre le même contrat de responsabilité, avec migration de leurs données.
- Pas de synchronisation multi-utilisateur ni arbitrage des écritures entre onglets.
- Des tests de parcours navigateur automatisés restent à ajouter ; les tests unitaires ne les remplacent pas.
- Scène 3D : pas encore de lien entre les objets de scène et l’inventaire (`equipmentId` existe mais n’est jamais renseigné, #33) ; une seule scène locale, non rattachée à un projet ni synchronisée ; le chunk Three.js reste lourd (~940 Ko) ; pas d’export de la conduite (#32) ; mesures à compléter sur de vrais PC (portable sans carte graphique, PC fixe).

## Traçabilité

- [#22 — Workspace](https://github.com/StageOps-EIP/StageOps/issues/22)
- [#23 — Routes et 3D](https://github.com/StageOps-EIP/StageOps/issues/23)
- [#24 — Contrôles et documentation](https://github.com/StageOps-EIP/StageOps/issues/24)
- [#26 — Scène 3D](https://github.com/StageOps-EIP/StageOps/issues/26)
- [#27 — Prévisualiser la conduite](https://github.com/StageOps-EIP/StageOps/issues/27) (#28 à #33)
- [#34 — Refonte du rendu 3D](https://github.com/StageOps-EIP/StageOps/issues/34)
- [Décision ADR-001](docs/adr/001-web-architecture.md)
- [Décision ADR-002](docs/adr/002-scene-3d-architecture.md)
- [Décision ADR-003](docs/adr/003-rendu-3d.md)
- [Wiki Architecture Web](https://github.com/StageOps-EIP/StageOps/wiki/Architecture-Web)
