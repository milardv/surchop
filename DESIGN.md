---
name: Surchope
description: Duels pop et votes bienveillants, conçus pour le mobile
colors:
  ink: "hsl(267 33% 18%)"
  arena: "#322044"
  paper: "hsl(39 100% 97%)"
  card: "#fffdf8"
  pink: "hsl(339 85% 54%)"
  yellow: "hsl(47 100% 73%)"
  cyan: "#22d3ee"
  muted: "hsl(34 44% 92%)"
typography:
  display:
    fontFamily: "Bricolage Grotesque, DM Sans, sans-serif"
    fontSize: "clamp(2.2rem, 7vw, 4.7rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
rounded:
  stage: "28px"
  card: "22px"
  control: "14px"
  pill: "999px"
spacing:
  tight: "8px"
  normal: "16px"
  open: "24px"
components:
  button-primary:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
  duel-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: Surchope

## Overview

**Creative North Star: "Le carnet de duels pop"**

L'expérience commence par un duel réel, pas une promesse abstraite. Les portraits, trois choix clairs et les votes exacts font le jeu. La page conserve une énergie d'arcade douce, sans transformer les personnes en spectacle cruel.

**Key Characteristics:** affichage mobile en une colonne ; violet d'arène pour les introductions ; jaune pour les actions ; rose, jaune et cyan pour distinguer les trois résultats.

## Colors

Le papier chaud soutient la lecture. Le violet porte les grands moments, le jaune les actions, le rose et le cyan les choix opposés. Les résultats gardent les mêmes couleurs partout.

**The Honest Score Rule.** Chaque nombre de votes est réel ; la largeur colorée n'est jamais le seul moyen de lire le score.

## Typography

Bricolage Grotesque donne une voix expressive aux titres et aux noms. DM Sans garde les actions, labels et chiffres lisibles. Les grands titres sont serrés ; les contrôles restent au moins à 16 px lorsque la saisie mobile pourrait déclencher un zoom.

## Layout

Le vote principal suit immédiatement l'introduction. Sur téléphone, l'action de vote vient avant le détail des résultats et la navigation est fixe à portée du pouce. Sur écran large, la progression et les défis occupent une colonne latérale. Les listes passent de une à deux colonnes à 640 px.

## Elevation & Depth

Le système est surtout tonal. Les cartes de duel reçoivent une ombre douce et décalée ; les autres blocs se distinguent par leur couleur ou leur espacement.

## Shapes

Les cartes ont des angles arrondis de 20 à 28 px, les portraits sont des carrés à angles de 18 px, et les actions principales des pilules. Le disque « VS » est l'unique accent rond de la rencontre.

## Components

Les choix de vote sont deux grands boutons nominatifs et une option d'égalité pleine largeur. L'état sélectionné passe en violet ; chaque bouton répond immédiatement à la pression. Les jauges affichent total, segments et valeurs individuelles. Les badges sont des pastilles secondaires, pas des obstacles au vote.

## Do's and Don'ts

- Afficher les personnes, les choix et les chiffres avant les mécaniques de partage.
- Garder les cibles tactiles d'au moins 44 px et une indication de focus visible.
- Limiter les transitions d'interface à 200 ms environ et respecter la réduction du mouvement.
- Ne jamais inventer un score, une récompense ou un classement.
- Ne pas cacher l'option d'égalité ni pousser un vote sur une personne.
