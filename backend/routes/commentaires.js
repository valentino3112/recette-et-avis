const express = require('express');
const crypto  = require('crypto');
const { body, validationResult } = require('express-validator');
const db      = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router({ mergeParams: true }); // accès à req.params.recetteId

// ─── GET /api/recettes/:recetteId/commentaires ────────────────────────────────
router.get('/', (req, res) => {
  const r = db.prepare('SELECT id FROM recettes WHERE id = ?').get(req.params.recetteId);
  if (!r) return res.status(404).json({ error: 'Recette introuvable.' });

  const rows = db.prepare(`
    SELECT c.id, c.contenu, c.date_commentaire,
           u.id AS utilisateur_id, u.nom AS utilisateur_nom, u.role AS utilisateur_role
    FROM commentaires c
    JOIN utilisateurs u ON u.id = c.utilisateur_id
    WHERE c.recette_id = ?
    ORDER BY c.date_commentaire DESC
  `).all(req.params.recetteId);

  res.json(rows);
});

// ─── POST /api/recettes/:recetteId/commentaires ───────────────────────────────
router.post('/', requireAuth, [
  body('contenu').trim().isLength({ min: 3, max: 500 }).withMessage('Commentaire : 3 à 500 caractères.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const r = db.prepare('SELECT id FROM recettes WHERE id = ? AND statut = ?').get(req.params.recetteId, 'approuvee');
  if (!r) return res.status(404).json({ error: 'Recette introuvable.' });

  const id   = 'c_' + crypto.randomBytes(4).toString('hex');
  const date = new Date().toISOString().slice(0, 10);

  db.prepare(
    'INSERT INTO commentaires (id, recette_id, utilisateur_id, contenu, date_commentaire) VALUES (?, ?, ?, ?, ?)'
  ).run(id, req.params.recetteId, req.session.userId, req.body.contenu.trim(), date);

  const user = db.prepare('SELECT id, nom, role FROM utilisateurs WHERE id = ?').get(req.session.userId);
  res.status(201).json({ id, contenu: req.body.contenu.trim(), date_commentaire: date, utilisateur_id: user.id, utilisateur_nom: user.nom, utilisateur_role: user.role });
});

// ─── PUT /api/commentaires/:id ────────────────────────────────────────────────
router.put('/:id', requireAuth, [
  body('contenu').trim().isLength({ min: 3, max: 500 }).withMessage('Commentaire : 3 à 500 caractères.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const c = db.prepare('SELECT * FROM commentaires WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Commentaire introuvable.' });

  const me = db.prepare('SELECT role FROM utilisateurs WHERE id = ?').get(req.session.userId);
  if (c.utilisateur_id !== req.session.userId && me.role !== 'admin') {
    return res.status(403).json({ error: 'Action non autorisée.' });
  }

  db.prepare('UPDATE commentaires SET contenu = ? WHERE id = ?').run(req.body.contenu.trim(), req.params.id);
  res.json({ id: req.params.id, contenu: req.body.contenu.trim() });
});

// ─── DELETE /api/commentaires/:id ─────────────────────────────────────────────
router.delete('/:id', requireAuth, (req, res) => {
  const c = db.prepare('SELECT utilisateur_id FROM commentaires WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Commentaire introuvable.' });

  const me = db.prepare('SELECT role FROM utilisateurs WHERE id = ?').get(req.session.userId);
  if (c.utilisateur_id !== req.session.userId && me.role !== 'admin') {
    return res.status(403).json({ error: 'Action non autorisée.' });
  }

  db.prepare('DELETE FROM commentaires WHERE id = ?').run(req.params.id);
  res.json({ message: 'Commentaire supprimé.' });
});

module.exports = router;
