export interface UserPublic {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export interface TokenResponse {
  token: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(path, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      (body as { error?: { message?: string }; message?: string })?.error?.message ??
      (body as { message?: string })?.message ??
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<TokenResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    request<TokenResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<UserPublic>('/api/auth/me'),

  updateUserRole: (id: string, role: string) =>
    request<UserPublic>(`/api/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
};
