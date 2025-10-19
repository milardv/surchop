# 🏗️ Architecture du projet **Surchope**

> Une application web sociale et légère pour voter “qui surchope qui” — autrement dit :  
> deviner dans un couple qui est un peu plus attractif que l’autre 😏

---

## 🚀 Objectif général

L’objectif de Surchope est de proposer une application ludique, rapide et minimaliste pour :
- créer et afficher des couples (publics ou personnels),
- voter pour celui ou celle “qui surchope”,
- visualiser les résultats en temps réel,
- tout en garantissant une expérience fluide, esthétique et respectueuse des données utilisateurs.

---

## 🧩 Stack technologique

| Domaine | Choix | Raisons principales |
|----------|-------|--------------------|
| **Framework Frontend** | **React (avec Vite)** | Performances excellentes, DX moderne, hot reload ultra-rapide. |
| **Langage** | **TypeScript** | Sécurité des types, auto-complétion, réduction des erreurs runtime. |
| **Base de données & Auth** | **Firebase (Firestore + Auth)** | Hébergement serverless, synchro temps réel, simplicité d’intégration, aucun backend à maintenir. |
| **Hébergement** | **GitHub Pages** | Déploiement gratuit, simple et continu depuis le dépôt GitHub. |
| **CSS & UI** | **Tailwind CSS** | Rapidité de prototypage, cohérence visuelle, style réactif et élégant. |
| **Design System interne** | **Couleurs Surchope** (rose, blanc, gris clair) | Cohérence identitaire du produit, esthétique douce et ludique. |
| **Outil de build** | **Vite** | Lancement instantané, bundle optimisé, support natif TypeScript et React. |


---

## 🎨 Décisions UX et Design

### 🩷 Identité visuelle
- Palette centrée autour du **rose (#ec4899)**, symbole de douceur et d’amour.
- Typographie sobre et lisible, laissant la place à l’émotion et à l’humour.
- Icônes **Lucide React** pour leur minimalisme et leur cohérence stylistique.

### 💬 Ton de l’application
- Humour bienveillant : on rit *avec* les gens, pas *d’eux*.
- Explications claires sur le sens de *“surchoper”*.
- Interface inclusive et non genrée.

### 📱 Responsive design
- Tous les composants sont conçus mobile-first (flex, grid, max-width).
- Tailwind simplifie le passage entre desktop et mobile (`sm:`, `lg:`).

---

## 🧠 Logique applicative

### 🔹 Gestion des couples
- Les couples sont stockés dans Firestore avec les champs :
  ```ts
  {
    id: string,
    people_a_id: string,
    people_b_id: string,
    personA_display_name: string,
    personB_display_name: string,
    personA_image_url: string,
    personB_image_url: string,
    category: 'friends' | 'people',
    createdBy: string,
    createdAt: Timestamp,
    count_a: number,
    count_b: number,
  }

Les images sont hébergées sur **ImgBB** (API simple, hébergement gratuit).

---

### 🔹 Votes
- Chaque utilisateur peut voter une seule fois par couple.
- Le total est affiché via un composant `Gauge` (barre colorée avec ratio dynamique).
- Les résultats sont mis à jour **en temps réel** grâce à `onSnapshot()` de Firestore.

### 🔹 Consentement et éthique
- Lors de l’ajout d’un couple, une **case à cocher obligatoire** certifie que les deux personnes ont donné leur consentement explicite.
- Le système de validation empêche les doublons de noms.

---

## 🔧 Outils de développement

| Outil | Rôle |
|--------|------|
| **ESLint + Prettier** | Garantir la qualité et la cohérence du code |
| **React Easy Crop** | Permet le recadrage circulaire d’images avant upload |
| **Lucide React** | Fournit des icônes élégantes et cohérentes |
| **Firebase CLI** | Gestion de l’authentification et accès Firestore |
| **npm scripts + Vite** | Build, run et optimisation du bundle |
| **Tailwind CLI** | Génération du CSS à la volée avec classes utilitaires |

---

## 🛠️ Décisions techniques clés

1. **React + Firebase (architecture serverless)**  
   → Supprime le besoin d’un backend dédié.  
   → Fournit des données **temps réel** via `onSnapshot`.  
   → Simplifie la gestion de l’authentification.

2. **Stockage d’images via ImgBB**  
   → Upload direct depuis le front-end.  
   → Évite les contraintes d’un bucket Firebase Storage.  
   → Génère une URL publique prête à l’emploi.

3. **Découpage modulaire des composants**  
   → Chaque partie UI est isolée (`CoupleCard`, `IntroModal`, `Loader`, etc.).  
   → Permet une évolution rapide et une maintenance simplifiée.

4. **Animations Tailwind personnalisées**  
   → Animations légères CSS-only (`@keyframes`) pour un rendu fluide (ex. : cœur battant).  
   → Aucun framework d’animation lourd requis.

5. **Déploiement GitHub Pages**  
   → Pipeline minimaliste : `npm run build` → `/dist` → hébergement via Pages.  
   → CDN performant, aucun serveur requis.

---

## 🔒 Sécurité & respect des données

- **Authentification Firebase** : connexion via Google sécurisée.
- **Pas de stockage sensible** : seules les infos publiques (noms, images) sont sauvegardées.
- **Consentement obligatoire** à l’ajout d’un couple.
- **Conformité RGPD** :
    - Suppression possible sur demande.
    - Aucune donnée personnelle exploitée à des fins commerciales.
- **Firestore Security Rules** :
    - Lecture publique autorisée.
    - Ajout réservé aux utilisateurs connectés.
    - Modification restreinte à l’auteur du contenu.

---

## 📈 Évolutions prévues

| Fonctionnalité | Description |
|----------------|-------------|
| 🔍 **Recherche avancée** | Filtrer par catégorie, popularité, ou date d’ajout |
| 💬 **Profil public** | Afficher les votes reçus pour chaque personne |
| 🧠 **Auto-modération** | Détection basique des contenus inappropriés |
| 📊 **Statistiques** | Classement des couples “les plus surchopés” |
| 💞 **Partage social** | Lien unique de partage pour chaque couple |
| 🌈 **Mode sombre** | Thème secondaire optionnel pour le confort visuel |

---

## 🧭 En résumé

> **Surchope** repose sur une architecture **100 % front-end + Firebase**,  
> alliant simplicité, performance et humour.

C’est :
- 💡 *Léger et serverless*
- 💘 *Humain et poétique*
- ⚡ *Évolutif et maintenable*
