require('dotenv').config();
const express      = require('express');
const session      = require('express-session');
const FileStore    = require('session-file-store')(session);
const cors         = require('cors');
const path         = require('path');

const authRoutes        = require('./routes/auth');
const usersRoutes       = require('./routes/users');
const recettesRoutes    = require('./routes/recettes');
const commentairesRoutes = require('./routes/commentaires');
const notesRoutes       = require('./routes/notes');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares globaux ──────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS — autorise le front-end (port 3000) pendant le dev
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // nécessaire pour envoyer les cookies de session
}));

// Sessions persistées en fichiers JSON (session-file-store, pur JS)
app.use(session({
  store:             new FileStore({ path: './database/sessions', ttl: 7 * 24 * 3600, retries: 0 }),
  secret:            process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 jours
  },
}));

// ─── Routes API ───────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/users',     usersRoutes);
app.use('/api/recettes',  recettesRoutes);

// Commentaires : deux points de montage (GET/POST nested + PUT/DELETE flat)
app.use('/api/recettes/:recetteId/commentaires', commentairesRoutes);
app.use('/api/commentaires',                     commentairesRoutes);

// Notes : montage nested
app.use('/api/recettes/:recetteId/notes', notesRoutes);

// ─── Servir le front-end statique (dev + production) ─────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// ─── Route de santé ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

// ─── Gestion des erreurs ──────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route introuvable.' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

// ─── Démarrage ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}/api`);
});

module.exports = app; // pour les tests Jest
