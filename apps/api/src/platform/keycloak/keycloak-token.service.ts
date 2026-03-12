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
import keycloakConfig from '../../config/keycloak.config';
import {
  KEYCLOAK_JWKS_PATH,
  KEYCLOAK_REVOKE_PATH,
  KEYCLOAK_TOKEN_PATH,
  KEYCLOAK_USERINFO_PATH,
} from './keycloak.constants';
import { KeycloakTokenValidationError } from './keycloak.errors';
import {
  KeycloakTokenPayload,
  KeycloakTokenResponse,
  KeycloakUserInfoResponse,
} from './keycloak.types';

@Injectable()
export class KeycloakTokenService {
  private readonly logger = new Logger(KeycloakTokenService.name);
  private readonly jwksByIssuer = new Map<string, unknown>();

  constructor(
    private readonly httpService: HttpService,
    @Inject(keycloakConfig.KEY)
    private readonly keycloak: ConfigType<typeof keycloakConfig>,
  ) {}

  async getServiceToken(
    realm = this.keycloak.realm,
  ): Promise<KeycloakTokenResponse> {
    const url = `${this.realmBaseUrl(realm)}${KEYCLOAK_TOKEN_PATH}`;
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
      const ax =
        err && typeof err === 'object' && 'response' in err
          ? (
              err as {
                response?: {
                  status?: number;
                  data?: unknown;
                };
              }
            ).response
          : undefined;
      const status = ax?.status;
      const data = ax?.data as
        | { error?: string; error_description?: string }
        | undefined;
      this.logger.warn(
        `getServiceToken failed: ${status ?? 'n/a'} ${url} - ${data?.error ?? data?.error_description ?? (err instanceof Error ? err.message : String(err))}`,
      );
      throw err;
    }
  }

  async refreshToken(
    refreshToken: string,
    realm = this.keycloak.realm,
  ): Promise<KeycloakTokenResponse> {
    const url = `${this.realmBaseUrl(realm)}${KEYCLOAK_TOKEN_PATH}`;
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.keycloak.clientId,
      client_secret: this.keycloak.clientSecret,
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
      const ax =
        err && typeof err === 'object' && 'response' in err
          ? (
              err as {
                response?: {
                  status?: number;
                  data?: unknown;
                };
              }
            ).response
          : undefined;
      const status = ax?.status;
      const data = ax?.data as
        | { error?: string; error_description?: string }
        | undefined;
      const message =
        data?.error_description ??
        data?.error ??
        'Invalid or expired refresh token';
      this.logger.warn(
        `refreshToken failed: ${status ?? 'n/a'} ${url} - ${data?.error ?? data?.error_description ?? (err instanceof Error ? err.message : String(err))}`,
      );
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
    const url = `${this.realmBaseUrl(realm)}${KEYCLOAK_USERINFO_PATH}`;
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
      const ax =
        err && typeof err === 'object' && 'response' in err
          ? (
              err as {
                response?: {
                  status?: number;
                  data?: unknown;
                };
              }
            ).response
          : undefined;
      const status = ax?.status;
      const data = ax?.data as
        | { error?: string; error_description?: string }
        | undefined;
      this.logger.warn(
        `getUserInfo failed: ${status ?? 'n/a'} ${url} - ${data?.error ?? data?.error_description ?? (err instanceof Error ? err.message : String(err))}`,
      );
      throw err;
    }
  }

  async exchangeToken(
    subjectToken: string,
    requestedSubject?: string,
    realm = this.keycloak.realm,
  ): Promise<KeycloakTokenResponse> {
    const url = `${this.realmBaseUrl(realm)}${KEYCLOAK_TOKEN_PATH}`;
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
      const ax =
        err && typeof err === 'object' && 'response' in err
          ? (
              err as {
                response?: {
                  status?: number;
                  data?: unknown;
                };
              }
            ).response
          : undefined;
      const status = ax?.status;
      const data = ax?.data as
        | { error?: string; error_description?: string }
        | undefined;
      this.logger.warn(
        `exchangeToken failed: ${status ?? 'n/a'} ${url} - ${data?.error ?? data?.error_description ?? (err instanceof Error ? err.message : String(err))}`,
      );
      throw err;
    }
  }

  async exchangeAuthorizationCode(
    code: string,
    codeVerifier: string,
    realm = this.keycloak.realm,
    clientId = this.keycloak.authClientId,
    clientSecret = this.keycloak.authClientSecret,
    redirectUri = this.keycloak.authRedirectUri,
  ): Promise<KeycloakTokenResponse> {
    const url = `${this.realmBaseUrl(realm)}${KEYCLOAK_TOKEN_PATH}`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });
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
      const ax =
        err && typeof err === 'object' && 'response' in err
          ? (
              err as {
                response?: {
                  status?: number;
                  data?: unknown;
                };
              }
            ).response
          : undefined;
      const status = ax?.status;
      const data = ax?.data as
        | { error?: string; error_description?: string }
        | undefined;
      this.logger.warn(
        `exchangeAuthorizationCode failed: ${status ?? 'n/a'} ${url} - ${data?.error ?? data?.error_description ?? (err instanceof Error ? err.message : String(err))}`,
      );
      throw err;
    }
  }

  async revokeToken(
    token: string,
    realm = this.keycloak.realm,
    tokenTypeHint: 'refresh_token' | 'access_token' = 'refresh_token',
  ): Promise<void> {
    const url = `${this.realmBaseUrl(realm)}${KEYCLOAK_REVOKE_PATH}`;
    const body = new URLSearchParams({
      token,
      client_id: this.keycloak.clientId,
      client_secret: this.keycloak.clientSecret,
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
      const ax =
        err && typeof err === 'object' && 'response' in err
          ? (
              err as {
                response?: {
                  status?: number;
                  data?: unknown;
                };
              }
            ).response
          : undefined;
      const status = ax?.status;
      const data = ax?.data as
        | { error?: string; error_description?: string }
        | undefined;
      this.logger.warn(
        `revokeToken failed: ${status ?? 'n/a'} ${url} - ${data?.error ?? data?.error_description ?? (err instanceof Error ? err.message : String(err))}`,
      );
      throw err;
    }
  }

  async validateAccessToken(
    token: string,
    realm = this.keycloak.realm,
  ): Promise<KeycloakTokenPayload> {
    const issuer = this.resolveIssuer(realm);
    const jwksUrl = `${this.realmBaseUrl(realm)}${KEYCLOAK_JWKS_PATH}`;
    this.logger.debug(
      `validateAccessToken realm=${realm} issuer=${issuer} jwksUrl=${jwksUrl} expectedAudience=${this.keycloak.expectedAudience}`,
    );

    const { jwtVerify, createRemoteJWKSet } = await import('jose');
    const jwks = this.getOrCreateJwks(issuer, realm, createRemoteJWKSet);
    const expectedAudience = this.keycloak.expectedAudience;

    try {
      const normalizedToken = this.normalizeCompactJwtToken(token);
      const segments = normalizedToken.split('.');
      if (segments.length !== 3) {
        this.logger.debug(
          `Malformed JWT before verification: segmentCount=${segments.length}`,
        );
        throw new KeycloakTokenValidationError(
          'Invalid or expired access token',
          new Error(
            `Malformed JWT: expected 3 segments, got ${segments.length}`,
          ),
        );
      }

      const invalidSegment = segments.some((segment) => {
        if (!segment || !/^[A-Za-z0-9_-]+$/.test(segment)) {
          return true;
        }

        // Base64URL segment length cannot be congruent to 1 modulo 4.
        return segment.length % 4 === 1;
      });
      if (invalidSegment) {
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

      // Verify signature and issuer only; jose requires 'aud' when audience is passed, but
      // Keycloak may issue tokens with azp and no aud, so we validate audience/azp after.
      const verification = await jwtVerify(normalizedToken, jwks as any, {
        issuer,
      });
      const payload = verification.payload as KeycloakTokenPayload;

      // Accept token if aud contains expected audience, or (when aud is missing) azp matches
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

  private normalizeCompactJwtToken(token: string): string {
    return token
      .trim()
      .replace(/^['"]+|['"]+$/g, '')
      .replace(/\s+/g, '');
  }

  private resolveIssuer(realm: string): string {
    if (this.keycloak.expectedIssuer) {
      return this.keycloak.expectedIssuer;
    }

    return `${this.keycloak.url}/realms/${realm}`;
  }

  private getOrCreateJwks(
    issuer: string,
    realm: string,
    createRemoteJWKSet: (url: URL) => unknown,
  ): unknown {
    const cached = this.jwksByIssuer.get(issuer);
    if (cached) {
      return cached;
    }

    const jwksUrl = new URL(`${this.realmBaseUrl(realm)}${KEYCLOAK_JWKS_PATH}`);
    this.logger.debug(`JWKS fetch ${jwksUrl.toString()}`);
    const remote = createRemoteJWKSet(jwksUrl);
    this.jwksByIssuer.set(issuer, remote);
    return remote;
  }

  private realmBaseUrl(realm: string): string {
    return `${this.keycloak.url}/realms/${realm}`;
  }
}
