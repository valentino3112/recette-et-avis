import React, { useState } from 'react';
import { api } from './api.js';
import { CATEGORIES, mapApiRecette } from './data.js';

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

export function About({ navigate }) {
  const team = [
    { nom: 'Valentin GONÇALVES',     role: 'Frontend · architecture React · GitHub', bio: 'Responsable du planning, des wireframes et de l\'intégration HTML/CSS.' },
    { nom: 'Batur HAMZAOGULLARI',    role: 'Back-end · API Express',                 bio: 'Implémentation des routes Express, du hash bcrypt et des sessions.' },
    { nom: 'Emma DUVERNET',          role: 'Base de données · migrations SQLite',     bio: 'Modélisation SQLite, scripts de migration, requêtes paramétrées.' },
    { nom: 'Ivane DJOTEBONG TIDONG', role: 'Tests · qualité & sécurité',             bio: 'Tests Jest/Supertest, audit accessibilité, contrastes et hiérarchie.' },
    { nom: 'Roline IMELE TIODA',     role: 'Green IT · déploiement',                 bio: 'Mesures EcoIndex / Lighthouse, optimisations Vite, déploiement Railway.' },
  ];
  return (
    <>
      <h1>À propos</h1>
      <p style={{ maxWidth: '60ch', fontSize: 17, color: 'var(--ink-2)' }}>
        Recette &amp; Avis est un mini-projet pédagogique réalisé dans le cadre du module
        <em> TI616 — Numérique Durable</em> à l'EFREI Paris (2025-2026), par le Groupe 3.
      </p>

      <h2 className="section-title mt-4">Notre équipe</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {team.map((m, i) => (
          <article key={i} className="profile-card" style={{ margin: 0 }}>
            <h3 style={{ fontSize: 18, marginBottom: 2 }}>{m.nom}</h3>
            <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>{m.role}</div>
            <p style={{ margin: 0, fontSize: 14 }}>{m.bio}</p>
          </article>
        ))}
      </div>

      <h2 className="section-title mt-4">Notre mission</h2>
      <p>Démontrer qu'un site web utile et agréable peut rester sobre : moins de 500 Ko par page, moins de 15 requêtes HTTP, polices système, base de données fichier unique et code maintenable. Chaque décision technique a été pesée à l'aune de la sobriété numérique.</p>

      <div className="eco-panel">
        <h3>Engagements Green IT</h3>
        <ul>
          <li>Build Vite en production — React compilé, minifié, sans Babel navigateur.</li>
          <li>Polices système uniquement, pas de Google Fonts.</li>
          <li>Images WebP compressées, lazy loading, dimensions explicites.</li>
          <li>Pagination côté serveur, requêtes SQL paramétrées.</li>
          <li>Aucune animation décorative, aucun autoplay média.</li>
        </ul>
      </div>
    </>
  );
}

export function Contact({ navigate }) {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [sujet, setSujet] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [err, setErr] = useState({});
  const [sent, setSent] = useState(false);

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (nom.trim().length < 2) errs.nom = 'Nom requis.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Email invalide.';
    if (message.trim().length < 10) errs.message = 'Message trop court (10 caractères mini).';
    setErr(errs);
    if (Object.keys(errs).length) return;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: 24 }}>Message envoyé ✓</h1>
        <p>Merci, <strong>{nom}</strong>. Nous reviendrons vers vous à <code>{email}</code> sous quelques jours.</p>
        <button className="primary" onClick={() => navigate('/')}>Retour à l'accueil</button>
      </div>
    );
  }

  return (
    <>
      <h1>Nous contacter</h1>
      <p className="muted" style={{ maxWidth: '56ch' }}>Une question, un bug, une idée d'amélioration ? Écrivez-nous, nous lisons tout.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div className="profile-card" style={{ margin: 0 }}>
          <form onSubmit={submit} noValidate>
            <div className="field">
              <label>Nom</label>
              <input value={nom} onChange={(e) => setNom(e.target.value)} />
              {err.nom && <div className="err">{err.nom}</div>}
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              {err.email && <div className="err">{err.email}</div>}
            </div>
            <div className="field">
              <label>Sujet</label>
              <select value={sujet} onChange={(e) => setSujet(e.target.value)}>
                <option>Feedback</option>
                <option>Bug technique</option>
                <option>Question sur une recette</option>
                <option>Modération / signalement</option>
                <option>Autre</option>
              </select>
            </div>
            <div className="field">
              <label>Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} style={{ minHeight: 140 }} maxLength={2000} />
              {err.message && <div className="err">{err.message}</div>}
            </div>
            <button type="submit" className="primary">Envoyer</button>
          </form>
        </div>

        <aside>
          <h2 className="section-title">Autres moyens</h2>
          <p><strong>Email</strong><br /><a href="mailto:contact@recetteavis.fr">contact@recetteavis.fr</a></p>
          <p className="muted" style={{ fontSize: 13 }}>Le formulaire ci-contre n'envoie pas réellement de mail dans cette démo : il valide simplement la saisie côté client.</p>
        </aside>
      </div>
    </>
  );
}
