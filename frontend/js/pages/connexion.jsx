import React, { useState } from 'react';
import { api } from '../api.js';

export function Login({ state, setState, navigate }) {
  const [email, setEmail]     = useState('');
  const [pwd, setPwd]         = useState('');
  const [err, setErr]         = useState('');
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
  const [nom, setNom]         = useState('');
  const [email, setEmail]     = useState('');
  const [pwd, setPwd]         = useState('');
  const [pwd2, setPwd2]       = useState('');
  const [err, setErr]         = useState({});
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
