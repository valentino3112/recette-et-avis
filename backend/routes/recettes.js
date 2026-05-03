const express = require('express');
const crypto  = require('crypto');
const { body, validationResult } = require('express-validator');
const db      = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const CATEGORIES = ['Entrée', 'Plat principal', 'Dessert', 'Végétarien', 'Rapide (<30 min)', 'Autre'];

// Parse les champs JSON (ingredients / etapes) avant de renvoyer
function parseRecette(r) {
  if (!r) return null;
  return {
    ...r,
    ingredients: JSON.parse(r.ingredients),
    etapes:      JSON.parse(r.etapes),
  };
}

// Requête de base : recette + auteur + moyenne des notes
const BASE_SELECT = `
  SELECT r.*,
    u.nom  AS auteur_nom,
    u.role AS auteur_role,
    ROUND(AVG(n.valeur), 2) AS note_moyenne,
    COUNT(DISTINCT n.id)    AS note_count,
    COUNT(DISTINCT c.id)    AS commentaire_count
  FROM recettes r
  JOIN utilisateurs u ON u.id = r.auteur_id
  LEFT JOIN notes n ON n.recette_id = r.id
  LEFT JOIN commentaires c ON c.recette_id = r.id
`;

// ─── GET /api/recettes ────────────────────────────────────────────���──────────
router.get('/', (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = Math.min(50, parseInt(req.query.limit) || 8);
  const offset = (page - 1) * limit;
  const cat    = req.query.cat || null;
  const sort   = req.query.sort || 'mieux-notées';
  const maxTemps = req.query.maxTemps ? parseInt(req.query.maxTemps) : null;

  let where = "WHERE r.statut = 'approuvee'";
  const params = [];

  if (cat && cat !== 'Toutes') { where += ' AND r.categorie = ?'; params.push(cat); }
  if (maxTemps)                { where += ' AND r.temps_preparation <= ?'; params.push(maxTemps); }

  const orderMap = {
    'mieux-notées':  'note_moyenne DESC, note_count DESC',
    'plus-récentes': 'r.date DESC',
    'rapides':       'r.temps_preparation ASC',
    'alphabétique':  'r.titre ASC',
  };
  const order = orderMap[sort] || orderMap['mieux-notées'];

  const total = db.prepare(`SELECT COUNT(*) as n FROM recettes r ${where}`).get(...params).n;
  const rows  = db.prepare(
    `${BASE_SELECT} ${where} GROUP BY r.id ORDER BY ${order} LIMIT ? OFFSET ?`
  ).all(...params, limit, offset);

  res.json({
    total,
    page,
    pageCount: Math.ceil(total / limit),
    recettes: rows.map(parseRecette),
  });
});

// ─── GET /api/recettes/:id ───────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const row = db.prepare(
    `${BASE_SELECT} WHERE r.id = ? GROUP BY r.id`
  ).get(req.params.id);

  if (!row) return res.status(404).json({ error: 'Recette introuvable.' });
  res.json(parseRecette(row));
});

// ─── POST /api/recettes ──────────────────────────────────────────────────────
router.post('/', requireAuth, [
  body('titre').trim().isLength({ min: 3, max: 100 }).withMessage('Titre : 3 à 100 caractères.'),
  body('description').optional().isLength({ max: 500 }),
  body('categorie').isIn(CATEGORIES).withMessage('Catégorie invalide.'),
  body('temps_preparation').isInt({ min: 1, max: 600 }).withMessage('Temps invalide (1–600 min).'),
  body('ingredients').isArray({ min: 1 }).withMessage('Au moins un ingrédient requis.'),
  body('etapes').isArray({ min: 1 }).withMessage('Au moins une étape requise.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { titre, description, categorie, temps_preparation, ingredients, etapes, image } = req.body;
  const id    = 'r_' + crypto.randomBytes(4).toString('hex');
  const date  = new Date().toISOString().slice(0, 10);

  // Les recettes soumises par des non-admin sont en attente de validation
  const me     = db.prepare('SELECT role FROM utilisateurs WHERE id = ?').get(req.session.userId);
  const statut = me.role === 'admin' ? 'approuvee' : 'en_attente';

  db.prepare(`
    INSERT INTO recettes (id, titre, description, ingredients, etapes, temps_preparation, categorie, image, auteur_id, statut, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, titre.trim(), description || null, JSON.stringify(ingredients), JSON.stringify(etapes), temps_preparation, categorie, image || null, req.session.userId, statut, date);

  res.status(201).json({ id, titre, statut, date });
});

// ─── PUT /api/recettes/:id ───────────────────────────────────────────────────
router.put('/:id', requireAuth, [
  body('titre').optional().trim().isLength({ min: 3, max: 100 }),
  body('categorie').optional().isIn(CATEGORIES),
  body('temps_preparation').optional().isInt({ min: 1, max: 600 }),
  body('ingredients').optional().isArray({ min: 1 }),
  body('etapes').optional().isArray({ min: 1 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const r = db.prepare('SELECT * FROM recettes WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Recette introuvable.' });

  const me = db.prepare('SELECT role FROM utilisateurs WHERE id = ?').get(req.session.userId);
  if (r.auteur_id !== req.session.userId && me.role !== 'admin') {
    return res.status(403).json({ error: 'Action non autorisée.' });
  }

  const updated = {
    titre:             req.body.titre             !== undefined ? req.body.titre.trim()                    : r.titre,
    description:       req.body.description       !== undefined ? req.body.description                     : r.description,
    categorie:         req.body.categorie         !== undefined ? req.body.categorie                       : r.categorie,
    temps_preparation: req.body.temps_preparation !== undefined ? req.body.temps_preparation               : r.temps_preparation,
    ingredients:       req.body.ingredients       !== undefined ? JSON.stringify(req.body.ingredients)     : r.ingredients,
    etapes:            req.body.etapes            !== undefined ? JSON.stringify(req.body.etapes)          : r.etapes,
    image:             req.body.image             !== undefined ? req.body.image                           : r.image,
  };

  db.prepare(`
    UPDATE recettes SET titre=?, description=?, categorie=?, temps_preparation=?, ingredients=?, etapes=?, image=?
    WHERE id=?
  `).run(updated.titre, updated.description, updated.categorie, updated.temps_preparation, updated.ingredients, updated.etapes, updated.image, req.params.id);

  res.json({ id: req.params.id, ...updated, ingredients: JSON.parse(updated.ingredients), etapes: JSON.parse(updated.etapes) });
});

// ─── DELETE /api/recettes/:id ────────────────────────────────────────────────
router.delete('/:id', requireAuth, (req, res) => {
  const r = db.prepare('SELECT auteur_id FROM recettes WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Recette introuvable.' });

  const me = db.prepare('SELECT role FROM utilisateurs WHERE id = ?').get(req.session.userId);
  if (r.auteur_id !== req.session.userId && me.role !== 'admin') {
    return res.status(403).json({ error: 'Action non autorisée.' });
  }

  db.prepare('DELETE FROM recettes WHERE id = ?').run(req.params.id);
  res.json({ message: 'Recette supprimée.' });
});

// ─── PATCH /api/recettes/:id/statut — approbation admin ──────────────────────
router.patch('/:id/statut', requireAdmin, [
  body('statut').isIn(['approuvee', 'rejetee', 'en_attente']).withMessage('Statut invalide.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const r = db.prepare('SELECT id FROM recettes WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Recette introuvable.' });

  db.prepare('UPDATE recettes SET statut = ? WHERE id = ?').run(req.body.statut, req.params.id);
  res.json({ message: 'Statut mis à jour.', statut: req.body.statut });
});

module.exports = router;
