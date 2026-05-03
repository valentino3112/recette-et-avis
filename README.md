# Recette & Avis

**ATTENTION: BRANCHE BACKEND**

Plateforme communautaire de consultation et de partage de recettes de cuisine.
Les utilisateurs peuvent parcourir les recettes, laisser une note (1–5 étoiles), poster des commentaires et suivre d'autres membres.
Projet académique EFREI — module **TI616 Numérique Durable** (Groupe 3).


---


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


---

### Dépendances de production

!!! attention il faut avoir windows sdk pour bcrypt et SQLite !!!

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

### Dépendances de développement

| Paquet | Rôle |
|---|---|
| `jest` | Framework de tests unitaires et d'intégration |
| `supertest` | Requêtes HTTP dans les tests Jest |
| `nodemon` | Redémarrage automatique du serveur en dev |

---



## Lancer le backend en local


```bash
# Installer 
npm install

# Initialisation de la db
npm run db:init

# On execute le server nodejs
npm run start

```

Ouvrir [http://localhost:3000/api/health](http://localhost:3000/api/health) dans le navigateur.

si tout est bon vous verrez 
```json
{"status":"ok","env":"development"}
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
