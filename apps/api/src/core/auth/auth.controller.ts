import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Audit } from '../../shared/decorators/audit.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { TokenRequestDto } from './dto/token-request.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { AuthMeResponseDto } from './dto/auth-me-response.dto';
import { ExchangeTokenUseCase } from './use-cases/exchange-token.usecase';
import { IntrospectTokenUseCase } from './use-cases/introspect-token.usecase';
import { RevokeSessionUseCase } from './use-cases/revoke-session.usecase';
import { ValidateTokenUseCase } from './use-cases/validate-token.usecase';
import { KeycloakTokenService } from '../../platform/keycloak/keycloak-token.service';
import { env } from '../../config/env.config';
import { AuthPrincipal } from '../../shared/interfaces/auth-principal.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly introspectTokenUseCase: IntrospectTokenUseCase,
    private readonly exchangeTokenUseCase: ExchangeTokenUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
    private readonly tokenService: KeycloakTokenService,
  ) {}

  @Public()
  @Post('validate')
  @ApiOperation({
    summary: 'Validate access token',
    description:
      'Validates an access token and returns the resolved principal identity, scopes, roles, and persisted permissions.',
  })
  @ApiBody({
    type: TokenRequestDto,
    examples: {
      validateToken: {
        summary: 'Validate token payload',
        value: {
          token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiOkResponse({
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
  validate(@Body() dto: TokenRequestDto) {
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
    type: TokenRequestDto,
    examples: {
      introspect: {
        summary: 'Token introspection payload',
        value: {
          token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiOkResponse({
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
  introspect(@Body() dto: TokenRequestDto) {
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
    type: TokenRequestDto,
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
  @ApiOkResponse({
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
  exchange(@Body() dto: TokenRequestDto) {
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
    type: TokenRequestDto,
    examples: {
      refresh: {
        summary: 'Refresh token payload',
        value: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiOkResponse({
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
  async refresh(@Body() dto: TokenRequestDto) {
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
    type: TokenRequestDto,
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
  @ApiOkResponse({
    description: 'Token/session revocation completed.',
    schema: {
      example: {
        revoked: true,
        subject: '65c827f5-96d6-4ad7-8f4a-80df9794ac2d',
        sessionId: '4f5c57c7-4f17-4171-a23a-53f38eb9f7c8',
        tokenTypeHint: 'refresh_token',
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
  revokeSession(@Body() dto: TokenRequestDto) {
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
}
