# V1 — captures de référence

Preuve datée de l'interface **avec la direction artistique Rideau**, version testée au round 1.

| | |
| --- | --- |
| Version | V1 : commit `97ad1c3` (merge de la PR Web #7, DA Rideau), branche `main` |
| Captures réalisées le | 26 novembre 2026 |
| Méthode | Même méthode que la [V0](../v0/README.md) : Node 24, `npm ci`, serveur `vite` local ; Playwright 1.65.1 (Chromium, rendu WebGL logiciel SwiftShader) avec [outils/capture-pages.mjs](../outils/capture-pages.mjs) |
| Données | Contexte navigateur neuf pour chaque page : localStorage vide, donc scénario initial (*Hamlet*, Théâtre National) |
| Thème | Clair (seul thème de la V1) |
| Formats | Bureau 1440 × 900 ; mobile 390 × 844 (tactile). Partie visible de l'écran, sans défilement |

Les noms de fichiers sont les mêmes qu'en V0 pour comparer page par page.

## Bureau

| Fichier | Route |
| --- | --- |
| [bureau-01-connexion.png](bureau-01-connexion.png) | `/login` |
| [bureau-02-inscription.png](bureau-02-inscription.png) | `/register` |
| [bureau-03-vue-generale.png](bureau-03-vue-generale.png) | `/` |
| [bureau-04-plateau-3d.png](bureau-04-plateau-3d.png) | `/stage` |
| [bureau-05-editeur-3d.png](bureau-05-editeur-3d.png) | `/editor` |
| [bureau-06-parc-materiel.png](bureau-06-parc-materiel.png) | `/equipment` |
| [bureau-07-conducteur.png](bureau-07-conducteur.png) | `/events` |
| [bureau-08-incidents.png](bureau-08-incidents.png) | `/incidents` |
| [bureau-09-equipe.png](bureau-09-equipe.png) | `/team` |
| [bureau-10-parametres.png](bureau-10-parametres.png) | `/settings` |
| [bureau-11-profil.png](bureau-11-profil.png) | `/profile` |
| [bureau-12-fiche-materiel-bmfl.png](bureau-12-fiche-materiel-bmfl.png) | `/equipment?equipment=eq-002` (étape 3 du parcours prioritaire) |
| [bureau-13-detail-incident-bmfl.png](bureau-13-detail-incident-bmfl.png) | `/incidents?incident=inc-001` (étape 4 du parcours prioritaire) |

## Mobile

| Fichier | Route |
| --- | --- |
| [mobile-01-vue-generale.png](mobile-01-vue-generale.png) | `/` |
| [mobile-02-plateau-3d.png](mobile-02-plateau-3d.png) | `/stage` |
| [mobile-03-parc-materiel.png](mobile-03-parc-materiel.png) | `/equipment` |
| [mobile-04-incidents.png](mobile-04-incidents.png) | `/incidents` |
| [mobile-05-conducteur.png](mobile-05-conducteur.png) | `/events` |
| [mobile-06-equipe.png](mobile-06-equipe.png) | `/team` |

## Refaire les captures

```sh
git worktree add --detach /tmp/stageops-v1 97ad1c3
cd /tmp/stageops-v1/StageOps_Web && npm ci && npx vite --port 5191 --strictPort
# puis, depuis un dossier où Playwright est installé (voir l'en-tête du script) :
node capture-pages.mjs http://localhost:5191 <repo>/docs/ux/v1
```

Les dates relatives (« il y a 3 mois ») dépendent du jour de capture.
