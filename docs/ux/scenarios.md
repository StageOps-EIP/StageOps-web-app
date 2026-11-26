# Scénarios d'usage

Trois situations réelles de régie, décrites à partir de ce que l'application Web fait aujourd'hui (branche `main`, direction Rideau). Elles servent à choisir les tâches des tests utilisateurs ([issue #41](https://github.com/StageOps-EIP/StageOps/issues/41)) et à repérer ce qui manque.

Les données affichées viennent du scénario local de démonstration : *Hamlet*, Théâtre National, Grande Salle. Elles sont enregistrées dans le navigateur (`stageops.workspace.v1`, `stageops.scene.v1`), sans synchronisation entre appareils.

---

## 1. Le régisseur prépare l'implantation la veille, sur PC

**Qui** : régisseur général ou régisseur plateau. Connaît le métier et la conduite papier, utilise un ordinateur portable au bureau de la régie.

**Quand** : la veille du montage, au calme, environ une heure devant lui.

**Objectif** : avoir une implantation du plateau et une liste de matériel fiables pour l'équipe du lendemain.

**Déroulé dans StageOps**

1. Ouvre la **Vue générale** (`/`) : vérifie la production sélectionnée, l'horaire et la progression de la checklist.
2. Clique sur **Ouvrir le plateau 3D** (`/stage`) : regarde la scène enregistrée, change de point de vue (Ensemble, Salle, Régie, Dessus).
3. Clique sur **Modifier la scène** (`/editor`) : place décor, mannequins, chaises, tables et projecteurs ; règle intensité, couleur, angle ; saisit éventuellement des cues dans le panneau **Conduite**.
4. Ouvre le **Parc matériel** (`/equipment`) : filtre par catégorie (Lumière, Son…) et par statut pour savoir ce qui est réellement disponible.
5. Consulte le **Conducteur** (`/events`) pour situer le montage dans le planning.

**Ce qui l'aide** : rendu 3D avec vues caméra, annuler/rétablir (50 étapes), conduite en cues, filtres du parc matériel.

**Ce qui le freine aujourd'hui**

- Les objets 3D ne sont pas reliés à l'inventaire ([#33](https://github.com/StageOps-EIP/StageOps/issues/33)) : un projecteur placé dans la scène ne dit pas s'il est disponible ou hors service.
- Une seule scène locale, non rattachée à une production ; le travail fait sur le PC n'est pas visible sur un autre poste.
- Pas d'export de la conduite ([#32](https://github.com/StageOps-EIP/StageOps/issues/32)) ; seule une capture PNG de la scène est possible.
- Le conducteur et l'équipe viennent encore de données fixes ([#25](https://github.com/StageOps-EIP/StageOps/issues/25)).

**Moment décisif** : le passage de la 3D au parc matériel. S'il doit retrouver chaque projecteur à la main dans la liste, il risque de revenir à son tableur.

---

## 2. Le technicien signale une panne en plein montage, sur mobile

**Qui** : technicien lumière ou plateau, souvent intermittent, peu de temps pour l'outil. Téléphone dans une main, parfois des gants, bruit et faible lumière.

**Quand** : pendant le montage, au moment où un projecteur ne répond plus depuis la console.

**Objectif** : que le problème soit connu et suivi, en moins d'une minute, sans quitter son poste.

**Déroulé dans StageOps**

1. Ouvre l'application sur son téléphone : barre du bas **Accueil · Plateau · Matériel · Planning · Incidents**.
2. Touche **Incidents** (`/incidents`), puis **Signaler un incident**.
3. Remplit le formulaire : titre, description, priorité (Faible → Critique), équipement (liste déroulante de tout le parc), « Signalé par ».
4. Valide **Signaler l'incident** : un message confirme « Incident enregistré » ; l'équipement lié passe *À vérifier* s'il était opérationnel.
5. Vérifie dans le Kanban (colonne *Ouvert*) que son signalement apparaît.

**Ce qui l'aide** : formulaire court, priorité explicite, mise à jour automatique de l'état du matériel.

**Ce qui le freine aujourd'hui**

- Le bouton **+ Signaler un incident** de la barre supérieure n'existe que sur grand écran ; sur téléphone il faut passer par l'onglet Incidents.
- La liste des équipements n'est ni filtrée ni préremplie ; pas de scan du QR code alors que chaque équipement en possède un.
- « Signalé par » est à ressaisir à chaque fois.
- Pas de photo dans le formulaire (le modèle prévoit `images`, l'écran ne le propose pas).
- Le signalement reste dans le navigateur du téléphone : le régisseur ne le voit pas sur son PC tant que la synchronisation API/CouchDB n'est pas branchée.
- L'onglet Équipe n'est pas dans la barre du bas (menu ☰ seulement).

**Moment décisif** : le choix de l'équipement dans la liste déroulante. S'il ne trouve pas le bon projecteur en quelques secondes, il laissera « Aucun » ou abandonnera pour un message oral.

---

## 3. Le directeur technique fait le point avant l'ouverture

**Qui** : directeur technique, responsable de la sécurité et de la décision d'ouvrir les portes. Connaît toutes les équipes, peu de temps, beaucoup d'interruptions.

**Quand** : environ une heure avant l'entrée du public.

**Objectif** : savoir en quelques secondes s'il reste un problème bloquant, qui s'en occupe et si la salle est prête.

**Déroulé dans StageOps**

1. Ouvre la **Vue générale** : fiche de production (horaires, équipe affectée, progression de la checklist).
2. Lit **À traiter maintenant** : les trois incidents actifs les plus graves, triés par priorité, avec un lien **Ouvrir**.
3. Lit le bloc **Matériel** : nombre d'équipements opérationnels, à vérifier, hors service, et le premier équipement à contrôler.
4. Ouvre un incident critique (par exemple *Fuite hydraulique praticable mobile*) et lit sa description, son historique et l'équipement concerné.
5. Peut passer l'incident *En cours* ou *Résolu*.

**Ce qui l'aide** : un seul écran de synthèse, tri par gravité, mêmes données dans Incidents, Matériel et Vue générale.

**Ce qui le freine aujourd'hui**

- Aucun incident n'indique **qui** s'en occupe : le modèle d'incident n'a pas de responsable ; « Prendre en charge » change le statut sans enregistrer de nom.
- Pas de verdict « prêt / pas prêt » ; la checklist est un pourcentage non modifiable issu des données de démonstration.
- Seuls trois incidents sont listés ; il faut ouvrir la page Incidents pour voir le reste.
- La production affichée est fixe (*Hamlet*) ([#37](https://github.com/StageOps-EIP/StageOps/issues/37)).

**Moment décisif** : lorsqu'il ouvre l'incident critique et cherche le nom de la personne responsable. S'il ne le trouve pas, il appellera quelqu'un, et l'outil n'aura pas joué son rôle de synthèse.
