const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function ensureApiUrl() {
  if (!API_URL) {
    throw new Error(
      'VITE_API_URL is not set. Add it in frontend/.env (local) or Vercel environment variables (production).'
    );
  }
}

async function request(path, options = {}) {
  ensureApiUrl();
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body;
}

export const tasksApi = {
  list: () => request('/api/tasks'),
  get: (id) => request(`/api/tasks/${id}`),
  create: (payload) =>
    request('/api/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) =>
    request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
  health: () => request('/api/health'),
};

export { API_URL };
