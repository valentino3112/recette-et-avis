const express = require('express');
const db      = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/admin/recettes — toutes les recettes (tous statuts) ────────────
router.get('/recettes', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT r.*, u.nom AS auteur_nom,
      ROUND(AVG(n.valeur), 2) AS note_moyenne,
      COUNT(DISTINCT n.id)    AS note_count
    FROM recettes r
    JOIN utilisateurs u ON u.id = r.auteur_id
    LEFT JOIN notes n ON n.recette_id = r.id
    GROUP BY r.id
    ORDER BY r.date DESC
  `).all();
  res.json(rows.map((r) => ({
    ...r,
    ingredients: JSON.parse(r.ingredients),
    etapes:      JSON.parse(r.etapes),
  })));
});

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
    SELECT c.id, c.contenu, c.date_commentaire, c.recette_id, c.utilisateur_id,
      u.nom   AS utilisateur_nom,
      r.titre AS recette_titre
    FROM commentaires c
    LEFT JOIN utilisateurs u ON u.id = c.utilisateur_id
    LEFT JOIN recettes     r ON r.id = c.recette_id
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
