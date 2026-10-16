# Corrections de review du rendu 3D

16 octobre 2026. Issue [StageOps #35](https://github.com/StageOps-EIP/StageOps/issues/35), liée à la PR Web #5 d’Hugo.

## Portée

Trois corrections sur la branche de rendu d’Hugo. Aucun changement de stack, de dépendances, de Backend ou de Mobile. La PR de correction cible `refactor/34-rendu-3d` afin qu’Hugo puisse valider les changements avant d’intégrer sa PR #5.

## Qualité Auto

L’ancien PerformanceMonitor comptait les hausses répétées comme des bascules : une simulation à 60 FPS constants déclenchait Éco et une résolution de 75 % après environ 11 secondes.

Le nouveau contrôleur mesure uniquement une interaction caméra, un déplacement ou une lecture en cours. La première image après inactivité est exclue pour ne pas compter le temps passé à l’arrêt. Les fenêtres durent au moins une seconde ; deux fenêtres sous 30 FPS abaissent un niveau, quatre au-dessus de 55 FPS le remontent. La résolution de 75 % n’arrive qu’après lenteur persistante en Éco et peut revenir à la normale. Une bonne performance au plafond HD ne déclenche aucune dégradation.

Le contrôleur est indépendant des sauvegardes et ne transforme pas l’inactivité en rendu continu. Les seuils sont des paramètres de départ à mesurer sur les PC cibles, pas une certification de fluidité.

## Capture PNG

La capture exécute une image via le compositeur actif, puis lit le canvas immédiatement. Bloom et vignette sont donc conservés. Si le compositeur n’est pas présent, elle utilise le rendu direct. `preserveDrawingBuffer` reste désactivé. Les étiquettes HTML et les panneaux d’interface ne font pas partie du canvas exporté.

## Spots simulés

Le trajet oblique entre le projecteur et le sol est comparé à sa portée. Aucun pool lumineux n’est rendu lorsque le sol est hors de portée ; modifier la portée recalcule le placement. La convention existante `distance = 0 → 30 m` des spots de cette branche est conservée. Le pool reste une approximation sans occlusion, pas un calcul photométrique.

## Validation et revue Hugo

Neuf tests ciblés couvrent : 60 FPS soutenus, inactivité et reprise, interruption sans image intermédiaire, baisse/récupération, courte baisse, capture avec/sans compositeur, portée verticale et oblique. Ils s’ajoutent aux 65 tests de la branche.

Scénarios navigateur :

1. Ouvrir l’éditeur en Auto, lancer une lecture ou maintenir une rotation, puis arrêter/reprendre. Vérifier l’absence de dégradation due au seul temps écoulé.
2. En Standard, activer la vignette et exporter un PNG ; désactiver les effets et réexporter. Vérifier les différences attendues.
3. En Éco, dépasser quatre spots actifs. Pour un spot simulé à 8 m, régler la portée à 2 m puis 10 m : la tache doit apparaître uniquement dans le second cas.

Les modifications restent `In review` jusqu’à validation par Hugo ; aucune fusion automatique.
