const express = require('express');
const bcrypt  = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db      = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide.'),
  body('password').notEmpty().withMessage('Mot de passe requis.'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM utilisateurs WHERE email = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.mot_de_passe)) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  req.session.userId = user.id;
  res.json({
    id:            user.id,
    nom:           user.nom,
    email:         user.email,
    role:          user.role,
    bio:           user.bio,
    date_creation: user.date_creation,
  });
});

// POST /api/auth/logout
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => res.json({ message: 'Déconnecté.' }));
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare(
    'SELECT id, nom, email, role, bio, date_creation FROM utilisateurs WHERE id = ?'
  ).get(req.session.userId);

  if (!user) {
    req.session.destroy();
    return res.status(401).json({ error: 'Session invalide.' });
  }
  res.json(user);
});

module.exports = router;
