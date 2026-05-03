const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs   = require('fs');

const DEFAULT_DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || './database';
const DB_PATH = process.env.DB_PATH || path.join(DEFAULT_DB_DIR, 'recette_avis.sqlite');

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, '../database/init.sql'), 'utf8');
db.exec(schema);

module.exports = db;
