---
name: StageOps Rideau
description: Direction artistique de l'interface Web de régie
colors:
  velours: "#4A0D1A"
  pourpre: "#8E1B2E"
  or-de-scene: "#C9A14A"
  or-pale: "#F2D79C"
  ivoire: "#F4EEE3"
  coulisse: "#16100F"
typography:
  display:
    fontFamily: "Fraunces Variable, Fraunces, serif"
    fontWeight: 600
    letterSpacing: "-0.025em"
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

## Overview

La direction « Rideau » vient du fichier fourni par l'équipe, conservé dans [docs/brand/StageOps_DA_Rideau_Figma.svg](docs/brand/StageOps_DA_Rideau_Figma.svg). L'interface reste un poste de régie dense et lisible : le caractère scénique se concentre dans le logo, les titres, la couleur d'action et les arches.

## Colors

Les couleurs de marque sont Velours `#4A0D1A`, Pourpre `#8E1B2E`, Or de scène `#C9A14A`, Coulisse `#16100F` et Ivoire `#F4EEE3`. L'interface utilise uniquement des surfaces claires, définies dans `StageOps_Web/src/index.css`. Le pourpre sert aux actions principales ; l'or reste un accent de marque. Les couleurs d'état conservent une signification opérationnelle ; chaque état reste accompagné d'un libellé.

## Typography

Fraunces sert au logotype et aux titres. Le « Ops » est en italique. DM Sans sert au texte, aux contrôles et aux données. Les deux fontes sont chargées localement par Fontsource, sans requête de police externe.

## Layout

Le panneau de navigation et les registres conservent leur organisation fonctionnelle. Les arches concentriques apparaissent uniquement sur la vue générale et l'écran de connexion ; elles restent décoratives et ignorées par les lecteurs d'écran.

## Elevation & Depth

La hiérarchie vient des fonds et des bordures chauds. Les ombres restent réservées aux surfaces qui se superposent au contenu.

## Shapes

Le symbole reprend le rideau, l'écharpe et l'encadrement or du document source. Les contrôles réutilisent des rayons de 8 à 16 px ; les lignes de registre restent droites pour faciliter le balayage.

## Components

Le bouton principal utilise le pourpre sur fond clair, avec un libellé ivoire. Les états hover, focus, disabled et erreur suivent les composants existants.

## Do's and Don'ts

- Employer les arches comme signature ponctuelle, jamais comme fond répété sur les données.
- Garder les couleurs de sécurité et d'état liées à leur sens, avec un libellé visible.
- Ne pas utiliser l'ancien violet/bleu de marque ou les anciennes fontes dans un nouvel écran.
