# V0 — captures de référence

Preuve datée de l'interface du **prototype d'origine**, avant toute refonte visuelle et de parcours.

| | |
| --- | --- |
| Version | V0 : commit `b8ae18f` (24 septembre 2026, *fix: make local development stack runnable*). C'est le prototype (PR Web #1) rendu lançable en local, juste avant la série de refonte du 25 septembre qui commence par `15b0321 feat(brand): establish StageOps visual identity` |
| Captures réalisées le | 26 novembre 2026 |
| Méthode | Worktree détaché sur `b8ae18f`, Node 24, `npm ci`, serveur `vite` local ; Playwright 1.65.1 (Chromium, rendu WebGL logiciel SwiftShader) avec [outils/capture-pages.mjs](../outils/capture-pages.mjs) et les options `--session-factice --ouvrir-par-clic` |
| Session | La V0 exige une connexion vérifiée par l'API Go (`/api/auth/me`). Pour capturer sans backend, le script place un jeton factice et répond lui-même avec un compte fictif `regie@exemple.fr`. Le code de la V0 n'est pas modifié ; seul l'e-mail affiché en bas du menu vient de cette simulation |
| Fiche matériel et détail d'incident | La V0 n'a pas de liens `?equipment=` / `?incident=` : le script clique sur **Détails** de la ligne *Projecteur LED Robe BMFL* et sur la carte *Panne projecteur BMFL* |
| Données | Contexte navigateur neuf pour chaque page : données fictives du prototype (*Hamlet*, Théâtre National) |
| Thème | Celui par défaut de la V0 : sombre, accent cyan |
| Formats | Bureau 1440 × 900 ; mobile 390 × 844 (tactile). Partie visible de l'écran, sans défilement |

Les noms de fichiers sont les mêmes qu'en [V1](../v1/README.md) pour comparer page par page. Les libellés de la V0 diffèrent : *Tableau de bord*, *Vue Scène*, *Inventaire*, *Événements*.

## Ce que montrent les captures

- **Pas de mise en page mobile** : à 390 px, le menu latéral occupe l'écran et le contenu est écrasé (voir `mobile-*.png`). La mise en page responsive arrive le lendemain (`b6889a8`).
- **Indicateur trompeur** : « Synchronisé il y a 5s » est un texte fixe ; aucune synchronisation n'existe.
- **Actions factices** : dans le détail d'un incident, **Escalader** ferme seulement la fenêtre.
- **Données non partagées** : chaque page part des données fictives ; un incident créé n'existe que dans la page Incidents, sans effet sur l'inventaire ni le tableau de bord, et disparaît au rechargement.
- **Tableau de bord** : quatre compteurs colorés, un bloc *Équipements HS* qui nomme directement le *Projecteur LED Robe BMFL*, un bloc *Incidents récents*.
- **Vue Scène** : plateau vide, sans compteur ni lien vers l'inventaire.

## Bureau

| Fichier | Route |
| --- | --- |
| [bureau-01-connexion.png](bureau-01-connexion.png) | `/login` |
| [bureau-02-inscription.png](bureau-02-inscription.png) | `/register` |
| [bureau-03-vue-generale.png](bureau-03-vue-generale.png) | `/` (Tableau de bord) |
| [bureau-04-plateau-3d.png](bureau-04-plateau-3d.png) | `/stage` (Vue Scène) |
| [bureau-05-editeur-3d.png](bureau-05-editeur-3d.png) | `/editor` |
| [bureau-06-parc-materiel.png](bureau-06-parc-materiel.png) | `/equipment` (Inventaire) |
| [bureau-07-conducteur.png](bureau-07-conducteur.png) | `/events` (Événements) |
| [bureau-08-incidents.png](bureau-08-incidents.png) | `/incidents` |
| [bureau-09-equipe.png](bureau-09-equipe.png) | `/team` |
| [bureau-10-parametres.png](bureau-10-parametres.png) | `/settings` |
| [bureau-11-profil.png](bureau-11-profil.png) | `/profile` |
| [bureau-12-fiche-materiel-bmfl.png](bureau-12-fiche-materiel-bmfl.png) | `/equipment`, puis **Détails** du BMFL (étape 3 du parcours prioritaire) |
| [bureau-13-detail-incident-bmfl.png](bureau-13-detail-incident-bmfl.png) | `/incidents`, puis carte *Panne projecteur BMFL* (étape 4 du parcours prioritaire) |

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
git worktree add --detach /tmp/stageops-v0 b8ae18f
cd /tmp/stageops-v0/StageOps_Web && npm ci && npx vite --port 5192 --strictPort
# puis, depuis un dossier où Playwright est installé (voir l'en-tête du script) :
node capture-pages.mjs http://localhost:5192 <repo>/docs/ux/v0 --session-factice --ouvrir-par-clic
```

Les dates relatives (« il y a 3 mois ») dépendent du jour de capture.
