import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { KeycloakIntrospectionService } from '../src/platform/keycloak/keycloak-introspection.service';
import { KeycloakMapperService } from '../src/platform/keycloak/keycloak-mapper.service';
import { PrincipalEnrichmentService } from '../src/platform/keycloak/principal-enrichment.service';
import { KeycloakTokenService } from '../src/platform/keycloak/keycloak-token.service';
import { KeycloakIdTokenValidationError } from '../src/platform/keycloak/keycloak.errors';
import { UserPermissionSnapshotService } from '../src/core/rbac/user-permission-snapshot.service';
import { ValidationPipe } from '../src/shared/pipes/validation.pipe';

const getCookie = (
  setCookie: string | string[] | undefined,
  name: string,
): string | undefined =>
  (Array.isArray(setCookie)
    ? setCookie
    : typeof setCookie === 'string'
      ? [setCookie]
      : []
  ).find((cookie) => cookie.startsWith(`${name}=`));

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const revokeTokenMock = jest.fn(() => Promise.resolve());
  const validateIdTokenMock = jest.fn((token: string) => {
    if (token === 'bad-id-token') {
      return Promise.reject(
        new KeycloakIdTokenValidationError(
          'Invalid ID token',
          'invalid_id_token',
        ),
      );
    }

    return Promise.resolve({
      sub: 'kc-user-1',
      aud: 'blih-system-auth',
      iss: 'http://localhost:8080/realms/blih',
      nonce: 'expected-nonce',
    });
  });
  const refreshTokenMock = jest.fn((token: string) => {
    if (token === 'refresh-cookie-token') {
      return Promise.resolve({
        access_token: 'rotated-access-token',
        refresh_token: 'rotated-refresh-token',
        id_token: 'rotated-id-token',
        token_type: 'Bearer',
        expires_in: 300,
        refresh_expires_in: 1800,
        scope: 'openid profile email',
      });
    }

    if (token === 'missing-rotation-token') {
      return Promise.resolve({
        access_token: 'rotated-access-token',
        token_type: 'Bearer',
        expires_in: 300,
        scope: 'openid profile email',
      });
    }

    return Promise.resolve({
      access_token: 'refreshed',
      refresh_token: 'refreshed-refresh',
      token_type: 'Bearer',
      expires_in: 300,
      refresh_expires_in: 1800,
      scope: 'openid profile email',
    });
  });
  const exchangeAuthorizationCodeMock = jest.fn((code: string) => {
    if (code === 'bad-code') {
      return Promise.reject({
        response: {
          status: 400,
          data: {
            error: 'invalid_grant',
          },
        },
      });
    }

    return Promise.resolve({
      access_token: 'access-token-from-code',
      refresh_token: 'refresh-token-from-code',
      id_token: code === 'bad-id-code' ? 'bad-id-token' : 'id-token-from-code',
      token_type: 'Bearer',
      expires_in: 300,
      refresh_expires_in: 1800,
    });
  });

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.SKIP_DATABASE_CONNECT = 'true';
    process.env.KEYCLOAK_URL = 'http://localhost:8080';
    process.env.KEYCLOAK_REALM = 'blih';
    process.env.KEYCLOAK_AUTH_CLIENT_ID = 'blih-system-auth';
    process.env.KEYCLOAK_AUTH_CLIENT_SECRET = 'dedicated-auth-secret';
    process.env.KEYCLOAK_AUTH_REDIRECT_URI =
      'http://localhost:5000/api/v1/auth/callback';
    process.env.KEYCLOAK_AUTH_SCOPES = 'openid profile email';
    process.env.AUTH_FRONTEND_BASE_URL = 'http://localhost:3000';
    process.env.AUTH_ALLOWED_REDIRECT_PATH_PREFIXES =
      '/,/auth,/dashboard,/no-access';
    process.env.AUTH_LOGIN_ERROR_REDIRECT_URI = '/auth/signin';
    process.env.AUTH_POST_LOGIN_REDIRECT_URI = '/';
    process.env.AUTH_POST_LOGOUT_REDIRECT_URI = '/auth/signin';
    process.env.AUTH_STATE_TTL_SECONDS = '600';
    process.env.AUTH_REFRESH_TOKEN_TTL_SECONDS = '2592000';
    process.env.AUTH_COOKIE_HTTP_ONLY = 'true';
    process.env.AUTH_COOKIE_SECURE = 'false';
    process.env.AUTH_COOKIE_DOMAIN = '';
    process.env.AUTH_COOKIE_PATH = '/';
    process.env.AUTH_COOKIE_SAME_SITE = 'lax';
    process.env.AUTH_NONCE_ENABLED = 'true';
    process.env.AUTH_PKCE_ENABLED = 'true';
    process.env.AUTH_PKCE_METHOD = 'S256';
    process.env.AUTH_LOGIN_RATE_LIMIT_POINTS = '50';
    process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS = '60';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(KeycloakTokenService)
      .useValue({
        validateAccessToken: () =>
          Promise.resolve({
            sub: 'kc-user-1',
            email: 'user@blih.local',
            realm_access: { roles: ['core:user:view'] },
            scope: 'openid profile',
          }),
        refreshToken: refreshTokenMock,
        exchangeToken: () =>
          Promise.resolve({
            access_token: 'exchanged',
            token_type: 'Bearer',
            expires_in: 300,
          }),
        exchangeAuthorizationCode: exchangeAuthorizationCodeMock,
        validateIdToken: validateIdTokenMock,
        revokeToken: revokeTokenMock,
      })
      .overrideProvider(KeycloakMapperService)
      .useValue({
        toPrincipal: () => ({
          sub: 'kc-user-1',
          email: 'user@blih.local',
          realm: 'blih',
          policyVersion: '1.0',
          roles: ['core:user:view'],
          permissions: ['core:user:view'],
          scopes: ['openid', 'profile'],
        }),
      })
      .overrideProvider(PrincipalEnrichmentService)
      .useValue({
        getContext: () => Promise.resolve({}),
      })
      .overrideProvider(UserPermissionSnapshotService)
      .useValue({
        getPersistedPermissions: () => Promise.resolve(['core:user:view']),
      })
      .overrideProvider(KeycloakIntrospectionService)
      .useValue({
        introspect: () =>
          Promise.resolve({
            active: true,
            sub: 'kc-user-1',
            sid: 'session-1',
            scope: 'openid profile',
          }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    revokeTokenMock.mockClear();
    refreshTokenMock.mockClear();
    validateIdTokenMock.mockClear();
    exchangeAuthorizationCodeMock.mockClear();
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          success: boolean;
          data: {
            status: string;
            checks: Record<string, unknown>;
          };
        };

        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('status');
        expect(body.data).toHaveProperty('checks');
      });
  });

  it('/api/v1/auth/login (GET) redirects to Keycloak with PKCE and transient cookies', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/login?redirect=/dashboard&prompt=login')
      .expect(302);

    const location = response.headers.location as string;
    const authorizationUrl = new URL(location);

    expect(authorizationUrl.pathname).toMatch(
      /^\/realms\/[^/]+\/protocol\/openid-connect\/auth$/,
    );
    expect(authorizationUrl.searchParams.get('client_id')).toBe(
      'blih-system-auth',
    );
    expect(authorizationUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost:5000/api/v1/auth/callback',
    );
    expect(authorizationUrl.searchParams.get('code_challenge')).toBeTruthy();
    expect(authorizationUrl.searchParams.get('state')).toBeTruthy();
    expect(authorizationUrl.searchParams.get('prompt')).toBe('login');

    const cookies = response.headers['set-cookie'];
    expect(getCookie(cookies, 'kc_state')).toBeDefined();
    expect(getCookie(cookies, 'kc_verifier')).toBeDefined();
    expect(getCookie(cookies, 'kc_redirect')).toBeDefined();
    expect(getCookie(cookies, 'kc_nonce')).toBeDefined();
  });

  it('/api/v1/auth/callback (GET) redirects to /login when state validation fails', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/callback?code=abc&state=wrong-state')
      .expect(302);

    expect(response.headers.location).toBe('http://localhost:3000/auth/signin');
    const cookies = response.headers['set-cookie'];
    expect(getCookie(cookies, 'kc_state')).toBeDefined();
    expect(getCookie(cookies, 'kc_verifier')).toBeDefined();
    expect(getCookie(cookies, 'kc_redirect')).toBeDefined();
    expect(getCookie(cookies, 'kc_nonce')).toBeDefined();
  });

  it('/api/v1/auth/callback (GET) redirects to /login?error=invalid_code for invalid_grant', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/callback?code=bad-code&state=expected-state')
      .set(
        'Cookie',
        'kc_state=expected-state; kc_verifier=test-verifier; kc_redirect=%2Fdashboard; kc_nonce=expected-nonce',
      )
      .expect(302);

    expect(response.headers.location).toBe(
      'http://localhost:3000/auth/signin?error=invalid_code',
    );
  });

  it('/api/v1/auth/callback (GET) sets auth cookies and redirects after successful exchange', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/callback?code=good-code&state=expected-state')
      .set(
        'Cookie',
        'kc_state=expected-state; kc_verifier=test-verifier; kc_redirect=%2Fdashboard; kc_nonce=expected-nonce',
      )
      .expect(302);

    expect(response.headers.location).toBe('http://localhost:3000/dashboard');
    const cookies = response.headers['set-cookie'];
    expect(getCookie(cookies, 'kc_access')).toBeDefined();
    expect(getCookie(cookies, 'kc_refresh')).toBeDefined();
    expect(getCookie(cookies, 'kc_id')).toBeDefined();
    expect(getCookie(cookies, 'kc_csrf')).toBeDefined();
    expect(getCookie(cookies, 'kc_state')).toBeDefined();
    expect(getCookie(cookies, 'kc_verifier')).toBeDefined();
    expect(getCookie(cookies, 'kc_redirect')).toBeDefined();
    expect(getCookie(cookies, 'kc_nonce')).toBeDefined();
    expect(validateIdTokenMock).toHaveBeenCalledWith(
      'id-token-from-code',
      'blih',
      'blih-system-auth',
      'expected-nonce',
    );
  });

  it('/api/v1/auth/callback (GET) redirects to invalid_id_token when nonce validation fails', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/callback?code=bad-id-code&state=expected-state')
      .set(
        'Cookie',
        'kc_state=expected-state; kc_verifier=test-verifier; kc_redirect=%2Fdashboard; kc_nonce=expected-nonce',
      )
      .expect(302);

    expect(response.headers.location).toBe(
      'http://localhost:3000/auth/signin?error=invalid_id_token',
    );
  });

  it('/api/v1/auth/logout (GET) clears cookies and redirects via Keycloak logout when id token exists', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/logout')
      .set('Cookie', 'kc_refresh=refresh-token; kc_id=id-token')
      .expect(302);

    const location = response.headers.location as string;
    const logoutUrl = new URL(location);
    expect(logoutUrl.pathname).toMatch(
      /^\/realms\/[^/]+\/protocol\/openid-connect\/logout$/,
    );
    expect(logoutUrl.searchParams.get('id_token_hint')).toBe('id-token');
    expect(logoutUrl.searchParams.get('post_logout_redirect_uri')).toBe(
      'http://localhost:3000/auth/signin',
    );

    const cookies = response.headers['set-cookie'];
    expect(getCookie(cookies, 'kc_access')).toBeDefined();
    expect(getCookie(cookies, 'kc_refresh')).toBeDefined();
    expect(getCookie(cookies, 'kc_id')).toBeDefined();
    expect(getCookie(cookies, 'kc_csrf')).toBeDefined();
    expect(revokeTokenMock).toHaveBeenCalledTimes(1);
  });

  it('/api/v1/auth/logout (GET) redirects to local path when id token is missing', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/logout?redirect=/auth/signin')
      .expect(302);

    expect(response.headers.location).toBe('http://localhost:3000/auth/signin');
    expect(revokeTokenMock).toHaveBeenCalledTimes(0);
  });

  it('/api/v1/auth/me (GET) rejects missing token', () => {
    return request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
  });

  it('/api/v1/auth/me (GET) returns principal with kc_access cookie', () => {
    return request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', 'kc_access=cookie-access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          data: { sub: string };
        };
        expect(body.data.sub).toBe('kc-user-1');
      });
  });

  it('/api/v1/auth/me (GET) returns principal with bearer token', () => {
    return request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer fake-token')
      .set('x-realm', 'blih')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          data: { sub: string };
        };
        expect(body.data.sub).toBe('kc-user-1');
      });
  });

  it('/api/v1/auth/refresh (POST) rotates cookies in browser mode', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set(
        'Cookie',
        'kc_refresh=refresh-cookie-token; kc_id=id-token; kc_csrf=csrf-cookie-token',
      )
      .set('x-csrf-token', 'csrf-cookie-token')
      .send({})
      .expect(201);

    expect(refreshTokenMock).toHaveBeenCalledWith(
      'refresh-cookie-token',
      'blih',
      'blih-system-auth',
      'dedicated-auth-secret',
    );
    const cookies = response.headers['set-cookie'];
    expect(getCookie(cookies, 'kc_access')).toBeDefined();
    expect(getCookie(cookies, 'kc_refresh')).toBeDefined();
    expect(getCookie(cookies, 'kc_id')).toBeDefined();
    expect(getCookie(cookies, 'kc_csrf')).toBeDefined();

    const body = response.body as {
      data: { accessToken?: string; refreshToken?: string };
    };
    expect(body.data.accessToken).toBeUndefined();
    expect(body.data.refreshToken).toBeUndefined();
  });

  it('/api/v1/auth/refresh (POST) clears auth cookies when browser refresh rotation fails', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set(
        'Cookie',
        'kc_refresh=missing-rotation-token; kc_id=id-token; kc_csrf=csrf-cookie-token',
      )
      .set('x-csrf-token', 'csrf-cookie-token')
      .send({})
      .expect(401);

    const cookies = response.headers['set-cookie'];
    expect(getCookie(cookies, 'kc_access')).toBeDefined();
    expect(getCookie(cookies, 'kc_refresh')).toBeDefined();
    expect(getCookie(cookies, 'kc_id')).toBeDefined();
    expect(getCookie(cookies, 'kc_csrf')).toBeDefined();
  });

  it('/api/v1/auth/refresh (POST) rejects cookie-authenticated refresh without csrf header', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set(
        'Cookie',
        'kc_refresh=refresh-cookie-token; kc_csrf=csrf-cookie-token',
      )
      .send({})
      .expect(403);
  });

  it('/api/v1/auth/revoke-session (POST) revokes refresh token', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/revoke-session')
      .send({ token: 'refresh-token' })
      .expect(201)
      .expect((response) => {
        const body = response.body as {
          data: {
            revoked: boolean;
            subject: string;
            sessionId: string;
          };
        };
        expect(body.data.revoked).toBe(true);
        expect(body.data.subject).toBe('kc-user-1');
        expect(body.data.sessionId).toBe('session-1');
      });
  });
});
