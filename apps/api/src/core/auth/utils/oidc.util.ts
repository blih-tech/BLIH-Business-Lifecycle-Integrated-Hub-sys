import { createHash, randomBytes } from 'node:crypto';
import type { CookieOptions } from 'express';
import type { Request } from 'express';
import {
  KEYCLOAK_AUTH_PATH,
  KEYCLOAK_LOGOUT_PATH,
} from '../../../platform/keycloak/keycloak.constants';

export const AUTH_COOKIE_NAMES = {
  state: 'kc_state',
  verifier: 'kc_verifier',
  redirect: 'kc_redirect',
  nonce: 'kc_nonce',
  csrf: 'kc_csrf',
  access: 'kc_access',
  refresh: 'kc_refresh',
  id: 'kc_id',
  frontendOrigin: 'kc_frontend_origin',
} as const;

export type AuthCookieSameSite = 'lax' | 'strict' | 'none';

export interface AuthCookieSettings {
  httpOnly: boolean;
  secure: boolean;
  sameSite: AuthCookieSameSite;
  domain?: string;
  path: string;
}

export interface CreateOidcAuthRequestOptions {
  pkceEnabled?: boolean;
  pkceMethod?: 'S256';
  nonceEnabled?: boolean;
}

export interface OidcAuthRequestContext {
  state: string;
  codeVerifier?: string;
  codeChallenge?: string;
  nonce?: string;
}

export interface BuildAuthorizeUrlOptions {
  keycloakUrl: string;
  realm: string;
  clientId: string;
  redirectUri: string;
  scopes: string;
  state: string;
  codeChallenge?: string;
  pkceMethod?: 'S256';
  prompt?: string;
  nonce?: string;
  authorizationUrl?: string;
}

export interface BuildEndSessionUrlOptions {
  keycloakUrl: string;
  realm: string;
  idToken: string;
  postLogoutRedirectUri: string;
  logoutUrl?: string;
}

type CookieReadable =
  | {
      cookies?: Record<string, unknown>;
      headers?: Record<string, string | string[] | undefined>;
    }
  | undefined;

const DEFAULT_STATE_BYTES = 32;
const DEFAULT_CODE_VERIFIER_BYTES = 64;
const DEFAULT_NONCE_BYTES = 32;
const DEFAULT_CSRF_BYTES = 32;

