// Public pages: Home, RecipeList, RecipeDetail, NotFound
const { useState: useStateP, useMemo: useMemoP } = React;

function RecipeCard({ r, state, navigate, glyph }) {
  const avg = window.RA_getAvg(state.notes, r.id);
  const count = window.RA_getNoteCount(state.notes, r.id);
  const initial = (r.titre || "?").trim()[0];
  return (
    <a href={`#/recettes/${r.id}`} className="recipe-card"
       onClick={(e) => { e.preventDefault(); navigate(`/recettes/${r.id}`); }}>
      <div className="plate">
        {r.image
          ? <img src={r.image} alt={r.titre} className="card-img" loading="lazy" />
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
      <div className="meta" style={{marginTop: 2}}>
        <Stars value={avg || 0} />
        <span style={{color:"var(--ink)", fontWeight:500}}>
          {avg ? avg.toFixed(2) : "—"}
        </span>
        <span className="muted">({count})</span>
      </div>
    </a>
  );
}

function Home({ state, navigate }) {
  const top = useMemoP(() => {
    return [...state.recipes].
    map((r) => ({ r, avg: window.RA_getAvg(state.notes, r.id) || 0, count: window.RA_getNoteCount(state.notes, r.id) })).
    sort((a, b) => b.avg * 1000 + b.count - (a.avg * 1000 + a.count)).
    slice(0, 4);
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
        <div className="search-pill" role="search" onClick={() => navigate("/recettes")}>
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
          <button className="orb" aria-label="Rechercher" onClick={(e) => {e.stopPropagation(); navigate("/recettes");}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Les mieux notées</h2>
          <a href="#/recettes" onClick={(e)=>{e.preventDefault();navigate("/recettes");}}>Tout voir</a>
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
    </>);

}

const SORT_OPTIONS = [
  { value: "mieux-notées", label: "Mieux notées" },
  { value: "plus-récentes", label: "Plus récentes" },
  { value: "rapides", label: "Les plus rapides" },
  { value: "alphabétique", label: "Alphabétique" },
];

function RecipeList({ state, navigate, route }) {
  const [cat, setCat] = useStateP(route.params.cat || "Toutes");
  const [sort, setSort] = useStateP("mieux-notées");
  const [page, setPage] = useStateP(parseInt(route.params.page || "1", 10));
  const PAGE_SIZE = 8;

  const filtered = useMemoP(() => {
    let list = state.recipes.filter((r) => cat === "Toutes" ? true : r.categorie === cat);
    if (sort === "mieux-notées") {
      list = [...list].sort((a, b) => {
        const avgA = window.RA_getAvg(state.notes, a.id) || 0;
        const avgB = window.RA_getAvg(state.notes, b.id) || 0;
        if (avgB !== avgA) return avgB - avgA;
        return window.RA_getNoteCount(state.notes, b.id) - window.RA_getNoteCount(state.notes, a.id);
      });
    } else if (sort === "plus-récentes") {
      list = [...list].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    } else if (sort === "rapides") {
      list = [...list].sort((a, b) => a.temps_preparation - b.temps_preparation);
    } else if (sort === "alphabétique") {
      list = [...list].sort((a, b) => a.titre.localeCompare(b.titre, "fr", { sensitivity: "base" }));
    }
    return list;
  }, [state.recipes, state.notes, cat, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <h1 style={{ fontFamily: "var(--serif)" }}>Recettes</h1>
      <p className="muted">{filtered.length} recette{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}.</p>

      <div className="toolbar">
        <span style={{ fontSize: 13, color: "var(--ink-3)", marginRight: 4 }}>Filtrer :</span>
        <div className="filters">
          {["Toutes", ...window.RA_CATEGORIES].map((c) =>
          <button key={c} className={c === cat ? "on" : ""} onClick={() => {setCat(c);setPage(1);}}>{c}</button>
          )}
        </div>
        <div className="sort-wrap">
          <label htmlFor="rl-sort">Trier :</label>
          <select id="rl-sort" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {slice.length === 0 && <p className="muted mt-3">Aucune recette dans cette catégorie.</p>}

      <div className="recipe-grid">
        {slice.map((r) => <RecipeCard key={r.id} r={r} state={state} navigate={navigate} />)}
      </div>

      <Pager page={safePage} pageCount={pageCount} onChange={setPage} />
    </>);

}

function RecipeDetail({ state, setState, navigate, route, currentUser, showImages }) {
  const r = window.RA_recipeById(state.recipes, route.params.id);
  if (!r) return <NotFound navigate={navigate} />;
  const avg = window.RA_getAvg(state.notes, r.id);
  const count = window.RA_getNoteCount(state.notes, r.id);
  const myNote = currentUser ? window.RA_noteByUser(state.notes, r.id, currentUser.id) : null;
  const comments = state.comments.
  filter((c) => c.recette_id === r.id).
  sort((a, b) => b.date_commentaire.localeCompare(a.date_commentaire));

  const [draft, setDraft] = useStateP("");
  const [editingId, setEditingId] = useStateP(null);
  const [editDraft, setEditDraft] = useStateP("");
  const [error, setError] = useStateP("");

  function rate(v) {
    if (!currentUser) {navigate("/connexion");return;}
    setState((s) => {
      const existing = s.notes.find((n) => n.recette_id === r.id && n.utilisateur_id === currentUser.id);
      let notes;
      if (existing) {
        notes = s.notes.map((n) => n === existing ? { ...n, valeur: v } : n);
      } else {
        notes = [...s.notes, { id: window.RA_uid("n"), recette_id: r.id, utilisateur_id: currentUser.id, valeur: v }];
      }
      return { ...s, notes };
    });
  }

  function postComment(e) {
    e.preventDefault();
    if (!currentUser) {navigate("/connexion");return;}
    const txt = draft.trim();
    if (txt.length < 3) {setError("Le commentaire doit faire au moins 3 caractères.");return;}
    if (txt.length > 500) {setError("500 caractères maximum.");return;}
    setError("");
    setState((s) => ({
      ...s,
      comments: [...s.comments, {
        id: window.RA_uid("c"),
        recette_id: r.id,
        utilisateur_id: currentUser.id,
        contenu: txt,
        date_commentaire: new Date().toISOString().slice(0, 10)
      }]
    }));
    setDraft("");
  }
  function deleteComment(id) {
    if (!confirm("Supprimer ce commentaire ?")) return;
    setState((s) => ({ ...s, comments: s.comments.filter((c) => c.id !== id) }));
  }
  function startEdit(c) {setEditingId(c.id);setEditDraft(c.contenu);}
  function saveEdit() {
    setState((s) => ({
      ...s,
      comments: s.comments.map((c) => c.id === editingId ? { ...c, contenu: editDraft.trim() } : c)
    }));
    setEditingId(null);setEditDraft("");
  }

  return (
    <>
      <button className="ghost small mb-2" onClick={() => navigate("/recettes")}>← Retour aux recettes</button>
      <div className="detail-head">
        <h1>{r.titre}</h1>
        <div className="meta">
          <CategoryPill>{r.categorie}</CategoryPill>
          <span>⏱ {r.temps_preparation} min</span>
          <span className="sep">·</span>
          <Stars value={avg || 0} size={16} />
          <span>{avg ? `${avg.toFixed(1)} / 5` : "Pas encore noté"} ({count} avis)</span>
          <span className="sep">·</span>
          <AuthorLink state={state} navigate={navigate} authorName={r.auteur} />
        </div>
        <p className="mt-2 muted" style={{ fontSize: 15 }}>{r.description}</p>
      </div>

      {showImages &&
      <div className="placeholder-image" role="img" aria-label="Emplacement image recette (optionnel, lazy-loaded)">
          [ image optionnelle · WebP · loading=lazy ]
        </div>
      }

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
        {currentUser ?
        <div className="row-flex">
            <StarInput value={myNote ? myNote.valeur : 0} onChange={rate} />
            <span className="muted">{myNote ? `Vous avez noté ${myNote.valeur}/5 — cliquez pour modifier.` : "Cliquez pour noter (1 à 5)."}</span>
          </div> :

        <p className="muted">
            <a href="#/connexion" onClick={(e) => {e.preventDefault();navigate("/connexion");}}>Connectez-vous</a> pour noter cette recette.
          </p>
        }
      </section>

      <section>
        <h2 className="section-title">Commentaires ({comments.length})</h2>
        {currentUser ?
        <form onSubmit={postComment} className="mb-3">
            <label htmlFor="cmt">Votre avis</label>
            <textarea id="cmt" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Partagez votre expérience…" maxLength={500} />
            {error && <div className="err">{error}</div>}
            <div className="row-flex mt-2">
              <button type="submit" className="primary small">Publier</button>
              <small className="muted">{draft.length}/500</small>
            </div>
          </form> :

        <p className="muted">
            <a href="#/connexion" onClick={(e) => {e.preventDefault();navigate("/connexion");}}>Connectez-vous</a> pour commenter.
          </p>
        }

        {comments.length === 0 && <p className="muted">Aucun commentaire pour l'instant.</p>}
        {comments.map((c) => {
          const author = window.RA_userById(state.users, c.utilisateur_id);
          const mine = currentUser && currentUser.id === c.utilisateur_id;
          const canMod = currentUser && currentUser.role === "admin";
          return (
            <article key={c.id} className="comment">
              <div className="head">
                <a href={author ? `#/utilisateurs/${author.id}` : undefined}
                   className="author"
                   style={author ? {color:"var(--ink)", textDecoration:"none"} : {}}
                   onClick={author ? (e)=>{e.preventDefault();navigate(`/utilisateurs/${author.id}`);} : undefined}>
                  {author ? author.nom : "Utilisateur supprimé"}
                </a>
                <span>·</span>
                <span>{window.RA_shortDate(c.date_commentaire)}</span>
                {author && author.role === "admin" && <span className="role-badge admin">admin</span>}
              </div>
              {editingId === c.id ?
              <>
                  <textarea value={editDraft} onChange={(e) => setEditDraft(e.target.value)} maxLength={500} />
                  <div className="actions">
                    <button className="primary small" onClick={saveEdit}>Enregistrer</button>
                    <button className="small" onClick={() => setEditingId(null)}>Annuler</button>
                  </div>
                </> :

              <>
                  <div>{c.contenu}</div>
                  {(mine || canMod) &&
                <div className="actions">
                      {mine && <button className="ghost small" onClick={() => startEdit(c)}>Modifier</button>}
                      <button className="danger small" onClick={() => deleteComment(c.id)}>
                        {canMod && !mine ? "Modérer" : "Supprimer"}
                      </button>
                    </div>
                }
                </>
              }
            </article>);

        })}
      </section>
    </>);

}

function NotFound({ navigate }) {
  return (
    <div className="center-block">
      <div className="code">Erreur 404</div>
      <h1>Page introuvable</h1>
      <p className="muted">Cette page n'existe pas ou a été déplacée.</p>
      <button className="primary mt-2" onClick={() => navigate("/")}>Retour à l'accueil</button>
    </div>);

}

function Mentions({ navigate }) {
  return (
    <>
      <button className="ghost small mb-2" onClick={() => navigate("/")}>← Accueil</button>
      <h1 style={{ fontFamily: "var(--serif)" }}>Mentions &amp; éco-conception</h1>
      <p>Recette &amp; Avis est un mini-projet pédagogique réalisé dans le cadre du module
      <em> TI616 — Numérique Durable</em> à l'EFREI Paris (2025-2026), Groupe 2.</p>
      <h2>Indicateurs Green IT</h2>
      <table className="data">
        <thead><tr><th>Indicateur</th><th>Cible</th><th>Mesuré</th></tr></thead>
        <tbody>
          <tr><td>Poids par page</td><td>&lt; 500 Ko</td><td>~ 60 Ko</td></tr>
          <tr><td>Requêtes HTTP / page</td><td>&lt; 15</td><td>4–7</td></tr>
          <tr><td>Score Lighthouse Perf.</td><td>&gt; 80</td><td>à mesurer en prod</td></tr>
          <tr><td>EcoIndex</td><td>A ou B</td><td>à mesurer en prod</td></tr>
          <tr><td>Polices</td><td>Système</td><td>system-ui / Georgia</td></tr>
        </tbody>
      </table>
    </>);

}

Object.assign(window, { Home, RecipeCard, RecipeList, RecipeDetail, NotFound, Mentions });