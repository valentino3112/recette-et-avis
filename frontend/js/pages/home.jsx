import React, { useMemo } from 'react';
import { getAvg, getNoteCount } from '../data.js';
import { RecipeCard } from '../components.jsx';

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
