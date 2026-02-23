import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KeycloakAuthGuard } from './keycloak-auth.guard';
import { AuthPrincipal } from '../interfaces/auth-principal.interface';

const createHttpContext = (headers: Record<string, string>) => {
  const request: {
    headers: Record<string, string>;
    user?: unknown;
  } = {
    headers,
  };

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getClass: () => ({}),
    getHandler: () => ({}),
  } as unknown as ExecutionContext;

  return { context, request };
};

describe('KeycloakAuthGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(false),
  } as unknown as Reflector;

  const mapper = {
    toPrincipal: jest.fn(),
  };

  const principalEnrichment = {
    getContext: jest.fn(),
  };

  const userPermissionSnapshot = {
    getPersistedPermissions: jest.fn(),
  };

  const tokenService = {
    validateAccessToken: jest.fn(),
    getUserInfo: jest.fn(),
  };

  const baseKeycloakConfig = {
    realm: 'blih',
    trustProxyPrincipalHeaders: false,
    internalAuthSharedSecret: '',
    enforceMfaForPrivileged: false,
    policyVersion: '1.0',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    principalEnrichment.getContext.mockResolvedValue({});
    userPermissionSnapshot.getPersistedPermissions.mockResolvedValue([]);
    tokenService.getUserInfo.mockResolvedValue({});
  });

  it('hydrates subject from userinfo when token payload lacks sub', async () => {
    tokenService.validateAccessToken.mockResolvedValue({
      iss: 'http://localhost:8080/realms/blih',
      azp: 'blih-system-api',
      realm_access: { roles: ['hr_manager'] },
      scope: 'openid roles',
    });
    tokenService.getUserInfo.mockResolvedValue({
      sub: 'user-1',
      preferred_username: 'user1',
    });
    mapper.toPrincipal.mockReturnValue({
      sub: '',
      email: '',
      realm: 'blih',
      policyVersion: '1.0',
      roles: ['hr_manager'],
      permissions: [],
      scopes: ['openid', 'roles'],
    });

    const guard = new KeycloakAuthGuard(
      reflector,
      tokenService as never,
      mapper as never,
      principalEnrichment as never,
      userPermissionSnapshot as never,
      baseKeycloakConfig as never,
    );
    const { context, request } = createHttpContext({
      authorization: 'Bearer valid-token',
    });

    const allowed = await guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(tokenService.getUserInfo).toHaveBeenCalledWith(
      'valid-token',
      'blih',
    );
    const principal = request.user as AuthPrincipal;
    expect(principal.sub).toBe('user-1');
    expect(principal.email).toBe('user1');
  });

  it('rejects request when subject is still missing after userinfo fallback', async () => {
    tokenService.validateAccessToken.mockResolvedValue({
      iss: 'http://localhost:8080/realms/blih',
      azp: 'blih-system-api',
      realm_access: { roles: ['hr_manager'] },
      scope: 'openid roles',
    });
    tokenService.getUserInfo.mockResolvedValue({});
    mapper.toPrincipal.mockReturnValue({
      sub: '',
      email: '',
      realm: 'blih',
      policyVersion: '1.0',
      roles: ['hr_manager'],
      permissions: [],
      scopes: ['openid', 'roles'],
    });

    const guard = new KeycloakAuthGuard(
      reflector,
      tokenService as never,
      mapper as never,
      principalEnrichment as never,
      userPermissionSnapshot as never,
      baseKeycloakConfig as never,
    );
    const { context } = createHttpContext({
      authorization: 'Bearer valid-token',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      'Invalid principal subject',
    );
  });

  it('allows superadmin without amr when privileged MFA enforcement is disabled', async () => {
    tokenService.validateAccessToken.mockResolvedValue({
      sub: 'admin-1',
      iss: 'http://localhost:8080/realms/blih',
      azp: 'blih-system-api',
      realm_access: { roles: ['superadmin'] },
      scope: 'openid roles',
      amr: [],
    });
    mapper.toPrincipal.mockReturnValue({
      sub: 'admin-1',
      email: 'admin@example.com',
      realm: 'blih',
      policyVersion: '1.0',
      roles: ['superadmin'],
      permissions: [],
      scopes: ['openid', 'roles'],
    });

    const guard = new KeycloakAuthGuard(
      reflector,
      tokenService as never,
      mapper as never,
      principalEnrichment as never,
      userPermissionSnapshot as never,
      {
        ...baseKeycloakConfig,
        enforceMfaForPrivileged: false,
      } as never,
    );
    const { context } = createHttpContext({
      authorization: 'Bearer valid-token',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('always resolves configured realm and ignores x-realm override header', async () => {
    tokenService.validateAccessToken.mockResolvedValue({
      sub: 'user-1',
      iss: 'http://localhost:8080/realms/blih',
      azp: 'blih-system-api',
      realm_access: { roles: ['hr_manager'] },
      scope: 'openid roles',
    });
    mapper.toPrincipal.mockReturnValue({
      sub: 'user-1',
      email: 'user1@example.com',
      realm: 'blih',
      policyVersion: '1.0',
      roles: ['hr_manager'],
      permissions: [],
      scopes: ['openid', 'roles'],
    });

    const guard = new KeycloakAuthGuard(
      reflector,
      tokenService as never,
      mapper as never,
      principalEnrichment as never,
      userPermissionSnapshot as never,
      baseKeycloakConfig as never,
    );
    const { context } = createHttpContext({
      authorization: 'Bearer valid-token',
      'x-realm': 'other-realm',
      'x-principal-realm': 'another-realm',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(tokenService.validateAccessToken).toHaveBeenCalledWith(
      'valid-token',
      'blih',
    );
  });
});
