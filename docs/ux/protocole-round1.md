# Protocole de test utilisateur — round 1

**Objet** : vérifier si une personne du spectacle, sans explication de l'équipe, peut suivre le [parcours prioritaire](parcours-prioritaire.md), et mesurer où elle bloque.
**Version testée** : V1, branche `main` (direction Rideau). Noter le hash exact du commit sur chaque fiche.
**Issue** : [#41 — Valider les parcours de régie avec des personnes extérieures](https://github.com/StageOps-EIP/StageOps/issues/41).
**Format** : 30 minutes en visio avec partage d'écran, une personne testée par session, au moins trois sessions.

## Rôles

| Rôle | Fait | Ne fait pas |
| --- | --- | --- |
| **Observateur** (anime la session) | Accueille, lit les tâches mot pour mot, relance avec les phrases neutres ci-dessous, chronomètre, note réussite et temps. | N'aide pas, ne montre rien, ne valide ni ne corrige une action, ne répond pas aux questions sur l'interface pendant une tâche. |
| **Preneur de notes** | Caméra et micro coupés. Note chaque hésitation, erreur et verbatim avec l'horodatage, sur la [fiche de test](fiche-test-template.md). | Ne parle pas pendant la session. |

**Relances neutres autorisées** : « Qu'est-ce que vous cherchez ? », « Que pensez-vous qu'il va se passer ? », « Continuez à penser à voix haute. », « Faites comme si vous étiez seul(e). »
**Réponse à une question sur l'interface** : « Je ne peux pas vous répondre pendant la tâche ; que feriez-vous si j'étais absent ? »
Toute aide, même un geste, rend la tâche **non réussie** ; la noter dans la colonne « aide ».

## Préparation (la veille et 15 minutes avant)

1. Build de `main` accessible à la personne testée. Deux options, à fixer avant la première session :
   - URL de prévisualisation (build `npm run build` servi par `npm run preview -- --host` derrière un tunnel, ou déploiement temporaire) : la personne ouvre l'URL dans son navigateur et partage son écran ;
   - à défaut, l'observateur partage son navigateur et donne le **contrôle à distance** (Zoom, Teams). Noter ce mode sur la fiche : il ajoute de la latence.
2. **Remettre les données à zéro** avant chaque session : fenêtre de navigation privée neuve, ou suppression des clés `stageops.workspace.v1` et `stageops.scene.v1` du localStorage. Vérifier que le *Projecteur LED Robe BMFL* est *Hors service* et que l'incident *Panne projecteur BMFL* est *En cours*.
3. Ouvrir l'application sur la **Vue générale** (`/`), fenêtre en plein écran, zoom 100 %.
4. Fiche de test copiée et préremplie (code testeur `T1`, `T2`…, date, commit, appareil).
5. Formulaire de consentement envoyé et signé : enregistrement de l'écran et de la voix, usage interne, suppression après analyse. **Aucune donnée personnelle dans le dépôt ni dans le wiki public** : seulement le code testeur et le profil métier.

## Tâche principale (lue mot pour mot)

> « Vous êtes régisseur ou régisseuse de la Grande Salle. On vous dit qu'un projecteur est hors service sur le plateau.
> En partant du plateau en 3D, retrouvez quel projecteur est hors service, ouvrez l'incident qui le concerne, et faites en sorte qu'une personne de l'équipe soit chargée de le traiter.
> Dites-moi "c'est fait" quand vous pensez avoir terminé, ou "j'arrête" si vous abandonnez. »

La consigne ne nomme ni écran, ni bouton, ni le mot « assigner ». Si la personne demande de répéter, relire la consigne entière, sans la reformuler.

**Limite** : 8 minutes. Au-delà, l'observateur dit « Merci, on passe à la suite » ; la tâche est notée non réussie.

## Tâches secondaires (si le temps le permet)

Elles couvrent les deux autres scénarios de l'issue #41. Les lire mot pour mot, 4 minutes au plus chacune.

- **T2, signalement mobile** (fenêtre réduite à la taille d'un téléphone ou téléphone réel partagé) : « Vous êtes technicien(ne) en plein montage. La console son DiGiCo ne s'allume plus. Signalez-le pour que la régie soit au courant, puis vérifiez que votre signalement est bien enregistré. »
- **T3, point avant l'ouverture** : « Vous êtes directeur ou directrice technique, l'ouverture est dans une heure. En moins d'une minute, dites-moi s'il reste un problème qui pourrait empêcher d'ouvrir, et ce qui est enregistré sur cet appareil seulement. »

## Ce qu'on observe

Pour chaque étape du [parcours prioritaire](parcours-prioritaire.md#étapes) :

- le premier endroit où la personne regarde et le premier clic ;
- **dans la 3D** : ce qu'elle cherche (couleur, icône, liste, clic sur un objet), combien de temps avant de quitter l'écran, où elle va ensuite ;
- **sur la fiche matériel** : si elle lit l'alerte HS, si elle tente de créer un nouvel incident au lieu de retrouver l'existant ;
- **dans les incidents** : comment elle retrouve *Panne projecteur BMFL* (Vue générale, Kanban, Liste, filtre) ;
- **pour l'assignation** : ce qu'elle cherche, le mot qu'elle emploie (« assigner », « affecter », « attribuer », « responsable »…), le contournement choisi ;
- les réactions : soupirs, retours arrière, survols répétés, lecture à voix haute, surprise.

## Critères de réussite

| Étape | Réussie si… |
| --- | --- |
| 1. Ouvrir le plateau 3D | Le plateau 3D s'affiche, sans aide. |
| 2. Repérer l'équipement HS | La personne nomme le *Projecteur LED Robe BMFL* comme hors service, quel que soit l'écran où elle le trouve. Noter si elle l'a trouvé **dans la 3D** (impossible en V1) ou ailleurs. |
| 3. Ouvrir l'incident | Le détail de *Panne projecteur BMFL* est ouvert **sans créer de nouvel incident**. |
| 4. Assigner | En V1 la fonction n'existe pas : l'étape est réussie si la personne **constate** qu'aucune assignation n'est possible, ou identifie un responsable par un contournement qu'elle juge acceptable, **sans action destructrice** (résoudre l'incident, changer le statut du matériel à tort). |

**Tâche réussie** = étapes 1, 2 et 3 réussies sans aide, dans la limite de temps, sans erreur grave.
**Réussite partielle** = l'incident BMFL est atteint, mais après une aide, une erreur grave annulée ou au-delà de 5 minutes.
**Échec** = abandon, limite de temps atteinte, aide décisive, ou incident en double créé et non remarqué.

## Mesures

| Mesure | Définition | Recueil |
| --- | --- | --- |
| Réussite | Oui / partielle / non, par étape et pour la tâche | Observateur |
| Temps | Du dernier mot de la consigne jusqu'à « c'est fait » ou « j'arrête » ; temps intermédiaire à l'ouverture de l'incident | Observateur, chronomètre, vérifié sur l'enregistrement |
| Hésitations | Pause de plus de 5 s sans action, va-et-vient du pointeur sans clic, ou question posée à voix haute ; noter l'écran | Preneur de notes, avec horodatage |
| Erreurs | Action qui éloigne du but : mauvais écran, retour arrière, doublon d'incident, modification non voulue. **Grave** si elle change une donnée (résolution, statut, doublon) | Preneur de notes |
| Aides | Toute intervention de l'observateur au-delà des relances neutres | Observateur |
| Verbatims | Phrases exactes, entre guillemets, avec l'horodatage ; surtout attentes, surprises et vocabulaire | Preneur de notes |
| Facilité perçue | Question unique après la tâche, de 1 (très difficile) à 7 (très facile) | Observateur |

## Déroulé d'une session de 30 minutes

| Minutes | Séquence | Observateur dit / fait |
| --- | --- | --- |
| 0–3 | Accueil | Remercie, rappelle la durée et l'enregistrement, confirme le consentement. « On teste l'application, pas vous. Il n'y a pas de mauvaise réponse. Pensez à voix haute. Je ne pourrai pas vous aider pendant les tâches. » |
| 3–6 | Contexte | Trois questions : métier et ancienneté ; outils utilisés aujourd'hui pour la conduite, le matériel et les pannes ; dernière panne vécue en montage et comment elle a été suivie. |
| 6–7 | Mise en place | Fait partager l'écran (ou donne le contrôle), vérifie que la Vue générale est visible. Lance l'enregistrement si ce n'est pas fait. |
| 7–17 | **Tâche principale** | Lit la consigne, chronomètre, se tait. Relances neutres seulement. |
| 17–19 | Après la tâche | Note de facilité 1–7. « Qu'est-ce qui vous a le plus gêné ? », « À quoi vous attendiez-vous dans le plateau 3D ? », « Comment désignez-vous la personne qui s'occupe d'une panne, dans votre métier ? » |
| 19–26 | Tâches secondaires | T2 puis T3 si le temps le permet ; mêmes règles. |
| 26–30 | Débrief | « Si vous ne pouviez changer qu'une chose ? », « Utiliseriez-vous cet outil en montage ? Pourquoi ? » Remercie, arrête l'enregistrement. |

Juste après la session (10 minutes, sans la personne testée) : l'observateur et le preneur de notes comparent leurs relevés, complètent la fiche et classent chaque problème par gravité (bloquant / gênant / mineur).

## Après le round

1. Consolider les fiches : taux de réussite par étape, temps médian, problèmes vus chez au moins deux personnes.
2. Ouvrir une issue ciblée par problème récurrent dans le dépôt StageOps, avec les verbatims anonymisés.
3. Remplir la ligne V1 de [versions.md](versions.md) (colonne « résultat au test suivant ») et définir la V2.
4. Résumé anonymisé dans le wiki ; consigner séparément invitations, réponses et tests réellement réalisés (critère de #41).
