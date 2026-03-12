import { createHash, randomBytes } from 'crypto';
import type { CookieOptions, Request } from 'express';
import {
  KEYCLOAK_AUTH_PATH,
  KEYCLOAK_LOGOUT_PATH,
} from '../../../platform/keycloak/keycloak.constants';

export const AUTH_COOKIE_NAMES = {
  state: 'kc_state',
  verifier: 'kc_verifier',
  redirect: 'kc_redirect',
  access: 'kc_access',
  refresh: 'kc_refresh',
  id: 'kc_id',
} as const;

export type AuthCookieSameSite = 'lax' | 'strict' | 'none';

export interface OidcAuthRequestContext {
  state: string;
  codeVerifier: string;
  codeChallenge: string;
}

interface AuthorizeUrlOptions {
  keycloakUrl: string;
  realm: string;
  clientId: string;
  redirectUri: string;
  scopes: string;
  state: string;
  codeChallenge: string;
  prompt?: string;
}

interface EndSessionUrlOptions {
  keycloakUrl: string;
  realm: string;
  idToken: string;
  postLogoutRedirectUri: string;
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function normalizeKeycloakBaseUrl(keycloakUrl: string): string {
  return keycloakUrl.replace(/\/+$/, '');
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return '/';
  }

  return trimmed;
}

export function createOidcAuthRequestContext(): OidcAuthRequestContext {
  const state = base64UrlEncode(randomBytes(16));
  const codeVerifier = base64UrlEncode(randomBytes(32));
  const codeChallenge = base64UrlEncode(
    createHash('sha256').update(codeVerifier).digest(),
  );

  return {
    state,
    codeVerifier,
    codeChallenge,
  };
}

export function buildAuthorizeUrl(options: AuthorizeUrlOptions): string {
  const url = new URL(
    `${normalizeKeycloakBaseUrl(options.keycloakUrl)}/realms/${options.realm}${KEYCLOAK_AUTH_PATH}`,
  );
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', options.clientId);
  url.searchParams.set('redirect_uri', options.redirectUri);
  url.searchParams.set('scope', options.scopes);
  url.searchParams.set('state', options.state);
  url.searchParams.set('code_challenge', options.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  if (options.prompt?.trim()) {
    url.searchParams.set('prompt', options.prompt.trim());
  }

  return url.toString();
}

export function buildEndSessionUrl(options: EndSessionUrlOptions): string {
  const url = new URL(
    `${normalizeKeycloakBaseUrl(options.keycloakUrl)}/realms/${options.realm}${KEYCLOAK_LOGOUT_PATH}`,
  );
  url.searchParams.set('id_token_hint', options.idToken);
  url.searchParams.set(
    'post_logout_redirect_uri',
    options.postLogoutRedirectUri,
  );
  return url.toString();
}

export function parseCookieHeader(
  headerValue: string | string[] | undefined,
): Record<string, string> {
  const source = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (!source) {
    return {};
  }

  const cookies: Record<string, string> = {};
  for (const part of source.split(';')) {
    const [rawName, ...rawValue] = part.split('=');
    const name = rawName?.trim();
    if (!name) {
      continue;
    }

    const value = rawValue.join('=').trim();
    if (!value) {
      continue;
    }

    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  }

  return cookies;
}

export function readCookie(
  request: Pick<Request, 'headers'>,
  cookieName: string,
): string | undefined {
  return parseCookieHeader(request.headers.cookie)[cookieName];
}

export function resolveSafeRedirectPath(
  redirectPath: string | undefined,
  fallbackPath: string,
): string {
  const fallback = normalizePath(fallbackPath);
  if (!redirectPath) {
    return fallback;
  }

  const candidate = redirectPath.trim();
  if (!candidate.startsWith('/') || candidate.startsWith('//')) {
    return fallback;
  }
  if (candidate.includes('://')) {
    return fallback;
  }
  if (candidate.includes('\r') || candidate.includes('\n')) {
    return fallback;
  }

  return candidate;
}

export function buildCookieOptions(
  secure: boolean,
  sameSite: AuthCookieSameSite,
  maxAgeMs: number,
): CookieOptions {
  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    maxAge: maxAgeMs,
  };
}

export function buildClearCookieOptions(
  secure: boolean,
  sameSite: AuthCookieSameSite,
): CookieOptions {
  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
  };
}
