-- Schéma de la base de données Recette & Avis
-- Activé automatiquement au démarrage du serveur

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ─── Utilisateurs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS utilisateurs (
  id            TEXT PRIMARY KEY,
  nom           TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  mot_de_passe  TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  bio           TEXT,
  date_creation TEXT NOT NULL DEFAULT (date('now'))
);

-- ─── Recettes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recettes (
  id                 TEXT PRIMARY KEY,
  titre              TEXT NOT NULL,
  description        TEXT,
  ingredients        TEXT NOT NULL, -- JSON array
  etapes             TEXT NOT NULL, -- JSON array
  temps_preparation  INTEGER NOT NULL CHECK(temps_preparation > 0),
  categorie          TEXT NOT NULL,
  image              TEXT,
  auteur_id          TEXT NOT NULL,
  statut             TEXT NOT NULL DEFAULT 'approuvee'
                       CHECK(statut IN ('en_attente', 'approuvee', 'rejetee')),
  date               TEXT NOT NULL DEFAULT (date('now')),
  FOREIGN KEY (auteur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- ─── Commentaires ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commentaires (
  id                TEXT PRIMARY KEY,
  recette_id        TEXT NOT NULL,
  utilisateur_id    TEXT NOT NULL,
  contenu           TEXT NOT NULL CHECK(length(contenu) BETWEEN 3 AND 500),
  date_commentaire  TEXT NOT NULL DEFAULT (date('now')),
  FOREIGN KEY (recette_id)     REFERENCES recettes(id)     ON DELETE CASCADE,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- ─── Notes ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id              TEXT PRIMARY KEY,
  recette_id      TEXT NOT NULL,
  utilisateur_id  TEXT NOT NULL,
  valeur          INTEGER NOT NULL CHECK(valeur BETWEEN 1 AND 5),
  UNIQUE(recette_id, utilisateur_id),
  FOREIGN KEY (recette_id)     REFERENCES recettes(id)     ON DELETE CASCADE,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- ─── Follows ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  id           TEXT PRIMARY KEY,
  follower_id  TEXT NOT NULL,
  following_id TEXT NOT NULL,
  date         TEXT NOT NULL DEFAULT (date('now')),
  UNIQUE(follower_id, following_id),
  FOREIGN KEY (follower_id)  REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- ─── Index (performances) ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_recettes_auteur    ON recettes(auteur_id);
CREATE INDEX IF NOT EXISTS idx_recettes_categorie ON recettes(categorie);
CREATE INDEX IF NOT EXISTS idx_recettes_statut    ON recettes(statut);
CREATE INDEX IF NOT EXISTS idx_commentaires_recette ON commentaires(recette_id);
CREATE INDEX IF NOT EXISTS idx_notes_recette        ON notes(recette_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower     ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following    ON follows(following_id);
