import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { KeycloakTokenService } from '../src/platform/keycloak/keycloak-token.service';
import { KeycloakMapperService } from '../src/platform/keycloak/keycloak-mapper.service';
import { KeycloakIntrospectionService } from '../src/platform/keycloak/keycloak-introspection.service';
import { ValidationPipe } from '../src/shared/pipes/validation.pipe';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.SKIP_DATABASE_CONNECT = 'true';
    process.env.KEYCLOAK_REALM = 'blih';

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
        revokeToken: () => Promise.resolve(),
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
          data: {
            auth: { sub: string };
          };
        };
        expect(body.data.auth.sub).toBe('kc-user-1');
      });
  });

  it('/api/v1/auth/me (GET) ignores swagger placeholder realm header', () => {
    return request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer fake-token')
      .set('x-realm', 'string')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          data: {
            auth: { sub: string };
          };
        };
        expect(body.data.auth.sub).toBe('kc-user-1');
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
