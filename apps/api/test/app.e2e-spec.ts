import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { KeycloakIntrospectionService } from '../src/platform/keycloak/keycloak-introspection.service';
import { KeycloakMapperService } from '../src/platform/keycloak/keycloak-mapper.service';
import { KeycloakTokenService } from '../src/platform/keycloak/keycloak-token.service';
import { ValidationPipe } from '../src/shared/pipes/validation.pipe';

const getCookie = (
  setCookie: string[] | undefined,
  name: string,
): string | undefined =>
  setCookie?.find((cookie) => cookie.startsWith(`${name}=`));

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const revokeTokenMock = jest.fn(() => Promise.resolve());
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
      id_token: 'id-token-from-code',
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
    process.env.AUTH_LOGIN_ERROR_REDIRECT_URI = '/login';
    process.env.AUTH_POST_LOGIN_REDIRECT_URI = '/';
    process.env.AUTH_POST_LOGOUT_REDIRECT_URI = '/login';
    process.env.AUTH_STATE_TTL_SECONDS = '600';
    process.env.AUTH_COOKIE_SECURE = 'false';
    process.env.AUTH_COOKIE_SAME_SITE = 'lax';

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
        refreshToken: () =>
          Promise.resolve({
            access_token: 'refreshed',
            token_type: 'Bearer',
            expires_in: 300,
          }),
        exchangeToken: () =>
          Promise.resolve({
            access_token: 'exchanged',
            token_type: 'Bearer',
            expires_in: 300,
          }),
        exchangeAuthorizationCode: exchangeAuthorizationCodeMock,
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

    expect(authorizationUrl.pathname).toBe(
      '/realms/blih/protocol/openid-connect/auth',
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

    const cookies = response.headers['set-cookie'] as string[] | undefined;
    expect(getCookie(cookies, 'kc_state')).toBeDefined();
    expect(getCookie(cookies, 'kc_verifier')).toBeDefined();
    expect(getCookie(cookies, 'kc_redirect')).toBeDefined();
  });

  it('/api/v1/auth/callback (GET) redirects to /login when state validation fails', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/callback?code=abc&state=wrong-state')
      .expect(302);

    expect(response.headers.location).toBe('/login');
    const cookies = response.headers['set-cookie'] as string[] | undefined;
    expect(getCookie(cookies, 'kc_state')).toBeDefined();
    expect(getCookie(cookies, 'kc_verifier')).toBeDefined();
    expect(getCookie(cookies, 'kc_redirect')).toBeDefined();
  });

  it('/api/v1/auth/callback (GET) redirects to /login?error=invalid_code for invalid_grant', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/callback?code=bad-code&state=expected-state')
      .set(
        'Cookie',
        'kc_state=expected-state; kc_verifier=test-verifier; kc_redirect=%2Fdashboard',
      )
      .expect(302);

    expect(response.headers.location).toBe('/login?error=invalid_code');
  });

  it('/api/v1/auth/callback (GET) sets auth cookies and redirects after successful exchange', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/callback?code=good-code&state=expected-state')
      .set(
        'Cookie',
        'kc_state=expected-state; kc_verifier=test-verifier; kc_redirect=%2Fdashboard',
      )
      .expect(302);

    expect(response.headers.location).toBe('/dashboard');
    const cookies = response.headers['set-cookie'] as string[] | undefined;
    expect(getCookie(cookies, 'kc_access')).toBeDefined();
    expect(getCookie(cookies, 'kc_refresh')).toBeDefined();
    expect(getCookie(cookies, 'kc_id')).toBeDefined();
    expect(getCookie(cookies, 'kc_state')).toBeDefined();
    expect(getCookie(cookies, 'kc_verifier')).toBeDefined();
    expect(getCookie(cookies, 'kc_redirect')).toBeDefined();
  });

  it('/api/v1/auth/logout (GET) clears cookies and redirects via Keycloak logout when id token exists', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/logout')
      .set('Cookie', 'kc_refresh=refresh-token; kc_id=id-token')
      .expect(302);

    const location = response.headers.location as string;
    const logoutUrl = new URL(location);
    expect(logoutUrl.pathname).toBe(
      '/realms/blih/protocol/openid-connect/logout',
    );
    expect(logoutUrl.searchParams.get('id_token_hint')).toBe('id-token');
    expect(logoutUrl.searchParams.get('post_logout_redirect_uri')).toContain(
      '/login',
    );

    const cookies = response.headers['set-cookie'] as string[] | undefined;
    expect(getCookie(cookies, 'kc_access')).toBeDefined();
    expect(getCookie(cookies, 'kc_refresh')).toBeDefined();
    expect(getCookie(cookies, 'kc_id')).toBeDefined();
    expect(revokeTokenMock).toHaveBeenCalledTimes(1);
  });

  it('/api/v1/auth/logout (GET) redirects to local path when id token is missing', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/logout?redirect=/auth/signin')
      .expect(302);

    expect(response.headers.location).toBe('/auth/signin');
    expect(revokeTokenMock).toHaveBeenCalledTimes(0);
  });

  it('/api/v1/auth/me (GET) rejects missing token', () => {
    return request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
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
