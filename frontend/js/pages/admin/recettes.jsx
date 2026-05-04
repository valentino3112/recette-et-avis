import React, { useState, useEffect } from 'react';
import { api } from '../../api.js';
import { getAvg, getNoteCount, CATEGORIES, uid } from '../../data.js';
import { CategoryPill, Pager } from '../../components.jsx';
import { AdminGuard, AdminTabs } from './shared.jsx';

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

export function AdminRecipes({ state, setState, navigate, currentUser }) {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [allRecipes, setAllRecipes] = useState(null);
  const PAGE = 8;

  useEffect(() => {
    api.getAdminRecettes().then(setAllRecipes).catch(() => {});
  }, []);

  const recipes = allRecipes ?? state.recipes;
  const slice = recipes.slice((page - 1) * PAGE, page * PAGE);
  const pageCount = Math.max(1, Math.ceil(recipes.length / PAGE));

  async function remove(id) {
    if (!confirm('Supprimer définitivement cette recette ?')) return;
    try {
      await api.deleteRecette(id);
      setAllRecipes((prev) => prev ? prev.filter((r) => r.id !== id) : prev);
      setState((s) => ({
        ...s,
        recipes:  s.recipes.filter((r) => r.id !== id),
        comments: s.comments.filter((c) => c.recette_id !== id),
        notes:    s.notes.filter((n) => n.recette_id !== id),
      }));
    } catch (_) {
      alert('Erreur lors de la suppression.');
    }
  }

  async function changeStatut(id, statut) {
    try {
      await api.approuverRecette(id, statut);
      setAllRecipes((prev) => prev ? prev.map((r) => r.id === id ? { ...r, statut } : r) : prev);
      if (statut === 'approuvee') {
        const r = recipes.find((x) => x.id === id);
        if (r) setState((s) => ({ ...s, recipes: s.recipes.some((x) => x.id === id) ? s.recipes : [{ ...r, statut }, ...s.recipes] }));
      } else {
        setState((s) => ({ ...s, recipes: s.recipes.filter((r) => r.id !== id) }));
      }
    } catch (_) {
      alert('Erreur lors du changement de statut.');
    }
  }

  function save(form) {
    if (form._new) {
      const r = { ...form, id: uid('r'), date: new Date().toISOString().slice(0, 10), auteur: currentUser.nom, statut: 'approuvee' };
      delete r._new;
      setState((s) => ({ ...s, recipes: [r, ...s.recipes] }));
      setAllRecipes((prev) => prev ? [r, ...prev] : prev);
    } else {
      setState((s) => ({ ...s, recipes: s.recipes.map((r) => r.id === form.id ? form : r) }));
      setAllRecipes((prev) => prev ? prev.map((r) => r.id === form.id ? form : r) : prev);
    }
    setEditing(null);
  }

  const pending = recipes.filter((r) => r.statut === 'en_attente').length;

  return (
    <AdminGuard currentUser={currentUser} navigate={navigate}>
      <h1>Gestion des recettes</h1>
      <AdminTabs active="recipes" navigate={navigate} />
      <div className="row-flex mb-2" style={{ justifyContent: 'space-between' }}>
        <div className="muted">
          {recipes.length} recette{recipes.length > 1 ? 's' : ''}
          {pending > 0 && <span style={{ marginLeft: 8, color: 'var(--warn)', fontWeight: 600 }}>· {pending} en attente</span>}
        </div>
        <button className="primary" onClick={() => setEditing({
          _new: true, titre: '', description: '', ingredients: [], etapes: [],
          temps_preparation: 30, categorie: 'Plat principal', image: null,
        })}>+ Nouvelle recette</button>
      </div>

      {editing && <RecipeEditor initial={editing} onSave={save} onCancel={() => setEditing(null)} />}

      <table className="data">
        <thead>
          <tr><th>Titre</th><th>Statut</th><th>Catégorie</th><th>Temps</th><th>Note moy.</th><th></th></tr>
        </thead>
        <tbody>
          {allRecipes === null && <tr><td colSpan={6} className="muted">Chargement…</td></tr>}
          {slice.map((r) => {
            const avg = getAvg(state.notes, r.id);
            const cnt = getNoteCount(state.notes, r.id);
            const enAttente = r.statut === 'en_attente';
            const rejetee   = r.statut === 'rejetee';
            const rowBg = enAttente ? { background: 'oklch(0.97 0.03 80)' } : rejetee ? { background: 'oklch(0.97 0.02 20)', opacity: 0.8 } : {};
            return (
              <tr key={r.id} style={rowBg}>
                <td>
                  <a href={`#/recettes/${r.id}`} onClick={(e) => { e.preventDefault(); navigate(`/recettes/${r.id}`); }} style={{ fontWeight: 600, color: 'var(--ink)', textDecoration: 'underline' }}>{r.titre}</a>
                  <br /><span className="muted" style={{ fontSize: 12 }}>{r.auteur_nom || r.auteur}</span>
                </td>
                <td>
                  {enAttente && <span className="role-badge" style={{ background: 'var(--warn)', color: '#fff' }}>En attente</span>}
                  {rejetee   && <span className="role-badge" style={{ background: '#c00', color: '#fff' }}>Rejetée</span>}
                  {!enAttente && !rejetee && <span className="role-badge" style={{ background: 'var(--eco)', color: '#fff' }}>Publiée</span>}
                </td>
                <td><CategoryPill>{r.categorie}</CategoryPill></td>
                <td>{r.temps_preparation} min</td>
                <td>{avg ? `${avg.toFixed(1)} (${cnt})` : '—'}</td>
                <td className="actions">
                  {enAttente && <>
                    <button className="small" style={{ color: 'var(--eco)' }} onClick={() => changeStatut(r.id, 'approuvee')}>✓ Approuver</button>
                    <button className="danger small" onClick={() => changeStatut(r.id, 'rejetee')}>✗ Rejeter</button>
                  </>}
                  {rejetee && <>
                    <button className="small" onClick={() => changeStatut(r.id, 'approuvee')}>↩ Republier</button>
                    <button className="danger small" onClick={() => remove(r.id)}>Suppr.</button>
                  </>}
                  {!enAttente && !rejetee && <>
                    <button className="small" onClick={() => navigate(`/recettes/${r.id}`)}>Voir</button>
                    <button className="small" onClick={() => setEditing(r)}>Éditer</button>
                    <button className="danger small" onClick={() => remove(r.id)}>Suppr.</button>
                  </>}
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
