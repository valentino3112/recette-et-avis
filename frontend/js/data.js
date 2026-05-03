export const CATEGORIES = ['Entrée', 'Plat principal', 'Dessert', 'Végétarien', 'Rapide (<30 min)', 'Autre'];

// Convertit une recette reçue de l'API vers la forme attendue par le front
export function mapApiRecette(r) {
  return {
    id:                r.id,
    titre:             r.titre,
    description:       r.description || '',
    categorie:         r.categorie,
    temps_preparation: r.temps_preparation,
    auteur:            r.auteur_nom || r.auteur || '',
    auteur_id:         r.auteur_id || null,
    date:              r.date || r.date_creation || '',
    image:             r.image || null,
    statut:            r.statut || 'approuvee',
    ingredients:       Array.isArray(r.ingredients) ? r.ingredients : [],
    etapes:            Array.isArray(r.etapes)       ? r.etapes       : [],
  };
}

// Selectors / helpers
// Les entrées de notes peuvent être des objets agrégat {_agg, _moyenne, _count}
export function getAvg(notes, recipeId) {
  const agg = notes.find((n) => n.recette_id === recipeId && n._agg);
  if (agg) return agg._moyenne || null;
  const ns = notes.filter((n) => n.recette_id === recipeId);
  if (!ns.length) return null;
  return ns.reduce((a, n) => a + n.valeur, 0) / ns.length;
}

export function getNoteCount(notes, recipeId) {
  const agg = notes.find((n) => n.recette_id === recipeId && n._agg);
  if (agg) return agg._count || 0;
  return notes.filter((n) => n.recette_id === recipeId).length;
}

export function userById(users, id) {
  return users.find((u) => u.id === id) || null;
}

export function userByName(users, nom) {
  if (!nom) return null;
  const n = nom.toLowerCase();
  return users.find((u) => u.nom.toLowerCase() === n || (u.role === 'admin' && n === 'admin')) || null;
}

export function recipesByAuthor(recipes, users, userId) {
  const byId = recipes.filter((r) => r.auteur_id === userId);
  if (byId.length) return byId;
  const u = userById(users, userId);
  if (!u) return [];
  const n = u.nom.toLowerCase();
  return recipes.filter((r) => {
    const a = (r.auteur || '').toLowerCase();
    return a === n || (u.role === 'admin' && a === 'admin');
  });
}

export function followersOf(follows, userId) {
  return follows.filter((f) => f.following_id === userId);
}

export function followingOf(follows, userId) {
  return follows.filter((f) => f.follower_id === userId);
}

export function isFollowing(follows, followerId, followingId) {
  if (!followerId || !followingId) return false;
  return follows.some((f) => f.follower_id === followerId && f.following_id === followingId);
}

export function initials(nom) {
  if (!nom) return '?';
  return nom.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('');
}

export function recipeById(recipes, id) {
  return recipes.find((r) => r.id === id) || null;
}

export function noteByUser(notes, recipeId, userId) {
  return notes.find((n) => n.recette_id === recipeId && n.utilisateur_id === userId) || null;
}

export function shortDate(s) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function uid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}
