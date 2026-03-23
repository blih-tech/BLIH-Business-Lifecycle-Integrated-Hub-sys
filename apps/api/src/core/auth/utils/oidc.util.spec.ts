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
  buildDynamicFrontendRedirectUrl,
  extractOriginFromRequest,
  validateOriginAgainstAllowed,
  isValidOrigin,
} from './oidc.util';

// Mock Request interface for testing
interface MockRequest {
  headers: Record<string, string | undefined>;
}

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

  describe('buildDynamicFrontendRedirectUrl', () => {
    const allowedOrigins = [
      'https://project-k22it.vercel.app',
      'https://blihapi.blihmarketing.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001',
      'https://example.com',
    ];

    it('preserves localhost:3000 origin for redirects', () => {
      const request = {
        headers: {
          origin: 'http://localhost:3000',
        },
      } as MockRequest;

      const result = buildDynamicFrontendRedirectUrl(
        request as any,
        '/auth/signin',
        allowedOrigins,
      );
      expect(result).toBe('http://localhost:3000/auth/signin');
    });

    it('preserves example.com origin for redirects', () => {
      const request = {
        headers: {
          origin: 'https://example.com',
        },
      } as MockRequest;

      const result = buildDynamicFrontendRedirectUrl(
        request as any,
        '/dashboard',
        allowedOrigins,
      );
      expect(result).toBe('https://example.com/dashboard');
    });

    it('falls back to referer when origin header is missing', () => {
      const request = {
        headers: {
          referer: 'http://localhost:3001/some-page',
        },
      } as MockRequest;

      const result = buildDynamicFrontendRedirectUrl(
        request as any,
        '/auth/signin',
        allowedOrigins,
      );
      expect(result).toBe('http://localhost:3001/auth/signin');
    });

    it('uses x-forwarded headers for proxy scenarios', () => {
      const request = {
        headers: {
          'x-forwarded-host': 'example.com',
          'x-forwarded-proto': 'https',
        },
      } as MockRequest;

      const result = buildDynamicFrontendRedirectUrl(
        request as any,
        '/dashboard',
        allowedOrigins,
      );
      expect(result).toBe('https://example.com/dashboard');
    });

    it('uses host header with HTTPS assumption for production domains', () => {
      const request = {
        headers: {
          host: 'production.app.com',
        },
      } as MockRequest;

      const result = buildDynamicFrontendRedirectUrl(
        request as any,
        '/dashboard',
        ['https://production.app.com'],
      );
      expect(result).toBe('https://production.app.com/dashboard');
    });

    it('uses host header with HTTP assumption for localhost', () => {
      const request = {
        headers: {
          host: 'localhost:3000',
        },
      } as MockRequest;

      const result = buildDynamicFrontendRedirectUrl(
        request as any,
        '/auth/signin',
        allowedOrigins,
      );
      expect(result).toBe('http://localhost:3000/auth/signin');
    });

    it('falls back to default URL when no origin can be detected', () => {
      const request = {
        headers: {},
      } as MockRequest;

      const result = buildDynamicFrontendRedirectUrl(
        request as any,
        '/auth/signin',
        allowedOrigins,
      );
      expect(result).toBe('http://localhost:3000/auth/signin');
    });

    it('falls back to default URL when origin is not in allowed list', () => {
      const request = {
        headers: {
          origin: 'https://malicious-site.com',
        },
      } as MockRequest;

      const result = buildDynamicFrontendRedirectUrl(
        request as any,
        '/auth/signin',
        allowedOrigins,
      );
      expect(result).toBe('http://localhost:3000/auth/signin');
    });

    it('handles wildcard allowed origins', () => {
      const request = {
        headers: {
          origin: 'https://any-site.com',
        },
      } as MockRequest;

      const result = buildDynamicFrontendRedirectUrl(
        request as any,
        '/dashboard',
        ['*'],
      );
      expect(result).toBe('https://any-site.com/dashboard');
    });

    it('handles subdomain wildcards', () => {
      const request = {
        headers: {
          origin: 'https://sub.example.com',
        },
      } as MockRequest;

      const result = buildDynamicFrontendRedirectUrl(
        request as any,
        '/dashboard',
        ['*.example.com'],
      );
      expect(result).toBe('https://sub.example.com/dashboard');
    });

    it('rejects invalid origin URLs', () => {
      const request = {
        headers: {
          origin: 'not-a-valid-url',
        },
      } as MockRequest;

      const result = buildDynamicFrontendRedirectUrl(
        request as any,
        '/auth/signin',
        allowedOrigins,
      );
      expect(result).toBe('http://localhost:3000/auth/signin');
    });
  });

  describe('extractOriginFromRequest', () => {
    it('extracts origin from x-forwarded headers (highest priority)', () => {
      const request = {
        headers: {
          'x-forwarded-host': 'example.com',
          'x-forwarded-proto': 'https',
          origin: 'https://should-be-ignored.com',
          referer: 'https://also-ignored.com',
          host: 'ignored.com',
        },
      } as MockRequest;

      const result = extractOriginFromRequest(request as any);
      expect(result).toBe('https://example.com');
    });

    it('extracts origin from referer header when x-forwarded headers missing', () => {
      const request = {
        headers: {
          referer: 'https://example.com/some-page',
          origin: 'https://should-be-ignored.com',
          host: 'ignored.com',
        },
      } as MockRequest;

      const result = extractOriginFromRequest(request as any);
      expect(result).toBe('https://example.com');
    });

    it('extracts origin from origin header when x-forwarded and referer missing', () => {
      const request = {
        headers: {
          origin: 'https://example.com',
          host: 'ignored.com',
        },
      } as MockRequest;

      const result = extractOriginFromRequest(request as any);
      expect(result).toBe('https://example.com');
    });

    it('extracts origin from host header as last resort', () => {
      const request = {
        headers: {
          host: 'example.com',
        },
      } as MockRequest;

      const result = extractOriginFromRequest(request as any);
      expect(result).toBe('https://example.com');
    });

    it('extracts origin from host header with localhost (uses HTTP)', () => {
      const request = {
        headers: {
          host: 'localhost:3000',
        },
      } as MockRequest;

      const result = extractOriginFromRequest(request as any);
      expect(result).toBe('http://localhost:3000');
    });

    it('handles invalid referer URL gracefully', () => {
      const request = {
        headers: {
          referer: 'not-a-valid-url',
          origin: 'https://fallback.com',
        },
      } as MockRequest;

      const result = extractOriginFromRequest(request as any);
      expect(result).toBe('https://fallback.com');
    });

    it('returns undefined when no valid headers are present', () => {
      const request = {
        headers: {
          'x-forwarded-host': '',
          'x-forwarded-proto': '',
          referer: 'not-a-valid-url',
          origin: 'not-a-valid-url',
          host: '',
        },
      } as MockRequest;

      const result = extractOriginFromRequest(request as any);
      expect(result).toBeUndefined();
    });
  });

  describe('validateOriginAgainstAllowed', () => {
    it('allows exact matches', () => {
      const result = validateOriginAgainstAllowed('https://example.com', [
        'https://example.com',
      ]);
      expect(result).toBe(true);
    });

    it('allows wildcard', () => {
      const result = validateOriginAgainstAllowed('https://any-site.com', [
        '*',
      ]);
      expect(result).toBe(true);
    });

    it('allows subdomain wildcards', () => {
      expect(
        validateOriginAgainstAllowed('https://sub.example.com', [
          '*.example.com',
        ]),
      ).toBe(true);
      expect(
        validateOriginAgainstAllowed('https://another.sub.example.com', [
          '*.example.com',
        ]),
      ).toBe(true);
      expect(
        validateOriginAgainstAllowed('https://example.com', ['*.example.com']),
      ).toBe(true);
      expect(
        validateOriginAgainstAllowed('https://other.com', ['*.example.com']),
      ).toBe(false);
    });

    it('allows prefix matching', () => {
      expect(
        validateOriginAgainstAllowed('https://example.com/path', [
          'https://example.com',
        ]),
      ).toBe(true);
    });

    it('rejects non-matching origins', () => {
      const result = validateOriginAgainstAllowed('https://malicious.com', [
        'https://example.com',
      ]);
      expect(result).toBe(false);
    });
  });

  describe('isValidOrigin', () => {
    it('validates HTTPS URLs', () => {
      expect(isValidOrigin('https://example.com')).toBe(true);
    });

    it('validates HTTP URLs', () => {
      expect(isValidOrigin('http://localhost:3000')).toBe(true);
    });

    it('rejects invalid protocols', () => {
      expect(isValidOrigin('ftp://example.com')).toBe(false);
    });

    it('rejects malformed URLs', () => {
      expect(isValidOrigin('not-a-url')).toBe(false);
    });
  });
});
