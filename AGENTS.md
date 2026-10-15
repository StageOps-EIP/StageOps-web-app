# Travail dans StageOps Web

Ce dépôt contient uniquement le frontend Web. Respecter le périmètre explicitement donné par l’utilisateur ; aucune intervention Backend ou Mobile par défaut.

## Avant de travailler

Lire ARCHITECTURE.md et les ADR concernés, puis consulter le GitHub Project StageOps et l’issue. Vérifier git status ; fetch et pull --ff-only seulement si cela préserve les changements locaux. Une branche divergente ne doit jamais être écrasée.

## Frontières

- domain : modèles, règles pures et ports ; aucune dépendance React/navigateur.
- application : commandes et orchestration, uniquement application/domain.
- infrastructure : adaptateurs externes, aucune dépendance aux écrans.
- app : composition et choix des adaptateurs.
- pages/components/contexts/hooks : présentation ; aucune construction d’adaptateur concret.
- Ne pas ajouter de nouvelles sources de données factices dans les pages. Les stubs services historiques sont une dette identifiée en #25.
- Les pages restent lazy ; éviter les réexports qui réintroduisent la 3D dans l’entrée.

## Livraison

Depuis StageOps_Web, utiliser Node 24 et npm ci, puis npm run validate. Ajouter des tests pour les règles et erreurs modifiées. Conserver les clés de stockage ou documenter/tester la migration. Ne jamais remplacer silencieusement une donnée illisible par des fixtures sauvegardées.

Documenter la fonctionnalité ou la décision, mettre à jour le Wiki et relier la PR à l’issue du dépôt StageOps. La PR passe en In review ; ne pas prétendre qu’un autre membre l’a relue. Le passage Done dépend de l’intégration et des validations. Pousser les changements autorisés et vérifier leur état distant.

Quand l’utilisateur demande de « trouver la suite », sélectionner une tâche concrète du Project, l’implémenter, vérifier, documenter et pousser. Conserver des tâches futures motivées par le code, avec critères et dépendances.
