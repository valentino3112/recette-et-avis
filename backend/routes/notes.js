const express = require('express');
const crypto  = require('crypto');
const { body, validationResult } = require('express-validator');
const db      = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// ─── GET /api/recettes/:recetteId/notes — moyenne + count ─────────────────────
router.get('/', (req, res) => {
  const row = db.prepare(`
    SELECT ROUND(AVG(valeur), 2) AS moyenne, COUNT(*) AS count
    FROM notes WHERE recette_id = ?
  `).get(req.params.recetteId);

  res.json({ moyenne: row.moyenne, count: row.count });
});

// ─── GET /api/recettes/:recetteId/notes/moi — note de l'utilisateur connecté ─
router.get('/moi', requireAuth, (req, res) => {
  const note = db.prepare(
    'SELECT valeur FROM notes WHERE recette_id = ? AND utilisateur_id = ?'
  ).get(req.params.recetteId, req.session.userId);

  res.json({ valeur: note ? note.valeur : null });
});

// ─── POST /api/recettes/:recetteId/notes — noter (crée ou met à jour) ─────────
router.post('/', requireAuth, [
  body('valeur').isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const r = db.prepare('SELECT id FROM recettes WHERE id = ? AND statut = ?').get(req.params.recetteId, 'approuvee');
  if (!r) return res.status(404).json({ error: 'Recette introuvable.' });

  const { valeur } = req.body;
  const existing = db.prepare(
    'SELECT id FROM notes WHERE recette_id = ? AND utilisateur_id = ?'
  ).get(req.params.recetteId, req.session.userId);

  if (existing) {
    db.prepare('UPDATE notes SET valeur = ? WHERE id = ?').run(valeur, existing.id);
    return res.json({ id: existing.id, valeur, updated: true });
  }

  const id = 'n_' + crypto.randomBytes(4).toString('hex');
  db.prepare('INSERT INTO notes (id, recette_id, utilisateur_id, valeur) VALUES (?, ?, ?, ?)').run(id, req.params.recetteId, req.session.userId, valeur);
  res.status(201).json({ id, valeur, updated: false });
});

module.exports = router;
