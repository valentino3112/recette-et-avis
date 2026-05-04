import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../api.js';
import { shortDate } from '../../data.js';
import { Pager } from '../../components.jsx';
import { AdminGuard, AdminTabs } from './shared.jsx';

export function AdminComments({ state, navigate, currentUser }) {
  const [page, setPage] = useState(1);
  const [allComments, setAllComments] = useState(null);
  const PAGE = 10;

  useEffect(() => {
    api.getAdminCommentaires().then(setAllComments).catch(() => {});
  }, []);

  const comments = allComments ?? state.comments;
  const sorted = useMemo(() => [...comments].sort((a, b) => b.date_commentaire.localeCompare(a.date_commentaire)), [comments]);
  const slice = sorted.slice((page - 1) * PAGE, page * PAGE);
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE));

  async function remove(id) {
    if (!confirm('Modérer / supprimer ce commentaire ?')) return;
    try {
      await api.deleteAdminCommentaire(id);
      setAllComments((prev) => prev ? prev.filter((c) => c.id !== id) : prev);
    } catch (_) {
      alert('Erreur lors de la suppression.');
    }
  }

  return (
    <AdminGuard currentUser={currentUser} navigate={navigate}>
      <h1>Modération des commentaires</h1>
      <AdminTabs active="comments" navigate={navigate} />
      <div className="muted mb-2">{comments.length} commentaire{comments.length > 1 ? 's' : ''}</div>
      <table className="data">
        <thead><tr><th>Date</th><th>Auteur</th><th>Recette</th><th>Contenu</th><th></th></tr></thead>
        <tbody>
          {allComments === null && <tr><td colSpan={5} className="muted">Chargement…</td></tr>}
          {slice.map((c) => {
            const u = state.users.find((x) => x.id === c.utilisateur_id);
            const r = state.recipes.find((x) => x.id === c.recette_id);
            return (
              <tr key={c.id}>
                <td className="muted" style={{ whiteSpace: 'nowrap' }}>{shortDate(c.date_commentaire)}</td>
                <td>{u ? u.nom : <em className="muted">{c.utilisateur_id}</em>}</td>
                <td>{r ? <a href={`#/recettes/${r.id}`} onClick={(e) => { e.preventDefault(); navigate(`/recettes/${r.id}`); }}>{r.titre}</a> : <em className="muted">{c.recette_id}</em>}</td>
                <td>{c.contenu}</td>
                <td className="actions">
                  <button className="danger small" onClick={() => remove(c.id)}>Modérer</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pager page={page} pageCount={pageCount} onChange={setPage} />
    </AdminGuard>
  );
}
