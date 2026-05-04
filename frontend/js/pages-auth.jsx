import React, { useState, useMemo, useEffect } from 'react';
import { api } from './api.js';
import { recipesByAuthor, shortDate, getAvg, getNoteCount } from './data.js';
import { Stars, CategoryPill } from './components.jsx';

export function Login({ state, setState, navigate }) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!email.includes('@')) { setErr('Email invalide.'); return; }
    if (!pwd) { setErr('Mot de passe requis.'); return; }
    setErr(''); setLoading(true);
    try {
      const u = await api.login(email.trim(), pwd);
      const followsData = await api.getFollowing(u.id).catch(() => []);
      setState((s) => {
        const users = s.users.some((x) => x.id === u.id)
          ? s.users.map((x) => x.id === u.id ? { ...x, ...u } : x)
          : [...s.users, u];
        return {
          ...s,
          users,
          sessionUserId: u.id,
          follows: followsData.map((f) => ({
            id: 'fl_' + f.id,
            follower_id: u.id,
            following_id: f.id,
          })),
        };
      });
      navigate(u.role === 'admin' ? '/admin' : '/profil');
    } catch (err) {
      setErr(
        err.status === 401 ? 'Identifiants incorrects.' :
        err.status === 400 ? 'Email invalide.' :
        'Erreur serveur, réessayez.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h1 style={{ fontSize: 24 }}>Connexion</h1>
      <p className="muted" style={{ fontSize: 14 }}>
        Comptes de démo : <code>admin@recetteavis.fr</code> / <code>admin1234</code>
        &nbsp;ou <code>camille@example.com</code> / <code>camille1234</code>
      </p>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="login-pwd">Mot de passe</label>
          <input id="login-pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="current-password" required />
        </div>
        {err && <div className="notice warn" role="alert">{err}</div>}
        <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
      <p className="mt-3 muted" style={{ fontSize: 14, textAlign: 'center' }}>
        Pas encore de compte ?{' '}
        <a href="#/inscription" onClick={(e) => { e.preventDefault(); navigate('/inscription'); }}>Créer un compte</a>
      </p>
    </div>
  );
}

export function Register({ state, setState, navigate }) {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (nom.trim().length < 2)                              errs.nom   = 'Nom requis (≥ 2 caractères).';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))        errs.email = 'Email invalide.';
    if (pwd.length < 8)                                     errs.pwd   = 'Mot de passe : 8 caractères minimum.';
    if (pwd !== pwd2)                                       errs.pwd2  = 'Les mots de passe ne correspondent pas.';
    setErr(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const u = await api.register(nom.trim(), email.trim(), pwd);
      setState((s) => ({ ...s, users: [...s.users, u], sessionUserId: u.id }));
      navigate('/profil');
    } catch (err) {
      if (err.status === 409) {
        setErr((e) => ({ ...e, email: 'Email déjà utilisé.' }));
      } else if (err.status === 400) {
        const msg = err.data?.errors?.[0]?.msg || 'Données invalides.';
        setErr((e) => ({ ...e, _general: msg }));
      } else {
        setErr((e) => ({ ...e, _general: 'Erreur serveur, réessayez.' }));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h1 style={{ fontSize: 24 }}>Créer un compte</h1>
      <p className="muted" style={{ fontSize: 14 }}>Mot de passe hashé avec bcrypt · validation côté serveur.</p>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="reg-nom">Nom</label>
          <input id="reg-nom" value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" />
          {err.nom && <div className="err">{err.nom}</div>}
        </div>
        <div className="field">
          <label htmlFor="reg-email">Email</label>
          <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          {err.email && <div className="err">{err.email}</div>}
        </div>
        <div className="field">
          <label htmlFor="reg-pwd">Mot de passe</label>
          <input id="reg-pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="new-password" />
          <div className="hint">8 caractères minimum.</div>
          {err.pwd && <div className="err">{err.pwd}</div>}
        </div>
        <div className="field">
          <label htmlFor="reg-pwd2">Confirmer le mot de passe</label>
          <input id="reg-pwd2" type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} autoComplete="new-password" />
          {err.pwd2 && <div className="err">{err.pwd2}</div>}
        </div>
        {err._general && <div className="notice warn">{err._general}</div>}
        <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>
      <p className="mt-3 muted" style={{ fontSize: 14, textAlign: 'center' }}>
        Déjà inscrit ?{' '}
        <a href="#/connexion" onClick={(e) => { e.preventDefault(); navigate('/connexion'); }}>Se connecter</a>
      </p>
    </div>
  );
}

