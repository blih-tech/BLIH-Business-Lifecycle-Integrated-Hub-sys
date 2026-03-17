import { env, resetEnvCache } from './env.config';

describe('env.config', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalKeycloakClientId = process.env.KEYCLOAK_CLIENT_ID;
  const originalKeycloakClientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  const originalAuthClientId = process.env.KEYCLOAK_AUTH_CLIENT_ID;
  const originalAuthClientSecret = process.env.KEYCLOAK_AUTH_CLIENT_SECRET;
  const originalAuthorizationUrl = process.env.KEYCLOAK_AUTHORIZATION_URL;
  const originalTokenUrl = process.env.KEYCLOAK_TOKEN_URL;
  const originalLogoutUrl = process.env.KEYCLOAK_LOGOUT_URL;
  const originalUserInfoUrl = process.env.KEYCLOAK_USERINFO_URL;
  const originalJwksUrl = process.env.KEYCLOAK_JWKS_URL;
  const originalAuthRedirectUri = process.env.KEYCLOAK_AUTH_REDIRECT_URI;
  const originalAuthCookieHttpOnly = process.env.AUTH_COOKIE_HTTP_ONLY;
  const originalAuthCookieSecure = process.env.AUTH_COOKIE_SECURE;
  const originalAuthCookieDomain = process.env.AUTH_COOKIE_DOMAIN;
  const originalAuthCookiePath = process.env.AUTH_COOKIE_PATH;
  const originalAuthCookieSameSite = process.env.AUTH_COOKIE_SAME_SITE;
  const originalAuthNonceEnabled = process.env.AUTH_NONCE_ENABLED;
  const originalAuthPkceEnabled = process.env.AUTH_PKCE_ENABLED;
  const originalAuthPkceMethod = process.env.AUTH_PKCE_METHOD;
  const originalAuthFrontendBaseUrl = process.env.AUTH_FRONTEND_BASE_URL;
  const originalAllowedRedirectPrefixes =
    process.env.AUTH_ALLOWED_REDIRECT_PATH_PREFIXES;
  const originalLoginRateLimitPoints = process.env.AUTH_LOGIN_RATE_LIMIT_POINTS;
  const originalLoginRateLimitWindowSeconds =
    process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS;
  const originalJwksCacheTtlSeconds = process.env.JWKS_CACHE_TTL_SECONDS;
  const originalJwksCacheMaxKeys = process.env.JWKS_CACHE_MAX_KEYS;
  const originalEnforceMfa = process.env.ENFORCE_MFA_FOR_PRIVILEGED;
  const originalCorsOrigin = process.env.CORS_ORIGIN;

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalKeycloakClientId === undefined) {
      delete process.env.KEYCLOAK_CLIENT_ID;
    } else {
      process.env.KEYCLOAK_CLIENT_ID = originalKeycloakClientId;
    }

    if (originalKeycloakClientSecret === undefined) {
      delete process.env.KEYCLOAK_CLIENT_SECRET;
    } else {
      process.env.KEYCLOAK_CLIENT_SECRET = originalKeycloakClientSecret;
    }

    if (originalAuthClientId === undefined) {
      delete process.env.KEYCLOAK_AUTH_CLIENT_ID;
    } else {
      process.env.KEYCLOAK_AUTH_CLIENT_ID = originalAuthClientId;
    }

    if (originalAuthClientSecret === undefined) {
      delete process.env.KEYCLOAK_AUTH_CLIENT_SECRET;
    } else {
      process.env.KEYCLOAK_AUTH_CLIENT_SECRET = originalAuthClientSecret;
    }

    if (originalAuthRedirectUri === undefined) {
      delete process.env.KEYCLOAK_AUTH_REDIRECT_URI;
    } else {
      process.env.KEYCLOAK_AUTH_REDIRECT_URI = originalAuthRedirectUri;
    }

    if (originalAuthorizationUrl === undefined) {
      delete process.env.KEYCLOAK_AUTHORIZATION_URL;
    } else {
      process.env.KEYCLOAK_AUTHORIZATION_URL = originalAuthorizationUrl;
    }

    if (originalTokenUrl === undefined) {
      delete process.env.KEYCLOAK_TOKEN_URL;
    } else {
      process.env.KEYCLOAK_TOKEN_URL = originalTokenUrl;
    }

    if (originalLogoutUrl === undefined) {
      delete process.env.KEYCLOAK_LOGOUT_URL;
    } else {
      process.env.KEYCLOAK_LOGOUT_URL = originalLogoutUrl;
    }

    if (originalUserInfoUrl === undefined) {
      delete process.env.KEYCLOAK_USERINFO_URL;
    } else {
      process.env.KEYCLOAK_USERINFO_URL = originalUserInfoUrl;
    }

    if (originalJwksUrl === undefined) {
      delete process.env.KEYCLOAK_JWKS_URL;
    } else {
      process.env.KEYCLOAK_JWKS_URL = originalJwksUrl;
    }

    if (originalAuthCookieHttpOnly === undefined) {
      delete process.env.AUTH_COOKIE_HTTP_ONLY;
    } else {
      process.env.AUTH_COOKIE_HTTP_ONLY = originalAuthCookieHttpOnly;
    }

    if (originalAuthCookieSecure === undefined) {
      delete process.env.AUTH_COOKIE_SECURE;
    } else {
      process.env.AUTH_COOKIE_SECURE = originalAuthCookieSecure;
    }

    if (originalAuthCookieDomain === undefined) {
      delete process.env.AUTH_COOKIE_DOMAIN;
    } else {
      process.env.AUTH_COOKIE_DOMAIN = originalAuthCookieDomain;
    }

    if (originalAuthCookiePath === undefined) {
      delete process.env.AUTH_COOKIE_PATH;
    } else {
      process.env.AUTH_COOKIE_PATH = originalAuthCookiePath;
    }

    if (originalAuthCookieSameSite === undefined) {
      delete process.env.AUTH_COOKIE_SAME_SITE;
    } else {
      process.env.AUTH_COOKIE_SAME_SITE = originalAuthCookieSameSite;
    }

    if (originalAuthNonceEnabled === undefined) {
      delete process.env.AUTH_NONCE_ENABLED;
    } else {
      process.env.AUTH_NONCE_ENABLED = originalAuthNonceEnabled;
    }

    if (originalAuthPkceEnabled === undefined) {
      delete process.env.AUTH_PKCE_ENABLED;
    } else {
      process.env.AUTH_PKCE_ENABLED = originalAuthPkceEnabled;
    }

    if (originalAuthPkceMethod === undefined) {
      delete process.env.AUTH_PKCE_METHOD;
    } else {
      process.env.AUTH_PKCE_METHOD = originalAuthPkceMethod;
    }

    if (originalAuthFrontendBaseUrl === undefined) {
      delete process.env.AUTH_FRONTEND_BASE_URL;
    } else {
      process.env.AUTH_FRONTEND_BASE_URL = originalAuthFrontendBaseUrl;
    }

    if (originalAllowedRedirectPrefixes === undefined) {
      delete process.env.AUTH_ALLOWED_REDIRECT_PATH_PREFIXES;
    } else {
      process.env.AUTH_ALLOWED_REDIRECT_PATH_PREFIXES =
        originalAllowedRedirectPrefixes;
    }

    if (originalLoginRateLimitPoints === undefined) {
      delete process.env.AUTH_LOGIN_RATE_LIMIT_POINTS;
    } else {
      process.env.AUTH_LOGIN_RATE_LIMIT_POINTS = originalLoginRateLimitPoints;
    }

    if (originalLoginRateLimitWindowSeconds === undefined) {
      delete process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS;
    } else {
      process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS =
        originalLoginRateLimitWindowSeconds;
    }

    if (originalJwksCacheTtlSeconds === undefined) {
      delete process.env.JWKS_CACHE_TTL_SECONDS;
    } else {
      process.env.JWKS_CACHE_TTL_SECONDS = originalJwksCacheTtlSeconds;
    }

    if (originalJwksCacheMaxKeys === undefined) {
      delete process.env.JWKS_CACHE_MAX_KEYS;
    } else {
      process.env.JWKS_CACHE_MAX_KEYS = originalJwksCacheMaxKeys;
    }

    if (originalEnforceMfa === undefined) {
      delete process.env.ENFORCE_MFA_FOR_PRIVILEGED;
    } else {
      process.env.ENFORCE_MFA_FOR_PRIVILEGED = originalEnforceMfa;
    }

    if (originalCorsOrigin === undefined) {
      delete process.env.CORS_ORIGIN;
    } else {
      process.env.CORS_ORIGIN = originalCorsOrigin;
    }

    resetEnvCache();
  });

  it('defaults ENFORCE_MFA_FOR_PRIVILEGED to false', () => {
    delete process.env.ENFORCE_MFA_FOR_PRIVILEGED;
    resetEnvCache();

    expect(env.ENFORCE_MFA_FOR_PRIVILEGED).toBe(false);
  });

  it('reads Keycloak client credentials from runtime environment', () => {
    process.env.KEYCLOAK_CLIENT_ID = 'runtime-client-id';
    process.env.KEYCLOAK_CLIENT_SECRET = 'runtime-client-secret';
    resetEnvCache();

    expect(env.KEYCLOAK_CLIENT_ID).toBe('runtime-client-id');
    expect(env.KEYCLOAK_CLIENT_SECRET).toBe('runtime-client-secret');
  });

  it('reads dedicated auth client settings for authorization-code flow', () => {
    process.env.KEYCLOAK_AUTH_CLIENT_ID = 'runtime-auth-client-id';
    process.env.KEYCLOAK_AUTH_CLIENT_SECRET = 'runtime-auth-client-secret';
    process.env.KEYCLOAK_AUTHORIZATION_URL =
      'http://localhost:8080/realms/blih/protocol/openid-connect/auth';
    process.env.KEYCLOAK_TOKEN_URL =
      'http://localhost:8080/realms/blih/protocol/openid-connect/token';
    process.env.KEYCLOAK_LOGOUT_URL =
      'http://localhost:8080/realms/blih/protocol/openid-connect/logout';
    process.env.KEYCLOAK_USERINFO_URL =
      'http://localhost:8080/realms/blih/protocol/openid-connect/userinfo';
    process.env.KEYCLOAK_JWKS_URL =
      'http://localhost:8080/realms/blih/protocol/openid-connect/certs';
    process.env.KEYCLOAK_AUTH_REDIRECT_URI =
      'http://localhost:5000/api/v1/auth/callback';
    process.env.AUTH_COOKIE_HTTP_ONLY = 'true';
    process.env.AUTH_COOKIE_DOMAIN = 'localhost';
    process.env.AUTH_COOKIE_PATH = '/';
    process.env.AUTH_COOKIE_SAME_SITE = 'strict';
    process.env.AUTH_NONCE_ENABLED = 'true';
    process.env.AUTH_PKCE_ENABLED = 'true';
    process.env.AUTH_PKCE_METHOD = 'S256';
    process.env.AUTH_FRONTEND_BASE_URL = 'http://localhost:3000';
    process.env.AUTH_ALLOWED_REDIRECT_PATH_PREFIXES =
      '/,/auth,/dashboard,/no-access';
    process.env.AUTH_LOGIN_RATE_LIMIT_POINTS = '25';
    process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS = '120';
    process.env.JWKS_CACHE_TTL_SECONDS = '7200';
    process.env.JWKS_CACHE_MAX_KEYS = '8';
    resetEnvCache();

    expect(env.KEYCLOAK_AUTH_CLIENT_ID).toBe('runtime-auth-client-id');
    expect(env.KEYCLOAK_AUTH_CLIENT_SECRET).toBe('runtime-auth-client-secret');
    expect(env.KEYCLOAK_AUTHORIZATION_URL).toContain(
      '/protocol/openid-connect/auth',
    );
    expect(env.KEYCLOAK_TOKEN_URL).toContain('/protocol/openid-connect/token');
    expect(env.KEYCLOAK_LOGOUT_URL).toContain(
      '/protocol/openid-connect/logout',
    );
    expect(env.KEYCLOAK_USERINFO_URL).toContain(
      '/protocol/openid-connect/userinfo',
    );
    expect(env.KEYCLOAK_JWKS_URL).toContain('/protocol/openid-connect/certs');
    expect(env.KEYCLOAK_AUTH_REDIRECT_URI).toBe(
      'http://localhost:5000/api/v1/auth/callback',
    );
    expect(env.AUTH_COOKIE_HTTP_ONLY).toBe(true);
    expect(env.AUTH_COOKIE_DOMAIN).toBe('localhost');
    expect(env.AUTH_COOKIE_PATH).toBe('/');
    expect(env.AUTH_COOKIE_SAME_SITE).toBe('strict');
    expect(env.AUTH_NONCE_ENABLED).toBe(true);
    expect(env.AUTH_PKCE_ENABLED).toBe(true);
    expect(env.AUTH_PKCE_METHOD).toBe('S256');
    expect(env.AUTH_FRONTEND_BASE_URL).toBe('http://localhost:3000');
    expect(env.AUTH_ALLOWED_REDIRECT_PATH_PREFIXES).toBe(
      '/,/auth,/dashboard,/no-access',
    );
    expect(env.AUTH_LOGIN_RATE_LIMIT_POINTS).toBe(25);
    expect(env.AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS).toBe(120);
    expect(env.JWKS_CACHE_TTL_SECONDS).toBe(7200);
    expect(env.JWKS_CACHE_MAX_KEYS).toBe(8);
  });

  it('derives AUTH_COOKIE_SECURE default from production node env', () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGIN = 'https://app.example.com';
    delete process.env.AUTH_COOKIE_SECURE;
    resetEnvCache();

    expect(env.AUTH_COOKIE_SECURE).toBe(true);
  });

  it('rejects wildcard CORS in production with credentials enabled', () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGIN = '*';
    resetEnvCache();

    expect(() => env.CORS_ORIGIN).toThrow(
      `Env validation failed: "CORS_ORIGIN" contains an invalid value`,
    );
  });
});
