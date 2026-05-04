# Recette & Avis

Recette & Avis est une application web de partage de recettes de cuisine.  
Elle permet de consulter des recettes, publier des avis, noter des plats et gérer un profil utilisateur.  
Le projet a été réalisé dans une démarche d’éco-conception numérique : pages légères, images optimisées, polices système et base de données simple.

Site déployé : [https://recette-et-avis-production.up.railway.app/](https://recette-et-avis-production.up.railway.app/)

## Équipe

| Membre | Rôle principal |
|---|---|
| Valentin Gonçalves | Développement frontend et intégration |
| Batur Hamzaogullari | Développement backend et API |
| Emma Duvernet | Base de données et tests |
| Ivane Djotebong Tidong | Documentation et analyse Green IT |
| Roline Imele Tioda | Maquettes, validation fonctionnelle et rapport |

## Fonctionnalités

- Consultation, filtrage et détail des recettes
- Création de compte et connexion
- Ajout de recettes par les utilisateurs connectés
- Notes et commentaires
- Gestion du profil utilisateur
- Espace administrateur pour gérer recettes, commentaires et utilisateurs

## Stack technique

| Technologie | Utilisation | Justification Green IT |
|---|---|---|
| React + Vite | Interface web | Build rapide, fichiers minifiés, chargement optimisé |
| CSS | Mise en forme | Pas de framework CSS lourd |
| Node.js + Express | API backend | Serveur simple et léger |
| SQLite | Base de données | Pas de serveur BDD séparé, stockage local léger |
| WebP | Images | Format plus léger que PNG/JPEG |
| Railway | Déploiement | Déploiement simple avec ressources adaptées au projet |

## Installation locale

```bash
npm install
```

Créer un fichier `.env` à partir de `.env.example`, puis initialiser la base :

```bash
npm run db:init
```

Lancer le projet en développement :

```bash
npm run dev
```

Ou séparément :

```bash
npm run dev:backend
npm run dev:frontend
```

Build et lancement en production :

```bash
npm run build
npm start
```

## Structure du dépôt

```txt
.
├── backend/        # serveur Express, routes API, sessions et accès SQLite
├── frontend/       # interface React, pages, composants, styles et assets
├── database/       # schéma SQL et script de données initiales
├── docs/           # documentation, rapport et annexes
├── package.json    # dépendances et scripts npm
└── vite.config.js  # configuration du build frontend
```

## Conventions de commit

Format utilisé :

```txt
type: message court
```

Exemples :

```txt
feat: ajout de la page profil
fix: correction de la connexion utilisateur
docs: mise à jour du README
style: amélioration du responsive
refactor: simplification des appels API
```

## Rapport

Rapport PDF : [docs/Rapport Recette & avis.pdf](docs/Rapport%20Recette%20%26%20avis.pdf)
