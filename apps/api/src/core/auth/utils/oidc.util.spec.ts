import {
  AUTH_COOKIE_NAMES,
  buildFrontendRedirectUrl,
  buildAuthorizeUrl,
  buildCookieOptions,
  buildReadableCookieOptions,
  createOidcAuthRequestContext,
  createCsrfToken,
  isAllowedRedirectPath,
  parseAllowedRedirectPathPrefixes,
  parseCookieHeader,
  resolveSafeRedirectPath,
  extractFrontendOrigin,
  validateFrontendOrigin,
  isValidOrigin,
} from './oidc.util';
import type { Request } from 'express';

describe('oidc.util', () => {
  it('creates PKCE auth request context with url-safe values', () => {
    const context = createOidcAuthRequestContext({
      nonceEnabled: true,
    });

    expect(context.state).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(context.codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(context.codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(context.nonce).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('creates a readable csrf token cookie value', () => {
    expect(createCsrfToken()).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('builds encoded authorize URL with required parameters', () => {
    const url = buildAuthorizeUrl({
      keycloakUrl: 'http://localhost:8080/',
      realm: 'blih',
      clientId: 'blih-system-auth',
      redirectUri: 'http://localhost:5000/api/v1/auth/callback?source=web app',
      scopes: 'openid profile email',
      state: 'test-state',
      codeChallenge: 'challenge-value',
      nonce: 'nonce-value',
      authorizationUrl:
        'http://localhost:8080/realms/blih/protocol/openid-connect/auth',
    });

    const parsed = new URL(url);
    expect(parsed.origin).toBe('http://localhost:8080');
    expect(parsed.pathname).toBe('/realms/blih/protocol/openid-connect/auth');
    expect(parsed.searchParams.get('redirect_uri')).toBe(
      'http://localhost:5000/api/v1/auth/callback?source=web app',
    );
    expect(parsed.searchParams.get('code_challenge')).toBe('challenge-value');
    expect(parsed.searchParams.get('code_challenge_method')).toBe('S256');
    expect(parsed.searchParams.get('nonce')).toBe('nonce-value');
  });

  it('rejects unsafe redirects and keeps safe relative redirects', () => {
    const allowedPrefixes = parseAllowedRedirectPathPrefixes(
      '/,/auth,/dashboard,/no-access',
    );

    expect(
      resolveSafeRedirectPath('/dashboard/hr', '/auth/signin', allowedPrefixes),
    ).toBe('/dashboard/hr');
    expect(
      resolveSafeRedirectPath(
        'https://evil.local/pwn',
        '/auth/signin',
        allowedPrefixes,
      ),
    ).toBe('/auth/signin');
    expect(
      resolveSafeRedirectPath('//evil.local', '/auth/signin', allowedPrefixes),
    ).toBe('/auth/signin');
    expect(
      resolveSafeRedirectPath('/admin', '/auth/signin', allowedPrefixes),
    ).toBe('/auth/signin');
  });

  it('checks redirect path allow-lists using path prefixes', () => {
    const allowedPrefixes = parseAllowedRedirectPathPrefixes(
      '/,/auth,/dashboard,/no-access',
    );

    expect(isAllowedRedirectPath('/', allowedPrefixes)).toBe(true);
    expect(isAllowedRedirectPath('/dashboard/hr', allowedPrefixes)).toBe(true);
    expect(
      isAllowedRedirectPath(
        '/auth/signin?error=invalid_state',
        allowedPrefixes,
      ),
    ).toBe(true);
    expect(isAllowedRedirectPath('/settings', allowedPrefixes)).toBe(false);
  });

  it('builds frontend redirect urls against the configured app origin', () => {
    expect(
      buildFrontendRedirectUrl('https://app.example.com', '/dashboard/hr'),
    ).toBe('https://app.example.com/dashboard/hr');
  });

  it('parses redirect path prefixes into unique safe values', () => {
    expect(
      parseAllowedRedirectPathPrefixes('/,/dashboard,/dashboard,/auth'),
    ).toEqual(['/', '/dashboard', '/auth']);
  });

  it('falls back to the provided default path when no allow-list is passed', () => {
    expect(resolveSafeRedirectPath('//evil.local', '/login')).toBe('/login');
  });

  it('parses cookies and preserves auth cookie names', () => {
    const cookies = parseCookieHeader(
      `${AUTH_COOKIE_NAMES.access}=abc123; ${AUTH_COOKIE_NAMES.refresh}=refresh%20token; ${AUTH_COOKIE_NAMES.csrf}=csrf-token`,
    );

    expect(cookies[AUTH_COOKIE_NAMES.access]).toBe('abc123');
    expect(cookies[AUTH_COOKIE_NAMES.refresh]).toBe('refresh token');
    expect(cookies[AUTH_COOKIE_NAMES.csrf]).toBe('csrf-token');
  });

  it('builds cookie options with enforced flags', () => {
    expect(
      buildCookieOptions(
        {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          domain: 'localhost',
          path: '/',
        },
        60000,
      ),
    ).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: 'localhost',
      path: '/',
      maxAge: 60000,
    });
  });

  it('builds readable cookie options for csrf cookies', () => {
    expect(
      buildReadableCookieOptions(
        {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          domain: 'localhost',
          path: '/',
        },
        60000,
      ),
    ).toMatchObject({
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      domain: 'localhost',
      path: '/',
      maxAge: 60000,
    });
  });

  describe('Frontend Origin Preservation', () => {
    it('extracts frontend origin from X-Frontend-Origin header', () => {
      const request = {
        headers: {
          'x-frontend-origin': 'https://app.example.com',
        },
      } as unknown as Request;

      const origin = extractFrontendOrigin(request);
      expect(origin).toBe('https://app.example.com');
    });

    it('extracts frontend origin from Origin header as fallback', () => {
      const request = {
        headers: {
          origin: 'https://app.example.com',
        },
      } as unknown as Request;

      const origin = extractFrontendOrigin(request);
      expect(origin).toBe('https://app.example.com');
    });

    it('extracts frontend origin from Referer header as final fallback', () => {
      const request = {
        headers: {
          referer: 'https://app.example.com/dashboard',
        },
      } as unknown as Request;

      const origin = extractFrontendOrigin(request);
      expect(origin).toBe('https://app.example.com');
    });

    it('prioritizes redirect_origin query parameter over headers', () => {
      const request = {
        headers: {
          'x-frontend-origin': 'https://priority.example.com',
          origin: 'https://origin.example.com',
          referer: 'https://referer.example.com/dashboard',
        },
      } as unknown as Request;

      const origin = extractFrontendOrigin(
        request,
        'https://query.example.com',
      );
      expect(origin).toBe('https://query.example.com');
    });

    it('prioritizes X-Frontend-Origin over other headers', () => {
      const request = {
        headers: {
          'x-frontend-origin': 'https://priority.example.com',
          origin: 'https://origin.example.com',
          referer: 'https://referer.example.com/dashboard',
        },
      } as unknown as Request;

      const origin = extractFrontendOrigin(request);
      expect(origin).toBe('https://priority.example.com');
    });

    it('returns undefined when no valid origin headers are present', () => {
      const request = {
        headers: {},
      } as unknown as Request;

      const origin = extractFrontendOrigin(request);
      expect(origin).toBeUndefined();
    });

    it('validates origins against allowed origins list', () => {
      const allowedOrigins = [
        'https://app.example.com',
        'https://admin.example.com',
      ];

      expect(
        validateFrontendOrigin('https://app.example.com', allowedOrigins),
      ).toBe('https://app.example.com');
      expect(
        validateFrontendOrigin('https://admin.example.com', allowedOrigins),
      ).toBe('https://admin.example.com');
      expect(
        validateFrontendOrigin('https://evil.example.com', allowedOrigins),
      ).toBeUndefined();
      expect(validateFrontendOrigin(undefined, allowedOrigins)).toBeUndefined();
    });

    it('normalizes trailing slash origins before allow-list comparison', () => {
      const allowedOrigins = ['https://app.example.com/'];

      expect(
        validateFrontendOrigin('https://app.example.com', allowedOrigins),
      ).toBe('https://app.example.com');
    });

    it('rejects prefix-based origin bypass attempts', () => {
      const allowedOrigins = ['https://app.example.com'];

      expect(
        validateFrontendOrigin(
          'https://app.example.com.evil.example.org',
          allowedOrigins,
        ),
      ).toBeUndefined();
    });

    it('allows all origins when wildcard is in allowed list', () => {
      const allowedOrigins = ['*'];

      expect(
        validateFrontendOrigin('https://any.example.com', allowedOrigins),
      ).toBe('https://any.example.com');
      expect(
        validateFrontendOrigin('http://localhost:3000', allowedOrigins),
      ).toBe('http://localhost:3000');
    });

    it('validates origin URLs correctly', () => {
      expect(isValidOrigin('https://example.com')).toBe(true);
      expect(isValidOrigin('http://localhost:3000')).toBe(true);
      expect(isValidOrigin('ftp://example.com')).toBe(false);
      expect(isValidOrigin('invalid-url')).toBe(false);
      expect(isValidOrigin('')).toBe(false);
    });

    it('includes kc_frontend_origin in AUTH_COOKIE_NAMES', () => {
      expect(AUTH_COOKIE_NAMES.frontendOrigin).toBe('kc_frontend_origin');
    });
  });
});
