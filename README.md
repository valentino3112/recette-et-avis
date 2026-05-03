# Recette & Avis

**ATTENTION: BRANCHE BACKEND**

Plateforme communautaire de consultation et de partage de recettes de cuisine.
Les utilisateurs peuvent parcourir les recettes, laisser une note (1–5 étoiles), poster des commentaires et suivre d'autres membres.
Projet académique EFREI — module **TI616 Numérique Durable** (Groupe 3).

**Site déployé :** *à compléter après déploiement*

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

## Fonctionnalités actuelles

### Visiteurs non connectés
- Parcourir toutes les recettes avec filtres (catégorie, temps de préparation) et tri (mieux notées, plus récentes, plus rapides, alphabétique)
- Voir le détail d'une recette : ingrédients, étapes, notes et commentaires
- Consulter le profil public d'un auteur (ses recettes, ses abonnés, ses abonnements)
- Créer un compte

### Utilisateurs connectés
- Noter une recette (1–5 étoiles) et poster un commentaire
- Proposer une nouvelle recette (titre, catégorie, temps, description, ingrédients, étapes)
- Suivre / se désabonner d'un autre membre
- Accéder à son profil privé : modifier son nom/email, voir ses recettes, ses commentaires, ses stats d'abonnements
- Supprimer son compte

### Administrateur
- Tableau de bord avec KPIs (recettes, utilisateurs, commentaires, notes)
- Gestion des recettes : approuver, rejeter, supprimer
- Gestion des utilisateurs : consulter, promouvoir en admin, supprimer
- Gestion des commentaires : modérer, supprimer

### Navigation
- Menu hamburger responsive (mobile ≤ 744 px)
- Routing SPA côté client via hash (`#/recettes`, `#/recettes/:id`, `#/profil`, etc.)
- Pages : Accueil, Recettes, Détail recette, Proposer, À propos, Contact, Mentions légales, 404

### Back-end Node.js / Express
- API REST complète (recettes, utilisateurs, commentaires, notes, follows)
- Authentification par sessions (express-session + session-file-store)
- Hash des mots de passe avec bcryptjs
- Validation des entrées côté serveur (express-validator)

### Base de données SQLite
- Schéma relationnel (tables : recettes, utilisateurs, commentaires, notes, follows)
- Migrations et seed data SQL

### Tests
- Tests unitaires back-end avec Jest + Supertest
- Tests d'intégration base de données

---

### Dépendances et installation

| Couche | Technologie | Justification Green IT |
|---|---|---|
| Front-end (prototype) | React 18 via CDN + Babel Standalone | Phase de prototype uniquement — sera remplacé par du JS natif pour la mesure finale |
| Styles | CSS vanilla avec variables custom | Aucune dépendance externe, design system léger et réutilisable |
| Persistance | API Express + SQLite | Données persistées côté serveur, sans service BDD externe |
| Back-end | Node.js + Express | Runtime léger, faible consommation mémoire |
| Base de données | SQLite via `node:sqlite` | Fichier unique, pas de serveur BDD séparé, I/O minimaux |
| Tests | Jest + Supertest | Dépendances de dev uniquement, non incluses en prod |

> Note: le backend utilise `node:sqlite`, lance donc les scripts Node avec `--experimental-sqlite` comme dans `package.json`.

#### Paquets de production

| Paquet | Rôle |
|---|---|
| `express` | Serveur HTTP / routeur |
| `node:sqlite` | Pilote SQLite synchrone intégré à Node.js |
| `bcryptjs` | Hash des mots de passe |
| `express-session` | Gestion des sessions utilisateur |
| `session-file-store` | Stockage persistant des sessions en fichiers JSON |
| `express-validator` | Validation et sanitisation des entrées |
| `cors` | En-têtes CORS pour le dev front/back séparés |
| `dotenv` | Variables d'environnement (`.env`) |

#### Dépendances de développement

| Paquet | Rôle |
|---|---|
| `jest` | Framework de tests unitaires et d'intégration |
| `supertest` | Requêtes HTTP dans les tests Jest |
| `nodemon` | Redémarrage automatique du serveur en dev |

---

## Lancer le site en local

Le backend sert aussi le dossier `frontend/`. Pour tester l'application complète, lancer donc l'API puis ouvrir le site depuis le port `3001`.

```bash
# Installer les dépendances
npm install

# Initialiser la base de données
npm run db:init

# Démarrer le serveur API + front statique
npm run start
```