function trimTrailingSlashes(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function createRandomUrlSafeValue(byteLength: number): string {
  return randomBytes(byteLength).toString('base64url');
}

function normalizeAllowedRedirectPrefix(prefix: string): string | undefined {
  const normalized = normalizeRedirectPath(prefix);
  if (!normalized) {
    return undefined;
  }

  return normalized === '/' ? normalized : normalized.replace(/\/+$/, '');
}

function buildRealmEndpoint(
  keycloakUrl: string,
  realm: string,
  path: string,
): string {
  return `${trimTrailingSlashes(keycloakUrl)}/realms/${encodeURIComponent(
    realm,
  )}${path}`;
}

export function createOidcAuthRequestContext(
  options: CreateOidcAuthRequestOptions = {},
): OidcAuthRequestContext {
  const pkceEnabled = options.pkceEnabled ?? true;
  const pkceMethod = options.pkceMethod ?? 'S256';
  const nonceEnabled = options.nonceEnabled ?? false;
  const state = createRandomUrlSafeValue(DEFAULT_STATE_BYTES);
  const codeVerifier = pkceEnabled
    ? createRandomUrlSafeValue(DEFAULT_CODE_VERIFIER_BYTES)
    : undefined;
  const codeChallenge =
    pkceEnabled && codeVerifier
      ? createHash('sha256').update(codeVerifier).digest('base64url')
      : undefined;

  if (pkceEnabled && pkceMethod !== 'S256') {
    throw new Error(`Unsupported PKCE method: ${pkceMethod}`);
  }

  return {
    state,
    codeVerifier,
    codeChallenge,
    nonce: nonceEnabled
      ? createRandomUrlSafeValue(DEFAULT_NONCE_BYTES)
      : undefined,
  };
}

export function createCsrfToken(): string {
  return createRandomUrlSafeValue(DEFAULT_CSRF_BYTES);
}

export function buildAuthorizeUrl(options: BuildAuthorizeUrlOptions): string {
  const url = new URL(
    options.authorizationUrl ||
      buildRealmEndpoint(
        options.keycloakUrl,
        options.realm,
        KEYCLOAK_AUTH_PATH,
      ),
  );

  url.search = '';
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', options.clientId);
  url.searchParams.set('redirect_uri', options.redirectUri);
  url.searchParams.set('scope', options.scopes);
  url.searchParams.set('state', options.state);

  if (options.prompt) {
    url.searchParams.set('prompt', options.prompt);
  }

  if (options.codeChallenge) {
    url.searchParams.set('code_challenge', options.codeChallenge);
    url.searchParams.set('code_challenge_method', options.pkceMethod ?? 'S256');
  }

  if (options.nonce) {
    url.searchParams.set('nonce', options.nonce);
  }

  return url.toString();
}

export function buildEndSessionUrl(options: BuildEndSessionUrlOptions): string {
  const url = new URL(
    options.logoutUrl ||
      buildRealmEndpoint(
        options.keycloakUrl,
        options.realm,
        KEYCLOAK_LOGOUT_PATH,
      ),
  );

  url.search = '';
  url.searchParams.set('id_token_hint', options.idToken);
  url.searchParams.set(
    'post_logout_redirect_uri',
    options.postLogoutRedirectUri,
  );
  return url.toString();
}

export function buildCookieOptions(
  settings: AuthCookieSettings,
  maxAge: number,
): CookieOptions {
  return {
    httpOnly: settings.httpOnly,
    secure: settings.secure,
    sameSite: settings.sameSite,
    domain: settings.domain || undefined,
    path: settings.path,
    maxAge,
  };
}

export function buildReadableCookieOptions(
  settings: AuthCookieSettings,
  maxAge: number,
): CookieOptions {
  return {
    ...buildCookieOptions(settings, maxAge),
    httpOnly: false,
  };
}

export function buildClearCookieOptions(
  settings: AuthCookieSettings,
): CookieOptions {
  return {
    httpOnly: settings.httpOnly,
    secure: settings.secure,
    sameSite: settings.sameSite,
    domain: settings.domain || undefined,
    path: settings.path,
  };
}

export function parseCookieHeader(
  header: string | string[] | undefined,
): Record<string, string> {
  const raw = Array.isArray(header) ? header.join('; ') : (header ?? '');
  const cookies: Record<string, string> = {};

  for (const segment of raw.split(';')) {
    const trimmed = segment.trim();
    if (!trimmed) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const name = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!name) {
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
  source: CookieReadable,
  name: string,
): string | undefined {
  if (!source) {
    return undefined;
  }

  const directCookie = source.cookies?.[name];
  if (typeof directCookie === 'string') {
    return directCookie;
  }
  if (typeof directCookie === 'number' || typeof directCookie === 'boolean') {
    return String(directCookie);
  }

  return parseCookieHeader(source.headers?.cookie)[name];
}

export function resolveSafeRedirectPath(
  input: string | undefined,
  fallbackPath: string,
  allowedPrefixes: string[] = ['/'],
): string {
  const fallback = normalizeRedirectPath(fallbackPath) ?? '/';
  const candidate = normalizeRedirectPath(input);
  if (!candidate) {
    return fallback;
  }

  return isAllowedRedirectPath(candidate, allowedPrefixes)
    ? candidate
    : fallback;
}

export function parseAllowedRedirectPathPrefixes(value: string): string[] {
  const prefixes = value
    .split(',')
    .map((entry) => normalizeAllowedRedirectPrefix(entry.trim()))
    .filter((entry): entry is string => Boolean(entry));

  if (prefixes.length === 0) {
    return ['/'];
  }

  return [...new Set(prefixes)];
}

export function isAllowedRedirectPath(
  candidatePath: string,
  allowedPrefixes: string[],
): boolean {
  const candidate = new URL(candidatePath, 'http://localhost');
  const candidatePathname = candidate.pathname.replace(/\/+$/, '') || '/';

  return allowedPrefixes.some((prefix) => {
    const normalizedPrefix = normalizeAllowedRedirectPrefix(prefix);
    if (!normalizedPrefix) {
      return false;
    }

    if (normalizedPrefix === '/') {
      return candidatePathname === '/';
    }

    return (
      candidatePathname === normalizedPrefix ||
      candidatePathname.startsWith(`${normalizedPrefix}/`)
    );
  });
}

export function buildFrontendRedirectUrl(
  frontendBaseUrl: string,
  path: string,
): string {
  return new URL(path, frontendBaseUrl).toString();
}

export function extractFrontendOrigin(
  request: Request,
  redirectOrigin?: string,
): string | undefined {
  // Priority 1: redirect_origin query parameter (explicit client signal)
  if (redirectOrigin && isValidOrigin(redirectOrigin)) {
    return redirectOrigin;
  }

  // Priority 2: X-Frontend-Origin header (explicit client signal)
  const frontendOriginHeader = request.headers['x-frontend-origin'] as string;
  if (frontendOriginHeader && isValidOrigin(frontendOriginHeader)) {
    return frontendOriginHeader;
  }

  // Priority 3: Origin header (standard browser header)
  const originHeader = request.headers.origin as string;
  if (originHeader && isValidOrigin(originHeader)) {
    return originHeader;
  }

  // Priority 4: Referer header (fallback extraction)
  const refererHeader = request.headers.referer as string;
  if (refererHeader) {
    try {
      const refererUrl = new URL(refererHeader);
      const origin = refererUrl.origin;
      if (isValidOrigin(origin)) {
        return origin;
      }
    } catch {
      // Invalid URL, continue to undefined
    }
  }

  return undefined;
}

export function isValidOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateFrontendOrigin(
  origin: string | undefined,
  allowedOrigins: string[],
): string | undefined {
  if (!origin) {
    return undefined;
  }

  // Check if origin is in allowed list
  const isAllowed = allowedOrigins.some((allowed) => {
    if (allowed === '*') return true;
    return origin === allowed || origin.startsWith(`${allowed}/`);
  });

  return isAllowed ? origin : undefined;
}

export function buildDynamicFrontendRedirectUrl(
  request: Request,
  path: string,
  allowedOrigins: string[],
): string {
  // Extract origin from request headers
  const origin =
    (request.headers.origin as string) ||
    (request.headers.referer
      ? new URL(request.headers.referer as string).origin
      : undefined);

  // Fallback to configured base URL if no origin found
  if (!origin) {
    return new URL(
      path,
      process.env.AUTH_FRONTEND_BASE_URL || 'http://localhost:3000',
    ).toString();
  }

  // Validate origin against allowed origins
  const isAllowed = allowedOrigins.some((allowed) => {
    if (allowed === '*') return true;
    return origin === allowed || origin.startsWith(`${allowed}/`);
  });

  if (!isAllowed) {
    // Fallback to configured base URL for security
    return new URL(
      path,
      process.env.AUTH_FRONTEND_BASE_URL || 'http://localhost:3000',
    ).toString();
  }

  // Use request origin for redirect
  return new URL(path, origin).toString();
}

function normalizeRedirectPath(path: string | undefined): string | undefined {
  if (!path) {
    return undefined;
  }

  const trimmed = path.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') {
      return undefined;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return undefined;
  }
}
