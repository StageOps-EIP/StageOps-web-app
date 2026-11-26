# Versions testées et évolutions

Chaque ligne décrit le passage d'une version à la suivante : ce qui a été observé, ce qui a changé, pourquoi, et ce que le test suivant en a montré. Une ligne n'est remplie qu'à partir de faits : pas de résultat sans test réalisé.

| Version | Référence | Problème observé | Modification | Raison | Résultat au test suivant |
| --- | --- | --- | --- | --- | --- |
| **V0** | Site avant la refonte : commit `0d70257` (2 novembre 2026). Captures datées dans [v0/](v0/README.md). | Pas de test utilisateur sur la V0. Constats de l'équipe lors de la DA Rideau ([DESIGN.md](../../DESIGN.md), commits de la PR #7) : thème sombre par défaut avec bascule clair/sombre ; signalement d'incident accessible seulement depuis la page Incidents ; styles cyan hérités sur les écrans de travail. Lecture des captures : Vue générale dense (bandeau de 4 indicateurs, 6 incidents, feuille du jour). | — (état de départ) | — | Sert de référence pour comparer la V1. |
| **V1** | Maquette DA Rideau ([Figma](../brand/StageOps_DA_Rideau_Figma.svg), [DESIGN.md](../../DESIGN.md)) et son intégration, PR Web #7, `main` au commit `97ad1c3`. | Les constats de la V0 ci-dessus. | Thème clair unique (fond `#F8F4F0`, velours, pourpre, or) ; DM Sans pour l'interface ; en-tête commun avec la section active et « Données locales » ; bouton **+ Signaler un incident** permanent sur grand écran ; Vue générale recentrée sur la production, « À traiter maintenant » (3 incidents), matériel et plateau ; surfaces et couleurs d'état partagées. | Lisibilité d'un poste de régie et repérage en quelques secondes ; garder le logo, le pourpre et l'or ; chaque état reste écrit, jamais seulement coloré. | **À remplir après le round 1** ([protocole](protocole-round1.md)). Points à surveiller : 3D non reliée au matériel ([#33](https://github.com/StageOps-EIP/StageOps/issues/33)), incident lié absent de la fiche matériel ([#38](https://github.com/StageOps-EIP/StageOps/issues/38)), pas d'assignation d'incident. |
| **V2** | À définir après le round 1. Candidats déjà en relecture : PR Web #8 ([#37](https://github.com/StageOps-EIP/StageOps/issues/37), [#38](https://github.com/StageOps-EIP/StageOps/issues/38)) et PR Web #9 ([#39](https://github.com/StageOps-EIP/StageOps/issues/39), [#40](https://github.com/StageOps-EIP/StageOps/issues/40)), non intégrées à ce jour. | Résultats du round 1 sur la V1. | | | À remplir après le round 2. |
| **V3** | À définir après le round 2. | Résultats du round 2 sur la V2. | | | À remplir après le round 3. |

## Règles de mise à jour

- Avant chaque round, figer la version testée : commit, date, captures dans `docs/ux/vN/` avec la même méthode que la V0 ([v0/README.md](v0/README.md)).
- « Problème observé » cite les fiches (`T1`, `T3`…) et le nombre de personnes concernées, sans donnée personnelle.
- « Résultat au test suivant » compare les mêmes mesures : taux de réussite par étape, temps médian, hésitations et erreurs.
