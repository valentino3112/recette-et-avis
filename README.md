# Recette & Avis

Plateforme communautaire de consultation et de partage de recettes de cuisine.
Les utilisateurs peuvent parcourir les recettes, laisser une note (1–5 étoiles), poster des commentaires et suivre d'autres membres.
Projet académique EFREI — module **TI616 Numérique Durable** (Groupe 3).

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

---

## Fonctionnalités prévues (prochaine phase)

### Back-end Node.js / Express
- API REST complète (recettes, utilisateurs, commentaires, notes, follows)
- Authentification par sessions (express-session + connect-sqlite3)
- Hash des mots de passe avec bcrypt
- Validation des entrées côté serveur (express-validator)

### Base de données SQLite
- Schéma relationnel (tables : recettes, utilisateurs, commentaires, notes, follows)
- Migrations et seed data SQL

### Tests
- Tests unitaires back-end avec Jest + Supertest
- Tests d'intégration base de données

### Optimisation Green IT (phase finale)
- Réécriture du front-end en HTML/CSS/JS natif (sans React, sans CDN)
- Mesure et comparaison des deux versions (empreinte carbone, taille de page, nombre de requêtes HTTP)

---

## Stack technique

| Couche | Technologie |
|---|---|
| Front-end (prototype) | React 18 via CDN + Babel Standalone (transpilation JSX in-browser) |
| Styles | CSS vanilla avec variables custom (design system maison) |
| Persistance | `localStorage` (`ra_state_v1`) — simulé, pas de vrai back-end |
| Back-end (à venir) | Node.js + Express |
| Base de données (à venir) | SQLite via `better-sqlite3` |
| Tests (à venir) | Jest + Supertest |

---

## Lancer le site en local

Le front-end est une SPA statique. Il suffit de servir le dossier `frontend/` avec n'importe quel serveur HTTP local.

### Option A — `serve` (recommandé, zéro config)

```bash
# Installer serve une seule fois (globalement)
npm install -g serve

# Lancer depuis la racine du projet
serve frontend
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

### Option B — extension VS Code

Installer l'extension **Live Server** (Ritwick Dey), faire un clic droit sur `frontend/index.html` → **Open with Live Server**.

### Option C — Python (si Python est installé)

```bash
cd frontend
python -m http.server 8080
```

Ouvrir [http://localhost:8080](http://localhost:8080).

> **Pourquoi pas `file://` ?** Les scripts `type="text/babel"` chargés via `src=` sont bloqués par la politique CORS des navigateurs quand le protocole est `file://`. Il faut obligatoirement un serveur HTTP, même local.

### Comptes de démonstration

| Email | Rôle | Mot de passe |
|---|---|---|
| `admin@recetteavis.fr` | Administrateur | n'importe lequel |
| `camille@example.com` | Utilisateur | n'importe lequel |

---

## Préparer le back-end (fondation)

Ces commandes créent la structure Node.js + Express + SQLite prête à être développée.

### 1. Initialiser le projet Node

```bash
# À la racine du dépôt
npm init -y
```

### 2. Installer les dépendances de production

```bash
npm install express better-sqlite3 bcrypt express-session connect-sqlite3 express-validator cors dotenv
```

| Paquet | Rôle |
|---|---|
| `express` | Serveur HTTP / routeur |
| `better-sqlite3` | Pilote SQLite synchrone (simple, performant) |
| `bcrypt` | Hash des mots de passe |
| `express-session` | Gestion des sessions utilisateur |
| `connect-sqlite3` | Stockage des sessions dans SQLite |
| `express-validator` | Validation et sanitisation des entrées |
| `cors` | En-têtes CORS pour le dev front/back séparés |
| `dotenv` | Variables d'environnement (`.env`) |

### 3. Installer les dépendances de développement

```bash
npm install --save-dev jest supertest nodemon
```

| Paquet | Rôle |
|---|---|
| `jest` | Framework de tests unitaires et d'intégration |
| `supertest` | Requêtes HTTP dans les tests Jest |
| `nodemon` | Redémarrage automatique du serveur en dev |

### 4. Scripts npm (à ajouter dans `package.json`)

```json
"scripts": {
  "start": "node backend/server.js",
  "dev": "nodemon backend/server.js",
  "test": "jest --runInBand"
}
```

### 5. Lancer le serveur de développement (une fois créé)

```bash
npm run dev
```

---

## Structure du projet

```
PROJET_SITE_RECETTES/
├── frontend/
│   ├── index.html          # Point d'entrée SPA
│   ├── css/
│   │   └── styles.css      # Design system CSS
│   └── js/
│       ├── data.js         # Seed data + helpers localStorage
│       ├── app.jsx         # Routeur principal + état global
│       ├── components.jsx  # Header, Footer, Stars, Pager…
│       ├── pages-public.jsx   # Accueil, liste recettes, détail
│       ├── pages-auth.jsx     # Connexion, inscription, profil
│       ├── pages-user.jsx     # Profil public, follow system
│       ├── pages-admin.jsx    # Dashboard admin
│       └── pages-extra.jsx    # À propos, contact, mentions, 404
├── backend/                # À créer — API Express
├── docs/                   # Livrables PDF du projet
├── .gitignore
└── README.md
```

---

## Auteurs

Groupe 3 — EFREI Paris · Module TI616 Numérique Durable · 2025–2026
