import React, { useState, useMemo } from 'react';
import { api } from './api.js';
import { getAvg, getNoteCount, shortDate, CATEGORIES, uid } from './data.js';
import { CategoryPill, Pager } from './components.jsx';

function AdminGuard({ currentUser, children, navigate }) {
  if (!currentUser) {
    return (
      <div className="auth-card">
        <div className="notice warn">Accès restreint — connexion requise.</div>
        <button className="primary" onClick={() => navigate('/connexion')}>Se connecter</button>
      </div>
    );
  }
  if (currentUser.role !== 'admin') {
    return (
      <div className="auth-card">
        <div className="notice warn">403 — Vous n'avez pas les droits administrateur.</div>
        <button onClick={() => navigate('/')}>Retour à l'accueil</button>
      </div>
    );
  }
  return children;
}

function AdminTabs({ active, navigate }) {
  return (
    <div className="admin-tabs" role="tablist">
      <button role="tab" className={active === 'dash' ? 'on' : ''} onClick={() => navigate('/admin')}>Tableau de bord</button>
      <button role="tab" className={active === 'recipes' ? 'on' : ''} onClick={() => navigate('/admin/recettes')}>Recettes</button>
      <button role="tab" className={active === 'users' ? 'on' : ''} onClick={() => navigate('/admin/utilisateurs')}>Utilisateurs</button>
      <button role="tab" className={active === 'comments' ? 'on' : ''} onClick={() => navigate('/admin/commentaires')}>Commentaires</button>
    </div>
  );
}

