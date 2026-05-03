// Mock data + persistent app state for Recette & Avis prototype.
// Stored in localStorage under key "ra_state_v1".

const STORAGE_KEY = "ra_state_v1";

const seedRecipes = [
  {
    id: "r1",
    titre: "Tarte aux pommes rustique",
    description: "Une tarte simple, sans moule, idéale pour finir des pommes fatiguées.",
    ingredients: ["1 pâte brisée", "4 pommes", "60 g de sucre", "1 c. à soupe de beurre", "Cannelle"],
    etapes: [
      "Préchauffer le four à 200 °C.",
      "Étaler la pâte sur une plaque, replier les bords.",
      "Disposer les pommes en lamelles, saupoudrer de sucre et cannelle.",
      "Cuire 30 minutes jusqu'à ce que les bords soient dorés.",
    ],
    temps_preparation: 45,
    categorie: "Dessert",
    image: "assets/img/tarte-aux-pommes.png",
    auteur: "admin",
    date: "2026-04-12",
  },
  {
    id: "r2",
    titre: "Lentilles corail au lait de coco",
    description: "Plat végétarien complet et nourrissant, prêt en 25 minutes.",
    ingredients: ["200 g de lentilles corail", "1 oignon", "400 ml de lait de coco", "1 c. à café de curry", "Sel"],
    etapes: [
      "Émincer l'oignon et le faire revenir.",
      "Ajouter les lentilles, le curry, le lait de coco et 300 ml d'eau.",
      "Cuire 20 minutes à feu doux.",
      "Saler, servir avec du riz.",
    ],
    temps_preparation: 25,
    categorie: "Végétarien",
    image: "assets/img/lentilles-corail-au-lait-de-coco.png",
    auteur: "admin",
    date: "2026-04-15",
  },
  {
    id: "r3",
    titre: "Omelette aux herbes",
    description: "Trois œufs, des herbes du frigo, une poêle. C'est tout.",
    ingredients: ["3 œufs", "Persil", "Ciboulette", "Sel, poivre", "Beurre"],
    etapes: [
      "Battre les œufs avec les herbes.",
      "Faire fondre le beurre dans une poêle chaude.",
      "Verser, cuire 2 minutes, plier.",
    ],
    temps_preparation: 8,
    categorie: "Rapide (<30 min)",
    image: null,
    auteur: "admin",
    date: "2026-04-18",
  },
  {
    id: "r4",
    titre: "Soupe poireau pomme de terre",
    description: "Le grand classique, version sobre et réconfortante.",
    ingredients: ["3 poireaux", "4 pommes de terre", "1 cube de bouillon", "Poivre"],
    etapes: [
      "Émincer les poireaux, éplucher les pommes de terre.",
      "Couvrir d'eau, ajouter le bouillon, cuire 25 min.",
      "Mixer ou laisser tel quel.",
    ],
    temps_preparation: 35,
    categorie: "Entrée",
    image: null,
    auteur: "admin",
    date: "2026-04-20",
  },
  {
    id: "r5",
    titre: "Pâtes à l'ail et l'huile d'olive",
    description: "Aglio e olio. Quatre ingrédients, pas un de plus.",
    ingredients: ["200 g de spaghettis", "3 gousses d'ail", "Huile d'olive", "Piment", "Persil"],
    etapes: [
      "Cuire les pâtes al dente.",
      "Faire dorer l'ail dans l'huile avec le piment.",
      "Mélanger, ajouter le persil.",
    ],
    temps_preparation: 15,
    categorie: "Rapide (<30 min)",
    image: "assets/img/pates-ail-et-huile-olive.png",
    auteur: "admin",
    date: "2026-04-22",
  },
  {
    id: "r6",
    titre: "Salade de lentilles",
    description: "Froide, simple, parfaite en lunch box.",
    ingredients: ["250 g de lentilles vertes", "1 échalote", "Vinaigrette moutarde", "Persil"],
    etapes: [
      "Cuire les lentilles 25 min, égoutter.",
      "Mélanger avec l'échalote, la vinaigrette, le persil.",
    ],
    temps_preparation: 30,
    categorie: "Entrée",
    image: null,
    auteur: "admin",
    date: "2026-04-24",
  },
  {
    id: "r7",
    titre: "Riz cantonais maison",
    description: "Vide-frigo asiatique, idéal pour utiliser un reste de riz.",
    ingredients: ["300 g de riz cuit froid", "2 œufs", "Petits pois", "Jambon", "Sauce soja"],
    etapes: [
      "Battre et cuire les œufs en omelette, réserver.",
      "Faire sauter le riz avec petits pois et jambon.",
      "Ajouter les œufs, la sauce soja.",
    ],
    temps_preparation: 20,
    categorie: "Plat principal",
    image: null,
    auteur: "admin",
    date: "2026-04-26",
  },
  {
    id: "r8",
    titre: "Crumble pommes-poires",
    description: "Dessert d'automne, croustillant et fondant.",
    ingredients: ["3 pommes", "2 poires", "100 g farine", "80 g beurre", "60 g sucre roux"],
    etapes: [
      "Couper les fruits en cubes dans un plat.",
      "Sabler farine, beurre, sucre du bout des doigts.",
      "Couvrir les fruits, cuire 30 min à 180 °C.",
    ],
    temps_preparation: 45,
    categorie: "Dessert",
    image: null,
    auteur: "admin",
    date: "2026-04-28",
  },
  {
    id: "r9",
    titre: "Curry de pois chiches",
    description: "Végétarien, riche en protéines, parfait avec du riz.",
    ingredients: ["400 g pois chiches", "Tomate concassée", "Oignon", "Épices à curry", "Coriandre"],
    etapes: [
      "Faire revenir l'oignon, ajouter les épices.",
      "Tomate et pois chiches, mijoter 20 min.",
      "Servir avec coriandre.",
    ],
    temps_preparation: 30,
    categorie: "Végétarien",
    image: "assets/img/curry-de-pois-chiches.png",
    auteur: "admin",
    date: "2026-04-30",
  },
];

