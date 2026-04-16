'use client';

import {
  LOCAL_DEV_SESSION_STORAGE_KEY,
  LOCAL_SESSION_COOKIE,
} from '@/lib/auth-constants';
import { getApiBaseUrl } from '@/lib/api-base';

const MAX_AGE_SEC = 5 * 60;

export type LocalSessionPayloadV1 = {
  v: 1;
  exp: number;
  roles: string[];
  username: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

function encodePayload(payload: LocalSessionPayloadV1): string {
  const json = JSON.stringify(payload);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Persists a short-lived first-party cookie on the Next.js origin so RSC getSession()
 * can read roles after a browser /auth/me call with credentials: 'include'.
 * Development / split-origin only — not a substitute for server-side auth cookies in production.
 */
export function setLocalSessionCookieFromMeData(data: {
  roles?: string[];
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}): void {
  const payload: LocalSessionPayloadV1 = {
    v: 1,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
    roles: Array.isArray(data.roles) ? data.roles : [],
    username: data.username ?? null,
    email: data.email ?? null,
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
  };
  const encoded = encodePayload(payload);
  document.cookie = `${LOCAL_SESSION_COOKIE}=${encoded}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;

  try {
    sessionStorage.setItem(
      LOCAL_DEV_SESSION_STORAGE_KEY,
      JSON.stringify({
        source: '/auth/me',
        roles: payload.roles,
        email: payload.email,
        exp: payload.exp,
      }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearLocalSessionCookie(): void {
  document.cookie = `${LOCAL_SESSION_COOKIE}=; path=/; max-age=0`;
  try {
    sessionStorage.removeItem(LOCAL_DEV_SESSION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function buildLocalDevLoginUrl(): string {
  const api = getApiBaseUrl();
  const login = new URL(`${api}/auth/login`);
  login.searchParams.set('redirect', window.location.pathname || '/dashboard');
  login.searchParams.set('redirect_origin', window.location.origin);
  return login.toString();
}
