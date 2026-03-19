import { logger } from './logger';

export interface UserPublic {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export interface TokenResponse {
  token: string;
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 1;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryableStatus(status: number): boolean {
  return status >= 500 || status === 429;
}

function parseErrorMessage(status: number, body: unknown): string {
  const payload = body as { error?: { message?: string }; message?: string } | null;
  return payload?.error?.message ?? payload?.message ?? `HTTP ${status}`;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, ...fetchOptions } = options;
  const method = fetchOptions.method ?? 'GET';
  const startedAt = Date.now();
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  let lastError: Error | null = null;
  logger.info('api_request_started', { method, path, retries, timeoutMs });

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(path, { ...fetchOptions, headers, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = parseErrorMessage(res.status, body);

        if (res.status === 401) {
          localStorage.removeItem('auth_token');
          logger.info('api_auth_cleared', { reason: '401', path });
        }

        if (attempt < retries && isRetryableStatus(res.status)) {
          await sleep((attempt + 1) * 500);
          continue;
        }

        throw new Error(message);
      }

      if (res.status === 204) {
        logger.info('api_request_succeeded', {
          method,
          path,
          status: res.status,
          durationMs: Date.now() - startedAt,
        });
        return undefined as T;
      }

      logger.info('api_request_succeeded', {
        method,
        path,
        status: res.status,
        durationMs: Date.now() - startedAt,
      });
      return res.json() as Promise<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error('Erreur réseau');
      logger.error('api_request_failed_attempt', {
        method,
        path,
        attempt: attempt + 1,
        error: lastError.message,
      });
      if (attempt < retries) {
        await sleep((attempt + 1) * 500);
        continue;
      }
    }
  }

  logger.error('api_request_failed', {
    method,
    path,
    durationMs: Date.now() - startedAt,
    error: lastError?.message ?? 'Échec de la requête',
  });
  throw lastError ?? new Error('Échec de la requête');
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
