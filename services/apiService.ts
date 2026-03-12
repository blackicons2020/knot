/**
 * Central API client for all backend communication.
 * Token is read from localStorage on every request so it's always current.
 */

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('knot_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers as Record<string, string> || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // ---- Auth ----
  register: (email: string, password: string, name?: string) =>
    request<{ token: string; user: any; isNew: boolean }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: any; isNew: boolean }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  socialLogin: (email: string, name?: string) =>
    request<{ token: string; user: any; isNew: boolean }>('/api/auth/social', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    }),

  // ---- User ----
  getMe: () => request<any>('/api/users/me'),

  updateMe: (data: Partial<any>) =>
    request<any>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // ---- Matching ----
  getUsers: (excludeId?: string) =>
    request<any[]>(`/api/matching/users${excludeId ? `?exclude=${excludeId}` : ''}`),

  likeUser: (userId: string, matchedUserId: string) =>
    request<{ liked: boolean; isMutual: boolean }>('/api/matching/like', {
      method: 'POST',
      body: JSON.stringify({ userId, matchedUserId }),
    }),

  getLikes: (userId: string) => request<any[]>(`/api/matching/likes/${userId}`),

  // ---- Messages ----
  getMessages: (matchId: string) => request<any[]>(`/api/messages/${matchId}`),

  sendMessage: (receiverId: string, text: string) =>
    request<any>('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, text }),
    }),

  // ---- Payment ----
  verifyPayment: (reference: string, userId: string) =>
    request<{ status: string; message: string }>('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ reference, userId }),
    }),
};