const seedUsers = [
  { id: "u1", nom: "Admin EFREI", email: "admin@recetteavis.fr", role: "admin", date_creation: "2026-03-01", mot_de_passe: "•••", bio: "Compte administrateur du site. Recettes de référence, base de la bibliothèque." },
  { id: "u2", nom: "Camille D.", email: "camille@example.com", role: "user", date_creation: "2026-03-12", mot_de_passe: "•••", bio: "Cuisine de tous les jours, batch cooking et restes magnifiés." },
  { id: "u3", nom: "Lucas M.", email: "lucas@example.com", role: "user", date_creation: "2026-03-20", mot_de_passe: "•••", bio: "Pâtisserie de comptoir, fournées du dimanche." },
  { id: "u4", nom: "Inès B.", email: "ines@example.com", role: "user", date_creation: "2026-04-02", mot_de_passe: "•••", bio: "Recettes végétariennes inspirées de mes voyages." },
  { id: "u5", nom: "Rayan T.", email: "rayan@example.com", role: "user", date_creation: "2026-04-08", mot_de_passe: "•••", bio: "Étudiant, recettes rapides et fauchées mais bonnes." },
];

const seedFollows = [
  { id: "f1", follower_id: "u2", following_id: "u1", date: "2026-03-15" },
  { id: "f2", follower_id: "u3", following_id: "u1", date: "2026-03-22" },
  { id: "f3", follower_id: "u4", following_id: "u1", date: "2026-04-03" },
  { id: "f4", follower_id: "u5", following_id: "u1", date: "2026-04-10" },
  { id: "f5", follower_id: "u2", following_id: "u4", date: "2026-04-05" },
  { id: "f6", follower_id: "u3", following_id: "u4", date: "2026-04-06" },
  { id: "f7", follower_id: "u4", following_id: "u3", date: "2026-04-08" },
  { id: "f8", follower_id: "u5", following_id: "u2", date: "2026-04-11" },
];

const seedComments = [
  { id: "c1", recette_id: "r1", utilisateur_id: "u2", contenu: "Recette parfaite pour un dimanche pluvieux. J'ai ajouté un peu de zeste de citron.", date_commentaire: "2026-04-13" },
  { id: "c2", recette_id: "r1", utilisateur_id: "u3", contenu: "Très bonne base, je referai.", date_commentaire: "2026-04-14" },
  { id: "c3", recette_id: "r2", utilisateur_id: "u4", contenu: "Plat express et sain, on en a fait deux fois cette semaine.", date_commentaire: "2026-04-16" },
  { id: "c4", recette_id: "r3", utilisateur_id: "u5", contenu: "Simplissime mais ça dépanne un soir de flemme.", date_commentaire: "2026-04-19" },
  { id: "c5", recette_id: "r5", utilisateur_id: "u2", contenu: "Mon plat de minuit officiel.", date_commentaire: "2026-04-23" },
  { id: "c6", recette_id: "r9", utilisateur_id: "u3", contenu: "J'ai doublé les épices, c'était parfait.", date_commentaire: "2026-05-01" },
];

