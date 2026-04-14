import { type Role } from '@/shared/constants/roles';
import { cookies } from 'next/headers';
import { cache } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
  const cookieHeader = (await cookies()).toString();

  console.log('[getSession] Cookie header present:', !!cookieHeader);

  if (!cookieHeader) {
    console.log('[getSession] No cookie header, returning unauthenticated');
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

  const accessToken = extractAccessToken(cookieHeader);
  console.log('[getSession] Access token present:', !!accessToken);

  const headers: Record<string, string> = {
    cookie: cookieHeader,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/me`, {
      cache: 'no-store',
      headers,
      credentials: 'include',
    });
  } catch (err) {
    console.error('[getSession] Network error reaching auth endpoint:', err);
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

  console.log('[getSession] Auth endpoint status:', res.status);

  if (!res.ok) {
    console.log('[getSession] Auth failed with status:', res.status);
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

  console.log(
    '[getSession] Response envelope:',
    JSON.stringify(envelope, null, 2),
  );

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
