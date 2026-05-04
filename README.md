# Recette & Avis

Recette & Avis est une application web de partage de recettes de cuisine.  
Elle permet de consulter des recettes, lire des avis, noter des plats et publier des commentaires.

Le projet a aussi été conçu avec une démarche d’éco-conception : application légère, images optimisées, polices système, base de données simple et absence de ressources externes inutiles.

## Fonctionnalités

- Consultation des recettes
- Filtrage et affichage du détail d’une recette
- Création de compte et connexion
- Ajout de recettes par les utilisateurs connectés
- Ajout de commentaires et de notes
- Gestion du profil utilisateur
- Espace administrateur pour gérer les recettes, commentaires et utilisateurs

## Stack technique

- Frontend : React, Vite, CSS
- Backend : Node.js, Express
- Base de données : SQLite
- Authentification : sessions serveur
- Déploiement : Railway

## Structure du projet

```txt
.
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── middleware/
│   └── routes/
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── public/
├── database/
│   ├── init.sql
│   └── seed.js
├── docs/
├── package.json
└── vite.config.js
```

## Installation

```bash
npm install
```

Créer ensuite un fichier `.env` à partir du fichier `.env.example`.

## Initialiser la base de données

```bash
npm run db:init
```

## Lancer le projet en développement

Backend :

```bash
npm run dev:backend
```

Frontend :

```bash
npm run dev:frontend
```

## Build de production

```bash
npm run build
```

## Lancer en production

```bash
npm start
```

## Scripts utiles

```bash
npm run dev
npm run build
npm start
npm test
npm run db:init
```

## Éco-conception

Le projet applique plusieurs principes de développement web durable :

- images au format WebP ;
- polices système au lieu de polices externes ;
- build minifié avec Vite ;
- cache des fichiers statiques ;
- base SQLite légère ;
- limitation des dépendances ;
- absence de CDN externe en production.

## Auteurs

Projet réalisé dans le cadre du module TI616 à l’EFREI.
