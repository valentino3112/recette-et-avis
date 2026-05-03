const Database = require('better-sqlite3');
const path     = require('fs');
const fs       = require('fs');

const DB_PATH = process.env.DB_PATH || './database/recette_avis.sqlite';

// Créer le dossier database/ si inexistant
const dir = require('path').dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Appliquer le schéma au premier démarrage
const schema = fs.readFileSync(require('path').join(__dirname, '../database/init.sql'), 'utf8');
db.exec(schema);

module.exports = db;
