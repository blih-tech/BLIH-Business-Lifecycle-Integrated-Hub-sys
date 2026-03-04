import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { CreatePolicyAcknowledgementDto } from '@repo/types';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { PolicyAcknowledgementPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import type { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import { CreatePolicyAcknowledgementUseCase } from './use-cases/create-policy-acknowledgement.usecase';
import { GetPolicyAcknowledgementUseCase } from './use-cases/get-policy-acknowledgement.usecase';
import { GrantPolicyAccessUseCase } from './use-cases/grant-policy-access.usecase';
import { ListPolicyAcknowledgementsUseCase } from './use-cases/list-policy-acknowledgements.usecase';
import { VerifyPolicyAcknowledgementUseCase } from './use-cases/verify-policy-acknowledgement.usecase';

@ApiTags('HR Policy Acknowledgements')
@Controller('hr/onboarding/policy-acknowledgements')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class PolicyAcknowledgementsController {
  constructor(
    private readonly createUseCase: CreatePolicyAcknowledgementUseCase,
    private readonly listUseCase: ListPolicyAcknowledgementsUseCase,
    private readonly getUseCase: GetPolicyAcknowledgementUseCase,
    private readonly verifyUseCase: VerifyPolicyAcknowledgementUseCase,
    private readonly grantAccessUseCase: GrantPolicyAccessUseCase,
  ) {}

  @Post()
  @Roles(PolicyAcknowledgementPermissions.CREATE)
  @Audit(
    'onboarding.policy_acknowledgement.create',
    'hr.policy_acknowledgement',
  )
  @ApiProtected({
    path: '/api/v1/hr/onboarding/policy-acknowledgements',
    roles: [PolicyAcknowledgementPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Record policy acknowledgement' })
  @ApiBody({ schema: { type: 'object' } })
  create(@Body() body: CreatePolicyAcknowledgementDto) {
    return this.createUseCase.execute(body);
  }

  @Get()
  @Roles(PolicyAcknowledgementPermissions.VIEW)
  @Audit('onboarding.policy_acknowledgement.list', 'hr.policy_acknowledgement')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/policy-acknowledgements',
    roles: [PolicyAcknowledgementPermissions.VIEW],
  })
  list(
    @Query('employeeId') employeeId?: string,
    @Query('verified') verified?: string,
  ) {
    return this.listUseCase.execute({ employeeId, verified });
  }

  @Get(':id')
  @Roles(PolicyAcknowledgementPermissions.VIEW)
  @Audit('onboarding.policy_acknowledgement.get', 'hr.policy_acknowledgement')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/policy-acknowledgements/:id',
    roles: [PolicyAcknowledgementPermissions.VIEW],
  })
  @ApiParam({ name: 'id' })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Post(':id/verify')
  @Roles(PolicyAcknowledgementPermissions.VERIFY)
  @Audit(
    'onboarding.policy_acknowledgement.verify',
    'hr.policy_acknowledgement',
  )
  @ApiProtected({
    path: '/api/v1/hr/onboarding/policy-acknowledgements/:id/verify',
    roles: [PolicyAcknowledgementPermissions.VERIFY],
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  verify(
    @Param('id') id: string,
    @Body() body: { verifiedAt?: string | null },
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const verifiedById =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!verifiedById)
      throw new ForbiddenException('Authenticated user id required');
    return this.verifyUseCase.execute(id, verifiedById, body);
  }

  @Post(':id/grant-access')
  @Roles(PolicyAcknowledgementPermissions.GRANT_ACCESS)
  @Audit(
    'onboarding.policy_acknowledgement.grant_access',
    'hr.policy_acknowledgement',
  )
  @ApiProtected({
    path: '/api/v1/hr/onboarding/policy-acknowledgements/:id/grant-access',
    roles: [PolicyAcknowledgementPermissions.GRANT_ACCESS],
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  grantAccess(
    @Param('id') id: string,
    @Body() body?: { grantedAt?: string | null },
  ) {
    return this.grantAccessUseCase.execute(id, body);
  }
}
