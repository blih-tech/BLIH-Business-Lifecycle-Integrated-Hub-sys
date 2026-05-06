import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import type { AuthPrincipal } from '../../shared/interfaces/auth-principal.interface';
import { AccessEvaluationDto } from './dto/access-evaluation.dto';
import { EvaluateAccessUseCase } from './evaluate-access.usecase';

@ApiTags('RBAC')
@Controller('rbac')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class EvaluateAccessController {
  constructor(private readonly evaluateAccessUseCase: EvaluateAccessUseCase) {}

  @Post('evaluate-access')
  @ApiProtected({
    path: '/api/v1/rbac/evaluate-access',
  })
  @ApiOperation({
    summary: 'Evaluate access',
    description:
      'Evaluates whether a user has all requested permissions from persisted user permission snapshots.',
  })
  @ApiBody({
    type: AccessEvaluationDto,
    examples: {
      evaluateAccess: {
        summary: 'Evaluate access payload',
        value: {
          userId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
          requiredPermissions: ['invoice:view', 'invoice:approve'],
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Access evaluation decision.',
    schema: {
      example: {
        allowed: true,
        missingPermissions: [],
        permissions: ['invoice:view', 'invoice:approve'],
      },
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/rbac/evaluate-access',
    badRequest: {
      message: ['requiredPermissions must be an array'],
      error: 'Bad Request',
      statusCode: 400,
    },
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'User not found',
  })
  @ResponseMessage('Access evaluation completed successfully')
  evaluateAccess(@Body() dto: AccessEvaluationDto) {
    return this.evaluateAccessUseCase.execute(
      dto.userId,
      dto.requiredPermissions,
    );
  }

  @Get('me')
  @ApiOperation({
    summary: 'Debug: return resolved roles and permissions for current user',
  })
  me(@Req() req: Request & { user?: AuthPrincipal }) {
    const user = req.user;
    return {
      sub: user?.sub,
      userId: user?.userId,
      username: user?.username,
      roles: user?.roles ?? [],
      permissions: user?.permissions ?? [],
      permissionCount: (user?.permissions ?? []).length,
    };
  }
}
