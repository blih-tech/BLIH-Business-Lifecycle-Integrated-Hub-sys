import {
  buildAuthorizeUrl,
  createOidcAuthRequestContext,
  resolveSafeRedirectPath,
} from './oidc.util';

describe('oidc.util', () => {
  it('creates PKCE auth request context with url-safe values', () => {
    const context = createOidcAuthRequestContext();

    expect(context.state).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(context.codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(context.codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/);
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
    });

    const parsed = new URL(url);
    expect(parsed.origin).toBe('http://localhost:8080');
    expect(parsed.pathname).toBe('/realms/blih/protocol/openid-connect/auth');
    expect(parsed.searchParams.get('redirect_uri')).toBe(
      'http://localhost:5000/api/v1/auth/callback?source=web app',
    );
    expect(parsed.searchParams.get('code_challenge')).toBe('challenge-value');
    expect(parsed.searchParams.get('code_challenge_method')).toBe('S256');
  });

  it('rejects unsafe redirects and keeps safe relative redirects', () => {
    expect(resolveSafeRedirectPath('/dashboard/hr', '/login')).toBe(
      '/dashboard/hr',
    );
    expect(resolveSafeRedirectPath('https://evil.local/pwn', '/login')).toBe(
      '/login',
    );
    expect(resolveSafeRedirectPath('//evil.local', '/login')).toBe('/login');
  });
});
