import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { JWK, JSONWebKeySet } from 'jose';
import keycloakConfig from '../../config/keycloak.config';
import {
  KEYCLOAK_JWKS_PATH,
  KEYCLOAK_REVOKE_PATH,
  KEYCLOAK_TOKEN_PATH,
  KEYCLOAK_USERINFO_PATH,
} from './keycloak.constants';
import {
  KeycloakIdTokenValidationError,
  KeycloakTokenValidationError,
} from './keycloak.errors';
import {
  KeycloakTokenPayload,
  KeycloakTokenResponse,
  KeycloakUserInfoResponse,
} from './keycloak.types';

interface CachedJwkEntry {
  key: JWK;
  expiresAt: number;
  lastAccessedAt: number;
}

interface CachedJwksStore {
  keysByKid: Map<string, CachedJwkEntry>;
  lastAccessedAt: number;
}

@Injectable()
export class KeycloakTokenService {
  private readonly logger = new Logger(KeycloakTokenService.name);
  private readonly jwksByUrl = new Map<string, CachedJwksStore>();

  constructor(
    private readonly httpService: HttpService,
    @Inject(keycloakConfig.KEY)
    private readonly keycloak: ConfigType<typeof keycloakConfig>,
  ) {}

  async getServiceToken(
    realm = this.keycloak.realm,
  ): Promise<KeycloakTokenResponse> {
    const url = this.resolveTokenUrl(realm);
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.keycloak.clientId,
      client_secret: this.keycloak.clientSecret,
    });
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    this.logger.debug(`getServiceToken POST ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<KeycloakTokenResponse>(url, body.toString(), {
          headers,
        }),
      );
      this.logger.debug(`getServiceToken ${response.status} ${url}`);
      return response.data;
    } catch (err: unknown) {
      this.logHttpFailure('getServiceToken', url, err);
      throw err;
    }
  }

  async refreshToken(
    refreshToken: string,
    realm = this.keycloak.realm,
    clientId = this.keycloak.clientId,
    clientSecret = this.keycloak.clientSecret,
  ): Promise<KeycloakTokenResponse> {
    const url = this.resolveTokenUrl(realm);
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    this.logger.debug(`refreshToken POST ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<KeycloakTokenResponse>(url, body.toString(), {
          headers,
        }),
      );
      this.logger.debug(`refreshToken ${response.status} ${url}`);
      return response.data;
    } catch (err: unknown) {
      const { status, data } = this.readHttpError(err);
      const message =
        data?.error_description ??
        data?.error ??
        'Invalid or expired refresh token';
      this.logHttpFailure('refreshToken', url, err);
      if (status === 400) {
        throw new BadRequestException(message);
      }
      if (status != null && status >= 400 && status < 500) {
        throw new UnauthorizedException(message);
      }
      throw new UnauthorizedException(
        message || 'Refresh token request failed',
      );
    }
  }

  async getUserInfo(
    accessToken: string,
    realm = this.keycloak.realm,
  ): Promise<KeycloakUserInfoResponse> {
    const url = this.resolveUserInfoUrl(realm);
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    this.logger.debug(`getUserInfo GET ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get<KeycloakUserInfoResponse>(url, { headers }),
      );
      this.logger.debug(`getUserInfo ${response.status} ${url}`);
      return response.data;
    } catch (err: unknown) {
      this.logHttpFailure('getUserInfo', url, err);
      throw err;
    }
  }

  async exchangeToken(
    subjectToken: string,
    requestedSubject?: string,
    realm = this.keycloak.realm,
  ): Promise<KeycloakTokenResponse> {
    const url = this.resolveTokenUrl(realm);
    const params: Record<string, string> = {
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      client_id: this.keycloak.clientId,
      client_secret: this.keycloak.clientSecret,
      subject_token: subjectToken,
      requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
    };

    if (requestedSubject) {
      params.requested_subject = requestedSubject;
    }

    const body = new URLSearchParams(params);
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    this.logger.debug(`exchangeToken POST ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<KeycloakTokenResponse>(url, body.toString(), {
          headers,
        }),
      );
      this.logger.debug(`exchangeToken ${response.status} ${url}`);
      return response.data;
    } catch (err: unknown) {
      this.logHttpFailure('exchangeToken', url, err);
      throw err;
    }
  }

  async exchangeAuthorizationCode(
    code: string,
    codeVerifier: string | undefined,
    realm = this.keycloak.realm,
    clientId = this.keycloak.authClientId,
    clientSecret = this.keycloak.authClientSecret,
    redirectUri = this.keycloak.authRedirectUri,
  ): Promise<KeycloakTokenResponse> {
    const url = this.resolveTokenUrl(realm);
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });
    if (codeVerifier) {
      body.set('code_verifier', codeVerifier);
    }
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    this.logger.debug(`exchangeAuthorizationCode POST ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<KeycloakTokenResponse>(url, body.toString(), {
          headers,
        }),
      );
      this.logger.debug(`exchangeAuthorizationCode ${response.status} ${url}`);
      return response.data;
    } catch (err: unknown) {
      this.logHttpFailure('exchangeAuthorizationCode', url, err);
      throw err;
    }
  }

  async revokeToken(
    token: string,
    realm = this.keycloak.realm,
    tokenTypeHint: 'refresh_token' | 'access_token' = 'refresh_token',
    clientId = this.keycloak.clientId,
    clientSecret = this.keycloak.clientSecret,
  ): Promise<void> {
    const url = this.resolveRevokeUrl(realm);
    const body = new URLSearchParams({
      token,
      client_id: clientId,
      client_secret: clientSecret,
      token_type_hint: tokenTypeHint,
    });
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    this.logger.debug(`revokeToken POST ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, body.toString(), {
          headers,
        }),
      );
      this.logger.debug(`revokeToken ${response.status} ${url}`);
    } catch (err: unknown) {
      this.logHttpFailure('revokeToken', url, err);
      throw err;
    }
  }

  async validateAccessToken(
    token: string,
    realm = this.keycloak.realm,
  ): Promise<KeycloakTokenPayload> {
    const expectedAudience = this.keycloak.expectedAudience;

    try {
      const payload = await this.verifyJwtToken(token, realm);

      const audOk =
        payload.aud != null
          ? Array.isArray(payload.aud)
            ? payload.aud.includes(expectedAudience)
            : payload.aud === expectedAudience
          : payload.azp === expectedAudience;
      if (!audOk) {
        this.logger.debug(
          `Token audience/azp mismatch: expected=${expectedAudience}, aud=${JSON.stringify(payload.aud)}, azp=${payload.azp ?? 'none'}`,
        );
        throw new KeycloakTokenValidationError(
          'Token audience or azp does not match expected audience',
          new Error(
            `expected aud/azp: ${expectedAudience}, got aud: ${JSON.stringify(payload.aud)}, azp: ${payload.azp ?? 'none'}`,
          ),
        );
      }

      return payload;
    } catch (error) {
      if (error instanceof KeycloakTokenValidationError) {
        throw error;
      }
      this.logger.debug(
        `Token verification failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new KeycloakTokenValidationError(
        'Invalid or expired access token',
        error,
      );
    }
  }

  async validateIdToken(
    token: string,
    realm = this.keycloak.realm,
    clientId = this.keycloak.authClientId,
    expectedNonce?: string,
  ): Promise<KeycloakTokenPayload> {
    try {
      const payload = await this.verifyJwtToken(token, realm, clientId);

      if (expectedNonce && payload.nonce !== expectedNonce) {
        throw new KeycloakIdTokenValidationError(
          'ID token nonce does not match login request',
          'invalid_nonce',
          new Error(
            `expected nonce ${expectedNonce}, received ${payload.nonce ?? 'none'}`,
          ),
        );
      }

      return payload;
    } catch (error) {
      if (error instanceof KeycloakIdTokenValidationError) {
        throw error;
      }

      throw new KeycloakIdTokenValidationError(
        'Invalid ID token',
        'invalid_id_token',
        error,
      );
    }
  }

  private normalizeCompactJwtToken(token: string): string {
    return token
      .trim()
      .replace(/^['"]+|['"]+$/g, '')
      .replace(/\s+/g, '');
  }

  private assertJwtFormat(token: string): void {
    const segments = token.split('.');
    if (segments.length !== 3) {
      this.logger.debug(
        `Malformed JWT before verification: segmentCount=${segments.length}`,
      );
      throw new KeycloakTokenValidationError(
        'Invalid or expired access token',
        new Error(`Malformed JWT: expected 3 segments, got ${segments.length}`),
      );
    }

    const invalidSegment = segments.some((segment) => {
      if (!segment || !/^[A-Za-z0-9_-]+$/.test(segment)) {
        return true;
      }

      return segment.length % 4 === 1;
    });
    if (!invalidSegment) {
      return;
    }

    this.logger.debug(
      `Malformed JWT before verification: segmentLengths=${segments.map((segment) => segment.length).join('.')}`,
    );
    throw new KeycloakTokenValidationError(
      'Invalid or expired access token',
      new Error(
        `Malformed JWT: invalid base64url segment lengths ${segments
          .map((segment) => segment.length)
          .join('.')}`,
      ),
    );
  }

  private resolveIssuer(realm: string): string {
    if (this.keycloak.expectedIssuer) {
      return this.keycloak.expectedIssuer;
    }

    return `${this.trimTrailingSlashes(this.keycloak.url)}/realms/${realm}`;
  }

  private resolveRealmBaseUrl(realm: string): string {
    return `${this.trimTrailingSlashes(this.keycloak.url)}/realms/${realm}`;
  }

  private resolveTokenUrl(realm: string): string {
    return this.normalizeConfiguredUrl(
      this.keycloak.tokenUrl,
      `${this.resolveRealmBaseUrl(realm)}${KEYCLOAK_TOKEN_PATH}`,
    );
  }

  private resolveUserInfoUrl(realm: string): string {
    return this.normalizeConfiguredUrl(
      this.keycloak.userInfoUrl,
      `${this.resolveRealmBaseUrl(realm)}${KEYCLOAK_USERINFO_PATH}`,
    );
  }

  private resolveRevokeUrl(realm: string): string {
    return `${this.resolveRealmBaseUrl(realm)}${KEYCLOAK_REVOKE_PATH}`;
  }

  private resolveJwksUrl(realm: string): string {
    return this.normalizeConfiguredUrl(
      this.keycloak.jwksUrl,
      `${this.resolveRealmBaseUrl(realm)}${KEYCLOAK_JWKS_PATH}`,
    );
  }

  private normalizeConfiguredUrl(
    configuredUrl: string | undefined,
    fallbackUrl: string,
  ): string {
    const normalized = configuredUrl?.trim();
    return normalized ? normalized : fallbackUrl;
  }

  private async verifyJwtToken(
    token: string,
    realm: string,
    audience?: string,
  ): Promise<KeycloakTokenPayload> {
    const issuer = this.resolveIssuer(realm);
    const jwksUrl = this.resolveJwksUrl(realm);
    const { createLocalJWKSet, decodeProtectedHeader, jwtVerify } =
      await import('jose');
    const normalizedToken = this.normalizeCompactJwtToken(token);
    this.assertJwtFormat(normalizedToken);

    const protectedHeader = decodeProtectedHeader(normalizedToken);
    const kid =
      typeof protectedHeader.kid === 'string' && protectedHeader.kid.trim()
        ? protectedHeader.kid
        : undefined;

    try {
      const jwks = await this.getCachedJwkSet(jwksUrl, kid);
      const verification = await jwtVerify(
        normalizedToken,
        createLocalJWKSet(jwks),
        {
          issuer,
          audience,
        },
      );
      return verification.payload as KeycloakTokenPayload;
    } catch (error) {
      if (kid && this.isUnknownKidError(error)) {
        this.logger.debug(`Unknown kid ${kid}; forcing JWKS refresh`);
        const refreshedJwks = await this.getCachedJwkSet(jwksUrl, kid, true);
        const verification = await jwtVerify(
          normalizedToken,
          createLocalJWKSet(refreshedJwks),
          {
            issuer,
            audience,
          },
        );
        return verification.payload as KeycloakTokenPayload;
      }

      throw error;
    }
  }

  private async getCachedJwkSet(
    jwksUrl: string,
    preferredKid?: string,
    forceRefresh = false,
  ): Promise<JSONWebKeySet> {
    const store = await this.getOrCreateJwksStore(
      jwksUrl,
      preferredKid,
      forceRefresh,
    );
    this.touchCachedKey(store, preferredKid);

    return {
      keys: Array.from(store.keysByKid.values()).map((entry) => entry.key),
    };
  }

  private async getOrCreateJwksStore(
    jwksUrl: string,
    preferredKid?: string,
    forceRefresh = false,
  ): Promise<CachedJwksStore> {
    const now = Date.now();
    let store = this.jwksByUrl.get(jwksUrl);
    if (!store) {
      store = {
        keysByKid: new Map<string, CachedJwkEntry>(),
        lastAccessedAt: now,
      };
      this.jwksByUrl.set(jwksUrl, store);
    }
    this.evictExpiredJwksEntries(store, now);
    store.lastAccessedAt = now;

    if (
      forceRefresh ||
      store.keysByKid.size === 0 ||
      (preferredKid && !store.keysByKid.has(preferredKid))
    ) {
      await this.refreshJwksStore(jwksUrl, store, preferredKid);
    }

    return store;
  }

  private async refreshJwksStore(
    jwksUrl: string,
    store: CachedJwksStore,
    preferredKid?: string,
  ): Promise<void> {
    const response = await firstValueFrom(
      this.httpService.get<JSONWebKeySet>(jwksUrl),
    );
    const keys = Array.isArray(response.data?.keys) ? response.data.keys : [];
    const now = Date.now();
    const expiresAt = now + this.keycloak.jwksCacheTtlSeconds * 1000;
    const nextKeys = new Map<string, CachedJwkEntry>();

    this.logger.debug(`JWKS fetch ${jwksUrl}`);

    for (const jwk of keys) {
      const kid = this.getJwkIdentifier(jwk);
      nextKeys.set(kid, {
        key: jwk,
        expiresAt,
        lastAccessedAt: now,
      });
    }

    store.keysByKid = nextKeys;
    store.lastAccessedAt = now;
    this.evictLeastRecentlyUsedJwksEntry(store, preferredKid);
  }

  private evictExpiredJwksEntries(store: CachedJwksStore, now: number): void {
    for (const [key, entry] of store.keysByKid.entries()) {
      if (entry.expiresAt <= now) {
        store.keysByKid.delete(key);
      }
    }
  }

  private evictLeastRecentlyUsedJwksEntry(
    store: CachedJwksStore,
    preserveKid?: string,
  ): void {
    while (store.keysByKid.size > this.keycloak.jwksCacheMaxKeys) {
      let oldestKey: string | undefined;
      let oldestAccessedAt = Number.POSITIVE_INFINITY;

      for (const [key, entry] of store.keysByKid.entries()) {
        if (key === preserveKid) {
          continue;
        }

        if (entry.lastAccessedAt < oldestAccessedAt) {
          oldestAccessedAt = entry.lastAccessedAt;
          oldestKey = key;
        }
      }

      if (!oldestKey) {
        return;
      }

      store.keysByKid.delete(oldestKey);
    }
  }

  private touchCachedKey(store: CachedJwksStore, kid?: string): void {
    store.lastAccessedAt = Date.now();
    if (!kid) {
      return;
    }

    const entry = store.keysByKid.get(kid);
    if (entry) {
      entry.lastAccessedAt = store.lastAccessedAt;
    }
  }

  private getJwkIdentifier(jwk: JWK): string {
    if (typeof jwk.kid === 'string' && jwk.kid.trim()) {
      return jwk.kid;
    }

    return JSON.stringify({
      kty: jwk.kty,
      crv: jwk.crv,
      x: jwk.x,
      y: jwk.y,
      n: jwk.n,
      e: jwk.e,
    });
  }

  private isUnknownKidError(error: unknown): boolean {
    return (
      error instanceof Error &&
      /kid|no applicable key|no matching key/i.test(error.message)
    );
  }

  private trimTrailingSlashes(value: string): string {
    return value.trim().replace(/\/+$/, '');
  }

  private readHttpError(error: unknown): {
    status?: number;
    data?: { error?: string; error_description?: string };
  } {
    if (!error || typeof error !== 'object' || !('response' in error)) {
      return {};
    }

    const response = (
      error as {
        response?: {
          status?: number;
          data?: unknown;
        };
      }
    ).response;
    if (!response) {
      return {};
    }

    return {
      status: response.status,
      data:
        response.data &&
        typeof response.data === 'object' &&
        !Array.isArray(response.data)
          ? (response.data as { error?: string; error_description?: string })
          : undefined,
    };
  }

  private logHttpFailure(action: string, url: string, error: unknown): void {
    const { status, data } = this.readHttpError(error);
    this.logger.warn(
      `${action} failed: ${status ?? 'n/a'} ${url} - ${data?.error ?? data?.error_description ?? (error instanceof Error ? error.message : String(error))}`,
    );
  }
}
