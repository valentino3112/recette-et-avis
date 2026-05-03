const API_BASE = '/api';

async function apiFetch(path, opts = {}) {
  const { method = 'GET', body, headers = {} } = opts;
  const fetchOpts = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body !== undefined) fetchOpts.body = JSON.stringify(body);

  const res = await fetch(API_BASE + path, fetchOpts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      data.error || data.errors?.[0]?.msg || `Erreur ${res.status}`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  getMe:    ()              => apiFetch('/auth/me'),
  login:    (email, pwd)   => apiFetch('/auth/login',  { method: 'POST', body: { email, password: pwd } }),
  logout:   ()             => apiFetch('/auth/logout', { method: 'POST' }),

  // ─── Recettes ──────────────────────────────────────────────────────────────
  getRecettes:   (params) => apiFetch('/recettes?' + new URLSearchParams(params || {})),
  getRecette:    (id)     => apiFetch('/recettes/' + id),
  createRecette: (data)   => apiFetch('/recettes',  { method: 'POST', body: data }),
  deleteRecette: (id)     => apiFetch('/recettes/' + id, { method: 'DELETE' }),

  // ─── Notes ────────────────────────────────────────────────────────────────
  getMaNote: (recetteId)        => apiFetch(`/recettes/${recetteId}/notes/moi`),
  noter:     (recetteId, val)   => apiFetch(`/recettes/${recetteId}/notes`, { method: 'POST', body: { valeur: val } }),

  // ─── Commentaires ─────────────────────────────────────────────────────────
  getCommentaires:   (recetteId)         => apiFetch(`/recettes/${recetteId}/commentaires`),
  addCommentaire:    (recetteId, texte)  => apiFetch(`/recettes/${recetteId}/commentaires`, { method: 'POST', body: { contenu: texte } }),
  editCommentaire:   (id, texte)         => apiFetch(`/commentaires/${id}`, { method: 'PUT',    body: { contenu: texte } }),
  deleteCommentaire: (id)                => apiFetch(`/commentaires/${id}`, { method: 'DELETE' }),

  // ─── Utilisateurs ─────────────────────────────────────────────────────────
  register:     (nom, email, pwd) => apiFetch('/users',        { method: 'POST', body: { nom, email, password: pwd } }),
  getUser:      (id)              => apiFetch(`/users/${id}`),
  updateUser:   (id, data)        => apiFetch(`/users/${id}`,  { method: 'PUT',    body: data }),
  deleteUser:   (id)              => apiFetch(`/users/${id}`,  { method: 'DELETE' }),
  getFollowers: (id)              => apiFetch(`/users/${id}/followers`),
  getFollowing: (id)              => apiFetch(`/users/${id}/following`),
  follow:       (id)              => apiFetch(`/users/${id}/follow`, { method: 'POST' }),
};
