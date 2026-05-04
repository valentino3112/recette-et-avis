import React, { useState, useEffect } from 'react';
import { api } from '../../api.js';
import { shortDate } from '../../data.js';
import { AdminGuard, AdminTabs } from './shared.jsx';

export function AdminDash({ state, navigate, currentUser }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getAdminStats().then(setStats).catch(() => {});
  }, []);

  const kpi = (val) => stats ? val : '…';

  return (
    <AdminGuard currentUser={currentUser} navigate={navigate}>
      <h1>Tableau de bord</h1>
      <AdminTabs active="dash" navigate={navigate} />
      <div className="kpi-row">
        <div className="kpi"><div className="label">Recettes</div><div className="value">{kpi(stats?.recetteCount)}</div></div>
        <div className="kpi"><div className="label">Utilisateurs</div><div className="value">{kpi(stats?.userCount)}</div></div>
        <div className="kpi"><div className="label">Commentaires</div><div className="value">{kpi(stats?.commentCount)}</div></div>
        <div className="kpi"><div className="label">Notes données</div><div className="value">{kpi(stats?.noteCount)}</div></div>
      </div>
      <div className="eco-panel">
        <h3>État Green IT</h3>
        <ul>
          <li>Pages servies en HTML statique Vite + données JSON paginées (LIMIT/OFFSET).</li>
          <li>Aucune image servie sur les listes — uniquement sur le détail, en lazy loading WebP.</li>
          <li>Stack : Node + Express + SQLite — dépendances front compilées par Vite, ~5 dépendances back.</li>
        </ul>
      </div>
      <h2 className="section-title mt-4">Activité récente</h2>
      <table className="data">
        <thead><tr><th>Date</th><th>Type</th><th>Détail</th></tr></thead>
        <tbody>
          {state.comments.slice(-5).reverse().map((c) => {
            const r = state.recipes.find((x) => x.id === c.recette_id);
            const u = state.users.find((x) => x.id === c.utilisateur_id);
            return (
              <tr key={c.id}>
                <td>{shortDate(c.date_commentaire)}</td>
                <td>Commentaire</td>
                <td><strong>{u ? u.nom : '?'}</strong> sur <em>{r ? r.titre : '?'}</em></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </AdminGuard>
  );
}
