import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../api.js';
import { getAvg, getNoteCount, shortDate, CATEGORIES, mapApiRecette } from '../data.js';
import { Stars, StarInput, CategoryPill, Pager, RecipeCard, NotFound } from '../components.jsx';
import { AuthorLink } from './utilisateur.jsx';

const SORT_OPTIONS = [
  { value: 'mieux-notées',  label: 'Mieux notées' },
  { value: 'plus-récentes', label: 'Plus récentes' },
  { value: 'rapides',       label: 'Les plus rapides' },
  { value: 'alphabétique',  label: 'Alphabétique' },
];

export function RecipeList({ state, navigate, route }) {
  const [cat, setCat]   = useState(route.params.cat || 'Toutes');
  const [sort, setSort] = useState('mieux-notées');
  const [page, setPage] = useState(parseInt(route.params.page || '1', 10));
  const PAGE_SIZE = 8;

  const filtered = useMemo(() => {
    let list = state.recipes.filter((r) => cat === 'Toutes' ? true : r.categorie === cat);
    if (sort === 'mieux-notées') {
      list = [...list].sort((a, b) => {
        const avgA = getAvg(state.notes, a.id) || 0;
        const avgB = getAvg(state.notes, b.id) || 0;
        if (avgB !== avgA) return avgB - avgA;
        return getNoteCount(state.notes, b.id) - getNoteCount(state.notes, a.id);
      });
    } else if (sort === 'plus-récentes') {
      list = [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } else if (sort === 'rapides') {
      list = [...list].sort((a, b) => a.temps_preparation - b.temps_preparation);
    } else if (sort === 'alphabétique') {
      list = [...list].sort((a, b) => a.titre.localeCompare(b.titre, 'fr', { sensitivity: 'base' }));
    }
    return list;
  }, [state.recipes, state.notes, cat, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage  = Math.min(page, pageCount);
  const slice     = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <h1>Recettes</h1>
      <p className="muted">{filtered.length} recette{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}.</p>

      <div className="toolbar">
        <span style={{ fontSize: 13, color: 'var(--ink-3)', marginRight: 4 }}>Filtrer :</span>
        <div className="filters">
          {['Toutes', ...CATEGORIES].map((c) =>
            <button key={c} className={c === cat ? 'on' : ''} onClick={() => { setCat(c); setPage(1); }}>{c}</button>
          )}
        </div>
        <div className="sort-wrap">
          <label htmlFor="rl-sort">Trier :</label>
          <select id="rl-sort" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {slice.length === 0 && <p className="muted mt-3">Aucune recette dans cette catégorie.</p>}

      <div className="recipe-grid">
        {slice.map((r) => <RecipeCard key={r.id} r={r} state={state} navigate={navigate} />)}
      </div>

      <Pager page={safePage} pageCount={pageCount} onChange={setPage} />
    </>
  );
}

export function RecipeDetail({ state, navigate, route, currentUser }) {
  const recetteId  = route.params.id;
  const fromState  = state.recipes.find((x) => x.id === recetteId) || null;
  const [r, setR]  = useState(fromState);
  const [recipeLoading, setRecipeLoading] = useState(!fromState);

  const [comments, setComments]             = useState([]);
  const [myNote, setMyNote]                 = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [draft, setDraft]                   = useState('');
  const [editingId, setEditingId]           = useState(null);
  const [editDraft, setEditDraft]           = useState('');
  const [error, setError]                   = useState('');

  useEffect(() => {
    const known = state.recipes.find((x) => x.id === recetteId) || null;
    if (known) { setR(known); setRecipeLoading(false); return; }
    setRecipeLoading(true);
    api.getRecette(recetteId)
      .then((data) => { setR(mapApiRecette(data)); })
      .catch(() => setR(null))
      .finally(() => setRecipeLoading(false));
  }, [recetteId]);

  useEffect(() => {
    if (!recetteId) return;
    setCommentsLoading(true);
    setComments([]);
    setMyNote(null);

    const tasks = [api.getCommentaires(recetteId).catch(() => [])];
    if (currentUser) tasks.push(api.getMaNote(recetteId).catch(() => ({ valeur: null })));

    Promise.all(tasks).then(([cmts, noteData]) => {
      setComments(cmts || []);
      if (noteData) setMyNote(noteData.valeur != null ? noteData : null);
    }).finally(() => setCommentsLoading(false));
  }, [recetteId, currentUser?.id]);

  if (recipeLoading) return <p className="muted">Chargement…</p>;
  if (!r) return <NotFound navigate={navigate} />;

  const enAttente = r.statut === 'en_attente';
  const rejetee   = r.statut === 'rejetee';
  const avg   = getAvg(state.notes, r.id);
  const count = getNoteCount(state.notes, r.id);

  async function rate(v) {
    if (!currentUser) { navigate('/connexion'); return; }
    try {
      await api.noter(recetteId, v);
      setMyNote({ valeur: v });
    } catch (_) {}
  }

  async function postComment(e) {
    e.preventDefault();
    if (!currentUser) { navigate('/connexion'); return; }
    const txt = draft.trim();
    if (txt.length < 3)   { setError('Le commentaire doit faire au moins 3 caractères.'); return; }
    if (txt.length > 500) { setError('500 caractères maximum.'); return; }
    setError('');
    try {
      const c = await api.addCommentaire(recetteId, txt);
      setComments((cs) => [c, ...cs]);
      setDraft('');
    } catch (_) {
      setError('Erreur lors de l\'envoi du commentaire.');
    }
  }

  async function deleteComment(id) {
    if (!confirm('Supprimer ce commentaire ?')) return;
    try {
      await api.deleteCommentaire(id);
      setComments((cs) => cs.filter((c) => c.id !== id));
    } catch (_) {}
  }

  function startEdit(c) { setEditingId(c.id); setEditDraft(c.contenu); }

  async function saveEdit() {
    try {
      const updated = await api.editCommentaire(editingId, editDraft.trim());
      setComments((cs) => cs.map((c) => c.id === editingId ? { ...c, contenu: updated.contenu } : c));
      setEditingId(null); setEditDraft('');
    } catch (_) {}
  }

  return (
    <>
      <button className="ghost small mb-2" onClick={() => navigate('/recettes')}>← Retour aux recettes</button>

      {enAttente && (
        <div className="notice warn mb-2">
          ⏳ Cette recette est en attente de validation par un modérateur. Elle n'est pas encore visible publiquement.
        </div>
      )}
      {rejetee && (
        <div className="notice warn mb-2" style={{ borderColor: 'var(--danger, #c00)' }}>
          ✗ Cette recette a été rejetée par un modérateur et n'est pas visible publiquement.
        </div>
      )}

      <div className="detail-head">
        <h1>{r.titre}</h1>
        <div className="meta">
          <CategoryPill>{r.categorie}</CategoryPill>
          <span>⏱ {r.temps_preparation} min</span>
          <span className="sep">·</span>
          <Stars value={avg || 0} size={16} />
          <span>{avg ? `${avg.toFixed(1)} / 5` : 'Pas encore noté'} ({count} avis)</span>
          <span className="sep">·</span>
          <AuthorLink state={state} navigate={navigate} authorName={r.auteur} />
        </div>
        <p className="mt-2 muted" style={{ fontSize: 15 }}>{r.description}</p>
      </div>

      {r.image && (
        <div style={{ margin: '16px 0 28px', borderRadius: 'var(--r-md)', overflow: 'hidden', aspectRatio: '16/9' }}>
          <img src={r.image} alt={r.titre} loading="lazy" width="800" height="450"
               style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      <div className="cols-2">
        <div className="ingredients">
          <h2 className="section-title">Ingrédients</h2>
          <ul>{r.ingredients.map((it, i) => <li key={i}>{it}</li>)}</ul>
        </div>
        <div className="steps">
          <h2 className="section-title">Étapes</h2>
          <ol>{r.etapes.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </div>
      </div>

      <section className="mb-3">
        <h2 className="section-title">Votre note</h2>
        {currentUser
          ? <div className="row-flex">
              <StarInput value={myNote ? myNote.valeur : 0} onChange={rate} />
              <span className="muted">
                {myNote ? `Vous avez noté ${myNote.valeur}/5 — cliquez pour modifier.` : 'Cliquez pour noter (1 à 5).'}
              </span>
            </div>
          : <p className="muted">
              <a href="#/connexion" onClick={(e) => { e.preventDefault(); navigate('/connexion'); }}>Connectez-vous</a> pour noter cette recette.
            </p>
        }
      </section>

      <section>
        <h2 className="section-title">
          Commentaires {!commentsLoading && `(${comments.length})`}
        </h2>
        {currentUser
          ? <form onSubmit={postComment} className="mb-3">
              <label htmlFor="cmt">Votre avis</label>
              <textarea id="cmt" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Partagez votre expérience…" maxLength={500} />
              {error && <div className="err">{error}</div>}
              <div className="row-flex mt-2">
                <button type="submit" className="primary small">Publier</button>
                <small className="muted">{draft.length}/500</small>
              </div>
            </form>
          : <p className="muted">
              <a href="#/connexion" onClick={(e) => { e.preventDefault(); navigate('/connexion'); }}>Connectez-vous</a> pour commenter.
            </p>
        }

        {commentsLoading && <p className="muted">Chargement des commentaires…</p>}
        {!commentsLoading && comments.length === 0 && <p className="muted">Aucun commentaire pour l'instant.</p>}

        {comments.map((c) => {
          const mine   = currentUser && currentUser.id === c.utilisateur_id;
          const canMod = currentUser && currentUser.role === 'admin';
          return (
            <article key={c.id} className="comment">
              <div className="head">
                <a href={`#/utilisateurs/${c.utilisateur_id}`} className="author"
                   style={{ color: 'var(--ink)', textDecoration: 'none' }}
                   onClick={(e) => { e.preventDefault(); navigate(`/utilisateurs/${c.utilisateur_id}`); }}>
                  {c.utilisateur_nom || 'Utilisateur supprimé'}
                </a>
                <span>·</span>
                <span>{shortDate(c.date_commentaire)}</span>
                {c.utilisateur_role === 'admin' && <span className="role-badge admin">admin</span>}
              </div>
              {editingId === c.id
                ? <>
                    <textarea value={editDraft} onChange={(e) => setEditDraft(e.target.value)} maxLength={500} />
                    <div className="actions">
                      <button className="primary small" onClick={saveEdit}>Enregistrer</button>
                      <button className="small" onClick={() => setEditingId(null)}>Annuler</button>
                    </div>
                  </>
                : <>
                    <div>{c.contenu}</div>
                    {(mine || canMod) &&
                      <div className="actions">
                        {mine && <button className="ghost small" onClick={() => startEdit(c)}>Modifier</button>}
                        <button className="danger small" onClick={() => deleteComment(c.id)}>
                          {canMod && !mine ? 'Modérer' : 'Supprimer'}
                        </button>
                      </div>
                    }
                  </>
              }
            </article>
          );
        })}
      </section>
    </>
  );
}
