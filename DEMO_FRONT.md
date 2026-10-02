# Démonstration Front — scénario d’incident persistant

Cette démonstration montre une amélioration concrète du front StageOps : les écrans Incidents, Matériel et Dashboard partagent désormais le même état de démonstration. Une action effectuée dans un écran est visible dans les autres et reste enregistrée après rechargement.

## Préparation

1. Lancer le frontend avec les instructions de `LANCEMENT_LOCAL.md`.
2. Ouvrir la page **Vue générale**.
3. Si la bannière indique `Modifications enregistrées`, cliquer sur **Réinitialiser la démo**.
4. Vérifier que le compteur **Incidents actifs** affiche l’état initial.

## Script de démonstration — environ 90 secondes

> « StageOps doit éviter qu’un incident signalé en régie soit perdu ou visible uniquement sur un écran. Je vais déclarer un problème matériel et montrer que toute l’interface utilise immédiatement la même information. »

1. Dans le menu, ouvrir **Incidents**.
2. Cliquer sur **Signaler un incident**.
3. Saisir par exemple :
   - titre : `Projecteur face hors service` ;
   - description : `Le projecteur ne répond plus depuis la régie lumière.` ;
   - priorité : `Élevée` ;
   - équipement : `Projecteur LED Robe BMFL` ;
   - signalé par : votre prénom.
4. Cliquer sur **Signaler l’incident**.
5. Montrer le message de confirmation, la nouvelle carte et la bannière **Modifications enregistrées**.
6. Ouvrir **Vue générale** et montrer que le compteur et la liste des incidents ont changé sans ressaisie.
7. Recharger la page : l’incident est toujours présent.
8. Cliquer sur **Réinitialiser la démo** pour revenir au scénario initial.

## Ce que la démonstration prouve

- un état partagé entre plusieurs pages React ;
- un horodatage réel lors de la création ;
- une persistance locale après rechargement ;
- une cohérence entre registre, matériel lié et dashboard ;
- une remise à zéro rapide pour répéter la démonstration ;
- un feedback visuel après création, changement de statut et réinitialisation.

## Limites annoncées honnêtement

La persistance actuelle est locale au navigateur et sert à fiabiliser le prototype de démonstration. La synchronisation multi-utilisateur via l’API et CouchDB reste un travail séparé. L’issue fonctionnelle ne doit donc pas être marquée `Done` tant que les critères API, édition/suppression et tests automatiques ne sont pas terminés.

## Traçabilité

- Issue produit : [StageOps #9](https://github.com/StageOps-EIP/StageOps/issues/9)
- Dépôt : [StageOps-web-app](https://github.com/StageOps-EIP/StageOps-web-app)
- Commit principal : [`4669f5c`](https://github.com/StageOps-EIP/StageOps-web-app/commit/4669f5c8d18279ea179fbc2c7c11133d5af7417a)
- Documentation longue : page Wiki `Feature Web - Scénario d'incident persistant`
