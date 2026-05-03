// Script de seed : crée la BDD et insère les données de démonstration.
// Usage : node database/seed.js
require('dotenv').config();
const { DatabaseSync } = require('node:sqlite');
const bcrypt           = require('bcryptjs');
const fs       = require('fs');
const path     = require('path');
const crypto   = require('crypto');

const DEFAULT_DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || './database';
const DB_PATH = process.env.DB_PATH || path.join(DEFAULT_DB_DIR, 'recette_avis.sqlite');
const SEED_IF_EMPTY = process.argv.includes('--if-empty') || process.env.SEED_IF_EMPTY === '1';
const dbExists = fs.existsSync(DB_PATH);

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Supprimer l'ancienne BDD pour repartir de zéro
if (dbExists && !SEED_IF_EMPTY) {
  fs.unlinkSync(DB_PATH);
  for (const suffix of ['-wal', '-shm']) {
    const sidecar = DB_PATH + suffix;
    if (fs.existsSync(sidecar)) fs.unlinkSync(sidecar);
  }
  console.log('Ancienne BDD supprimée.');
}

const db = new DatabaseSync(DB_PATH);

// Appliquer le schéma
const schema = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
db.exec(schema);
console.log('Schéma appliqué.');

if (SEED_IF_EMPTY) {
  const existingUsers = db.prepare('SELECT COUNT(*) AS n FROM utilisateurs').get().n;
  if (existingUsers > 0) {
    console.log(`BDD deja initialisee (${existingUsers} utilisateurs). Seed ignore.`);
    db.close();
    process.exit(0);
  }
}

const uid = (prefix) => prefix + '_' + crypto.randomBytes(4).toString('hex');
const HASH_ROUNDS = 12;

// ─── Utilisateurs ────────────────────────────────────────────────────────────
const hash = (pwd) => bcrypt.hashSync(pwd, HASH_ROUNDS);

const users = [
  { id: 'u1', nom: 'Admin EFREI',  email: 'admin@recetteavis.fr',  role: 'admin', bio: 'Compte administrateur du site.',                                  pwd: 'admin1234'    },
  { id: 'u2', nom: 'Camille D.',   email: 'camille@example.com',   role: 'user',  bio: 'Cuisine de tous les jours, batch cooking et restes magnifiés.',   pwd: 'camille1234'  },
  { id: 'u3', nom: 'Lucas M.',     email: 'lucas@example.com',     role: 'user',  bio: 'Pâtisserie de comptoir, fournées du dimanche.',                   pwd: 'lucas1234'    },
  { id: 'u4', nom: 'Inès B.',      email: 'ines@example.com',      role: 'user',  bio: 'Recettes végétariennes inspirées de mes voyages.',                pwd: 'ines1234'     },
  { id: 'u5', nom: 'Rayan T.',     email: 'rayan@example.com',     role: 'user',  bio: 'Étudiant, recettes rapides et fauchées mais bonnes.',             pwd: 'rayan1234'    },
];