Ouvrir [http://localhost:3001](http://localhost:3001) dans le navigateur.

La route de santé est disponible sur [http://localhost:3001/api/health](http://localhost:3001/api/health) :

```json
{"status":"ok","env":"development"}
```

### Développement backend

```bash
npm run dev
```

### Front-end seul

Le front-end est une SPA statique. Il suffit de servir le dossier `frontend/` avec n'importe quel serveur HTTP local.

### Option A — `serve` (recommandé, zéro config)

```bash
# Installer serve une seule fois (globalement)
npm install -g serve

# Lancer depuis la racine du projet
serve frontend
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

Quand le front tourne sur `localhost:3000`, `frontend/js/api.js` envoie automatiquement les appels API vers `http://localhost:3001/api`.

> **Pourquoi pas `file://` ?** Les scripts `type="text/babel"` chargés via `src=` sont bloqués par la politique CORS des navigateurs quand le protocole est `file://`. Il faut obligatoirement un serveur HTTP, même local.

### Comptes de démonstration

| Email | Rôle | Mot de passe |
|---|---|---|
| `admin@recetteavis.fr` | Administrateur | `admin1234` |
| `camille@example.com` | Utilisateur | `camille1234` |

---

## Déploiement Railway

Railway est la cible recommandée pour ce projet, car l'application est un serveur Express qui sert le front-end et écrit dans une base SQLite locale.

Configuration recommandée :

```text
Builder: Nixpacks
Start command: npm run start
Healthcheck path: /api/health
Volume mount path: /app/database
```

Variables d'environnement Railway :

```text
NODE_ENV=production
SESSION_SECRET=<valeur longue et secrète>
DB_PATH=/app/database/recette_avis.sqlite
SESSION_DIR=/app/database/sessions
COOKIE_SAMESITE=lax
```

Le script `npm run start` lance `database/seed.js --if-empty` avant le serveur : la base est remplie au premier démarrage seulement, puis les données du volume sont conservées aux redéploiements.

Vercel n'est pas recommandé pour cette version du projet : Express y tourne en fonction serverless, `express.static()` n'y sert pas les fichiers statiques, et le filesystem n'est pas persistant pour SQLite.

---

## Structure du projet

```
recette-et-avis/
├── frontend/
│   ├── index.html              # Point d'entrée SPA
│   ├── assets/img/             # Images recettes (optimisées)
│   ├── css/
│   │   └── styles.css          # Design system CSS (variables, composants)
│   └── js/
│       ├── data.js             # Helpers de mapping API + fallback prototype
│       ├── app.jsx             # Routeur principal + état global
│       ├── components.jsx      # Header, Footer, Stars, Pager…
│       ├── pages-public.jsx    # Accueil, liste recettes, détail
│       ├── pages-auth.jsx      # Connexion, inscription, profil
│       ├── pages-user.jsx      # Profil public, système de follow
│       ├── pages-admin.jsx     # Dashboard admin
│       └── pages-extra.jsx     # À propos, contact, mentions, 404
├── backend/                    # API Express
│   ├── server.js               # Point d'entrée serveur
│   ├── db.js                   # Connexion SQLite + init schéma
│   └── routes/                 # Routes API (users, recettes, auth…)
├── database/                   # Schéma SQL + seed
│   └── init.sql                # Schéma + seed data
├── docs/                       # Livrables PDF (consignes, rapports UML)
├── .env.example                # Variables d'environnement (template)
├── .gitignore
├── .gitattributes
├── package.json
└── README.md
```

---

## Conventions de commits

Ce projet suit la convention [Conventional Commits](https://www.conventionalcommits.org/fr/) :

```
type(scope): description courte en minuscules
```

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `chore` | Config, dépendances, outillage |
| `docs` | README, commentaires, rapport |
| `style` | CSS, formatage (sans changement de logique) |
| `refactor` | Restructuration sans changement de comportement |
| `test` | Ajout ou correction de tests |

**Exemples :**
```
feat(frontend): add hamburger menu for mobile navigation
fix(frontend): remove CSS pseudo-element conflict on follow button
feat(backend): add CRUD routes for recipes
chore: add .env.example
docs: update README with deployment URL
```

---

## Workflow Git

```
main          ← code déployé (jamais de commit direct)
└── develop   ← branche d'intégration
    ├── feature/frontend-base     ✅ mergé
    ├── feature/backend-setup     → en cours
    ├── feature/auth              → à venir
    ├── feature/crud-recettes     → à venir
    ├── feature/crud-users        → à venir
    └── feature/deploy            → à venir
```

Chaque feature part de `develop`, revient dans `develop` par Pull Request.
`develop` → `main` uniquement pour les releases stables.

---

## Auteurs

Groupe 3 — EFREI Paris · Module TI616 Numérique Durable · 2025–2026
