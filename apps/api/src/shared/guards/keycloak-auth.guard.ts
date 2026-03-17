import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ConfigType } from '@nestjs/config';
import keycloakConfig from '../../config/keycloak.config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthPrincipal } from '../interfaces/auth-principal.interface';
import { extractBearerToken } from '../../platform/keycloak/utils/token.util';
import { KeycloakTokenValidationError } from '../../platform/keycloak/keycloak.errors';
import { KeycloakTokenService } from '../../platform/keycloak/keycloak-token.service';
import { KeycloakMapperService } from '../../platform/keycloak/keycloak-mapper.service';
import { PrincipalEnrichmentService } from '../../platform/keycloak/principal-enrichment.service';
import type {
  KeycloakProfileClaims,
  KeycloakTokenPayload,
  KeycloakUserInfoResponse,
} from '../../platform/keycloak/keycloak.types';
import { UserPermissionSnapshotService } from '../../core/rbac/user-permission-snapshot.service';
import { AUTH_COOKIE_NAMES, readCookie } from '../../core/auth/utils/oidc.util';
import { buildRequestContext } from '../utils/request.util';
import { AUDIT_ACTIONS } from '../constants/audit-actions.constant';

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  private readonly logger = new Logger(KeycloakAuthGuard.name);
  private readonly privilegedRoles = new Set(['superadmin']);

  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: KeycloakTokenService,
    private readonly mapper: KeycloakMapperService,
    private readonly principalEnrichment: PrincipalEnrichmentService,
    private readonly userPermissionSnapshot: UserPermissionSnapshotService,
    @Inject(keycloakConfig.KEY)
    private readonly keycloak: ConfigType<typeof keycloakConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: unknown;
    }>();

    const trustedPrincipal = this.resolveTrustedPrincipal(request.headers);
    if (trustedPrincipal) {
      request.user = await this.enrichPrincipal(trustedPrincipal, {
        sub: trustedPrincipal.sub,
        email: trustedPrincipal.email,
      });
      return true;
    }

    const token = this.resolveAccessToken(request.headers);
    const realm = this.resolveRealm();

    let payload: KeycloakTokenPayload;
    try {
      payload = await this.tokenService.validateAccessToken(token, realm);
    } catch (error) {
      if (error instanceof KeycloakTokenValidationError) {
        const requestContext = buildRequestContext(
          request as unknown as Parameters<typeof buildRequestContext>[0],
        );
        this.logger.warn(
          JSON.stringify({
            action: AUDIT_ACTIONS.AUTH_TOKEN_VALIDATION_FAILURE,
            timestamp: new Date().toISOString(),
            requestId: requestContext.requestId,
            ipAddress: requestContext.ipAddress,
            userAgent: requestContext.userAgent,
            reason: error.message,
          }),
        );
        throw new UnauthorizedException('Invalid or expired access token');
      }
      throw error;
    }

    let profileClaims = this.claimsFromTokenPayload(payload);
    if (!profileClaims.sub || this.shouldLoadUserInfo(profileClaims)) {
      profileClaims = await this.loadUserInfoClaims(
        token,
        realm,
        profileClaims,
      );
    }

    let principal = this.mapper.toPrincipal(payload, realm);
    principal = this.hydratePrincipalSubject(principal, profileClaims);
    this.enforcePrivilegedMfa(principal.roles, payload.amr ?? []);

    request.user = await this.enrichPrincipal(principal, profileClaims);
    return true;
  }

  private hydratePrincipalSubject(
    principal: AuthPrincipal,
    claims: KeycloakProfileClaims,
  ): AuthPrincipal {
    if (principal.sub && principal.email && principal.username) {
      return principal;
    }

    return {
      ...principal,
      sub: principal.sub || claims.sub || '',
      username: principal.username || claims.username,
      email: principal.email || claims.email || claims.username || '',
    };
  }

  private async enrichPrincipal(
    principal: AuthPrincipal,
    profileClaims: KeycloakProfileClaims,
  ): Promise<AuthPrincipal> {
    if (!principal.sub) {
      throw new UnauthorizedException('Invalid principal subject');
    }

    const contextData = await this.principalEnrichment.getContext(
      principal.sub,
      profileClaims,
    );
    const permissions =
      await this.userPermissionSnapshot.getPersistedPermissions(principal.sub);

    return {
      ...principal,
      permissions,
      userId: contextData.userId ?? principal.sub,
      username:
        principal.username || contextData.username || profileClaims.username,
      email:
        principal.email ||
        contextData.email ||
        profileClaims.email ||
        profileClaims.username ||
        '',
      firstName: contextData.firstName || profileClaims.firstName,
      lastName: contextData.lastName || profileClaims.lastName,
      phone: contextData.phone,
      status: contextData.status ?? 'ACTIVE',
      departmentId: contextData.departmentId ?? null,
    };
  }

  private resolveTrustedPrincipal(
    headers: Record<string, string | string[] | undefined>,
  ): AuthPrincipal | null {
    const principalSub = this.getHeader(headers, 'x-principal-sub');
    if (!principalSub) {
      return null;
    }

    if (!this.keycloak.trustProxyPrincipalHeaders) {
      throw new UnauthorizedException(
        'Trusted principal headers are not enabled',
      );
    }

    const sharedSecret = this.keycloak.internalAuthSharedSecret;
    if (!sharedSecret) {
      throw new UnauthorizedException(
        'INTERNAL_AUTH_SHARED_SECRET is required when trusting principal headers',
      );
    }

    const providedSecret = this.getHeader(headers, 'x-internal-auth');
    if (providedSecret !== sharedSecret) {
      throw new UnauthorizedException('Invalid internal auth signature');
    }

    const roles = this.parseListHeader(headers, 'x-principal-roles');
    const amr = this.parseListHeader(headers, 'x-principal-amr');
    this.enforcePrivilegedMfa(roles, amr);

    return {
      sub: principalSub,
      email: this.getHeader(headers, 'x-principal-email') ?? '',
      realm: this.resolveRealm(),
      policyVersion:
        this.getHeader(headers, 'x-principal-policy-version') ??
        this.keycloak.policyVersion,
      roles,
      permissions: [],
      scopes: this.parseListHeader(headers, 'x-principal-scopes'),
      sessionId: this.getHeader(headers, 'x-principal-session-id') ?? undefined,
      clientId: this.getHeader(headers, 'x-principal-client-id') ?? undefined,
    };
  }

  private enforcePrivilegedMfa(roles: string[], amr?: string[]): void {
    if (!this.keycloak.enforceMfaForPrivileged) {
      return;
    }

    const hasPrivilegedRole = (roles ?? []).some((role) =>
      this.privilegedRoles.has(role.toLowerCase()),
    );
    if (!hasPrivilegedRole) {
      return;
    }

    const hasMfa = (amr ?? []).some((method) => method.toLowerCase() === 'mfa');
    if (!hasMfa) {
      this.logger.warn(
        'Blocked privileged principal without MFA in token/auth context',
      );
      throw new UnauthorizedException('MFA is required for privileged roles');
    }
  }

  private resolveRealm(): string {
    return this.keycloak.realm;
  }

  private claimsFromTokenPayload(
    payload: KeycloakTokenPayload,
  ): KeycloakProfileClaims {
    return {
      sub: this.clean(payload.sub),
      email: this.clean(payload.email),
      username: this.clean(payload.preferred_username),
      firstName: this.clean(payload.given_name),
      lastName: this.clean(payload.family_name),
      fullName: this.clean(payload.name),
    };
  }

  private claimsFromUserInfo(
    userInfo: KeycloakUserInfoResponse,
  ): KeycloakProfileClaims {
    return {
      sub: this.clean(userInfo.sub),
      email: this.clean(userInfo.email),
      username: this.clean(userInfo.preferred_username),
      firstName: this.clean(userInfo.given_name),
      lastName: this.clean(userInfo.family_name),
      fullName: this.clean(userInfo.name),
    };
  }

  private mergeClaims(
    baseClaims: KeycloakProfileClaims,
    fallbackClaims: KeycloakProfileClaims,
  ): KeycloakProfileClaims {
    return {
      sub: baseClaims.sub || fallbackClaims.sub,
      email: baseClaims.email || fallbackClaims.email,
      username: baseClaims.username || fallbackClaims.username,
      firstName: baseClaims.firstName || fallbackClaims.firstName,
      lastName: baseClaims.lastName || fallbackClaims.lastName,
      fullName: baseClaims.fullName || fallbackClaims.fullName,
    };
  }

  private shouldLoadUserInfo(claims: KeycloakProfileClaims): boolean {
    return (
      !claims.email || !claims.username || !claims.firstName || !claims.lastName
    );
  }

  private async loadUserInfoClaims(
    token: string,
    realm: string,
    existingClaims: KeycloakProfileClaims,
  ): Promise<KeycloakProfileClaims> {
    if (!existingClaims.sub) {
      this.logger.debug(
        'Token missing sub claim; attempting userinfo subject fallback',
      );
    }

    try {
      const userInfo = await this.tokenService.getUserInfo(token, realm);
      return this.mergeClaims(
        existingClaims,
        this.claimsFromUserInfo(userInfo),
      );
    } catch (error) {
      this.logger.warn(
        `Userinfo fallback failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return existingClaims;
    }
  }

  private clean(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      if (typeof value === 'number' || typeof value === 'boolean') {
        const normalized = String(value).trim();
        return normalized.length > 0 ? normalized : undefined;
      }

      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private resolveAccessToken(
    headers: Record<string, string | string[] | undefined>,
  ): string {
    const cookieToken = readCookie({ headers }, AUTH_COOKIE_NAMES.access);
    if (cookieToken) {
      return cookieToken;
    }

    const authorization = this.getHeader(headers, 'authorization');
    return extractBearerToken(authorization);
  }

  private getHeader(
    headers: Record<string, string | string[] | undefined>,
    key: string,
  ): string | undefined {
    const value = headers[key];
    return Array.isArray(value) ? value[0] : value;
  }

  private parseListHeader(
    headers: Record<string, string | string[] | undefined>,
    key: string,
  ): string[] {
    const raw = this.getHeader(headers, key);
    if (!raw) {
      return [];
    }

    return raw
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
}
