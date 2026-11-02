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

Le panneau latéral garde les sept sections existantes. Un en-tête commun indique la section active et rappelle que les données sont locales. Le bouton de signalement ouvre directement le formulaire d'incident. Sur la vue générale, la fiche de production précède les incidents actifs, les productions du jeu de démonstration et l'état du matériel. Les autres pages réutilisent les surfaces, les contrôles et les couleurs d'état partagés.

Les arches décoratives restent sur l'écran de connexion ; elles sont ignorées par les lecteurs d'écran. L'éditeur 3D conserve son espace de travail plein écran : ses panneaux et contrôles utilisent les mêmes surfaces claires, tandis que le canvas représente le plateau.

## Formes et profondeur

Les contrôles ont des rayons de 8 à 16 px. Les listes et tableaux gardent des séparateurs pour le balayage. Les bordures chaudes discrètes structurent les panneaux ; les ombres sont réservées aux surfaces superposées, comme les menus et les modales.

## Règles

- Garder les faits de production liés aux données existantes ; ne pas inventer des horaires opérationnels.
- Faire apparaître les états par texte et couleur, avec une lisibilité suffisante sur fond clair.
- Conserver les parcours et la navigation clavier pendant la refonte visuelle.
- Ne pas ajouter de thème sombre ou de commandes de bascule.
