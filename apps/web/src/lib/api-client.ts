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
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
let refreshInFlight: Promise<boolean> | null = null;

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api/v1';
    }
  }

  throw new Error(
    'NEXT_PUBLIC_API_URL is not set. Configure it to point at your API (e.g. https://.../api/v1).',
  );
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
    console.log(`Checking cookie for ${key}:`, !!cookieToken);
    if (cookieToken) {
      return cookieToken;
    }

    try {
      const storedToken = window.localStorage.getItem(key);
      console.log(`Checking localStorage for ${key}:`, !!storedToken);
      if (storedToken) {
        return storedToken;
      }
    } catch {
      // Ignore storage access errors (privacy mode / blocked storage).
    }

    try {
      const sessionToken = window.sessionStorage.getItem(key);
      console.log(`Checking sessionStorage for ${key}:`, !!sessionToken);
      if (sessionToken) {
        return sessionToken;
      }
    } catch {
      // Ignore storage access errors (privacy mode / blocked storage).
    }
  }

  return null;
}

async function tryRefreshSession(): Promise<boolean> {
  try {
    const csrfToken = getCookieValue('kc_csrf');
    const response = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      },
      // Browser cookie mode: API reads kc_refresh from HttpOnly cookie.
      body: JSON.stringify({}),
      cache: 'no-store',
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function refreshSessionSingleFlight(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = tryRefreshSession().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  query?: QueryParams,
): Promise<T> {
  const token = getBrowserToken();
  console.log('API Request:', method, path, 'Token found:', !!token);

  const makeRequest = async (): Promise<Response> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const csrfToken = !SAFE_METHODS.has(method.toUpperCase())
      ? getCookieValue('kc_csrf')
      : null;
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    } else if (!SAFE_METHODS.has(method.toUpperCase())) {
      console.warn(
        'API Request: Missing kc_csrf cookie for non-GET request to',
        path,
      );
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(buildUrl(path, query), {
      method,
      credentials: 'include',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
  };

  let response = await makeRequest();

  const contentType = response.headers.get('content-type') ?? '';
  let payload: unknown = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok && (response.status === 401 || response.status === 403)) {
    // Avoid infinite loops when refresh itself fails with 401/403.
    const isRefreshEndpoint =
      typeof path === 'string' && path.replace(/^\//, '') === 'auth/refresh';

    if (!isRefreshEndpoint) {
      const refreshed = await refreshSessionSingleFlight();
      if (refreshed) {
        response = await makeRequest();
        const retryContentType = response.headers.get('content-type') ?? '';
        payload = retryContentType.includes('application/json')
          ? await response.json()
          : await response.text();
      }
    }
  }

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
