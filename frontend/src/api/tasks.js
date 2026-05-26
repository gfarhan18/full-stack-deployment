const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function ensureApiUrl() {
  if (!API_URL) {
    throw new Error(
      'VITE_API_URL is not set. Add it in Vercel → Settings → Environment Variables, then redeploy.'
    );
  }
  if (import.meta.env.PROD && /localhost|127\.0\.0\.1/.test(API_URL)) {
    throw new Error(
      `VITE_API_URL points to localhost (${API_URL}). Set your Railway URL on Vercel and redeploy.`
    );
  }
}

async function request(path, options = {}) {
  ensureApiUrl();

  const { method = 'GET', body, headers = {}, ...rest } = options;
  const hasBody = body != null && body !== '';

  // Do not set Content-Type on GET — that triggers a CORS preflight and often breaks production
  const finalHeaders = { ...headers };
  if (hasBody && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: hasBody ? body : undefined,
      ...rest,
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${API_URL}. Check VITE_API_URL on Vercel and redeploy, or CORS / FRONTEND_URL on Railway.`
    );
  }

  const bodyText = await res.text();
  let data = {};
  if (bodyText) {
    try {
      data = JSON.parse(bodyText);
    } catch {
      data = {};
    }
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
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
