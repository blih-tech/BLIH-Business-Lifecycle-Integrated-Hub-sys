import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  CreateProbationConfirmationDto,
  UpdateProbationConfirmationDto,
} from '@repo/types';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProbationConfirmationPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { CreateProbationConfirmationUseCase } from './use-cases/create-probation-confirmation.usecase';
import { GetProbationConfirmationUseCase } from './use-cases/get-probation-confirmation.usecase';
import { ListProbationConfirmationsUseCase } from './use-cases/list-probation-confirmations.usecase';
import { SignOffProbationConfirmationUseCase } from './use-cases/sign-off-probation-confirmation.usecase';
import { UpdateProbationConfirmationUseCase } from './use-cases/update-probation-confirmation.usecase';

@ApiTags('HR Probation Confirmations')
@Controller('hr/onboarding/probation-confirmations')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class ProbationConfirmationsController {
  constructor(
    private readonly createUseCase: CreateProbationConfirmationUseCase,
    private readonly listUseCase: ListProbationConfirmationsUseCase,
    private readonly getUseCase: GetProbationConfirmationUseCase,
    private readonly updateUseCase: UpdateProbationConfirmationUseCase,
    private readonly signOffUseCase: SignOffProbationConfirmationUseCase,
  ) {}

  @Post()
  @Roles(ProbationConfirmationPermissions.CREATE)
  @Audit(
    'onboarding.probation_confirmation.create',
    'hr.probation_confirmation',
  )
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-confirmations',
    roles: [ProbationConfirmationPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create probation confirmation record' })
  @ApiBody({ schema: { type: 'object' } })
  create(@Body() body: CreateProbationConfirmationDto) {
    return this.createUseCase.execute(body);
  }

  @Get()
  @Roles(ProbationConfirmationPermissions.VIEW)
  @Audit('onboarding.probation_confirmation.list', 'hr.probation_confirmation')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-confirmations',
    roles: [ProbationConfirmationPermissions.VIEW],
  })
  list(
    @Query('employeeId') employeeId?: string,
    @Query('verdict') verdict?: string,
  ) {
    return this.listUseCase.execute({ employeeId, verdict });
  }

  @Get(':id')
  @Roles(ProbationConfirmationPermissions.VIEW)
  @Audit('onboarding.probation_confirmation.get', 'hr.probation_confirmation')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-confirmations/:id',
    roles: [ProbationConfirmationPermissions.VIEW],
  })
  @ApiParam({ name: 'id' })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(ProbationConfirmationPermissions.UPDATE)
  @Audit(
    'onboarding.probation_confirmation.update',
    'hr.probation_confirmation',
  )
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-confirmations/:id',
    roles: [ProbationConfirmationPermissions.UPDATE],
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  update(
    @Param('id') id: string,
    @Body() body: UpdateProbationConfirmationDto,
  ) {
    return this.updateUseCase.execute(id, body);
  }

  @Post(':id/sign-off')
  @Roles(ProbationConfirmationPermissions.SIGN_OFF)
  @Audit(
    'onboarding.probation_confirmation.sign_off',
    'hr.probation_confirmation',
  )
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-confirmations/:id/sign-off',
    roles: [ProbationConfirmationPermissions.SIGN_OFF],
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  signOff(
    @Param('id') id: string,
    @Body() body?: { signedOffAt?: string | null },
  ) {
    return this.signOffUseCase.execute(id, body);
  }
}
