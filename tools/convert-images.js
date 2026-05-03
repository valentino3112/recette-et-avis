#!/usr/bin/env node
// Convert PNG images in frontend/assets/img to WebP and update data references.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMG_DIR = path.join(__dirname, '..', 'frontend', 'assets', 'img');
const DATA_FILE = path.join(__dirname, '..', 'frontend', 'js', 'data.js');

async function convertFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') return;
  const inPath = path.join(IMG_DIR, file);
  const outName = path.basename(file, ext) + '.webp';
  const outPath = path.join(IMG_DIR, outName);
  try {
    await sharp(inPath).webp({ quality: 80 }).toFile(outPath);
    console.log('Converted', file, '→', outName);
  } catch (e) {
    console.error('Error converting', file, e.message);
  }
}

async function main() {
  if (!fs.existsSync(IMG_DIR)) {
    console.error('Image folder not found:', IMG_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(IMG_DIR);
  for (const f of files) {
    await convertFile(f);
  }

  // Update references in data.js: replace .png/.jpg/.jpeg with .webp where appropriate
  if (fs.existsSync(DATA_FILE)) {
    let data = fs.readFileSync(DATA_FILE, 'utf8');
    const updated = data.replace(/assets\/img\/(.+?)\.(png|jpg|jpeg)/g, (m, name) => `assets/img/${name}.webp`);
    if (updated !== data) {
      fs.writeFileSync(DATA_FILE, updated, 'utf8');
      console.log('Updated image references in', DATA_FILE);
    } else {
      console.log('No references updated in', DATA_FILE);
    }
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
