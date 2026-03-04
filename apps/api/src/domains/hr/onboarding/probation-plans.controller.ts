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
  CreateProbationKpiPlanDto,
  UpdateProbationKpiPlanDto,
} from '@repo/types';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProbationPlanPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { CreateProbationPlanUseCase } from './use-cases/create-probation-plan.usecase';
import { EndorseProbationPlanUseCase } from './use-cases/endorse-probation-plan.usecase';
import { GetProbationPlanUseCase } from './use-cases/get-probation-plan.usecase';
import { ListProbationPlansUseCase } from './use-cases/list-probation-plans.usecase';
import { UpdateProbationPlanUseCase } from './use-cases/update-probation-plan.usecase';

@ApiTags('HR Probation Plans')
@Controller('hr/onboarding/probation-plans')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class ProbationPlansController {
  constructor(
    private readonly createUseCase: CreateProbationPlanUseCase,
    private readonly listUseCase: ListProbationPlansUseCase,
    private readonly getUseCase: GetProbationPlanUseCase,
    private readonly updateUseCase: UpdateProbationPlanUseCase,
    private readonly endorseUseCase: EndorseProbationPlanUseCase,
  ) {}

  @Post()
  @Roles(ProbationPlanPermissions.CREATE)
  @Audit('onboarding.probation_plan.create', 'hr.probation_plan')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-plans',
    roles: [ProbationPlanPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create probation KPI plan' })
  @ApiBody({ schema: { type: 'object' } })
  create(@Body() body: CreateProbationKpiPlanDto) {
    return this.createUseCase.execute(body);
  }

  @Get()
  @Roles(ProbationPlanPermissions.VIEW)
  @Audit('onboarding.probation_plan.list', 'hr.probation_plan')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-plans',
    roles: [ProbationPlanPermissions.VIEW],
  })
  list(
    @Query('employeeId') employeeId?: string,
    @Query('supervisorId') supervisorId?: string,
    @Query('status') status?: string,
  ) {
    return this.listUseCase.execute({ employeeId, supervisorId, status });
  }

  @Get(':id')
  @Roles(ProbationPlanPermissions.VIEW)
  @Audit('onboarding.probation_plan.get', 'hr.probation_plan')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-plans/:id',
    roles: [ProbationPlanPermissions.VIEW],
  })
  @ApiParam({ name: 'id' })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(ProbationPlanPermissions.UPDATE)
  @Audit('onboarding.probation_plan.update', 'hr.probation_plan')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-plans/:id',
    roles: [ProbationPlanPermissions.UPDATE],
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  update(@Param('id') id: string, @Body() body: UpdateProbationKpiPlanDto) {
    return this.updateUseCase.execute(id, body);
  }

  @Post(':id/endorse')
  @Roles(ProbationPlanPermissions.ENDORSE)
  @Audit('onboarding.probation_plan.endorse', 'hr.probation_plan')
  @ApiProtected({
    path: '/api/v1/hr/onboarding/probation-plans/:id/endorse',
    roles: [ProbationPlanPermissions.ENDORSE],
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object', required: ['role'] } })
  endorse(
    @Param('id') id: string,
    @Body()
    body: {
      role: 'EMPLOYEE' | 'SUPERVISOR' | 'HR_MANAGER';
      endorsedAt?: string | null;
    },
  ) {
    return this.endorseUseCase.execute(id, body);
  }
}
