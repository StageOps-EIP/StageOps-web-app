---
name: StageOps Rideau
description: Direction artistique de l'interface Web de régie
colors:
  velours: "#3D0D17"
  pourpre: "#CB2942"
  or-de-scene: "#E7A93A"
  ivoire: "#FFFDFB"
  fond: "#F8F4F0"
typography:
  display:
    fontFamily: "DM Sans Variable, DM Sans, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.03em"
  body:
    fontFamily: "DM Sans Variable, DM Sans, sans-serif"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.pourpre}"
    textColor: "{colors.ivoire}"
    rounded: "{rounded.sm}"
---

# StageOps Rideau

## Source et intention

La direction Rideau vient du fichier fourni par l'équipe, conservé dans [docs/brand/StageOps_DA_Rideau_Figma.svg](docs/brand/StageOps_DA_Rideau_Figma.svg). Cette évolution privilégie la lisibilité d'un poste de régie tout en conservant le logo, le pourpre et l'or de scène. Le tableau de bord sert à repérer une production, les incidents, le matériel et le planning en quelques secondes.

## Couleurs

L'interface est exclusivement claire : fond `#F8F4F0`, panneaux `#FFFDFB`, texte velours `#3D0D17`, action pourpre `#CB2942` et accent or `#E7A93A`. Les couleurs d'état sont plus foncées pour rester lisibles sur fond clair. Chaque état garde un libellé, jamais la couleur seule.

## Typographie

Fraunces reste réservé au logotype, avec « Ops » en italique. DM Sans sert aux titres, au texte, aux contrôles et aux données. Les deux fontes sont chargées localement par Fontsource.

## Organisation

Le panneau latéral garde les sept sections existantes. Sur téléphone, quatre raccourcis permanents (accueil, incidents, matériel, planning) ont un pictogramme et un libellé ; le menu donne accès à toutes les sections, dont le plateau 3D. L'en-tête nomme explicitement le scénario de démonstration. Sur la vue générale, l'incident actif le plus prioritaire et l'état du matériel précèdent le programme et la fiche de production d'exemple. Le bouton de signalement ouvre directement le formulaire d'incident. La fiche matériel montre les incidents associés avant les réglages et permet d'ouvrir un signalement existant ou d'en créer un avec le matériel prérempli. Sur téléphone, le conducteur s'ouvre en liste ; le calendrier reste disponible à la demande. Les autres pages réutilisent les surfaces, les contrôles et les couleurs d'état partagés.

Les arches décoratives restent sur l'écran de connexion ; elles sont ignorées par les lecteurs d'écran. L'éditeur 3D conserve son espace de travail plein écran : ses panneaux et contrôles utilisent les mêmes surfaces claires, tandis que le canvas représente le plateau.

## Formes et profondeur

Les contrôles ont des rayons de 8 à 16 px. Les listes et tableaux gardent des séparateurs pour le balayage. Les bordures chaudes discrètes structurent les panneaux ; les ombres sont réservées aux surfaces superposées, comme les menus et les modales.

## Règles

- Garder les faits de production liés aux données existantes ; ne pas inventer des horaires opérationnels.
- Faire apparaître les états par texte et couleur, avec une lisibilité suffisante sur fond clair.
- Conserver les parcours et la navigation clavier pendant la refonte visuelle.
- Ne pas ajouter de thème sombre ou de commandes de bascule.

## Itération UX 2 — hiérarchie et accès direct

Cette itération répond à l'audit interne des parcours : la vue générale était dispersée, le tableau du parc trop dense et les actions mobiles peu lisibles. Les choix sont les suivants :

- La vue générale est un point de décision. Elle présente d'abord l'incident actif le plus grave, puis les autres incidents actifs et l'état du parc. La note qui explique le programme fictif suit ces priorités ; le badge « Démo » reste visible dès l'en-tête mobile. Les matériels hors service passent avant ceux en réparation ou à vérifier. Les chiffres restent associés à un libellé et à un lien vers le détail.
- Le registre des incidents s'ouvre en liste, triée par statut actif, gravité puis récence. Le Kanban reste disponible pour le suivi par statut. Le compteur « à priorité élevée » couvre les incidents actifs élevés et critiques.
- Le tableau matériel expose six colonnes utiles à la décision. Le code QR et les notes secondaires restent sous le nom, les détails complets dans la fiche. Sur petit écran, les cartes évitent le défilement horizontal du tableau ; le nom, le lieu et l'état ont chacun une place lisible, sans troncature du nom ou du statut.
- À 320 px, l'action principale précède les vues et l'export. Chaque ligne d'incident donne toute la largeur au titre et au contexte, puis montre la priorité et le statut en dessous. Les filtres défilent dans leur propre zone sans élargir la page.
- Les formulaires gardent un ordre proche du travail réel : identification, catégorie et état, emplacement, puis informations facultatives. Les champs obligatoires sont nommés, les erreurs décrivent ce qui manque et le focus va sur le premier champ à corriger.

Les commandes principales et les champs ont une hauteur minimale de 44 px. Les modales gardent le focus à l'intérieur et le rendent à la commande d'ouverture quand elles se ferment ; si une navigation a retiré cette commande, le focus revient au contenu principal. Les états ne reposent jamais sur la couleur seule. Les pages accueil, incidents et matériel ont été inspectées à 320 px, sans défilement horizontal de la page ; le parcours fiche matériel → incident lié et le formulaire ont été vérifiés. Ces mesures et les essais au clavier ne constituent pas une certification WCAG : il reste une validation au zoom 200 %, avec lecteur d'écran, ainsi que des tests de parcours auprès de personnes extérieures à l'équipe.

## Itération UX 3 — accès et contrôles

Sur téléphone, l'écran de connexion donne immédiatement accès aux champs : la fiche détaillée du scénario et les arches restent sur ordinateur ; un rappel court du scénario demeure en haut de la version mobile. L'inscription présente les informations et la sécurité en deux étapes nommées. Les champs de prénom et de nom occupent chacun leur ligne à 320 px ; les exemples de saisie ne servent plus de libellés.

Les libellés des champs partagés sont reliés aux contrôles. Les erreurs de validation sont associées au champ, annoncées et le focus va au premier champ à corriger. Le passage à l'étape de sécurité place le focus sur son titre. Les règles du mot de passe sont écrites en texte plutôt que résumées par une jauge colorée. La commande pour afficher le mot de passe et le retour à l'étape précédente ont une cible de 44 × 44 px.

Les bordures des champs et des boutons secondaires utilisent un brun de contrôle distinct des bordures décoratives des panneaux. Le contraste calculé du brun sur les surfaces de champs est de 3,03:1. Les couples de texte principaux vérifiés vont de 4,51:1 à 16,32:1 sur les surfaces claires. Un test vérifie les seuils des couleurs de texte et de bordure ; il ne remplace pas la revue visuelle ni un audit complet avec lecteur d'écran.
