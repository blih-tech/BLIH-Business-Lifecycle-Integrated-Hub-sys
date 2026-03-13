import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Audit } from '../../shared/decorators/audit.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { AUDIT_ACTIONS } from '../../shared/constants/audit-actions.constant';
import { buildRequestContext } from '../../shared/utils/request.util';
import type {
  AuthCallbackQueryDto as AuthCallbackQueryDtoType,
  AuthLoginQueryDto as AuthLoginQueryDtoType,
  AuthLogoutQueryDto as AuthLogoutQueryDtoType,
} from '@repo/types';
import { ExchangeTokenRequestDto } from './dto/exchange-token-request.dto';
import { IntrospectTokenRequestDto } from './dto/introspect-token-request.dto';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';
import { RevokeSessionRequestDto } from './dto/revoke-session-request.dto';
import { RevokeSessionResponseDto } from './dto/revoke-session-response.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { ValidateTokenRequestDto } from './dto/validate-token-request.dto';
import { AuthMeResponseDto } from './dto/auth-me-response.dto';
import { ExchangeTokenUseCase } from './use-cases/exchange-token.usecase';
import { IntrospectTokenUseCase } from './use-cases/introspect-token.usecase';
import { RevokeSessionUseCase } from './use-cases/revoke-session.usecase';
import { ValidateTokenUseCase } from './use-cases/validate-token.usecase';
import { KeycloakTokenService } from '../../platform/keycloak/keycloak-token.service';
import { env } from '../../config/env.config';
import { AuthPrincipal } from '../../shared/interfaces/auth-principal.interface';
import {
  AUTH_COOKIE_NAMES,
  buildAuthorizeUrl,
  buildClearCookieOptions,
  buildCookieOptions,
  buildEndSessionUrl,
  createOidcAuthRequestContext,
  readCookie,
  resolveSafeRedirectPath,
} from './utils/oidc.util';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly introspectTokenUseCase: IntrospectTokenUseCase,
    private readonly exchangeTokenUseCase: ExchangeTokenUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
    private readonly tokenService: KeycloakTokenService,
  ) {}

  @Public()
  @Get('login')
  @Audit(AUDIT_ACTIONS.AUTH_LOGIN_INITIATED, 'system.auth')
  @ApiOperation({
    summary: 'Start Keycloak authorization code login',
    description:
      'Generates PKCE + state values, stores transient cookies, and redirects to the Keycloak authorize endpoint.',
  })
  @ApiQuery({
    name: 'redirect',
    required: false,
    description: 'Relative URL path used after successful login.',
    example: '/dashboard',
  })
  @ApiQuery({
    name: 'prompt',
    required: false,
    description: 'Optional OIDC prompt forwarded to Keycloak.',
    example: 'login',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects browser to Keycloak authorization endpoint.',
    headers: {
      Location: {
        description: 'Keycloak authorize URL.',
        schema: { type: 'string' },
      },
      'Set-Cookie': {
        description:
          'Transient OIDC cookies: kc_state, kc_verifier, kc_redirect.',
        schema: { type: 'string' },
      },
    },
  })
  login(
    @Query('redirect')
    redirectPath: AuthLoginQueryDtoType['redirect'] | undefined,
    @Query('prompt') prompt: AuthLoginQueryDtoType['prompt'] | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ): void {
    const authRequest = createOidcAuthRequestContext();
    const safeRedirectPath = resolveSafeRedirectPath(
      redirectPath,
      env.AUTH_POST_LOGIN_REDIRECT_URI,
    );
    const authorizeUrl = buildAuthorizeUrl({
      keycloakUrl: env.KEYCLOAK_URL,
      realm: env.KEYCLOAK_REALM,
      clientId: env.KEYCLOAK_AUTH_CLIENT_ID,
      redirectUri: env.KEYCLOAK_AUTH_REDIRECT_URI,
      scopes: env.KEYCLOAK_AUTH_SCOPES,
      state: authRequest.state,
      codeChallenge: authRequest.codeChallenge,
      prompt,
    });

    const transientCookieMaxAge = env.AUTH_STATE_TTL_SECONDS * 1000;
    const cookieOptions = buildCookieOptions(
      env.AUTH_COOKIE_SECURE,
      env.AUTH_COOKIE_SAME_SITE,
      transientCookieMaxAge,
    );

    response.cookie(AUTH_COOKIE_NAMES.state, authRequest.state, cookieOptions);
    response.cookie(
      AUTH_COOKIE_NAMES.verifier,
      authRequest.codeVerifier,
      cookieOptions,
    );
    response.cookie(
      AUTH_COOKIE_NAMES.redirect,
      safeRedirectPath,
      cookieOptions,
    );

    this.logAuthEvent(request, AUDIT_ACTIONS.AUTH_LOGIN_INITIATED, {
      redirectPath: safeRedirectPath,
    });

    response.redirect(302, authorizeUrl);
  }

  @Public()
  @Get('callback')
  @ApiOperation({
    summary: 'Handle Keycloak authorization callback',
    description:
      'Validates callback state, exchanges authorization code for tokens, sets auth cookies, and redirects the browser.',
  })
  @ApiQuery({
    name: 'code',
    required: false,
    description: 'Authorization code returned by Keycloak.',
    schema: { type: 'string' },
  })
  @ApiQuery({
    name: 'state',
    required: false,
    description: 'Opaque state value returned by Keycloak.',
    schema: { type: 'string' },
  })
  @ApiResponse({
    status: 302,
    description:
      'Redirects to success page or login error page depending on callback outcome.',
    headers: {
      Location: {
        description:
          'Redirect target after callback processing (success or error).',
        schema: { type: 'string' },
      },
      'Set-Cookie': {
        description:
          'Auth cookies on success (kc_access/kc_refresh/kc_id) and transient cookie cleanup.',
        schema: { type: 'string' },
      },
    },
  })
  async callback(
    @Query('code') code: AuthCallbackQueryDtoType['code'] | undefined,
    @Query('state') state: AuthCallbackQueryDtoType['state'] | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const storedState = readCookie(request, AUTH_COOKIE_NAMES.state);
    const codeVerifier = readCookie(request, AUTH_COOKIE_NAMES.verifier);
    const requestedRedirectPath = readCookie(
      request,
      AUTH_COOKIE_NAMES.redirect,
    );
    const loginErrorPath = resolveSafeRedirectPath(
      undefined,
      env.AUTH_LOGIN_ERROR_REDIRECT_URI,
    );

    if (
      !code ||
      !state ||
      !storedState ||
      state !== storedState ||
      !codeVerifier
    ) {
      this.clearTransientCookies(response);
      this.logAuthEvent(request, AUDIT_ACTIONS.AUTH_CALLBACK_FAILURE, {
        reason: 'invalid_state_or_missing_cookie',
      });
      response.redirect(302, loginErrorPath);
      return;
    }

    try {
      const tokenResponse = await this.tokenService.exchangeAuthorizationCode(
        code,
        codeVerifier,
        env.KEYCLOAK_REALM,
        env.KEYCLOAK_AUTH_CLIENT_ID,
        env.KEYCLOAK_AUTH_CLIENT_SECRET,
        env.KEYCLOAK_AUTH_REDIRECT_URI,
      );

      response.cookie(
        AUTH_COOKIE_NAMES.access,
        tokenResponse.access_token,
        buildCookieOptions(
          env.AUTH_COOKIE_SECURE,
          env.AUTH_COOKIE_SAME_SITE,
          (tokenResponse.expires_in ?? 300) * 1000,
        ),
      );

      if (tokenResponse.refresh_token) {
        response.cookie(
          AUTH_COOKIE_NAMES.refresh,
          tokenResponse.refresh_token,
          buildCookieOptions(
            env.AUTH_COOKIE_SECURE,
            env.AUTH_COOKIE_SAME_SITE,
            (tokenResponse.refresh_expires_in ?? 1800) * 1000,
          ),
        );
      }

      if (tokenResponse.id_token) {
        response.cookie(
          AUTH_COOKIE_NAMES.id,
          tokenResponse.id_token,
          buildCookieOptions(
            env.AUTH_COOKIE_SECURE,
            env.AUTH_COOKIE_SAME_SITE,
            (tokenResponse.refresh_expires_in ??
              tokenResponse.expires_in ??
              1800) * 1000,
          ),
        );
      }

      this.clearTransientCookies(response);
      this.logAuthEvent(request, AUDIT_ACTIONS.AUTH_TOKEN_EXCHANGE_SUCCESS, {
        hasRefreshToken: Boolean(tokenResponse.refresh_token),
        hasIdToken: Boolean(tokenResponse.id_token),
      });
      this.logAuthEvent(request, AUDIT_ACTIONS.AUTH_CALLBACK_SUCCESS);

      const successRedirectPath = resolveSafeRedirectPath(
        requestedRedirectPath,
        env.AUTH_POST_LOGIN_REDIRECT_URI,
      );
      response.redirect(302, successRedirectPath);
    } catch (error: unknown) {
      this.clearTransientCookies(response);

      const keycloakError = this.extractKeycloakErrorCode(error);
      const errorCode =
        keycloakError === 'invalid_grant' ? 'invalid_code' : 'token_exchange';
      this.logAuthEvent(request, AUDIT_ACTIONS.AUTH_TOKEN_EXCHANGE_FAILURE, {
        keycloakError: keycloakError ?? 'unknown',
      });
      this.logAuthEvent(request, AUDIT_ACTIONS.AUTH_CALLBACK_FAILURE, {
        reason: errorCode,
      });

      response.redirect(302, this.appendErrorCode(loginErrorPath, errorCode));
    }
  }

  @Public()
  @Get('logout')
  @Audit(AUDIT_ACTIONS.AUTH_LOGOUT, 'system.auth')
  @ApiOperation({
    summary: 'Logout current browser session',
    description:
      'Clears auth cookies, optionally revokes refresh token, and redirects through Keycloak end-session when an ID token is present.',
  })
  @ApiQuery({
    name: 'redirect',
    required: false,
    description: 'Relative URL path used after logout completion.',
    example: '/login',
  })
  @ApiResponse({
    status: 302,
    description:
      'Redirects to Keycloak logout endpoint or local post-logout URL.',
    headers: {
      Location: {
        description: 'Keycloak logout URL or local post-logout redirect URL.',
        schema: { type: 'string' },
      },
      'Set-Cookie': {
        description: 'Clears auth and transient cookies.',
        schema: { type: 'string' },
      },
    },
  })
  async logout(
    @Query('redirect')
    redirectPath: AuthLogoutQueryDtoType['redirect'] | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const refreshToken = readCookie(request, AUTH_COOKIE_NAMES.refresh);
    const idToken = readCookie(request, AUTH_COOKIE_NAMES.id);
    const safePostLogoutPath = resolveSafeRedirectPath(
      redirectPath,
      env.AUTH_POST_LOGOUT_REDIRECT_URI,
    );

    if (refreshToken) {
      try {
        await this.tokenService.revokeToken(
          refreshToken,
          env.KEYCLOAK_REALM,
          'refresh_token',
        );
      } catch (error: unknown) {
        this.logger.warn(
          `Refresh token revocation failed during logout: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    this.clearAuthCookies(response);
    this.clearTransientCookies(response);
    this.logAuthEvent(request, AUDIT_ACTIONS.AUTH_LOGOUT, {
      hasIdToken: Boolean(idToken),
    });

    if (!idToken) {
      response.redirect(302, safePostLogoutPath);
      return;
    }

    const baseUrl = `${request.protocol}://${request.get('host')}`;
    const postLogoutRedirectUri = new URL(
      safePostLogoutPath,
      baseUrl,
    ).toString();

    response.redirect(
      302,
      buildEndSessionUrl({
        keycloakUrl: env.KEYCLOAK_URL,
        realm: env.KEYCLOAK_REALM,
        idToken,
        postLogoutRedirectUri,
      }),
    );
  }

  @Public()
  @Post('validate')
  @ApiOperation({
    summary: 'Validate access token',
    description:
      'Validates an access token and returns the resolved principal identity, scopes, roles, and persisted permissions.',
  })
  @ApiBody({
    type: ValidateTokenRequestDto,
    examples: {
      validateToken: {
        summary: 'Validate token payload',
        value: {
          token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Token is valid and principal context has been resolved.',
    type: TokenResponseDto,
    schema: {
      example: {
        active: true,
        policyVersion: '2026.1',
        sub: '65c827f5-96d6-4ad7-8f4a-80df9794ac2d',
        email: 'admin@blih.local',
        scopes: ['openid', 'profile', 'email'],
        roles: ['superadmin'],
        permissions: ['user:view', 'user:update'],
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/auth/validate',
    badRequest: {
      message: ['token must be a string'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Invalid or expired token',
  })
  @ResponseMessage('Token validated successfully')
  validate(@Body() dto: ValidateTokenRequestDto) {
    return this.validateTokenUseCase.execute(dto.token, env.KEYCLOAK_REALM);
  }

  @Public()
  @Post('introspect')
  @ApiOperation({
    summary: 'Introspect token',
    description:
      'Performs Keycloak token introspection and returns normalized token activity and subject metadata.',
  })
  @ApiBody({
    type: IntrospectTokenRequestDto,
    examples: {
      introspect: {
        summary: 'Token introspection payload',
        value: {
          token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Introspection result was returned successfully.',
    type: TokenResponseDto,
    schema: {
      example: {
        active: true,
        policyVersion: '2026.1',
        sub: '65c827f5-96d6-4ad7-8f4a-80df9794ac2d',
        email: 'admin1',
        scopes: ['openid', 'profile', 'email'],
        roles: [],
        permissions: [],
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/auth/introspect',
    badRequest: {
      message: ['token must be a string'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Invalid or expired token',
  })
  @ResponseMessage('Token introspected successfully')
  introspect(@Body() dto: IntrospectTokenRequestDto) {
    return this.introspectTokenUseCase.execute(dto.token, env.KEYCLOAK_REALM);
  }

  @Public()
  @Post('exchange')
  @ApiOperation({
    summary: 'Exchange token',
    description:
      'Exchanges an existing token, and optionally impersonates a requested subject, to issue a new access and refresh token pair.',
  })
  @ApiBody({
    type: ExchangeTokenRequestDto,
    examples: {
      exchange: {
        summary: 'Token exchange payload',
        value: {
          token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
          requestedSubject: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Token exchange succeeded.',
    type: TokenResponseDto,
    schema: {
      example: {
        active: true,
        policyVersion: '2026.1',
        scopes: ['openid', 'profile', 'email'],
        roles: [],
        permissions: [],
        accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/auth/exchange',
    badRequest: {
      message: ['token must be a string'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Invalid or expired token',
  })
  @ResponseMessage('Token exchanged successfully')
  exchange(@Body() dto: ExchangeTokenRequestDto) {
    return this.exchangeTokenUseCase.execute(
      dto.token,
      env.KEYCLOAK_REALM,
      dto.requestedSubject,
    );
  }

  @Public()
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh token',
    description:
      'Refreshes an access token using a refresh token and returns a new access and refresh token pair.',
  })
  @ApiBody({
    type: RefreshTokenRequestDto,
    examples: {
      refresh: {
        summary: 'Refresh token payload',
        value: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Token refresh succeeded.',
    type: TokenResponseDto,
    schema: {
      example: {
        active: true,
        policyVersion: '2026.1',
        scopes: ['openid', 'profile', 'email'],
        roles: [],
        permissions: [],
        accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/auth/refresh',
    badRequest: {
      message: ['token must be a string'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Invalid or expired refresh token',
  })
  @ResponseMessage('Token refreshed successfully')
  async refresh(@Body() dto: RefreshTokenRequestDto) {
    const refreshed = await this.tokenService.refreshToken(
      dto.token,
      env.KEYCLOAK_REALM,
    );
    return {
      active: true,
      policyVersion: env.AUTH_POLICY_VERSION,
      scopes: refreshed.scope?.split(' ').filter(Boolean) ?? [],
      roles: [],
      permissions: [],
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
    };
  }

  @Public()
  @Post('revoke-session')
  @Audit('session.revoke', 'system.auth')
  @ApiOperation({
    summary: 'Revoke session token',
    description:
      'Revokes an access or refresh token and returns the subject and session metadata when introspection succeeds.',
  })
  @ApiBody({
    type: RevokeSessionRequestDto,
    examples: {
      revokeSession: {
        summary: 'Revoke refresh token',
        value: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          tokenTypeHint: 'refresh_token',
          reason: 'user_logout',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Token/session revocation completed.',
    type: RevokeSessionResponseDto,
    schema: {
      example: {
        revoked: true,
        subject: '65c827f5-96d6-4ad7-8f4a-80df9794ac2d',
        sessionId: '4f5c57c7-4f17-4171-a23a-53f38eb9f7c8',
        tokenTypeHint: 'refresh_token',
        reason: 'user_logout',
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/auth/revoke-session',
    badRequest: {
      message: [
        'tokenTypeHint must be one of the following values: refresh_token, access_token',
      ],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Invalid or expired token',
  })
  @ResponseMessage('Session revoked successfully')
  revokeSession(@Body() dto: RevokeSessionRequestDto) {
    return this.revokeSessionUseCase.execute(
      dto.token,
      env.KEYCLOAK_REALM,
      dto.tokenTypeHint ?? 'refresh_token',
      dto.reason,
    );
  }

  @UseGuards(KeycloakAuthGuard)
  @Get('me')
  @ApiProtected({
    path: '/api/v1/auth/me',
  })
  @ApiOperation({
    summary: 'Get authenticated user',
    description:
      'Returns the authenticated user profile and resolved access context for the current bearer token.',
  })
  @ApiOkResponse({
    description: 'Authenticated user and auth context.',
    type: AuthMeResponseDto,
    schema: {
      example: {
        id: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
        keycloakId: '65c827f5-96d6-4ad7-8f4a-80df9794ac2d',
        username: 'admin1',
        email: 'admin@blih.local',
        firstName: 'Admin',
        lastName: 'User',
        status: 'ACTIVE',
        phone: '+12025550199',
        departmentId: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
        sub: '65c827f5-96d6-4ad7-8f4a-80df9794ac2d',
        roles: ['superadmin'],
        permissions: ['user:view', 'user:update'],
        scopes: ['openid', 'profile', 'email'],
        sessionId: '4f5c57c7-4f17-4171-a23a-53f38eb9f7c8',
        clientId: 'blih-system-api',
      },
    },
  })
  @ResponseMessage('Authenticated user retrieved successfully')
  me(@Req() request: { user: AuthPrincipal }): AuthMeResponseDto {
    const principal = request.user;

    return {
      id: principal.userId ?? principal.sub,
      keycloakId: principal.sub,
      username: principal.username,
      email: principal.email,
      firstName: principal.firstName,
      lastName: principal.lastName,
      phone: principal.phone,
      status: principal.status,
      departmentId: principal.departmentId ?? null,
      sub: principal.sub,
      roles: principal.roles,
      permissions: principal.permissions,
      scopes: principal.scopes,
      sessionId: principal.sessionId,
      clientId: principal.clientId,
    };
  }

  private clearTransientCookies(response: Response): void {
    const clearOptions = buildClearCookieOptions(
      env.AUTH_COOKIE_SECURE,
      env.AUTH_COOKIE_SAME_SITE,
    );

    response.clearCookie(AUTH_COOKIE_NAMES.state, clearOptions);
    response.clearCookie(AUTH_COOKIE_NAMES.verifier, clearOptions);
    response.clearCookie(AUTH_COOKIE_NAMES.redirect, clearOptions);
  }

  private clearAuthCookies(response: Response): void {
    const clearOptions = buildClearCookieOptions(
      env.AUTH_COOKIE_SECURE,
      env.AUTH_COOKIE_SAME_SITE,
    );

    response.clearCookie(AUTH_COOKIE_NAMES.access, clearOptions);
    response.clearCookie(AUTH_COOKIE_NAMES.refresh, clearOptions);
    response.clearCookie(AUTH_COOKIE_NAMES.id, clearOptions);
  }

  private logAuthEvent(
    request: Request,
    action: string,
    metadata: Record<string, unknown> = {},
  ): void {
    const requestContext = buildRequestContext(request);
    this.logger.log(
      JSON.stringify({
        action,
        timestamp: new Date().toISOString(),
        requestId: requestContext.requestId,
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent,
        ...metadata,
      }),
    );
  }

  private appendErrorCode(path: string, code: string): string {
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}error=${encodeURIComponent(code)}`;
  }

  private extractKeycloakErrorCode(error: unknown): string | undefined {
    if (!error || typeof error !== 'object' || !('response' in error)) {
      return undefined;
    }

    const response = (
      error as {
        response?: {
          data?: unknown;
        };
      }
    ).response;
    if (!response || !response.data || typeof response.data !== 'object') {
      return undefined;
    }

    const code = (response.data as { error?: unknown }).error;
    return typeof code === 'string' ? code : undefined;
  }
}
