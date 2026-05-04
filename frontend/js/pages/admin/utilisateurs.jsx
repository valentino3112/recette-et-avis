import React, { useState, useEffect } from 'react';
import { api } from '../../api.js';
import { shortDate } from '../../data.js';
import { Pager } from '../../components.jsx';
import { AdminGuard, AdminTabs } from './shared.jsx';

export function AdminUsers({ state, setState, navigate, currentUser }) {
  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState(null);
  const PAGE = 10;

  useEffect(() => {
    api.getUsers({ limit: 100 }).then((data) => setAllUsers(data.users)).catch(() => {});
  }, []);

  const users = allUsers ?? state.users;
  const slice = users.slice((page - 1) * PAGE, page * PAGE);
  const pageCount = Math.max(1, Math.ceil(users.length / PAGE));

  async function toggleRole(id) {
    const target = (allUsers ?? state.users).find((u) => u.id === id);
    if (!target) return;
    const newRole = target.role === 'admin' ? 'user' : 'admin';
    try {
      await api.patchUserRole(id, newRole);
      const flip = (u) => u.id === id ? { ...u, role: newRole } : u;
      setState((s) => ({ ...s, users: s.users.map(flip) }));
      setAllUsers((prev) => prev ? prev.map(flip) : prev);
    } catch (_) {
      alert('Erreur lors du changement de rôle.');
    }
  }

  async function remove(id) {
    if (id === currentUser.id) { alert('Impossible de supprimer le compte connecté.'); return; }
    if (!confirm('Supprimer ce compte ? Ses commentaires et notes seront aussi supprimés.')) return;
    try {
      await api.deleteUser(id);
      setState((s) => ({
        ...s,
        users:    s.users.filter((u) => u.id !== id),
        comments: s.comments.filter((c) => c.utilisateur_id !== id),
        notes:    s.notes.filter((n) => n.utilisateur_id !== id),
      }));
      setAllUsers((prev) => prev ? prev.filter((u) => u.id !== id) : prev);
    } catch (_) {
      alert('Erreur lors de la suppression.');
    }
  }

  return (
    <AdminGuard currentUser={currentUser} navigate={navigate}>
      <h1>Gestion des utilisateurs</h1>
      <AdminTabs active="users" navigate={navigate} />
      <div className="muted mb-2">{users.length} compte{users.length > 1 ? 's' : ''} · liste paginée (LIMIT/OFFSET côté serveur)</div>
      <table className="data">
        <thead>
          <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th><th>Activité</th><th></th></tr>
        </thead>
        <tbody>
          {slice.map((u) => {
            const cmt = state.comments.filter((c) => c.utilisateur_id === u.id).length;
            const not = state.notes.filter((n) => n.utilisateur_id === u.id).length;
            return (
              <tr key={u.id}>
                <td><strong>{u.nom}</strong>{u.id === currentUser.id && <span className="muted"> (vous)</span>}</td>
                <td className="muted">{u.email}</td>
                <td>{u.role === 'admin' ? <span className="role-badge admin">admin</span> : <span className="role-badge">user</span>}</td>
                <td>{shortDate(u.date_creation)}</td>
                <td className="muted">{cmt} cmt · {not} notes</td>
                <td className="actions">
                  <button className="small" onClick={() => toggleRole(u.id)} disabled={u.id === currentUser.id}>
                    {u.role === 'admin' ? '→ user' : '→ admin'}
                  </button>
                  <button className="danger small" onClick={() => remove(u.id)} disabled={u.id === currentUser.id}>Suppr.</button>
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
