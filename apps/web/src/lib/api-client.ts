export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type QueryParams = Record<string, string | number | boolean | undefined>;

const BEARER_TOKEN_KEYS = ['kc_access'];

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  return 'http://localhost:5000/api/v1';
}

function buildUrl(path: string, query?: QueryParams): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${getApiBaseUrl()}${normalizedPath}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${escapedName}=([^;]*)`),
  );
  if (!match?.[1]) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function getBrowserToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const key of BEARER_TOKEN_KEYS) {
    const cookieToken = getCookieValue(key);
    if (cookieToken) {
      return cookieToken;
    }

    try {
      const storedToken = window.localStorage.getItem(key);
      if (storedToken) {
        return storedToken;
      }
    } catch {
      // Ignore storage access errors (privacy mode / blocked storage).
    }

    try {
      const sessionToken = window.sessionStorage.getItem(key);
      if (sessionToken) {
        return sessionToken;
      }
    } catch {
      // Ignore storage access errors (privacy mode / blocked storage).
    }
  }

  return null;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  query?: QueryParams,
): Promise<T> {
  const token = getBrowserToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    credentials: 'include',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload &&
      'message' in payload &&
      typeof (payload as { message?: unknown }).message === 'string'
        ? (payload as { message: string }).message
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const apiClient = {
  get<T>(path: string, query?: QueryParams): Promise<T> {
    return request<T>('GET', path, undefined, query);
  },
  post<T>(path: string, body?: unknown, query?: QueryParams): Promise<T> {
    return request<T>('POST', path, body, query);
  },
  patch<T>(path: string, body?: unknown, query?: QueryParams): Promise<T> {
    return request<T>('PATCH', path, body, query);
  },
  put<T>(path: string, body?: unknown, query?: QueryParams): Promise<T> {
    return request<T>('PUT', path, body, query);
  },
  delete<T>(path: string, query?: QueryParams): Promise<T> {
    return request<T>('DELETE', path, undefined, query);
  },
};
