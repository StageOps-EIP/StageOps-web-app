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

- La vue générale est un point de décision. Elle présente d'abord l'incident actif le plus grave, puis les autres incidents actifs, l'état du parc et seulement ensuite le programme fictif. Les matériels hors service passent avant ceux en réparation ou à vérifier. Les chiffres restent associés à un libellé et à un lien vers le détail.
- Le registre des incidents s'ouvre en liste, triée par statut actif, gravité puis récence. Le Kanban reste disponible pour le suivi par statut. Le compteur « à priorité élevée » couvre les incidents actifs élevés et critiques.
- Le tableau matériel expose six colonnes utiles à la décision. Le code QR et les notes secondaires restent sous le nom, les détails complets dans la fiche. Sur petit écran, les cartes évitent le défilement horizontal du tableau.
- Les formulaires gardent un ordre proche du travail réel : identification, catégorie et état, emplacement, puis informations facultatives. Les champs obligatoires sont nommés, les erreurs décrivent ce qui manque et le focus va sur le premier champ à corriger.

Les commandes principales et les champs ont une hauteur minimale de 44 px. Les modales gardent le focus à l'intérieur et le rendent à la commande d'ouverture quand elles se ferment. Les états ne reposent jamais sur la couleur seule. Les contrastes calculés des couples de texte principaux de cette itération vont de 5,4:1 à 16,3:1 sur les surfaces utilisées. Ces mesures et les essais au clavier ne constituent pas une certification WCAG : il reste une validation sur téléphone, au zoom et avec lecteur d'écran, ainsi que des tests de parcours auprès de personnes extérieures à l'équipe.
