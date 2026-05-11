import { cache } from 'react';
import { cookies } from 'next/headers';

type AuthMeResponse = {
  data?: {
    id?: string;
    sub?: string;
    username?: string | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    roles?: string[];
    permissions?: string[];
  };
};

export type WebSession = {
  authenticated: boolean;
  roles: string[];
  permissions: string[];
  userId: string | null;
  sub: string | null;
  username: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  return 'http://localhost:5000/api/v1';
}

function getDefaultSession(): WebSession {
  return {
    authenticated: false,
    roles: [],
    permissions: [],
    userId: null,
    sub: null,
    username: null,
    email: null,
    firstName: null,
    lastName: null,
  };
}

async function loadSession(): Promise<WebSession> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('kc_access')?.value;
  const refreshToken = cookieStore.get('kc_refresh')?.value;

  if (!accessToken && !refreshToken) {
    return getDefaultSession();
  }

  const cookieHeader = cookieStore
    .getAll()
    .map((item) => `${item.name}=${item.value}`)
    .join('; ');

  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
      method: 'GET',
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: 'no-store',
    });

    if (!response.ok) {
      return getDefaultSession();
    }

    const payload = (await response.json()) as AuthMeResponse;
    const profile = payload.data;
    if (!profile) {
      return getDefaultSession();
    }

    return {
      authenticated: true,
      roles: Array.isArray(profile.roles) ? profile.roles : [],
      permissions: Array.isArray(profile.permissions)
        ? profile.permissions
        : [],
      userId: typeof profile.id === 'string' ? profile.id : null,
      sub: typeof profile.sub === 'string' ? profile.sub : null,
      username: profile.username ?? null,
      email: profile.email ?? null,
      firstName: profile.firstName ?? null,
      lastName: profile.lastName ?? null,
    };
  } catch {
    return getDefaultSession();
  }
}

export const getSession = cache(loadSession);
