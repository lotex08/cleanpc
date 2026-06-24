const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setToken(token: string) {
  localStorage.setItem('token', token)
}

export function clearToken() {
  localStorage.removeItem('token')
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  health: () => request('/api/health'),

  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/api/auth/me'),
  },

  scans: {
    create: (path?: string) =>
      request('/api/scans/', { method: 'POST', body: JSON.stringify({ path }) }),
    list: () => request('/api/scans/'),
    get: (id: string) => request(`/api/scans/${id}`),
    delete: (id: string) => request(`/api/scans/${id}`, { method: 'DELETE' }),
  },

  billing: {
    plans: () => request('/api/billing/plans'),
    change: (data: { plan: string; payment_method_id?: string }) =>
      request('/api/billing/change', { method: 'POST', body: JSON.stringify(data) }),
  },
}
