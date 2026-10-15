# ADR-001 — Séparer le workspace métier du navigateur

Date : 15 octobre 2026. Statut : proposé dans la PR d’architecture Web ; à accepter lors de la revue.

## Contexte

Le provider opérationnel regroupait données initiales, persistance et transitions. Une mise à jour d’incident exécutait une mise à jour du matériel à l’intérieur d’un updater React. Le stockage JSON n’était pas validé et une erreur pouvait provoquer un remplacement silencieux par les données initiales. Les pages 3D étaient importées dès l’entrée.

## Décision

Conserver React et React Router. Créer un domaine pur, un store applicatif indépendant de React, un port de repository synchrone et un adaptateur local injecté dans la composition app. Adapter le store à React par useSyncExternalStore. Charger les pages à la demande avec route.lazy. Protéger les dépendances et les transitions par des tests et une CI.

## Alternatives examinées

- Déplacer uniquement les fichiers : ne corrige ni les effets imbriqués ni le couplage au navigateur.
- Ajouter Redux/Zustand à tout le projet : dépendance et migration globales inutiles pour ce registre réduit.
- Réécrire tous les domaines en une session : risque de modifier des parcours non couverts ; migration progressive avec dette identifiée.

## Conséquences

Les règles sont testables avec Node et un faux repository. Les erreurs du stockage sont visibles et le payload corrompu est conservé. Le store est atomique pour une commande, mais il ne fournit pas de synchronisation distante. Les signatures de repository devront évoluer pour un accès API asynchrone.

lib/types.ts et routes.ts restent des réexports de compatibilité. Les fixtures conducteur/équipe, le thème, l’auth et l’éditeur restent des limites explicites. Le chunk 3D séparé reste lourd.

## Validation

Tests du reducer, du repository, du store, des exports CSV et des frontières/cycles ; types application/tests, lint et build. Revue navigateur : registres, navigation 3D/éditeur et 404. Détails et mesures : ARCHITECTURE.md.

Issues : StageOps #22, #23, #24. Suite : #25.
