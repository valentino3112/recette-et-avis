const express = require('express');
const db      = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', requireAdmin, (req, res) => {
  const recetteCount  = db.prepare("SELECT COUNT(*) as n FROM recettes WHERE statut = 'approuvee'").get().n;
  const userCount     = db.prepare('SELECT COUNT(*) as n FROM utilisateurs').get().n;
  const commentCount  = db.prepare('SELECT COUNT(*) as n FROM commentaires').get().n;
  const noteCount     = db.prepare('SELECT COUNT(*) as n FROM notes').get().n;
  res.json({ recetteCount, userCount, commentCount, noteCount });
});

// ─── GET /api/admin/commentaires ─────────────────────────────────────────────
router.get('/commentaires', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT c.id, c.contenu, c.date_commentaire, c.recette_id, c.utilisateur_id
    FROM commentaires c
    ORDER BY c.date_commentaire DESC
  `).all();
  res.json(rows);
});

// ─── DELETE /api/admin/commentaires/:id ──────────────────────────────────────
router.delete('/commentaires/:id', requireAdmin, (req, res) => {
  const c = db.prepare('SELECT id FROM commentaires WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Commentaire introuvable.' });
  db.prepare('DELETE FROM commentaires WHERE id = ?').run(req.params.id);
  res.json({ message: 'Commentaire supprimé.' });
});

module.exports = router;