export function Profile({ state, setState, navigate, currentUser }) {
  const [nom, setNom] = useState(currentUser?.nom ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [followerCount, setFollowerCount] = useState(currentUser?.followerCount ?? null);
  const [followingCount, setFollowingCount] = useState(currentUser?.followingCount ?? null);

  useEffect(() => {
    if (currentUser) {
      api.getUser(currentUser.id)
        .then((u) => { setFollowerCount(u.followerCount ?? 0); setFollowingCount(u.followingCount ?? 0); })
        .catch(() => {});
      setNom(currentUser.nom);
      setEmail(currentUser.email);
    }
  }, [currentUser?.id]);

  const myRecipes = useMemo(
    () => currentUser ? recipesByAuthor(state.recipes, state.users, currentUser.id) : [],
    [state.recipes, state.users, currentUser?.id]
  );

  if (!currentUser) {
    return (
      <div className="auth-card">
        <div className="notice warn">Vous devez être connecté pour accéder à cette page.</div>
        <button className="primary" onClick={() => navigate('/connexion')}>Se connecter</button>
      </div>
    );
  }

  async function save(e) {
    e.preventDefault();
    setSaveError('');
    try {
      const u = await api.updateUser(currentUser.id, { nom: nom.trim(), email: email.trim() });
      setState((s) => ({
        ...s,
        users: s.users.map((x) => x.id === currentUser.id ? { ...x, ...u } : x),
      }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(
        err.status === 409 ? 'Email déjà utilisé.' :
        err.status === 400 ? 'Données invalides.' :
        'Erreur lors de l\'enregistrement.'
      );
    }
  }

  async function deleteAccount() {
    try {
      await api.deleteUser(currentUser.id);
      setState((s) => ({
        ...s,
        users:         s.users.filter((u) => u.id !== currentUser.id),
        recipes:       s.recipes.filter((r) => r.auteur_id !== currentUser.id),
        sessionUserId: null,
      }));
      navigate('/');
    } catch (_) {
      alert('Erreur lors de la suppression du compte.');
    }
  }

  return (
    <>
      <h1>Mon profil</h1>
      <div className="profile-card mb-3">
        <form onSubmit={save}>
          <div className="field">
            <label>Nom</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Rôle</label>
            <input value={currentUser.role === 'admin' ? 'Administrateur' : 'Utilisateur'} disabled />
          </div>
          <div className="field">
            <label>Inscrit le</label>
            <input value={shortDate(currentUser.date_creation)} disabled />
          </div>
          {saveError && <div className="notice warn">{saveError}</div>}
          <div className="row-flex">
            <button type="submit" className="primary">Enregistrer</button>
            {saved && <small style={{ color: 'var(--eco)' }}>✓ Modifications enregistrées</small>}
          </div>
        </form>
      </div>

      <div className="profile-card mb-3">
        <h2 style={{ fontSize: 18 }}>Mon activité</h2>
        <div className="row-flex" style={{ gap: 24, flexWrap: 'wrap' }}>
          <div><strong>{myRecipes.length}</strong> <span className="muted">recette{myRecipes.length > 1 ? 's' : ''}</span></div>
          <div>
            <strong>{followerCount ?? '…'}</strong>{' '}
            <a href={`#/utilisateurs/${currentUser.id}/followers`} className="muted"
               onClick={(e) => { e.preventDefault(); navigate(`/utilisateurs/${currentUser.id}/followers`); }}>
              abonné{followerCount !== 1 ? 's' : ''}
            </a>
          </div>
          <div>
            <strong>{followingCount ?? '…'}</strong>{' '}
            <a href={`#/utilisateurs/${currentUser.id}/following`} className="muted"
               onClick={(e) => { e.preventDefault(); navigate(`/utilisateurs/${currentUser.id}/following`); }}>
              abonnement{followingCount !== 1 ? 's' : ''}
            </a>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="ghost small" onClick={() => navigate(`/utilisateurs/${currentUser.id}`)}>Voir mon profil public →</button>
          </div>
        </div>
      </div>

      <div className="profile-card mb-3">
        <h2 style={{ fontSize: 18 }}>
          Mes recettes
          <span className="muted" style={{ fontSize: 14, fontWeight: 400, marginLeft: 10 }}>({myRecipes.length})</span>
        </h2>
        {myRecipes.length === 0 ? (
          <div style={{ paddingTop: 8 }}>
            <p className="muted" style={{ fontSize: 14 }}>Vous n'avez pas encore publié de recette.</p>
            <button className="primary small" onClick={() => navigate('/proposer')}>Proposer une recette</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>
              {myRecipes.map((r) => {
                const avg = getAvg(state.notes, r.id);
                const cnt = getNoteCount(state.notes, r.id);
                return (
                  <a key={r.id} href={`#/recettes/${r.id}`}
                     onClick={(e) => { e.preventDefault(); navigate(`/recettes/${r.id}`); }}
                     style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
                              borderBottom: '1px solid var(--rule)', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{r.titre}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
                        <CategoryPill>{r.categorie}</CategoryPill>
                        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>⏱ {r.temps_preparation} min</span>
                        <Stars value={avg || 0} size={13} />
                        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                          {avg ? `${avg.toFixed(1)} (${cnt} avis)` : 'Pas encore noté'}
                        </span>
                      </div>
                    </div>
                    <span style={{ color: 'var(--ink-3)', fontSize: 18, flexShrink: 0 }}>›</span>
                  </a>
                );
              })}
            </div>
            <div style={{ marginTop: 14 }}>
              <button className="ghost small" onClick={() => navigate('/proposer')}>+ Proposer une recette</button>
            </div>
          </>
        )}
      </div>

      <div className="profile-card" style={{ borderColor: 'var(--warn)' }}>
        <h2 style={{ fontSize: 18, color: 'var(--warn)' }}>Zone dangereuse</h2>
        <p className="muted" style={{ fontSize: 14 }}>La suppression de votre compte est définitive.</p>
        {!confirmDelete
          ? <button className="danger" onClick={() => setConfirmDelete(true)}>Supprimer mon compte</button>
          : <div className="notice warn">
              <p style={{ margin: 0 }}><strong>Confirmer la suppression ?</strong> Cette action est irréversible.</p>
              <div className="row-flex mt-2">
                <button className="danger" onClick={deleteAccount}>Oui, supprimer définitivement</button>
                <button onClick={() => setConfirmDelete(false)}>Annuler</button>
              </div>
            </div>
        }
      </div>
    </>
  );
}

