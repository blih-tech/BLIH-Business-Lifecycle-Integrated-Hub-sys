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
  CreateProbationEvaluationDto,
  UpdateProbationEvaluationDto,
} from '@repo/types';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProbationEvaluationPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { ApproveProbationEvaluationUseCase } from './use-cases/approve-probation-evaluation.usecase';
import { CreateProbationEvaluationUseCase } from './use-cases/create-probation-evaluation.usecase';
import { GetProbationEvaluationUseCase } from './use-cases/get-probation-evaluation.usecase';
import { ListProbationEvaluationsUseCase } from './use-cases/list-probation-evaluations.usecase';
import { UpdateProbationEvaluationUseCase } from './use-cases/update-probation-evaluation.usecase';

@ApiTags('HR Probation Evaluations')
@Controller('hr/onboarding/probation-evaluations')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class ProbationEvaluationsController {
  constructor(
    private readonly createUseCase: CreateProbationEvaluationUseCase,
    private readonly listUseCase: ListProbationEvaluationsUseCase,
    private readonly getUseCase: GetProbationEvaluationUseCase,
    private readonly updateUseCase: UpdateProbationEvaluationUseCase,
    private readonly approveUseCase: ApproveProbationEvaluationUseCase,
  ) {}

  @Post()
  @Roles(ProbationEvaluationPermissions.CREATE)
  @Audit('onboarding.probation_evaluation.create', 'hr.probation_evaluation')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-evaluations',
    roles: [ProbationEvaluationPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create probation evaluation' })
  @ApiBody({ schema: { type: 'object' } })
  create(@Body() body: CreateProbationEvaluationDto) {
    return this.createUseCase.execute(body);
  }

  @Get()
  @Roles(ProbationEvaluationPermissions.VIEW)
  @Audit('onboarding.probation_evaluation.list', 'hr.probation_evaluation')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-evaluations',
    roles: [ProbationEvaluationPermissions.VIEW],
  })
  list(
    @Query('employeeId') employeeId?: string,
    @Query('kpiPlanId') kpiPlanId?: string,
    @Query('round') round?: string,
  ) {
    return this.listUseCase.execute({ employeeId, kpiPlanId, round });
  }

  @Get(':id')
  @Roles(ProbationEvaluationPermissions.VIEW)
  @Audit('onboarding.probation_evaluation.get', 'hr.probation_evaluation')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-evaluations/:id',
    roles: [ProbationEvaluationPermissions.VIEW],
  })
  @ApiParam({ name: 'id' })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(ProbationEvaluationPermissions.UPDATE)
  @Audit('onboarding.probation_evaluation.update', 'hr.probation_evaluation')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-evaluations/:id',
    roles: [ProbationEvaluationPermissions.UPDATE],
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  update(@Param('id') id: string, @Body() body: UpdateProbationEvaluationDto) {
    return this.updateUseCase.execute(id, body);
  }

  @Post(':id/approve')
  @Roles(ProbationEvaluationPermissions.APPROVE)
  @Audit('onboarding.probation_evaluation.approve', 'hr.probation_evaluation')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-evaluations/:id/approve',
    roles: [ProbationEvaluationPermissions.APPROVE],
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object', required: ['role'] } })
  approve(
    @Param('id') id: string,
    @Body() body: { role: string; approvedAt?: string | null },
  ) {
    return this.approveUseCase.execute(id, body);
  }
}
