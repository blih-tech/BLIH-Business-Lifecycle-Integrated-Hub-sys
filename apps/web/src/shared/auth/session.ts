import { type Role } from '@/shared/constants/roles';
import { cookies } from 'next/headers';
import { cache } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type SessionResponse = {
  authenticated: boolean;
  roles: Role[];
  username: string | null;
  email: string | null;
  exp: number | null;
};

export const getSession = cache(async (): Promise<SessionResponse> => {
  const cookieHeader = (await cookies()).toString();

  if (!cookieHeader) {
    return {
      authenticated: false,
      roles: [],
      username: null,
      email: null,
      exp: null,
    };
  }

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    cache: 'no-store',
    headers: {
      cookie: cookieHeader,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    return {
      authenticated: false,
      roles: [],
      username: null,
      email: null,
      exp: null,
    };
  }

  const user = (await res.json()) as {
    username: string;
    email: string;
    roles: Role[];
  };

  return {
    authenticated: true,
    roles: user.roles ?? [],
    username: user.username ?? null,
    email: user.email ?? null,
    exp: null,
  };
});
