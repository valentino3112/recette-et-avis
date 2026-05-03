const db = require('../db');

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié. Veuillez vous connecter.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié. Veuillez vous connecter.' });
  }
  const user = db.prepare('SELECT role FROM utilisateurs WHERE id = ?').get(req.session.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
  }
  next();
}

// Attache req.currentUser si une session existe (sans bloquer)
function loadUser(req, res, next) {
  if (req.session.userId) {
    req.currentUser = db.prepare(
      'SELECT id, nom, email, role, bio, date_creation FROM utilisateurs WHERE id = ?'
    ).get(req.session.userId) || null;
  } else {
    req.currentUser = null;
  }
  next();
}

module.exports = { requireAuth, requireAdmin, loadUser };
