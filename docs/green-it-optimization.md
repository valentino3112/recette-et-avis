# Green IT — Optimisation & Mesures

**Projet :** Recette & Avis — EFREI TI616 Numérique Durable  
**Groupe :** 3  
**Date :** Mai 2026

---

## 1. Méthodologie

### Approche

L'optimisation Green IT de ce projet suit le principe **mesurer → optimiser → re-mesurer**.  
Les métriques sont collectées sur la version déployée en production (Railway), en navigation privée, cache vidé, depuis une connexion fixe stable.

### Pages à tester

| Page | URL (prod) | Description |
|---|---|---|
| Accueil | `/#/` | Page principale, hero + grille top 4 recettes |
| Liste recettes | `/#/recettes` | Grille paginée de toutes les recettes |
| Détail recette | `/#/recettes/r1` | Recette avec ingrédients, étapes, commentaires |
| Connexion | `/#/connexion` | Formulaire d'authentification |
| Admin dashboard | `/#/admin` | Tableau de bord (admin uniquement) |

---

## 2. Outils de mesure

| Outil | Utilisation | URL |
|---|---|---|
| **Lighthouse** | Performance, Accessibilité, SEO, Bonnes pratiques | DevTools → Onglet Lighthouse |
| **PageSpeed Insights** | Lighthouse en conditions réelles + données terrain | pagespeed.web.dev |
| **EcoIndex** | Score environnemental (A–G), CO₂ par visite | ecoindex.fr |
| **Website Carbon** | Estimation CO₂ par page | websitecarbon.com |
| **DevTools Network** | Nombre de requêtes, poids total, waterfall | F12 → Network (Ctrl+Shift+N pour vider cache) |

### Protocole de test

1. Ouvrir la page en **navigation privée** (Ctrl+Shift+N)
2. Ouvrir DevTools → Network → cocher **Disable cache**
3. Recharger la page (F5) et noter : requêtes, poids total, temps de chargement
4. Lancer Lighthouse en mode **Navigation** (Mobile + Desktop)
5. Copier les scores dans le tableau ci-dessous
6. Répéter sur EcoIndex et Website Carbon avec l'URL de production

---

## 3. Métriques cibles (Green IT)

| Métrique | Cible | Justification |
|---|---|---|
| Poids de page | < 500 Ko | Référence EcoIndex niveau B |
| Requêtes HTTP | < 15 | Réduction des allers-retours réseau |
| Lighthouse Performance | > 90 | Bonne expérience utilisateur |
| Lighthouse Accessibilité | > 90 | Inclusion numérique |
| FCP (First Contentful Paint) | < 1,8 s | Perception de vitesse |
| LCP (Largest Contentful Paint) | < 2,5 s | Core Web Vitals Google |
| TBT (Total Blocking Time) | < 200 ms | Interactivité |
| CLS (Cumulative Layout Shift) | < 0,1 | Stabilité visuelle |
| EcoIndex | A ou B (> 70) | Impact environnemental faible |
| CO₂ par visite | < 0,5 g eq. CO₂ | Référence Website Carbon |

---

## 4. Tableau avant / après

Remplir la colonne **Avant** depuis l'ancienne version CDN (branche antérieure si disponible),  
et la colonne **Après** depuis la version optimisée Vite en production.

| Page | Métrique | Avant | Après | Gain |
|---|---:|---:|---:|---:|
| Accueil | Poids page (Ko) | | | |
| Accueil | Requêtes HTTP | | | |
| Accueil | Lighthouse Perf. | | | |
| Accueil | FCP (ms) | | | |
| Accueil | LCP (ms) | | | |
| Accueil | TBT (ms) | | | |
| Accueil | CLS | | | |
| Accueil | EcoIndex score | | | |
| Accueil | EcoIndex grade | | | |
| Accueil | CO₂ / visite (g) | | | |
| Liste recettes | Poids page (Ko) | | | |
| Liste recettes | Requêtes HTTP | | | |
| Liste recettes | Lighthouse Perf. | | | |
| Liste recettes | FCP (ms) | | | |
| Détail recette | Poids page (Ko) | | | |
| Détail recette | Requêtes HTTP | | | |
| Détail recette | LCP (ms) | | | |
| Connexion | Poids page (Ko) | | | |
| Connexion | Requêtes HTTP | | | |
| Admin dashboard | Poids page (Ko) | | | |
| Admin dashboard | Requêtes HTTP | | | |

---

## 5. Optimisations appliquées

### A — Toolchain Vite (impact majeur)

| Optimisation | Détail | Impact estimé |
|---|---|---|
| Suppression React CDN dev | `react.development.js` (1,1 Mo) retiré | −1,1 Mo JS |
| Suppression ReactDOM CDN dev | `react-dom.development.js` (1,1 Mo) retiré | −1,1 Mo JS |
| Suppression Babel Standalone | `babel.min.js` (860 Ko) retiré, plus de transpilation navigateur | −860 Ko JS |
| Build Vite production | React compilé, minifié, haché (vendor ~42 Ko gz + app ~20 Ko gz) | ~3 Mo → ~65 Ko |
| Code splitting | Chunk `vendor` (React/ReactDOM) séparé du code applicatif | Meilleur cache navigateur |
| Sourcemaps désactivées | `sourcemap: false` en production | −taille dist |
| Assets hachés | `[name]-[hash].js` / `.css` → cache HTTP 1 an (`max-age=31536000`) | Visites suivantes < 5 Ko |

