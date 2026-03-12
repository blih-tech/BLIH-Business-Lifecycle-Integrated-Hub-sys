import { env, resetEnvCache } from './env.config';

describe('env.config', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalKeycloakClientId = process.env.KEYCLOAK_CLIENT_ID;
  const originalKeycloakClientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  const originalAuthClientId = process.env.KEYCLOAK_AUTH_CLIENT_ID;
  const originalAuthClientSecret = process.env.KEYCLOAK_AUTH_CLIENT_SECRET;
  const originalAuthRedirectUri = process.env.KEYCLOAK_AUTH_REDIRECT_URI;
  const originalAuthCookieSecure = process.env.AUTH_COOKIE_SECURE;
  const originalAuthCookieSameSite = process.env.AUTH_COOKIE_SAME_SITE;
  const originalEnforceMfa = process.env.ENFORCE_MFA_FOR_PRIVILEGED;

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

    if (originalAuthCookieSecure === undefined) {
      delete process.env.AUTH_COOKIE_SECURE;
    } else {
      process.env.AUTH_COOKIE_SECURE = originalAuthCookieSecure;
    }

    if (originalAuthCookieSameSite === undefined) {
      delete process.env.AUTH_COOKIE_SAME_SITE;
    } else {
      process.env.AUTH_COOKIE_SAME_SITE = originalAuthCookieSameSite;
    }

    if (originalEnforceMfa === undefined) {
      delete process.env.ENFORCE_MFA_FOR_PRIVILEGED;
    } else {
      process.env.ENFORCE_MFA_FOR_PRIVILEGED = originalEnforceMfa;
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
    process.env.KEYCLOAK_AUTH_REDIRECT_URI =
      'http://localhost:5000/api/v1/auth/callback';
    process.env.AUTH_COOKIE_SAME_SITE = 'strict';
    resetEnvCache();

    expect(env.KEYCLOAK_AUTH_CLIENT_ID).toBe('runtime-auth-client-id');
    expect(env.KEYCLOAK_AUTH_CLIENT_SECRET).toBe('runtime-auth-client-secret');
    expect(env.KEYCLOAK_AUTH_REDIRECT_URI).toBe(
      'http://localhost:5000/api/v1/auth/callback',
    );
    expect(env.AUTH_COOKIE_SAME_SITE).toBe('strict');
  });

  it('derives AUTH_COOKIE_SECURE default from production node env', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.AUTH_COOKIE_SECURE;
    resetEnvCache();

    expect(env.AUTH_COOKIE_SECURE).toBe(true);
  });
});
