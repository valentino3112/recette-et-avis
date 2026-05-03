require('dotenv').config();
const express      = require('express');
const session      = require('express-session');
const FileStore    = require('session-file-store')(session);
const cors         = require('cors');
const path         = require('path');

const authRoutes         = require('./routes/auth');
const usersRoutes        = require('./routes/users');
const recettesRoutes     = require('./routes/recettes');
const commentairesRoutes = require('./routes/commentaires');
const notesRoutes        = require('./routes/notes');

const app  = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const isProd = process.env.NODE_ENV === 'production';

const DEFAULT_DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || './database';
const DB_PATH    = process.env.DB_PATH    || path.join(DEFAULT_DB_DIR, 'recette_avis.sqlite');
const SESSION_DIR = process.env.SESSION_DIR || path.join(path.dirname(DB_PATH), 'sessions');

const FRONTEND_DIST   = path.join(__dirname, '../frontend/dist');
const FRONTEND_DEV    = path.join(__dirname, '../frontend');
const FRONTEND_PUBLIC = path.join(__dirname, '../frontend/public');

if (isProd) {
  app.set('trust proxy', 1);
}

// ─── Middlewares globaux ──────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS — uniquement nécessaire en dev (front sur :3000, back sur :3001)
if (!isProd) {
  app.use(cors({
    origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));
}

// Sessions persistées en fichiers JSON
app.use(session({
  store:             new FileStore({ path: SESSION_DIR, ttl: 7 * 24 * 3600, retries: 0 }),
  secret:            process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   isProd,
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  },
}));

// ─── Routes API ───────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/users',     usersRoutes);
app.use('/api/recettes',  recettesRoutes);

app.use('/api/recettes/:recetteId/commentaires', commentairesRoutes);
app.use('/api/commentaires',                     commentairesRoutes);

app.use('/api/recettes/:recetteId/notes', notesRoutes);

// ─── Route de santé ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

// ─── Servir le front-end ──────────────────────────────────────────────────────
// En production : build Vite depuis frontend/dist (assets hachés, minifiés)
// En développement : fichiers source depuis frontend/ (Vite dev server sur :3000)
const staticDir = isProd ? FRONTEND_DIST : FRONTEND_DEV;

app.use(express.static(staticDir, {
  maxAge: isProd ? '1y' : 0,
  etag:   true,
}));

// En dev : servir aussi frontend/public/ (images WebP) qui sont dans dist/ en production
if (!isProd) {
  app.use(express.static(FRONTEND_PUBLIC, { maxAge: 0, etag: true }));
}

// SPA fallback — toutes les routes non-API renvoient index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(staticDir, 'index.html'));
});

// ─── Gestion des erreurs ──────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route introuvable.' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

// ─── Démarrage ────────────────────────────────────────────────────────────────
app.listen(PORT, HOST, () => {
  console.log(`Serveur démarré sur http://${HOST}:${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}/api`);
  if (isProd) console.log(`Front-end servi depuis ${FRONTEND_DIST}`);
});

module.exports = app;
