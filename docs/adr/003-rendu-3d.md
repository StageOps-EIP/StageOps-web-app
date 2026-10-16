# ADR-003 — Refondre le rendu 3D sans changer de moteur

Date : 16 octobre 2026. Statut : proposé (StageOps #34), en attente de revue d’équipe, conformément à AGENTS.md (mesures, options, gains et coûts présentés avant décision).

## Contexte

La prévisualisation de la conduite (#27) fait tourner la 3D en continu pendant la lecture et doit fonctionner sur tout type de PC, y compris un portable de bureau sans carte graphique. Le rendu existant calculait 60 images par seconde même immobile, utilisait une douzaine de lumières dynamiques dont huit décoratives, des ombres douces 2048 px sur chaque projecteur, un matériau par pièce de mannequin, et recréait des textures sans les libérer. Le plateau se limitait à une boîte, sans faisceaux visibles.

Mesure initiale sur une scène lourde (20 personnes, 56 meubles, 30 projecteurs) : 2 744 appels de dessin par image et rendu permanent. Les mesures montrent que le coût dominant sur une machine faible est le nombre de lumières calculées par pixel.

## Options

1. **Garder Three.js / React Three Fiber et réécrire la couche de rendu** : aucune migration du domaine, du store ni de la conduite ; s’appuie sur le benchmark M1 (Three.js le plus rapide).
2. Passer à Babylon.js ou PlayCanvas : migration complète de la présentation 3D, moins bons résultats au benchmark M1.
3. Renderer Three.js impératif sans React Three Fiber : plus de contrôle, mais perte de l’intégration React pour un gain non démontré.
4. Renderer WebGPU de Three.js : prometteur, support navigateur encore incomplet sur le parc visé.

## Décision

Option 1. Rendu à la demande ; budget de lumières temps réel par niveau de qualité, les autres projecteurs étant simulés (faisceau + tache au sol) ; budget d’ombres ; géométries fusionnées et partagées, instanciation des éléments répétés ; Lambert en Éco ; post-traitement et reflets chargés à la demande ; niveaux Auto / Éco / Standard / HD, Auto suivant le nombre d’images par seconde mesuré. Plateau à l’italienne réaliste (cadre, pendrillons, frises, porteuses, salle) et faisceaux visibles. Aucune nouvelle dépendance.

## Conséquences

- Plus aucune image calculée à l’arrêt ; appels de dessin divisés par plus de 10 sur la scène lourde ; chunk 3D de 990 à 939 Ko.
- Au-delà du budget, un projecteur simulé n’éclaire pas réellement les objets ni ne projette d’ombre ; un indicateur « N/M en temps réel » le signale et le projecteur sélectionné est toujours calculé.
- Les intensités sont désormais en unités physiques : l’aspect des scènes existantes change (plus réaliste).
- Les mesures ont été prises en rendu logiciel (SwiftShader) : elles sont comparatives. Des mesures sur de vrais PC restent à faire et à ajouter au Wiki.
- `RenderingSettings` remplace l’interrupteur HD par `quality` ; les anciennes sauvegardes sont migrées.

## Validation

`npm run validate` (65 tests, dont budget lumières/ombres et migration des préférences) ; parcours navigateur sur Plateau 3D et éditeur, vues Ensemble/Salle/Régie/Dessus, niveaux Éco/Standard/HD, conduite complète (lecture, pause, correction, annuler/rétablir, rechargement), aucune erreur console. Script de mesure reproductible décrit dans la PR.
