import React from 'react';

export function AdminGuard({ currentUser, children, navigate }) {
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

export function AdminTabs({ active, navigate }) {
  return (
    <div className="admin-tabs" role="tablist">
      <button role="tab" className={active === 'dash' ? 'on' : ''} onClick={() => navigate('/admin')}>Tableau de bord</button>
      <button role="tab" className={active === 'recipes' ? 'on' : ''} onClick={() => navigate('/admin/recettes')}>Recettes</button>
      <button role="tab" className={active === 'users' ? 'on' : ''} onClick={() => navigate('/admin/utilisateurs')}>Utilisateurs</button>
      <button role="tab" className={active === 'comments' ? 'on' : ''} onClick={() => navigate('/admin/commentaires')}>Commentaires</button>
    </div>
  );
}
