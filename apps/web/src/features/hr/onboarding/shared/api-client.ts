import { getApiBaseUrl } from '@/lib/api-base';

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type RequestMethod = 'GET' | 'POST' | 'PATCH';

function getBaseUrl(): string {
  return getApiBaseUrl();
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('access_token') || localStorage.getItem('token') || ''
  );
}

function buildHeaders(hasBody: boolean): HeadersInit {
  const token = getToken();
  return {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function requestJson<T>(
  path: string,
  method: RequestMethod = 'GET',
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers: buildHeaders(body !== undefined),
    credentials: 'include',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof (payload as { message?: unknown }).message === 'string'
        ? (payload as { message: string }).message
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    'success' in payload
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}
