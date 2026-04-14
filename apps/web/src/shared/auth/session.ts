import { getApiBaseUrl } from '@/lib/api-base';
import { LOCAL_SESSION_COOKIE } from '@/lib/auth-constants';
import { isLocalDevSessionBridgeActive } from '@/lib/local-dev-auth';
import { type Role } from '@/shared/constants/roles';
import { cookies } from 'next/headers';
import { cache } from 'react';

const AUTH_DEBUG = process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true';
const ACCESS_COOKIE_NAME = 'kc_access';

export type SessionResponse = {
  authenticated: boolean;
  roles: Role[];
  username: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  exp: number | null;
};

type LocalSessionPayloadV1 = {
  v: 1;
  exp: number;
  roles: string[];
  username: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

function unauthenticated(): SessionResponse {
  return {
    authenticated: false,
    roles: [],
    username: null,
    email: null,
    firstName: null,
    lastName: null,
    exp: null,
  };
}

function decodeLocalSessionCookie(
  raw: string | undefined,
): LocalSessionPayloadV1 | null {
  if (!raw) {
    return null;
  }
  try {
    const padded = raw.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(padded, 'base64').toString('utf8');
    const parsed = JSON.parse(json) as LocalSessionPayloadV1;
    if (parsed.v !== 1 || typeof parsed.exp !== 'number') {
      return null;
    }
    if (parsed.exp * 1000 < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function sessionFromLocalPayload(
  payload: LocalSessionPayloadV1,
): SessionResponse {
  return {
    authenticated: true,
    roles: (payload.roles as Role[]) ?? [],
    username: payload.username,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    exp: payload.exp,
  };
}

function extractAccessToken(cookieHeader: string): string | null {
  const pairs = cookieHeader.split(';').map((c) => c.trim());
  for (const pair of pairs) {
    if (pair.startsWith(ACCESS_COOKIE_NAME + '=')) {
      return pair.slice(ACCESS_COOKIE_NAME.length + 1);
    }
  }
  return null;
}

export const getSession = cache(async (): Promise<SessionResponse> => {
  const API_BASE_URL = getApiBaseUrl();
  const cookieStore = await cookies();

  if (isLocalDevSessionBridgeActive()) {
    const localRaw = cookieStore.get(LOCAL_SESSION_COOKIE)?.value;
    const localPayload = decodeLocalSessionCookie(localRaw);
    if (localPayload) {
      if (AUTH_DEBUG) {
        console.log(
          '[getSession] using local dev session cookie, roles:',
          localPayload.roles,
        );
      }
      return sessionFromLocalPayload(localPayload);
    }
    // Split-origin dev: Keycloak cookies are on the API host; the Next.js server
    // cannot forward kc_access. LocalDevSessionGate sets blih_local_session from the browser.
    if (AUTH_DEBUG) {
      console.log(
        '[getSession] local dev bridge: no valid blih_local_session — skip server /auth/me',
      );
    }
    return unauthenticated();
  }

  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join('; ');

  if (AUTH_DEBUG) {
    console.log(
      '[getSession] cookie count (forwarded to API):',
      allCookies.length,
    );
  }

  if (allCookies.length === 0) {
    if (AUTH_DEBUG) {
      console.log('[getSession] No cookies, returning unauthenticated');
    }
    return unauthenticated();
  }

  let res: Response;
  try {
    const accessToken = extractAccessToken(cookieHeader);
    const headers: Record<string, string> = {
      Cookie: cookieHeader,
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    res = await fetch(`${API_BASE_URL}/auth/me`, {
      cache: 'no-store',
      headers,
      credentials: 'include',
    });
  } catch (error: unknown) {
    if (AUTH_DEBUG) {
      console.warn('[getSession] /auth/me fetch failed:', error);
    }
    return unauthenticated();
  }

  if (AUTH_DEBUG) {
    console.log('[getSession] Auth endpoint status:', res.status);
  }

  if (!res.ok) {
    if (AUTH_DEBUG) {
      console.log('[getSession] Auth failed with status:', res.status);
    }
    return unauthenticated();
  }

  const envelope = (await res.json()) as {
    success: boolean;
    data: {
      id: string;
      keycloakId: string;
      username?: string;
      email: string;
      firstName?: string;
      lastName?: string;
      roles: string[];
      permissions: string[];
      scopes: string[];
      phone?: string;
      status?: string;
      departmentId?: string | null;
      sub: string;
      sessionId?: string;
      clientId?: string;
    };
    message: string;
    error: null;
    meta: {
      timestamp: string;
      requestId: string;
      version: string;
    };
  };

  if (AUTH_DEBUG) {
    console.log(
      '[getSession] /auth/me roles:',
      envelope.data?.roles ?? '(no data)',
    );
  }

  const user = envelope.data;

  return {
    authenticated: true,
    roles: (user.roles as Role[]) ?? [],
    username: user.username ?? null,
    email: user.email ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    exp: null,
  };
});
