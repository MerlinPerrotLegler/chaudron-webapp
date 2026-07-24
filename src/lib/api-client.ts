const API_KEY_STORAGE = 'chaudron_api_key';

export function getApiKey(): string {
  if (typeof window === 'undefined') {
    return process.env.API_KEY ?? process.env.NEXT_PUBLIC_API_KEY ?? '';
  }
  const fromStorage = window.localStorage.getItem(API_KEY_STORAGE);
  if (fromStorage) return fromStorage;
  return process.env.NEXT_PUBLIC_API_KEY ?? '';
}

export function setApiKey(key: string) {
  if (typeof window === 'undefined') return;
  if (key) window.localStorage.setItem(API_KEY_STORAGE, key);
  else window.localStorage.removeItem(API_KEY_STORAGE);
}

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  const key = getApiKey();
  if (key) headers.set('x-api-key', key);

  const res = await fetch(path.startsWith('/') ? path : `/${path}`, {
    ...init,
    headers,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiClientError(
      data?.code ?? 'error',
      data?.message ?? res.statusText,
      res.status,
      data?.details,
    );
  }
  return data as T;
}
