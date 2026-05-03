# Recette & Avis

Plateforme communautaire de consultation et de partage de recettes de cuisine.
Les utilisateurs peuvent parcourir les recettes, laisser une note (1–5 étoiles), poster des commentaires et suivre d'autres membres.
Projet académique EFREI — module **TI616 Numérique Durable** (Groupe 3).

**Site déployé :** *à compléter après déploiement Railway*

**Rapport PDF :** [docs/](docs/)

---

## Équipe

| Membre | Rôle |
|---|---|
| Valentin GONÇALVES | Frontend, architecture React, GitHub |
| Batur HAMZAOGULLARI | Back-end, API Express |
| Emma DUVERNET | Base de données, migrations SQLite |
| Ivane DJOTEBONG TIDONG | Tests, qualité & sécurité |
| Roline IMELE TIODA | Analyse Green IT, rapport PDF |

---

## Fonctionnalités

### Visiteurs non connectés
- Parcourir toutes les recettes avec filtres (catégorie) et tri (mieux notées, plus récentes, plus rapides, alphabétique)
- Voir le détail d'une recette : ingrédients, étapes, notes et commentaires
- Consulter le profil public d'un auteur (recettes, abonnés, abonnements)
- Créer un compte

### Utilisateurs connectés
- Noter une recette (1–5 étoiles) et poster un commentaire
- Proposer une nouvelle recette
- Suivre / se désabonner d'un autre membre
- Modifier son profil, voir ses stats, supprimer son compte

### Administrateur
- Tableau de bord avec KPIs
- Gestion des recettes, utilisateurs et commentaires

---

## Stack technique

| Couche | Technologie |
|---|---|
| Front-end | React 18 — compilé par **Vite** en production |
| Styles | CSS vanilla (variables custom, polices système) |
| Back-end | Node.js + Express |
| Base de données | SQLite via `node:sqlite` (intégré Node 22) |
| Tests | Jest + Supertest |
| Déploiement | Railway (Nixpacks) |

**Green IT :** build Vite (pas de CDN, pas de Babel navigateur), images WebP, polices système, pagination serveur, 0 dépendance front.

---

## Développement local

### Prérequis

- Node.js 22 (`nvm use` utilise automatiquement `.nvmrc`)
- npm

### Installation

```bash
git clone <url-du-repo>
cd recette-et-avis
npm install
cp .env.example .env
```

### Démarrage en développement

```bash
# Terminal 1 — backend Express (port 3001)
npm run dev:backend

# Terminal 2 — frontend Vite dev server (port 3000, proxy vers 3001)
npm run dev:frontend
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Ou en une seule commande (backend uniquement, sans hot-reload frontend) :

```bash
npm run dev
# Puis ouvrir http://localhost:3001
```

### Base de données

```bash
# Créer / réinitialiser la base de données avec les données de démo
npm run db:init

# Initialiser seulement si la base est vide (utilisé au démarrage Railway)
npm run db:init-if-empty
```

### Tests

```bash
npm test
```

### Comptes de démonstration

| Email | Rôle | Mot de passe |
|---|---|---|
| `admin@recetteavis.fr` | Administrateur | `admin1234` |
| `camille@example.com` | Utilisateur | `camille1234` |
| `lucas@example.com` | Utilisateur | `lucas1234` |

---

## Build de production

```bash
# Compiler le frontend avec Vite
npm run build
# → génère frontend/dist/ (assets minifiés et hachés)

# Lancer le serveur en production
NODE_ENV=production npm run start:server

# Ou en une commande (seed + serveur) :
NODE_ENV=production npm run start
```

Ouvrir [http://localhost:3001](http://localhost:3001).

Le serveur Express sert `frontend/dist/` avec `Cache-Control: max-age=31536000` sur les assets hachés.

### Prévisualisation Vite

```bash
npm run preview
# Ouvre http://localhost:4173 (build Vite en mode preview, sans Express)
```

---

## Déploiement Railway

### Configuration minimale

| Paramètre | Valeur |
|---|---|
| Builder | Nixpacks |
| Build command | `npm install && npm run build` |
| Start command | `npm run start` |
| Healthcheck path | `/api/health` |

Ces valeurs sont déjà définies dans `railway.json`.

### Variables d'environnement Railway

```
NODE_ENV=production
SESSION_SECRET=<valeur longue et aléatoire — min 32 caractères>
DB_PATH=/app/database/recette_avis.sqlite
SESSION_DIR=/app/database/sessions
COOKIE_SAMESITE=lax
```

### Volume pour SQLite

Monter un **volume Railway** sur `/app/database` pour persister la base SQLite entre les redéploiements.  
Sans volume, la base est réinitialisée à chaque déploiement (acceptable pour la démo, pas pour la production).

### Déroulement du déploiement

1. Railway clone le repo
2. Nixpacks exécute `npm install && npm run build` → génère `frontend/dist/`
3. Railway démarre `npm run start` → seed si vide + serveur Express
4. Express sert `frontend/dist/` + API sous `/api/`

---

## Structure du projet

```
recette-et-avis/
├── frontend/
│   ├── index.html              # Point d'entrée Vite SPA
│   ├── assets/img/             # Images WebP optimisées
│   ├── css/
│   │   └── styles.css          # Design system CSS
│   ├── js/
│   │   ├── main.jsx            # Entrée Vite (imports CSS + App)
│   │   ├── app.jsx             # Routeur principal + état global
│   │   ├── api.js              # Client HTTP vers /api
│   │   ├── data.js             # Helpers de mapping et sélecteurs
│   │   ├── components.jsx      # Header, Footer, Stars, Pager…
│   │   ├── pages-public.jsx    # Accueil, liste, détail recette
│   │   ├── pages-auth.jsx      # Connexion, inscription, profil
│   │   ├── pages-user.jsx      # Profil public, follow system
│   │   ├── pages-admin.jsx     # Dashboard admin
│   │   └── pages-extra.jsx     # À propos, contact, mentions, 404
│   └── dist/                   # Build Vite (gitignored)
├── backend/
│   ├── server.js               # Point d'entrée Express
│   ├── db.js                   # Connexion SQLite + init schéma
│   └── routes/                 # Routes API REST
├── database/
│   ├── init.sql                # Schéma SQLite
│   └── seed.js                 # Données de démonstration
├── docs/
│   ├── green-it-optimization.md  # Métriques et tableau avant/après
│   └── *.pdf                   # Livrables PDF
├── vite.config.js              # Configuration Vite + proxy dev
├── railway.json                # Configuration Railway
├── .env.example                # Template variables d'environnement
├── .nvmrc                      # Node 22
└── package.json
```

---

## Mesures Green IT

Voir [docs/green-it-optimization.md](docs/green-it-optimization.md) pour :
- Le protocole de mesure (Lighthouse, EcoIndex, Website Carbon)
- Le tableau avant/après à compléter
- La liste complète des optimisations appliquées

---

## Conventions de commits

```
type(scope): description courte
```

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `chore` | Config, dépendances, outillage |
| `docs` | README, commentaires, rapport |
| `style` | CSS, formatage |
| `refactor` | Restructuration |
| `test` | Tests |
| `perf` | Optimisation performance / Green IT |
