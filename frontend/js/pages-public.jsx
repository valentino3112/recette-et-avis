import React, { useState, useMemo, useEffect } from 'react';
import { api } from './api.js';
import { getAvg, getNoteCount, shortDate, CATEGORIES } from './data.js';
import { Stars, StarInput, CategoryPill, Pager } from './components.jsx';
import { AuthorLink } from './pages-user.jsx';

export function RecipeCard({ r, state, navigate, glyph }) {
  const avg = getAvg(state.notes, r.id);
  const count = getNoteCount(state.notes, r.id);
  const initial = (r.titre || '?').trim()[0];
  return (
    <a href={`#/recettes/${r.id}`} className="recipe-card"
       onClick={(e) => { e.preventDefault(); navigate(`/recettes/${r.id}`); }}>
      <div className="plate">
        {r.image
          ? <img src={r.image} alt={r.titre} className="card-img" loading="lazy" width="400" height="400" />
          : <span className="glyph" aria-hidden="true">{initial}</span>
        }
        {glyph !== false && avg && avg >= 4.5 && <span className="badge">★ Coup de cœur</span>}
        <span className="heart" aria-hidden="true">♡</span>
      </div>
      <h3>{r.titre}</h3>
      <div className="meta">
        <span>{r.categorie}</span>
        <span className="sep">·</span>
        <span>{r.temps_preparation} min</span>
      </div>
      <div className="meta" style={{ marginTop: 2 }}>
        <Stars value={avg || 0} />
        <span style={{ color: 'var(--ink)', fontWeight: 500 }}>
          {avg ? avg.toFixed(2) : '—'}
        </span>
        <span className="muted">({count})</span>
      </div>
    </a>
  );
}

