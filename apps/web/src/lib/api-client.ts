const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://blihapi.blihmarketing.com/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

/** Read the JS-accessible kc_token cookie (set during OIDC callback). */
function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)kc_token=([^;]+)/);
  return match ? decodeURIComponent(match[1] ?? '') : null;
}

/** Read the CSRF token from kc_csrf cookie. */
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)kc_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1] ?? '') : null;
}

class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public statusText: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  return url.toString();
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);

  const token = getAccessToken();
  const method = fetchOptions.method?.toUpperCase() || 'GET';
  const isNonSafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(method);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Merge additional headers from fetchOptions
  if (fetchOptions.headers) {
    const additionalHeaders = fetchOptions.headers as Record<string, string>;
    Object.assign(headers, additionalHeaders);
  }

  // Add CSRF token for non-safe HTTP methods when auth cookies are present
  if (isNonSafeMethod && token) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    const redirectUrl = new URL('/api/auth/login', window.location.origin);
    redirectUrl.searchParams.set('redirect', window.location.pathname);
    redirectUrl.searchParams.set('redirect_origin', window.location.origin);
    window.location.href = redirectUrl.toString();
    throw new ApiError('Unauthorized', 401, 'Unauthorized');
  }

  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${response.statusText}`,
      response.status,
      response.statusText,
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, string>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),

  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),

  patch: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

export { ApiError };
