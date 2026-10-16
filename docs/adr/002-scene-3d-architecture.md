# ADR-002 — Aligner la scène 3D sur l’architecture en couches

Date : 16 octobre 2026. Statut : proposé dans la PR liée à StageOps #26, en attente de revue.

## Contexte

L’éditeur de scène regroupait dans un même fichier le modèle, le reducer, les données initiales, la lecture `localStorage` et le contexte React. Le provider écrivait tout l’état React (sélection et outil compris) à chaque rendu, sans validation à la lecture : une donnée corrompue était remplacée silencieusement. « Rétablir » restaurait l’état d’avant la modification annulée, et chaque frame d’un glisser créait une entrée d’historique. Le plateau et l’éditeur avaient chacun leur provider. Le dossier `components/stage3d` n’était plus utilisé.

## Décision

Reprendre le contrat de l’ADR-001 : domaine pur (`scene-models.ts`, `scene.ts`), port `SceneRepository`, store applicatif exposé à React par `useSyncExternalStore`, adaptateur local validé et injecté dans `app`. Modéliser l’historique avec des piles passé/futur et des gestes explicites pour regrouper les modifications continues. Créer le store dans une route lazy commune au plateau et à l’éditeur pour garder l’entrée sans code de scène. Supprimer le code 3D mort.

## Alternatives examinées

- Corriger uniquement les bugs de l’historique dans l’ancien store : laisse la persistance non validée et le couplage React/localStorage.
- Créer le store dans `AppProviders` comme le workspace : plus simple, mais ajoute environ 12 Ko à l’entrée pour toutes les pages.
- Regrouper l’historique par délai (debounce) : dépend du temps, difficile à tester ; les gestes explicites sont déterministes.
- Ajouter une bibliothèque d’historique ou de store : dépendance inutile pour ce périmètre.

## Conséquences

Les règles de la scène et de l’historique sont testables avec Node. Une scène illisible est conservée et signalée. Les composants n’envoient plus d’actions brutes mais des commandes. Les entrées continues doivent déclarer leurs gestes (`beginGesture`/`endGesture`) ; un nouveau contrôle qui l’oublie crée une étape par modification, sans perte de données. La scène reste unique, locale et non rattachée à un projet.

## Validation

Tests du reducer et de l’historique, du repository (migration, corruption, quota) et du store ; `npm run validate`. Parcours navigateur : migration de l’ancienne clé, ajout et modification d’un objet, Ctrl+Z puis Ctrl+Y, partage plateau/éditeur, rechargement, alerte et conservation d’une donnée corrompue, aucune erreur console.

Issue : StageOps #26.
