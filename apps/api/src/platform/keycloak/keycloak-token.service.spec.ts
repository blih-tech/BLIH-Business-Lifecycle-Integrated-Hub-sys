import { generateKeyPairSync, sign } from 'node:crypto';
import type { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import type { JWK, JSONWebKeySet } from 'jose';
import type { KeycloakConfig } from '../../config/keycloak.config';
import { KeycloakTokenService } from './keycloak-token.service';

const JWKS_URL =
  'https://sso.example.com/realms/blih/protocol/openid-connect/certs';
const EXPECTED_ISSUER = 'https://sso.example.com/realms/blih';

type CachedJwkSetMethod = (
  jwksUrl: string,
  preferredKid?: string,
  forceRefresh?: boolean,
) => Promise<JSONWebKeySet>;

type KeycloakTokenServiceTestAccess = {
  getCachedJwkSet: CachedJwkSetMethod;
  jwksByUrl: Map<
    string,
    {
      keysByKid: Map<string, unknown>;
      lastAccessedAt: number;
    }
  >;
};

const getServiceAccess = (
  service: KeycloakTokenService,
): KeycloakTokenServiceTestAccess =>
  service as unknown as KeycloakTokenServiceTestAccess;

const createJwksResponse = (keys: JWK[]): AxiosResponse<JSONWebKeySet> =>
  ({
    data: { keys },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: {} as never },
  }) as AxiosResponse<JSONWebKeySet>;

const createDummyRsaJwk = (kid: string): JWK =>
  ({
    kid,
    kty: 'RSA',
    alg: 'RS256',
    use: 'sig',
    n: `${kid}-modulus`,
    e: 'AQAB',
  }) as JWK;

const createKeycloakConfig = (
  overrides: Partial<KeycloakConfig> = {},
): KeycloakConfig => ({
  enabled: true,
  url: 'https://sso.example.com',
  realm: 'blih',
  clientId: 'blih-system-api',
  clientSecret: 'secret',
  authClientId: 'blih-system-auth',
  authClientSecret: 'auth-secret',
  authorizationUrl: '',
  tokenUrl: '',
  logoutUrl: '',
  userInfoUrl: '',
  jwksUrl: JWKS_URL,
  authRedirectUri: 'http://localhost:5000/api/v1/auth/callback',
  authScopes: 'openid profile email',
  adminClientId: 'admin-cli',
  adminUsername: '',
  adminPassword: '',
  expectedAudience: 'blih-system-api',
  expectedIssuer: EXPECTED_ISSUER,
  trustProxyPrincipalHeaders: false,
  internalAuthSharedSecret: '',
  enforceMfaForPrivileged: false,
  policyVersion: '1.0',
  jwksCacheTtlSeconds: 60,
  jwksCacheMaxKeys: 2,
  ...overrides,
});

const createService = (configOverrides: Partial<KeycloakConfig> = {}) => {
  const httpService = {
    get: jest.fn(),
    post: jest.fn(),
  };
  const service = new KeycloakTokenService(
    httpService as never,
    createKeycloakConfig(configOverrides) as never,
  );

  return { service, httpService };
};

const createSignedAccessToken = async (
  kid: string,
  claims: {
    sub?: string;
    aud?: string | string[];
    iss?: string;
  } = {},
): Promise<{ token: string; publicJwk: JWK }> => {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const publicJwk = publicKey.export({ format: 'jwk' }) as JWK;
  publicJwk.kid = kid;
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: 'RS256', kid, typ: 'JWT' }),
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: claims.sub ?? 'kc-user-1',
      iss: claims.iss ?? EXPECTED_ISSUER,
      aud: claims.aud ?? 'blih-system-api',
      scope: 'openid profile email',
      iat: now,
      exp: now + 3600,
    }),
  ).toString('base64url');
  const signingInput = `${header}.${payload}`;
  const signature = sign('RSA-SHA256', Buffer.from(signingInput), privateKey);

  return {
    token: `${signingInput}.${signature.toString('base64url')}`,
    publicJwk,
  };
};

describe('KeycloakTokenService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reuses cached jwks entries until the ttl expires', async () => {
    const { service, httpService } = createService({
      jwksCacheTtlSeconds: 60,
    });
    const nowSpy = jest.spyOn(Date, 'now');
    let now = 1_000;
    nowSpy.mockImplementation(() => now);
    httpService.get.mockReturnValue(
      of(createJwksResponse([createDummyRsaJwk('kid-1')])),
    );

    const serviceAccess = getServiceAccess(service);

    await serviceAccess.getCachedJwkSet(JWKS_URL, 'kid-1');
    await serviceAccess.getCachedJwkSet(JWKS_URL, 'kid-1');

    expect(httpService.get).toHaveBeenCalledTimes(1);

    now = 62_000;
    await serviceAccess.getCachedJwkSet(JWKS_URL, 'kid-1');

    expect(httpService.get).toHaveBeenCalledTimes(2);
  });

  it('refreshes jwks and retries token verification once for an unknown kid', async () => {
    const { service, httpService } = createService();
    const { publicJwk: fallbackJwk } = await createSignedAccessToken('kid-old');
    const { token, publicJwk } = await createSignedAccessToken('kid-new');
    httpService.get
      .mockReturnValueOnce(of(createJwksResponse([fallbackJwk])))
      .mockReturnValueOnce(of(createJwksResponse([publicJwk])));

    const payload = await service.validateAccessToken(token, 'blih');

    expect(payload.sub).toBe('kc-user-1');
    expect(httpService.get).toHaveBeenCalledTimes(2);
  }, 15000);

  it('evicts the least recently used jwk when the cache exceeds the max key limit', async () => {
    const { service, httpService } = createService({
      jwksCacheMaxKeys: 2,
    });
    const nowSpy = jest.spyOn(Date, 'now');
    let now = 1_000;
    nowSpy.mockImplementation(() => now);
    httpService.get
      .mockReturnValueOnce(
        of(
          createJwksResponse([
            createDummyRsaJwk('kid-a'),
            createDummyRsaJwk('kid-b'),
          ]),
        ),
      )
      .mockReturnValueOnce(
        of(
          createJwksResponse([
            createDummyRsaJwk('kid-a'),
            createDummyRsaJwk('kid-b'),
            createDummyRsaJwk('kid-c'),
          ]),
        ),
      );

    const serviceAccess = getServiceAccess(service);

    await serviceAccess.getCachedJwkSet(JWKS_URL, 'kid-a');

    now = 2_000;
    await serviceAccess.getCachedJwkSet(JWKS_URL, 'kid-b');

    now = 3_000;
    await serviceAccess.getCachedJwkSet(JWKS_URL, 'kid-c', true);

    const store = serviceAccess.jwksByUrl.get(JWKS_URL);

    expect(store?.keysByKid.size).toBe(2);
    expect(store?.keysByKid.has('kid-a')).toBe(false);
    expect(store?.keysByKid.has('kid-b')).toBe(true);
    expect(store?.keysByKid.has('kid-c')).toBe(true);
  });
});
