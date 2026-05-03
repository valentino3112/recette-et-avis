const express = require('express');
const bcrypt  = require('bcrypt');
const crypto  = require('crypto');
const { body, validationResult } = require('express-validator');
const db      = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const uid = () => 'u_' + crypto.randomBytes(4).toString('hex');

// ─── GET /api/users — liste paginée (admin uniquement) ───────────────────────
router.get('/', requireAdmin, (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  const total = db.prepare('SELECT COUNT(*) as n FROM utilisateurs').get().n;
  const users = db.prepare(
    'SELECT id, nom, email, role, bio, date_creation FROM utilisateurs ORDER BY date_creation DESC LIMIT ? OFFSET ?'
  ).all(limit, offset);

  res.json({ total, page, pageCount: Math.ceil(total / limit), users });
});

// ─── GET /api/users/:id — profil public ────────────────────────────────���─────
router.get('/:id', (req, res) => {
  const user = db.prepare(
    'SELECT id, nom, role, bio, date_creation FROM utilisateurs WHERE id = ?'
  ).get(req.params.id);

  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const recetteCount  = db.prepare('SELECT COUNT(*) as n FROM recettes WHERE auteur_id = ? AND statut = ?').get(req.params.id, 'approuvee').n;
  const followerCount = db.prepare('SELECT COUNT(*) as n FROM follows WHERE following_id = ?').get(req.params.id).n;
  const followingCount = db.prepare('SELECT COUNT(*) as n FROM follows WHERE follower_id = ?').get(req.params.id).n;

  res.json({ ...user, recetteCount, followerCount, followingCount });
});

// ─── POST /api/users — inscription ───────────────────────────────────────────
router.post('/', [
  body('nom').trim().isLength({ min: 2 }).withMessage('Nom requis (≥ 2 caractères).'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide.'),
  body('password').isLength({ min: 8 }).withMessage('Mot de passe : 8 caractères minimum.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { nom, email, password, bio } = req.body;

  const existing = db.prepare('SELECT id FROM utilisateurs WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email déjà utilisé.' });

  const id   = uid();
  const hash = bcrypt.hashSync(password, 12);
  const today = new Date().toISOString().slice(0, 10);

  db.prepare(
    'INSERT INTO utilisateurs (id, nom, email, mot_de_passe, role, bio, date_creation) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, nom.trim(), email, hash, 'user', bio || null, today);

  req.session.userId = id;
  res.status(201).json({ id, nom: nom.trim(), email, role: 'user', bio: bio || null, date_creation: today });
});

// ─── PUT /api/users/:id — modifier profil ───────────────────────────────────��
router.put('/:id', requireAuth, [
  body('nom').optional().trim().isLength({ min: 2 }).withMessage('Nom : 2 caractères minimum.'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email invalide.'),
  body('bio').optional().isLength({ max: 300 }).withMessage('Bio : 300 caractères maximum.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const target = db.prepare('SELECT * FROM utilisateurs WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const me = db.prepare('SELECT role FROM utilisateurs WHERE id = ?').get(req.session.userId);
  if (req.session.userId !== req.params.id && me.role !== 'admin') {
    return res.status(403).json({ error: 'Action non autorisée.' });
  }

  const nom   = req.body.nom   !== undefined ? req.body.nom.trim() : target.nom;
  const email = req.body.email !== undefined ? req.body.email      : target.email;
  const bio   = req.body.bio   !== undefined ? req.body.bio        : target.bio;

  if (email !== target.email) {
    const taken = db.prepare('SELECT id FROM utilisateurs WHERE email = ? AND id != ?').get(email, req.params.id);
    if (taken) return res.status(409).json({ error: 'Email déjà utilisé.' });
  }

  db.prepare('UPDATE utilisateurs SET nom = ?, email = ?, bio = ? WHERE id = ?').run(nom, email, bio, req.params.id);
  res.json({ id: req.params.id, nom, email, role: target.role, bio, date_creation: target.date_creation });
});

// ─── DELETE /api/users/:id — supprimer compte ────────────────────────────────
router.delete('/:id', requireAuth, (req, res) => {
  const target = db.prepare('SELECT id FROM utilisateurs WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const me = db.prepare('SELECT role FROM utilisateurs WHERE id = ?').get(req.session.userId);
  if (req.session.userId !== req.params.id && me.role !== 'admin') {
    return res.status(403).json({ error: 'Action non autorisée.' });
  }

  db.prepare('DELETE FROM utilisateurs WHERE id = ?').run(req.params.id);

  if (req.session.userId === req.params.id) {
    req.session.destroy();
  }
  res.json({ message: 'Compte supprimé.' });
});

// ─── PATCH /api/users/:id/role — promouvoir en admin (admin uniquement) ──────
router.patch('/:id/role', requireAdmin, [
  body('role').isIn(['user', 'admin']).withMessage('Rôle invalide.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const target = db.prepare('SELECT id FROM utilisateurs WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  db.prepare('UPDATE utilisateurs SET role = ? WHERE id = ?').run(req.body.role, req.params.id);
  res.json({ message: 'Rôle mis à jour.' });
});

// ─── POST /api/users/:id/follow — follow / unfollow ──────────────────────────
router.post('/:id/follow', requireAuth, (req, res) => {
  const targetId = req.params.id;
  const meId     = req.session.userId;

  if (meId === targetId) return res.status(400).json({ error: 'Vous ne pouvez pas vous suivre vous-même.' });

  const target = db.prepare('SELECT id FROM utilisateurs WHERE id = ?').get(targetId);
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const existing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(meId, targetId);

  if (existing) {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(meId, targetId);
    return res.json({ following: false });
  }

  const id = 'f_' + crypto.randomBytes(4).toString('hex');
  const date = new Date().toISOString().slice(0, 10);
  db.prepare('INSERT INTO follows (id, follower_id, following_id, date) VALUES (?, ?, ?, ?)').run(id, meId, targetId, date);
  res.json({ following: true });
});

// ─── GET /api/users/:id/followers ──────────────────────────────────���─────────
router.get('/:id/followers', (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.nom, u.role, f.date
    FROM follows f
    JOIN utilisateurs u ON u.id = f.follower_id
    WHERE f.following_id = ?
    ORDER BY f.date DESC
  `).all(req.params.id);
  res.json(rows);
});

// ─── GET /api/users/:id/following ─────────────────────────────────────��──────
router.get('/:id/following', (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.nom, u.role, f.date
    FROM follows f
    JOIN utilisateurs u ON u.id = f.following_id
    WHERE f.follower_id = ?
    ORDER BY f.date DESC
  `).all(req.params.id);
  res.json(rows);
});

module.exports = router;