export function Home({ state, navigate }) {
  const top = useMemo(() => {
    return [...state.recipes]
      .map((r) => ({ r, avg: getAvg(state.notes, r.id) || 0, count: getNoteCount(state.notes, r.id) }))
      .sort((a, b) => b.avg * 1000 + b.count - (a.avg * 1000 + a.count))
      .slice(0, 4);
  }, [state.recipes, state.notes]);

  return (
    <>
      <section className="hero">
        <h1>Des recettes simples, des avis honnêtes.</h1>
        <p className="lede">
          Une plateforme sobre de recettes de cuisine, enrichie de notes et
          de commentaires laissés par la communauté. Pas de publicité, pas
          de média superflu, pas de cookies de traçage.
        </p>
        <div className="search-pill" role="search" onClick={() => navigate('/recettes')}>
          <div className="seg">
            <div className="label">Catégorie</div>
            <div className="val">Toutes les recettes</div>
          </div>
          <div className="seg">
            <div className="label">Temps</div>
            <div className="val">Peu importe</div>
          </div>
          <div className="seg">
            <div className="label">Trier par</div>
            <div className="val">Mieux notées</div>
          </div>
          <button className="orb" aria-label="Rechercher" onClick={(e) => { e.stopPropagation(); navigate('/recettes'); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Les mieux notées</h2>
          <a href="#/recettes" onClick={(e) => { e.preventDefault(); navigate('/recettes'); }}>Tout voir</a>
        </div>
        <div className="recipe-grid">
          {top.map(({ r }) => <RecipeCard key={r.id} r={r} state={state} navigate={navigate} />)}
        </div>
      </section>

      <section className="eco-panel" aria-labelledby="eco-h">
        <h3 id="eco-h">Nos engagements éco-conception</h3>
        <ul>
          <li>Polices système uniquement, aucune ressource externe.</li>
          <li>Cartes de recettes <strong>textuelles</strong> — images optionnelles, en lazy loading et compressées en WebP.</li>
          <li>Pagination plutôt que scroll infini, requêtes paginées côté serveur.</li>
          <li>JavaScript minimal, pas d'animations décoratives, mode sombre disponible.</li>
        </ul>
      </section>
    </>
  );
}

const SORT_OPTIONS = [
  { value: 'mieux-notées', label: 'Mieux notées' },
  { value: 'plus-récentes', label: 'Plus récentes' },
  { value: 'rapides', label: 'Les plus rapides' },
  { value: 'alphabétique', label: 'Alphabétique' },
];

export function RecipeList({ state, navigate, route }) {
  const [cat, setCat] = useState(route.params.cat || 'Toutes');
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
  const safePage = Math.min(page, pageCount);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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

export function RecipeDetail({ state, setState, navigate, route, currentUser }) {
  const recetteId = route.params.id;
  const r = state.recipes.find((x) => x.id === recetteId) || null;

  const [comments, setComments] = useState([]);
  const [myNote, setMyNote] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const [error, setError] = useState('');

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

  if (!r) return <NotFound navigate={navigate} />;

  const avg = getAvg(state.notes, r.id);
  const count = getNoteCount(state.notes, r.id);

  async function rate(v) {
    if (!currentUser) { navigate('/connexion'); return; }
    try {
      await api.noter(recetteId, v);
      setMyNote({ valeur: v });
      setState((s) => ({
        ...s,
        notes: s.notes.map((n) =>
          n.recette_id === recetteId && n._agg
            ? { ...n, _moyenne: n._count > 0 ? ((n._moyenne * n._count - (myNote?.valeur || 0) + v) / n._count).toFixed(2) * 1 : v, _count: myNote ? n._count : n._count + 1 }
            : n
        ),
      }));
    } catch (_) {}
  }

  async function postComment(e) {
    e.preventDefault();
    if (!currentUser) { navigate('/connexion'); return; }
    const txt = draft.trim();
    if (txt.length < 3) { setError('Le commentaire doit faire au moins 3 caractères.'); return; }
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
          <ul>
            {r.ingredients.map((it, i) => <li key={i}>{it}</li>)}
          </ul>
        </div>
        <div className="steps">
          <h2 className="section-title">Étapes</h2>
          <ol>
            {r.etapes.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
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
          const mine = currentUser && currentUser.id === c.utilisateur_id;
          const canMod = currentUser && currentUser.role === 'admin';
          return (
            <article key={c.id} className="comment">
              <div className="head">
                <a href={`#/utilisateurs/${c.utilisateur_id}`}
                   className="author"
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

export function NotFound({ navigate }) {
  return (
    <div className="center-block">
      <div className="code">Erreur 404</div>
      <h1>Page introuvable</h1>
      <p className="muted">Cette page n'existe pas ou a été déplacée.</p>
      <button className="primary mt-2" onClick={() => navigate('/')}>Retour à l'accueil</button>
    </div>
  );
}

export function Mentions({ navigate }) {
  return (
    <>
      <button className="ghost small mb-2" onClick={() => navigate('/')}>← Accueil</button>
      <h1>Mentions &amp; éco-conception</h1>
      <p>Recette &amp; Avis est un mini-projet pédagogique réalisé dans le cadre du module
      <em> TI616 — Numérique Durable</em> à l'EFREI Paris (2025-2026), Groupe 3.</p>
      <h2>Indicateurs Green IT</h2>
      <table className="data">
        <thead><tr><th>Indicateur</th><th>Cible</th><th>Mesuré</th></tr></thead>
        <tbody>
          <tr><td>Poids par page</td><td>&lt; 500 Ko</td><td>à mesurer en prod</td></tr>
          <tr><td>Requêtes HTTP / page</td><td>&lt; 15</td><td>à mesurer en prod</td></tr>
          <tr><td>Score Lighthouse Perf.</td><td>&gt; 90</td><td>à mesurer en prod</td></tr>
          <tr><td>EcoIndex</td><td>A ou B</td><td>à mesurer en prod</td></tr>
          <tr><td>Polices</td><td>Système</td><td>system-ui / sans-serif</td></tr>
        </tbody>
      </table>
    </>
  );
}