const insertUser = db.prepare(`
  INSERT INTO utilisateurs (id, nom, email, mot_de_passe, role, bio, date_creation)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const u of users) {
  insertUser.run(u.id, u.nom, u.email, hash(u.pwd), u.role, u.bio, '2026-03-01');
}
console.log(`${users.length} utilisateurs insérés.`);

// ─── Recettes ────────────────────────────────────────────────────────────────
const recettes = [
  {
    id: 'r1', auteur_id: 'u1', date: '2026-04-12', categorie: 'Dessert', temps: 45,
    titre: 'Tarte aux pommes rustique',
    description: 'Une tarte simple, sans moule, idéale pour finir des pommes fatiguées.',
    ingredients: ['1 pâte brisée', '4 pommes', '60 g de sucre', '1 c. à soupe de beurre', 'Cannelle'],
    etapes: ['Préchauffer le four à 200 °C.', 'Étaler la pâte sur une plaque, replier les bords.', 'Disposer les pommes en lamelles, saupoudrer de sucre et cannelle.', 'Cuire 30 minutes jusqu\'à ce que les bords soient dorés.'],
    image: 'assets/img/tarte-aux-pommes.png',
  },
  {
    id: 'r2', auteur_id: 'u1', date: '2026-04-15', categorie: 'Végétarien', temps: 25,
    titre: 'Lentilles corail au lait de coco',
    description: 'Plat végétarien complet et nourrissant, prêt en 25 minutes.',
    ingredients: ['200 g de lentilles corail', '1 oignon', '400 ml de lait de coco', '1 c. à café de curry', 'Sel'],
    etapes: ['Émincer l\'oignon et le faire revenir.', 'Ajouter les lentilles, le curry, le lait de coco et 300 ml d\'eau.', 'Cuire 20 minutes à feu doux.', 'Saler, servir avec du riz.'],
    image: 'assets/img/lentilles-corail-au-lait-de-coco.png',
  },
  {
    id: 'r3', auteur_id: 'u1', date: '2026-04-18', categorie: 'Rapide (<30 min)', temps: 8,
    titre: 'Omelette aux herbes',
    description: 'Trois œufs, des herbes du frigo, une poêle. C\'est tout.',
    ingredients: ['3 œufs', 'Persil', 'Ciboulette', 'Sel, poivre', 'Beurre'],
    etapes: ['Battre les œufs avec les herbes.', 'Faire fondre le beurre dans une poêle chaude.', 'Verser, cuire 2 minutes, plier.'],
    image: null,
  },
  {
    id: 'r4', auteur_id: 'u1', date: '2026-04-20', categorie: 'Entrée', temps: 35,
    titre: 'Soupe poireau pomme de terre',
    description: 'Le grand classique, version sobre et réconfortante.',
    ingredients: ['3 poireaux', '4 pommes de terre', '1 cube de bouillon', 'Poivre'],
    etapes: ['Émincer les poireaux, éplucher les pommes de terre.', 'Couvrir d\'eau, ajouter le bouillon, cuire 25 min.', 'Mixer ou laisser tel quel.'],
    image: null,
  },
  {
    id: 'r5', auteur_id: 'u1', date: '2026-04-22', categorie: 'Rapide (<30 min)', temps: 15,
    titre: 'Pâtes à l\'ail et l\'huile d\'olive',
    description: 'Aglio e olio. Quatre ingrédients, pas un de plus.',
    ingredients: ['200 g de spaghettis', '3 gousses d\'ail', 'Huile d\'olive', 'Piment', 'Persil'],
    etapes: ['Cuire les pâtes al dente.', 'Faire dorer l\'ail dans l\'huile avec le piment.', 'Mélanger, ajouter le persil.'],
    image: 'assets/img/pates-ail-et-huile-olive.png',
  },
  {
    id: 'r6', auteur_id: 'u1', date: '2026-04-24', categorie: 'Entrée', temps: 30,
    titre: 'Salade de lentilles',
    description: 'Froide, simple, parfaite en lunch box.',
    ingredients: ['250 g de lentilles vertes', '1 échalote', 'Vinaigrette moutarde', 'Persil'],
    etapes: ['Cuire les lentilles 25 min, égoutter.', 'Mélanger avec l\'échalote, la vinaigrette, le persil.'],
    image: null,
  },
  {
    id: 'r7', auteur_id: 'u1', date: '2026-04-26', categorie: 'Plat principal', temps: 20,
    titre: 'Riz cantonais maison',
    description: 'Vide-frigo asiatique, idéal pour utiliser un reste de riz.',
    ingredients: ['300 g de riz cuit froid', '2 œufs', 'Petits pois', 'Jambon', 'Sauce soja'],
    etapes: ['Battre et cuire les œufs en omelette, réserver.', 'Faire sauter le riz avec petits pois et jambon.', 'Ajouter les œufs, la sauce soja.'],
    image: null,
  },
  {
    id: 'r8', auteur_id: 'u1', date: '2026-04-28', categorie: 'Dessert', temps: 45,
    titre: 'Crumble pommes-poires',
    description: 'Dessert d\'automne, croustillant et fondant.',
    ingredients: ['3 pommes', '2 poires', '100 g farine', '80 g beurre', '60 g sucre roux'],
    etapes: ['Couper les fruits en cubes dans un plat.', 'Sabler farine, beurre, sucre du bout des doigts.', 'Couvrir les fruits, cuire 30 min à 180 °C.'],
    image: null,
  },
  {
    id: 'r9', auteur_id: 'u1', date: '2026-04-30', categorie: 'Végétarien', temps: 30,
    titre: 'Curry de pois chiches',
    description: 'Végétarien, riche en protéines, parfait avec du riz.',
    ingredients: ['400 g pois chiches', 'Tomate concassée', 'Oignon', 'Épices à curry', 'Coriandre'],
    etapes: ['Faire revenir l\'oignon, ajouter les épices.', 'Tomate et pois chiches, mijoter 20 min.', 'Servir avec coriandre.'],
    image: 'assets/img/curry-de-pois-chiches.png',
  },
];

const insertRecette = db.prepare(`
  INSERT INTO recettes (id, titre, description, ingredients, etapes, temps_preparation, categorie, image, auteur_id, statut, date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approuvee', ?)
`);

for (const r of recettes) {
  insertRecette.run(r.id, r.titre, r.description, JSON.stringify(r.ingredients), JSON.stringify(r.etapes), r.temps, r.categorie, r.image, r.auteur_id, r.date);
}
console.log(`${recettes.length} recettes insérées.`);

// ─── Commentaires ────────────────────────────────────────────────────────────
const commentaires = [
  { id: 'c1', recette_id: 'r1', utilisateur_id: 'u2', contenu: 'Recette parfaite pour un dimanche pluvieux. J\'ai ajouté un peu de zeste de citron.', date: '2026-04-13' },
  { id: 'c2', recette_id: 'r1', utilisateur_id: 'u3', contenu: 'Très bonne base, je referai.',                                                              date: '2026-04-14' },
  { id: 'c3', recette_id: 'r2', utilisateur_id: 'u4', contenu: 'Plat express et sain, on en a fait deux fois cette semaine.',                               date: '2026-04-16' },
  { id: 'c4', recette_id: 'r3', utilisateur_id: 'u5', contenu: 'Simplissime mais ça dépanne un soir de flemme.',                                           date: '2026-04-19' },
  { id: 'c5', recette_id: 'r5', utilisateur_id: 'u2', contenu: 'Mon plat de minuit officiel.',                                                              date: '2026-04-23' },
  { id: 'c6', recette_id: 'r9', utilisateur_id: 'u3', contenu: 'J\'ai doublé les épices, c\'était parfait.',                                               date: '2026-05-01' },
];

const insertComment = db.prepare(`
  INSERT INTO commentaires (id, recette_id, utilisateur_id, contenu, date_commentaire)
  VALUES (?, ?, ?, ?, ?)
`);
for (const c of commentaires) {
  insertComment.run(c.id, c.recette_id, c.utilisateur_id, c.contenu, c.date);
}
console.log(`${commentaires.length} commentaires insérés.`);

// ─── Notes ────────────────────────────────────────────────────────────────────
const notes = [
  { id: 'n1',  recette_id: 'r1', utilisateur_id: 'u2', valeur: 5 },
  { id: 'n2',  recette_id: 'r1', utilisateur_id: 'u3', valeur: 4 },
  { id: 'n3',  recette_id: 'r1', utilisateur_id: 'u4', valeur: 5 },
  { id: 'n4',  recette_id: 'r2', utilisateur_id: 'u4', valeur: 5 },
  { id: 'n5',  recette_id: 'r2', utilisateur_id: 'u5', valeur: 4 },
  { id: 'n6',  recette_id: 'r3', utilisateur_id: 'u5', valeur: 3 },
  { id: 'n7',  recette_id: 'r5', utilisateur_id: 'u2', valeur: 5 },
  { id: 'n8',  recette_id: 'r5', utilisateur_id: 'u3', valeur: 4 },
  { id: 'n9',  recette_id: 'r7', utilisateur_id: 'u2', valeur: 4 },
  { id: 'n10', recette_id: 'r9', utilisateur_id: 'u3', valeur: 5 },
  { id: 'n11', recette_id: 'r9', utilisateur_id: 'u4', valeur: 4 },
];

const insertNote = db.prepare(`
  INSERT INTO notes (id, recette_id, utilisateur_id, valeur) VALUES (?, ?, ?, ?)
`);
for (const n of notes) {
  insertNote.run(n.id, n.recette_id, n.utilisateur_id, n.valeur);
}
console.log(`${notes.length} notes insérées.`);

// ─── Follows ─────────────────────────────────────────────────────────────────
const follows = [
  { id: 'f1', follower_id: 'u2', following_id: 'u1', date: '2026-03-15' },
  { id: 'f2', follower_id: 'u3', following_id: 'u1', date: '2026-03-22' },
  { id: 'f3', follower_id: 'u4', following_id: 'u1', date: '2026-04-03' },
  { id: 'f4', follower_id: 'u5', following_id: 'u1', date: '2026-04-10' },
  { id: 'f5', follower_id: 'u2', following_id: 'u4', date: '2026-04-05' },
  { id: 'f6', follower_id: 'u3', following_id: 'u4', date: '2026-04-06' },
  { id: 'f7', follower_id: 'u4', following_id: 'u3', date: '2026-04-08' },
  { id: 'f8', follower_id: 'u5', following_id: 'u2', date: '2026-04-11' },
];

const insertFollow = db.prepare(`
  INSERT INTO follows (id, follower_id, following_id, date) VALUES (?, ?, ?, ?)
`);
for (const f of follows) {
  insertFollow.run(f.id, f.follower_id, f.following_id, f.date);
}
console.log(`${follows.length} follows insérés.`);

db.close();
console.log('\n✓ BDD initialisée avec succès → ' + DB_PATH);
console.log('\nComptes de démonstration :');
console.log('  admin@recetteavis.fr  /  admin1234  (admin)');
console.log('  camille@example.com   /  camille1234');
console.log('  lucas@example.com     /  lucas1234');
