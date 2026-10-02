# Parcours incident et cohérence opérationnelle

Cette fonctionnalité relie les écrans **Incidents**, **Matériel** et **Vue générale** autour d’une même donnée opérationnelle. Un incident créé est enregistré dans le navigateur, reste disponible après rechargement et actualise immédiatement les autres vues.

## Règles métier implémentées

- Un incident possède un titre, une description, une priorité, un déclarant et, si nécessaire, un équipement lié.
- Un nouvel incident non résolu lié à un équipement fait passer cet équipement de `Opérationnel` à `À vérifier`.
- Lorsqu’un incident est résolu, l’équipement repasse `Opérationnel` uniquement s’il ne possède plus d’autre incident actif.
- Le Dashboard calcule ses indicateurs à partir du même registre que les écrans Incidents et Matériel.
- Les modifications sont conservées localement afin que le parcours reste utilisable hors ligne et après rechargement.

## Vérification manuelle

1. Lancer le frontend avec les instructions de `LANCEMENT_LOCAL.md`.
2. Ouvrir **Incidents**, puis cliquer sur **Signaler un incident**.
3. Saisir par exemple :
   - titre : `Projecteur face hors service` ;
   - description : `Le projecteur ne répond plus depuis la régie lumière.` ;
   - priorité : `Élevée` ;
   - équipement : `Projecteur LED Robe BMFL` ;
   - signalé par : votre prénom.
4. Valider et vérifier le message **Incident enregistré**.
5. Ouvrir **Matériel** et vérifier que l’équipement est marqué **À vérifier**.
6. Ouvrir **Vue générale** et vérifier l’évolution des incidents actifs et du matériel disponible.
7. Recharger la page et vérifier que les données sont toujours présentes.
8. Résoudre l’incident et vérifier la remise en service du matériel lorsqu’aucun autre incident actif ne lui est associé.

## Présentation courte

> « StageOps évite qu’un problème signalé en régie reste isolé dans une liste. Lorsqu’un incident est déclaré sur un équipement, son état opérationnel et le tableau de bord sont immédiatement actualisés. L’information reste disponible après rechargement et peut donc être utilisée sur le terrain, même avec une connexion limitée. »

## Limite actuelle

La persistance fonctionne aujourd’hui sur le navigateur courant. La synchronisation entre plusieurs utilisateurs et appareils devra être branchée sur l’API Go et CouchDB avant de considérer la user story complètement terminée.

## Traçabilité

- Issue produit : [StageOps #9](https://github.com/StageOps-EIP/StageOps/issues/9)
- Dépôt : [StageOps-web-app](https://github.com/StageOps-EIP/StageOps-web-app)
- Documentation longue : page Wiki `Feature Web — Gestion cohérente des incidents`