### B — Polices

| Optimisation | Avant | Après |
|---|---|---|
| Google Fonts Inter | 3 requêtes externes + ~80 Ko + GDPR | Supprimé |
| Police de secours | `"Inter"` non disponible → fallback system | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto` |

### C — Images

| Fichier | Avant | Après | Réduction |
|---|---:|---:|---:|
| `curry-de-pois-chiches` | 1 200 Ko PNG | 101 Ko WebP | −92 % |
| `lentilles-corail-au-lait-de-coco` | 715 Ko PNG | 55 Ko WebP | −92 % |
| `tarte-aux-pommes` | 263 Ko PNG | 31 Ko WebP | −88 % |
| `pates-ail-et-huile-olive` | 123 Ko PNG | 30 Ko WebP | −76 % |
| `gateau` | 215 Ko JPEG | 39 Ko WebP | −82 % |
| **Total** | **~2 516 Ko** | **~256 Ko** | **−90 %** |

Optimisations complémentaires :
- Toutes les images ont `loading="lazy"` (déjà présent, conservé)
- Attributs `width` et `height` explicites ajoutés pour éviter le CLS
- Images redimensionnées à 800 px max (taille d'affichage réelle)

### D — Backend Express

| Optimisation | Détail |
|---|---|
| Serve `frontend/dist` en prod | Express sert le build Vite avec `max-age=1y` pour les assets |
| Fallback SPA | Route `*` renvoie `index.html` (évite les 404 sur navigation directe) |
| CORS désactivé en prod | Plus nécessaire : front et back sur le même hôte |

### E — Code React

| Optimisation | Détail |
|---|---|
| ES modules natifs | Tous les fichiers `.jsx` utilisent `import/export` standards |
| Suppression des globals `window.RA_*` | Plus de pollution du scope global |
| Suppression des data seed côté client | `data.js` ne contient plus les seed recettes/utilisateurs (~4 Ko) |
| `width`/`height` sur `<img>` | Empêche le CLS lors du chargement des images |
| Lazy loading conservé | `loading="lazy"` sur toutes les images de cards |

### F — Réseau

| Optimisation | Avant | Après |
|---|---|---|
| Requêtes externes | 6 (3 CDN JS + 3 Google Fonts) | 0 |
| Requêtes JS par page | 3 CDN + 6 JSX = 9 | 2 (vendor + app, depuis cache ensuite) |
| Cache assets | Aucun (CDN géré par unpkg) | `max-age=1y` sur fichiers hachés |

---

## 6. Reproduire le build de production en local

```bash
# 1. Cloner et installer
git clone <url-du-repo>
cd recette-et-avis
npm install

# 2. Initialiser la base de données
npm run db:init

# 3. Builder le frontend (Vite)
npm run build

# 4. Lancer en mode production
NODE_ENV=production npm run start:server

# 5. Ouvrir http://localhost:3001
```

Le build Vite génère `frontend/dist/`. Express sert ce dossier en production.

Pour simuler exactement Railway :

```bash
NODE_ENV=production npm run start
# Ceci lance seed.js --if-empty puis server.js
```

---

## 7. Tester l'URL déployée sur Railway

Une fois l'app déployée sur Railway :

```bash
# Remplacer <votre-url> par l'URL Railway
PROD_URL=https://recette-et-avis.up.railway.app

# Vérifier la route de santé
curl $PROD_URL/api/health

# Ouvrir les pages dans le navigateur
open $PROD_URL              # Accueil
open $PROD_URL/#/recettes   # Liste
open $PROD_URL/#/recettes/r1 # Détail
```

Lancer Lighthouse depuis Chrome DevTools sur chaque URL ci-dessus.

---

## 8. Railway — Variables d'environnement requises

Configurer dans Railway → Settings → Variables :

```
NODE_ENV=production
SESSION_SECRET=<valeur longue et aléatoire, min 32 caractères>
DB_PATH=/app/database/recette_avis.sqlite
SESSION_DIR=/app/database/sessions
COOKIE_SAMESITE=lax
```

**Volume Railway :** monter un volume sur `/app/database` pour persister la base SQLite entre les redéploiements.

---

## 9. Notes et limites connues

- **Base existante :** si une base SQLite a été créée avant cette optimisation, les chemins d'image en base pointent encore vers `.png`. Lancer `npm run db:init` en local pour régénérer avec les chemins `.webp`. Sur Railway, vider le volume ou lancer manuellement `node --experimental-sqlite database/seed.js`.
- **Polices :** Inter n'est plus chargée. Sur les systèmes où Inter est installée localement (macOS récent), la police sera utilisée automatiquement. Sur les autres systèmes, le fallback system-ui sera appliqué — différence visuelle négligeable.
- **SSR :** non implémenté. La page `index.html` est servie et React monte côté client. Le FCP dépend du chargement du bundle JS. Pour aller plus loin : considérer un pré-rendu statique (Vite SSG) pour la page d'accueil.
- **Images sans DB :** les recettes créées par les utilisateurs n'ont pas d'image (le formulaire ne permet pas l'upload). Seules les recettes seed ont des images.
