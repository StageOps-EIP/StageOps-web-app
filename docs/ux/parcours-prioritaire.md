# Parcours prioritaire : du plateau 3D à l'incident assigné

> Ouvrir le plateau 3D → repérer un équipement hors service → ouvrir l'incident → l'assigner.

Ce parcours relie les deux promesses de StageOps : voir le plateau, et ne pas laisser un problème sans suite. Il est décrit **tel qu'il fonctionne sur `main` (V1, direction Rideau)**. Les différences avec la V0 sont signalées quand elles changent le parcours.

**Données du scénario utilisées** : le *Projecteur LED Robe BMFL* (`eq-002`, QR `QR-LIGHT-002`, Gril · Cour, responsable Thomas Dubois) est **Hors service**. L'incident *Panne projecteur BMFL* (`inc-001`, priorité Élevée, statut En cours, signalé par Thomas Dubois) lui est déjà lié.

## Constat à connaître avant de tester

Deux étapes du parcours ne sont **pas possibles** dans l'application actuelle :

| Étape | Pourquoi | Suivi |
| --- | --- | --- |
| Repérer l'équipement HS **dans la 3D** | La scène 3D n'est pas reliée à l'inventaire : `equipmentId` existe sur les objets mais n'est jamais renseigné. Le plateau par défaut affiche « 0 objets ». En lecture seule, les objets ne sont pas cliquables. | [#33](https://github.com/StageOps-EIP/StageOps/issues/33) |
| **Assigner** l'incident | Le modèle `Incident` n'a pas de champ responsable. « Prendre en charge » passe le statut à *En cours* sans enregistrer qui. Seul l'équipement a un « Responsable » modifiable. | à créer après le round 1 |

Le test garde ces étapes volontairement : on mesure ce que la personne attend de l'outil et ce qu'elle fait quand il ne répond pas. C'est l'information dont on a besoin pour concevoir la V2.

## Étapes

### Étape 1 : ouvrir le plateau 3D

- **Écran** : Vue générale (`/`) → Plateau 3D (`/stage`).
- **Chemins possibles** : lien **Ouvrir le plateau 3D** en haut à droite ; lien **Ouvrir** du bloc *Plateau 3D* en bas de page ; entrée **Plateau 3D** du menu latéral ; onglet **Plateau** sur mobile.
- **Friction probable**
  - Trois liens vers la même page sur la Vue générale ; le bloc du bas est sous la ligne de flottaison sur un portable.
  - Chargement du moteur 3D (~940 Ko) : quelques secondes d'écran vide sur une machine modeste, sans indication de progression dans le canvas.
- **Moment décisif** : le premier rendu. Si l'écran reste noir ou vide, la personne doute que la page fonctionne.

### Étape 2 : repérer l'équipement hors service

- **Écran attendu** : Plateau 3D (`/stage`).
- **Ce que l'écran montre** : le volume de scène, les pendrillons, trois sources lumineuses, les vues caméra (Ensemble, Salle, Régie, Dessus), « 0 objets · 3 sources » et le message *Aucun objet de décor placé*. Aucun état de matériel, aucune légende, aucun lien vers le parc.
- **Friction probable**
  - La personne cherche une couleur, une icône ou une liste « hors service » sur le plateau, et ne trouve rien.
  - Elle peut cliquer sur **Modifier la scène** en pensant y trouver le matériel, et arriver dans l'éditeur, plus complexe.
  - Retour arrière vers la Vue générale ou le menu pour chercher ailleurs.
- **Chemins de repli dans l'application**
  - Vue générale, bloc **Matériel** : compteur *hors service* et premier équipement à contrôler (*Projecteur LED Robe BMFL*, badge Hors service), lien direct vers sa fiche.
  - **Parc matériel** (`/equipment`) : filtre *Tous les statuts → Hors service*, ligne BMFL, bouton **Détails**.
- **Moment décisif** : **le plus important du parcours.** Noter combien de temps la personne cherche dans la 3D avant d'abandonner, où elle va ensuite, et ce qu'elle dit attendre du plateau.

### Étape 3 : ouvrir l'incident lié

- **Écrans** : fiche matériel (modale sur `/equipment?equipment=eq-002`) → Incidents (`/incidents`) → détail (modale sur `/incidents?incident=inc-001`).
- **Ce que l'écran montre** : la fiche du BMFL affiche le statut, l'emplacement, le responsable, les notes et l'alerte *« Cet équipement est marqué HS. Pensez à créer un incident et à notifier le responsable. »* Elle **ne montre pas** l'incident déjà lié et n'a pas de lien vers lui.
- **Friction probable**
  - L'alerte pousse à **créer un doublon** via **+ Signaler un incident** (barre du haut), qui n'est d'ailleurs pas prérempli avec l'équipement ([#38](https://github.com/StageOps-EIP/StageOps/issues/38)).
  - Sur la page Incidents, aucune recherche : filtre par priorité seulement. L'incident BMFL est dans la colonne *En cours* du Kanban, parmi huit incidents ; l'ordre des cartes ne suit pas la gravité ([#39](https://github.com/StageOps-EIP/StageOps/issues/39)).
  - Sur mobile, les colonnes du Kanban sont empilées : il faut faire défiler la colonne *Ouvert* avant d'atteindre *En cours*.
- **Chemin le plus court existant** : Vue générale → **À traiter maintenant** → *Panne projecteur BMFL* → **Ouvrir** (l'incident est 2ᵉ dans la liste triée par gravité).
- **Moment décisif** : le choix entre « chercher l'incident existant » et « en créer un nouveau ». Créer un doublon est compté comme une erreur.

### Étape 4 : assigner l'incident

- **Écran** : détail de l'incident (modale).
- **Ce que l'écran montre** : priorité, statut, description, *Signalé par*, date, équipement concerné, historique (*Incident signalé*, *Prise en charge — En cours*). Actions : **Marquer résolu** et **Fermer** (car l'incident est déjà *En cours* ; **Prendre en charge** n'apparaît que pour un incident *Ouvert*).
- **Friction probable**
  - Aucun champ « assigné à » ; la personne relit la modale, survole les éléments, cherche un menu.
  - Confusion possible entre *Signalé par* (Thomas Dubois) et la personne en charge.
  - Contournements à observer : ouvrir la page **Équipe**, modifier le **Responsable** dans la fiche matériel, ou cliquer **Marquer résolu** par erreur (erreur grave : l'incident est clos et le matériel peut repasser opérationnel).
- **Moment décisif** : ce que la personne déclare quand elle constate qu'elle ne peut pas assigner (« je ferais comment ? », « j'appellerais… »). Ses mots orientent le futur champ d'assignation : à une personne, à un rôle, à un service.

## Différences avec la V0

| Point | V0 (`b8ae18f`, prototype de septembre) | V1 (`main`) |
| --- | --- | --- |
| Accès | Connexion obligatoire via l'API Go | Espace local sans compte |
| Téléphone | Aucune mise en page mobile | Barre d'onglets en bas, écrans adaptés |
| Thème et libellés | Sombre, cyan ; *Tableau de bord*, *Vue Scène*, *Inventaire*, *Événements* | Clair Rideau ; *Vue générale*, *Plateau 3D*, *Parc matériel*, *Conducteur* |
| Étape 1 (ouvrir la 3D) | Bouton **Ouvrir Vue Scène** dans la carte de la représentation | Lien **Ouvrir le plateau 3D** et bloc *Plateau 3D* |
| Étape 2 (repérer le HS) | 3D vide. Le tableau de bord a un bloc *Équipements HS* qui nomme le BMFL | 3D vide (« 0 objets »). Le bloc *Matériel* donne les compteurs et le premier équipement à contrôler |
| Étape 3 (ouvrir l'incident) | Fiche matériel sans lien vers l'incident ; incident trouvé dans *Incidents récents* ou le Kanban | Même manque sur la fiche ; incident dans « À traiter maintenant », trié par gravité |
| Étape 4 (assigner) | Pas d'assignation ; bouton **Escalader** sans effet | Pas d'assignation ; **Escalader** retiré |
| Cohérence des données | Chaque page a ses propres données ; rien n'est enregistré | Matériel et incidents partagés et enregistrés dans le navigateur |

Captures, mêmes noms de fichiers pour comparer : V0 [v0/](v0/README.md) · V1 [v1/](v1/README.md).

## Chemin idéal visé (à valider par les tests)

Plateau 3D → projecteur BMFL affiché en rouge avec son état → clic : fiche courte avec l'incident lié → **Ouvrir l'incident** → champ **Assigné à** → choix d'une personne de l'équipe → l'historique note l'assignation. Quatre écrans au plus, aucun retour arrière.