export function AdminDash({ state, navigate, currentUser }) {
  return (
    <AdminGuard currentUser={currentUser} navigate={navigate}>
      <h1>Tableau de bord</h1>
      <AdminTabs active="dash" navigate={navigate} />
      <div className="kpi-row">
        <div className="kpi"><div className="label">Recettes</div><div className="value">{state.recipes.length}</div></div>
        <div className="kpi"><div className="label">Utilisateurs</div><div className="value">{state.users.length}</div></div>
        <div className="kpi"><div className="label">Commentaires</div><div className="value">{state.comments.length}</div></div>
        <div className="kpi"><div className="label">Notes données</div><div className="value">{state.notes.length}</div></div>
      </div>
      <div className="eco-panel">
        <h3>État Green IT</h3>
        <ul>
          <li>Pages servies en HTML statique Vite + données JSON paginées (LIMIT/OFFSET).</li>
          <li>Aucune image servie sur les listes — uniquement sur le détail, en lazy loading WebP.</li>
          <li>Stack : Node + Express + SQLite — dépendances front compilées par Vite, ~5 dépendances back.</li>
        </ul>
      </div>
      <h2 className="section-title mt-4">Activité récente</h2>
      <table className="data">
        <thead><tr><th>Date</th><th>Type</th><th>Détail</th></tr></thead>
        <tbody>
          {state.comments.slice(-5).reverse().map((c) => {
            const r = state.recipes.find((x) => x.id === c.recette_id);
            const u = state.users.find((x) => x.id === c.utilisateur_id);
            return (
              <tr key={c.id}>
                <td>{shortDate(c.date_commentaire)}</td>
                <td>Commentaire</td>
                <td><strong>{u ? u.nom : '?'}</strong> sur <em>{r ? r.titre : '?'}</em></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </AdminGuard>
  );
}

export function AdminRecipes({ state, setState, navigate, currentUser }) {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const PAGE = 8;
  const slice = state.recipes.slice((page - 1) * PAGE, page * PAGE);
  const pageCount = Math.max(1, Math.ceil(state.recipes.length / PAGE));

  async function remove(id) {
    if (!confirm('Supprimer définitivement cette recette ?')) return;
    try {
      await api.deleteRecette(id);
      setState((s) => ({
        ...s,
        recipes: s.recipes.filter((r) => r.id !== id),
        comments: s.comments.filter((c) => c.recette_id !== id),
        notes: s.notes.filter((n) => n.recette_id !== id),
      }));
    } catch (_) {
      alert('Erreur lors de la suppression.');
    }
  }

  function save(form) {
    if (form._new) {
      const r = { ...form, id: uid('r'), date: new Date().toISOString().slice(0, 10), auteur: currentUser.nom };
      delete r._new;
      setState((s) => ({ ...s, recipes: [r, ...s.recipes] }));
    } else {
      setState((s) => ({ ...s, recipes: s.recipes.map((r) => r.id === form.id ? form : r) }));
    }
    setEditing(null);
  }

  return (
    <AdminGuard currentUser={currentUser} navigate={navigate}>
      <h1>Gestion des recettes</h1>
      <AdminTabs active="recipes" navigate={navigate} />
      <div className="row-flex mb-2" style={{ justifyContent: 'space-between' }}>
        <div className="muted">{state.recipes.length} recette{state.recipes.length > 1 ? 's' : ''}</div>
        <button className="primary" onClick={() => setEditing({
          _new: true, titre: '', description: '', ingredients: [], etapes: [],
          temps_preparation: 30, categorie: 'Plat principal', image: null,
        })}>+ Nouvelle recette</button>
      </div>

      {editing && <RecipeEditor initial={editing} onSave={save} onCancel={() => setEditing(null)} />}

      <table className="data">
        <thead>
          <tr><th>Titre</th><th>Catégorie</th><th>Temps</th><th>Note moy.</th><th>Avis</th><th></th></tr>
        </thead>
        <tbody>
          {slice.map((r) => {
            const avg = getAvg(state.notes, r.id);
            const cnt = getNoteCount(state.notes, r.id);
            return (
              <tr key={r.id}>
                <td><strong>{r.titre}</strong></td>
                <td><CategoryPill>{r.categorie}</CategoryPill></td>
                <td>{r.temps_preparation} min</td>
                <td>{avg ? avg.toFixed(1) : '—'}</td>
                <td>{cnt}</td>
                <td className="actions">
                  <button className="small" onClick={() => navigate(`/recettes/${r.id}`)}>Voir</button>
                  <button className="small" onClick={() => setEditing(r)}>Éditer</button>
                  <button className="danger small" onClick={() => remove(r.id)}>Suppr.</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pager page={page} pageCount={pageCount} onChange={setPage} />
    </AdminGuard>
  );
}

function RecipeEditor({ initial, onSave, onCancel }) {
  const [f, setF] = useState({
    ...initial,
    ingredients: Array.isArray(initial.ingredients) ? initial.ingredients.join('\n') : (initial.ingredients || ''),
    etapes: Array.isArray(initial.etapes) ? initial.etapes.join('\n') : (initial.etapes || ''),
  });
  const [err, setErr] = useState('');

  function submit(e) {
    e.preventDefault();
    if (f.titre.trim().length < 3) { setErr('Titre trop court.'); return; }
    if (f.description.trim().length < 10) { setErr('Description trop courte (10 caractères mini).'); return; }
    const ing = f.ingredients.split('\n').map((s) => s.trim()).filter(Boolean);
    const etp = f.etapes.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!ing.length || !etp.length) { setErr('Ingrédients et étapes obligatoires.'); return; }
    onSave({ ...f, ingredients: ing, etapes: etp, temps_preparation: parseInt(f.temps_preparation, 10) || 0 });
  }

  return (
    <div className="profile-card mb-3" style={{ maxWidth: 'none' }}>
      <h2 style={{ fontSize: 18 }}>{initial._new ? 'Nouvelle recette' : 'Modifier la recette'}</h2>
      <form onSubmit={submit}>
        <div className="field">
          <label>Titre</label>
          <input value={f.titre} onChange={(e) => setF({ ...f, titre: e.target.value })} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </div>
        <div className="row-flex" style={{ gap: 12, alignItems: 'flex-start' }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Catégorie</label>
            <select value={f.categorie} onChange={(e) => setF({ ...f, categorie: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field" style={{ width: 140 }}>
            <label>Temps (min)</label>
            <input type="number" value={f.temps_preparation} onChange={(e) => setF({ ...f, temps_preparation: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label>Ingrédients <span className="muted">(un par ligne)</span></label>
          <textarea value={f.ingredients} onChange={(e) => setF({ ...f, ingredients: e.target.value })} style={{ minHeight: 120 }} />
        </div>
        <div className="field">
          <label>Étapes <span className="muted">(une par ligne)</span></label>
          <textarea value={f.etapes} onChange={(e) => setF({ ...f, etapes: e.target.value })} style={{ minHeight: 140 }} />
        </div>
        {err && <div className="notice warn">{err}</div>}
        <div className="row-flex">
          <button type="submit" className="primary">Enregistrer</button>
          <button type="button" onClick={onCancel}>Annuler</button>
        </div>
      </form>
    </div>
  );
}

export function AdminUsers({ state, setState, navigate, currentUser }) {
  const [page, setPage] = useState(1);
  const PAGE = 10;
  const slice = state.users.slice((page - 1) * PAGE, page * PAGE);
  const pageCount = Math.max(1, Math.ceil(state.users.length / PAGE));

  function toggleRole(id) {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => u.id === id ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u),
    }));
  }

  function remove(id) {
    if (id === currentUser.id) { alert('Impossible de supprimer le compte connecté.'); return; }
    if (!confirm('Supprimer ce compte ? Ses commentaires et notes seront aussi supprimés.')) return;
    setState((s) => ({
      ...s,
      users:    s.users.filter((u) => u.id !== id),
      comments: s.comments.filter((c) => c.utilisateur_id !== id),
      notes:    s.notes.filter((n) => n.utilisateur_id !== id),
    }));
  }

  return (
    <AdminGuard currentUser={currentUser} navigate={navigate}>
      <h1>Gestion des utilisateurs</h1>
      <AdminTabs active="users" navigate={navigate} />
      <div className="muted mb-2">{state.users.length} compte{state.users.length > 1 ? 's' : ''} · liste paginée (LIMIT/OFFSET côté serveur)</div>
      <table className="data">
        <thead>
          <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th><th>Activité</th><th></th></tr>
        </thead>
        <tbody>
          {slice.map((u) => {
            const cmt = state.comments.filter((c) => c.utilisateur_id === u.id).length;
            const not = state.notes.filter((n) => n.utilisateur_id === u.id).length;
            return (
              <tr key={u.id}>
                <td><strong>{u.nom}</strong>{u.id === currentUser.id && <span className="muted"> (vous)</span>}</td>
                <td className="muted">{u.email}</td>
                <td>{u.role === 'admin' ? <span className="role-badge admin">admin</span> : <span className="role-badge">user</span>}</td>
                <td>{shortDate(u.date_creation)}</td>
                <td className="muted">{cmt} cmt · {not} notes</td>
                <td className="actions">
                  <button className="small" onClick={() => toggleRole(u.id)} disabled={u.id === currentUser.id}>
                    {u.role === 'admin' ? '→ user' : '→ admin'}
                  </button>
                  <button className="danger small" onClick={() => remove(u.id)} disabled={u.id === currentUser.id}>Suppr.</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pager page={page} pageCount={pageCount} onChange={setPage} />
    </AdminGuard>
  );
}

export function AdminComments({ state, setState, navigate, currentUser }) {
  const [page, setPage] = useState(1);
  const PAGE = 10;
  const sorted = useMemo(() => [...state.comments].sort((a, b) => b.date_commentaire.localeCompare(a.date_commentaire)), [state.comments]);
  const slice = sorted.slice((page - 1) * PAGE, page * PAGE);
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE));

  function remove(id) {
    if (!confirm('Modérer / supprimer ce commentaire ?')) return;
    setState((s) => ({ ...s, comments: s.comments.filter((c) => c.id !== id) }));
  }

  return (
    <AdminGuard currentUser={currentUser} navigate={navigate}>
      <h1>Modération des commentaires</h1>
      <AdminTabs active="comments" navigate={navigate} />
      <div className="muted mb-2">{state.comments.length} commentaire{state.comments.length > 1 ? 's' : ''}</div>
      <table className="data">
        <thead><tr><th>Date</th><th>Auteur</th><th>Recette</th><th>Contenu</th><th></th></tr></thead>
        <tbody>
          {slice.map((c) => {
            const u = state.users.find((x) => x.id === c.utilisateur_id);
            const r = state.recipes.find((x) => x.id === c.recette_id);
            return (
              <tr key={c.id}>
                <td className="muted" style={{ whiteSpace: 'nowrap' }}>{shortDate(c.date_commentaire)}</td>
                <td>{u ? u.nom : <em className="muted">supprimé</em>}</td>
                <td>{r ? <a href={`#/recettes/${r.id}`} onClick={(e) => { e.preventDefault(); navigate(`/recettes/${r.id}`); }}>{r.titre}</a> : <em className="muted">supprimée</em>}</td>
                <td>{c.contenu}</td>
                <td className="actions">
                  <button className="danger small" onClick={() => remove(c.id)}>Modérer</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pager page={page} pageCount={pageCount} onChange={setPage} />
    </AdminGuard>
  );
}
