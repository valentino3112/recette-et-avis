import React, { useState, useEffect } from 'react';
import { api } from './api.js';
import { mapApiRecette } from './data.js';
import { SiteHeader, SiteFooter, NotFound } from './components.jsx';
import { Home } from './pages/home.jsx';
import { RecipeList, RecipeDetail } from './pages/recettes.jsx';
import { Login, Register } from './pages/connexion.jsx';
import { Profile } from './pages/profil.jsx';
import { UserProfile } from './pages/utilisateur.jsx';
import { SubmitRecipe } from './pages/proposer.jsx';
import { About, Contact, Mentions } from './pages/extras.jsx';
import { AdminDash } from './pages/admin/dashboard.jsx';
import { AdminRecipes } from './pages/admin/recettes.jsx';
import { AdminUsers } from './pages/admin/utilisateurs.jsx';
import { AdminComments } from './pages/admin/commentaires.jsx';

const ACCENT_PRESETS = {
  forest: { accent: 'oklch(0.5 0.11 150)',  accentInk: 'oklch(0.36 0.1 150)',  soft: 'oklch(0.93 0.05 150)' },
};

function parseRoute(hash) {
  const path = (hash || '').replace(/^#/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'home', params: {} };
  if (parts[0] === 'recettes' && parts.length === 1) return { name: 'list', params: {} };
  if (parts[0] === 'recettes' && parts.length === 2) return { name: 'detail', params: { id: parts[1] } };
  if (parts[0] === 'connexion') return { name: 'login', params: {} };
  if (parts[0] === 'inscription') return { name: 'register', params: {} };
  if (parts[0] === 'profil') return { name: 'profile', params: {} };
  if (parts[0] === 'mentions') return { name: 'mentions', params: {} };
  if (parts[0] === 'proposer') return { name: 'submit', params: {} };
  if (parts[0] === 'about') return { name: 'about', params: {} };
  if (parts[0] === 'contact') return { name: 'contact', params: {} };
  if (parts[0] === 'utilisateurs' && parts.length >= 2) return { name: 'user', params: { id: parts[1], tab: parts[2] || null } };
  if (parts[0] === 'admin') {
    if (parts.length === 1) return { name: 'admin', params: {} };
    if (parts[1] === 'recettes') return { name: 'admin-recipes', params: {} };
    if (parts[1] === 'utilisateurs') return { name: 'admin-users', params: {} };
    if (parts[1] === 'commentaires') return { name: 'admin-comments', params: {} };
  }
  return { name: '404', params: {} };
}

export default function App() {
  const [state, setState] = useState(() => ({
    recipes:       [],
    users:         [],
    notes:         [],
    follows:       [],
    comments:      [],
    sessionUserId: null,
    loading:       true,
  }));
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));

  useEffect(() => {
    async function init() {
      try {
        const [meRes, recipesRes] = await Promise.allSettled([
          api.getMe(),
          api.getRecettes({ limit: 50 }),
        ]);

        const meUser = meRes.status === 'fulfilled' ? meRes.value : null;

        let followsData = [];
        let userDetails = null;
        if (meUser) {
          [followsData, userDetails] = await Promise.all([
            api.getFollowing(meUser.id).catch(() => []),
            api.getUser(meUser.id).catch(() => null),
          ]);
        }

        setState((s) => {
          const next = { ...s, loading: false, users: [...s.users] };

          if (meUser) {
            next.sessionUserId = meUser.id;
            const enrichedMe = userDetails
              ? { ...meUser, followerCount: userDetails.followerCount ?? 0, followingCount: userDetails.followingCount ?? 0 }
              : meUser;
            next.users  = [enrichedMe];
            next.follows = followsData.map((f) => ({
              id:           'fl_' + f.id,
              follower_id:  meUser.id,
              following_id: f.id,
            }));
          }

          if (recipesRes.status === 'fulfilled') {
            const recettes = recipesRes.value.recettes || [];
            next.recipes = recettes.map(mapApiRecette);

            next.notes = recettes
              .filter((r) => r.note_count > 0)
              .map((r) => ({
                id:         'agg_' + r.id,
                recette_id: r.id,
                _agg:       true,
                _moyenne:   r.note_moyenne,
                _count:     r.note_count,
              }));

            const authorMap = {};
            recettes.forEach((r) => {
              if (r.auteur_id && !authorMap[r.auteur_id]) {
                authorMap[r.auteur_id] = { id: r.auteur_id, nom: r.auteur_nom, role: r.auteur_role || 'user' };
              }
            });
            const knownIds = new Set(next.users.map((u) => u.id));
            Object.values(authorMap).forEach((u) => { if (!knownIds.has(u.id)) next.users.push(u); });
          }

          return next;
        });
      } catch (_) {
        setState((s) => ({ ...s, loading: false }));
      }
    }
    init();
  }, []);

  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
    root.setAttribute('data-density', 'comfortable');
    const a = ACCENT_PRESETS.forest;
    root.style.setProperty('--accent', a.accent);
    root.style.setProperty('--accent-ink', a.accentInk);
    root.style.setProperty('--accent-soft', a.soft);
  }, []);

  function navigate(path) {
    window.location.hash = path;
    window.scrollTo(0, 0);
  }

  const currentUser = state.sessionUserId
    ? state.users.find((u) => u.id === state.sessionUserId) || null
    : null;

  async function logout() {
    try { await api.logout(); } catch (_) {}
    setState((s) => ({ ...s, sessionUserId: null, follows: [] }));
    navigate('/');
  }

  if (state.loading) {
    return (
      <div className="app">
        <div className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p className="muted">Chargement…</p>
        </div>
      </div>
    );
  }

  let page;
  switch (route.name) {
    case 'home':           page = <Home state={state} navigate={navigate} />; break;
    case 'list':           page = <RecipeList state={state} navigate={navigate} route={route} />; break;
    case 'detail':         page = <RecipeDetail state={state} navigate={navigate} route={route} currentUser={currentUser} />; break;
    case 'login':          page = <Login state={state} setState={setState} navigate={navigate} />; break;
    case 'register':       page = <Register state={state} setState={setState} navigate={navigate} />; break;
    case 'profile':        page = <Profile state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case 'admin':          page = <AdminDash state={state} navigate={navigate} currentUser={currentUser} />; break;
    case 'admin-recipes':  page = <AdminRecipes state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case 'admin-users':    page = <AdminUsers state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case 'admin-comments': page = <AdminComments state={state} navigate={navigate} currentUser={currentUser} />; break;
    case 'mentions':       page = <Mentions navigate={navigate} />; break;
    case 'submit':         page = <SubmitRecipe state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case 'about':          page = <About navigate={navigate} />; break;
    case 'contact':        page = <Contact navigate={navigate} />; break;
    case 'user':           page = <UserProfile state={state} setState={setState} navigate={navigate} route={route} currentUser={currentUser} />; break;
    default:               page = <NotFound navigate={navigate} />;
  }

  return (
    <div className="app" data-screen-label={route.name}>
      <SiteHeader route={route} navigate={navigate} currentUser={currentUser} onLogout={logout} />
      <main className="shell">{page}</main>
      <SiteFooter navigate={navigate} />
    </div>
  );
}