const seedNotes = [
  { id: "n1", recette_id: "r1", utilisateur_id: "u2", valeur: 5 },
  { id: "n2", recette_id: "r1", utilisateur_id: "u3", valeur: 4 },
  { id: "n3", recette_id: "r1", utilisateur_id: "u4", valeur: 5 },
  { id: "n4", recette_id: "r2", utilisateur_id: "u4", valeur: 5 },
  { id: "n5", recette_id: "r2", utilisateur_id: "u5", valeur: 4 },
  { id: "n6", recette_id: "r3", utilisateur_id: "u5", valeur: 3 },
  { id: "n7", recette_id: "r5", utilisateur_id: "u2", valeur: 5 },
  { id: "n8", recette_id: "r5", utilisateur_id: "u3", valeur: 4 },
  { id: "n9", recette_id: "r7", utilisateur_id: "u2", valeur: 4 },
  { id: "n10", recette_id: "r9", utilisateur_id: "u3", valeur: 5 },
  { id: "n11", recette_id: "r9", utilisateur_id: "u4", valeur: 4 },
];

const CATEGORIES = ["Entrée", "Plat principal", "Dessert", "Végétarien", "Rapide (<30 min)", "Autre"];

function defaultState() {
  return {
    recipes: seedRecipes,
    users: seedUsers,
    comments: seedComments,
    notes: seedNotes,
    follows: seedFollows,
    sessionUserId: null, // null = visiteur
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const merged = { ...defaultState(), ...parsed };
    // patch seed images into existing recipes that still have image: null
    const imageMap = {};
    seedRecipes.forEach(r => { if (r.image) imageMap[r.id] = r.image; });
    merged.recipes = merged.recipes.map(r => (!r.image && imageMap[r.id]) ? { ...r, image: imageMap[r.id] } : r);
    return merged;
  } catch (e) {
    return defaultState();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {}
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return defaultState();
}

// Selectors / helpers
function getAvg(notes, recipeId) {
  const ns = notes.filter((n) => n.recette_id === recipeId);
  if (!ns.length) return null;
  return ns.reduce((a, n) => a + n.valeur, 0) / ns.length;
}
function getNoteCount(notes, recipeId) {
  return notes.filter((n) => n.recette_id === recipeId).length;
}
function userById(users, id) {
  return users.find((u) => u.id === id) || null;
}
function userByName(users, nom) {
  if (!nom) return null;
  const n = nom.toLowerCase();
  return users.find((u) => u.nom.toLowerCase() === n || (u.role === "admin" && n === "admin")) || null;
}
function recipesByAuthor(recipes, users, userId) {
  const u = userById(users, userId);
  if (!u) return [];
  const n = u.nom.toLowerCase();
  // Match by name OR by the literal "admin" alias used in seed data
  return recipes.filter((r) => {
    const a = (r.auteur || "").toLowerCase();
    return a === n || (u.role === "admin" && a === "admin");
  });
}
function followersOf(follows, userId) {
  return follows.filter((f) => f.following_id === userId);
}
function followingOf(follows, userId) {
  return follows.filter((f) => f.follower_id === userId);
}
function isFollowing(follows, followerId, followingId) {
  if (!followerId || !followingId) return false;
  return follows.some((f) => f.follower_id === followerId && f.following_id === followingId);
}
function initials(nom) {
  if (!nom) return "?";
  return nom.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("");
}
function recipeById(recipes, id) {
  return recipes.find((r) => r.id === id) || null;
}
function noteByUser(notes, recipeId, userId) {
  return notes.find((n) => n.recette_id === recipeId && n.utilisateur_id === userId) || null;
}
function shortDate(s) {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
function uid(prefix) {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

Object.assign(window, {
  RA_loadState: loadState,
  RA_saveState: saveState,
  RA_resetState: resetState,
  RA_CATEGORIES: CATEGORIES,
  RA_getAvg: getAvg,
  RA_getNoteCount: getNoteCount,
  RA_userById: userById,
  RA_userByName: userByName,
  RA_recipesByAuthor: recipesByAuthor,
  RA_followersOf: followersOf,
  RA_followingOf: followingOf,
  RA_isFollowing: isFollowing,
  RA_initials: initials,
  RA_recipeById: recipeById,
  RA_noteByUser: noteByUser,
  RA_shortDate: shortDate,
  RA_uid: uid,
});
