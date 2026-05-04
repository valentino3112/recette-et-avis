import React, { useState } from 'react';
import { api } from '../api.js';
import { CATEGORIES, mapApiRecette } from '../data.js';

export function SubmitRecipe({ state, setState, navigate, currentUser }) {
  if (!currentUser) {
    return (
      <div className="auth-card">
        <div className="notice warn">Vous devez être connecté pour proposer une recette.</div>
        <div className="row-flex">
          <button className="primary" onClick={() => navigate('/connexion')}>Se connecter</button>
          <button onClick={() => navigate('/inscription')}>Créer un compte</button>
        </div>
      </div>
    );
  }

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState('Plat principal');
  const [temps, setTemps] = useState(30);
  const [ingredients, setIngredients] = useState('');
  const [etapes, setEtapes] = useState('');
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (titre.trim().length < 3) { setErr('Titre trop court (3 caractères mini).'); return; }
    if (description.trim().length < 10) { setErr('Description trop courte (10 caractères mini).'); return; }
    const ing = ingredients.split('\n').map((s) => s.trim()).filter(Boolean);
    const etp = etapes.split('\n').map((s) => s.trim()).filter(Boolean);
    if (ing.length < 2) { setErr('Au moins 2 ingrédients requis.'); return; }
    if (etp.length < 1) { setErr('Au moins 1 étape requise.'); return; }
    const t = parseInt(temps, 10);
    if (!t || t < 1 || t > 600) { setErr('Temps de préparation invalide.'); return; }
    setErr('');
    try {
      const data = await api.createRecette({
        titre: titre.trim(),
        description: description.trim(),
        categorie,
        temps_preparation: t,
        ingredients: ing,
        etapes: etp,
      });
      const fullRecette = await api.getRecette(data.id).catch(() => null);
      if (fullRecette) {
        setState((s) => ({ ...s, recipes: [mapApiRecette(fullRecette), ...s.recipes] }));
      }
      setDone(data.id);
    } catch (err) {
      setErr(err.data?.errors?.[0]?.msg || err.message || 'Erreur lors de la publication.');
    }
  }

  if (done) {
    return (
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: 24 }}>Recette publiée ✓</h1>
        <p>Merci pour votre contribution. Votre recette est désormais visible par toute la communauté.</p>
        <div className="row-flex">
          <button className="primary" onClick={() => navigate(`/recettes/${done}`)}>Voir ma recette</button>
          <button onClick={() => { setDone(null); setTitre(''); setDescription(''); setIngredients(''); setEtapes(''); setTemps(30); }}>En proposer une autre</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1>Proposer une recette</h1>
      <p className="muted" style={{ maxWidth: '56ch' }}>Partagez une recette simple, fiable et bien testée. Pas d'image lourde nécessaire — la sobriété fait partie de l'engagement du site.</p>
      <div className="profile-card mb-3" style={{ maxWidth: 'none' }}>
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label>Titre</label>
            <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex. Salade de quinoa aux légumes rôtis" />
          </div>
          <div className="field">
            <label>Description courte</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Une phrase ou deux pour donner envie." />
          </div>
          <div className="row-flex" style={{ gap: 12, alignItems: 'flex-start' }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Catégorie</label>
              <select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field" style={{ width: 160 }}>
              <label>Temps (min)</label>
              <input type="number" min="1" max="600" value={temps} onChange={(e) => setTemps(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Ingrédients <span className="muted">(un par ligne)</span></label>
            <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} style={{ minHeight: 120 }}
              placeholder={'200 g de quinoa\n2 courgettes\n1 c. à soupe d\'huile d\'olive'} />
          </div>
          <div className="field">
            <label>Étapes <span className="muted">(une par ligne)</span></label>
            <textarea value={etapes} onChange={(e) => setEtapes(e.target.value)} style={{ minHeight: 140 }}
              placeholder={'Cuire le quinoa 12 min.\nRôtir les courgettes au four 20 min.\nMélanger, assaisonner.'} />
          </div>
          {err && <div className="notice warn">{err}</div>}
          <div className="row-flex">
            <button type="submit" className="primary">Publier la recette</button>
            <button type="button" onClick={() => navigate('/recettes')}>Annuler</button>
          </div>
        </form>
      </div>
    </>
  );
}
