import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type {
  CreateSkillDto,
  UpsertEmployeeSkillsDto,
  CreateTrainingRequestDto,
  ApproveTrainingRequestDto,
  CreateTrainingCompletionDto,
  UpdateTrainingCompletionDto,
  CreateSkillGapAssessmentDto,
} from '@repo/types';
import { TrainingPermissions } from '../../../core/rbac/constants/permissions.constants';
import { ApiProtected } from '../../../shared/docs/openapi';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { ListSkillsUseCase } from './use-cases/list-skills.usecase';
import { CreateSkillUseCase } from './use-cases/create-skill.usecase';
import { GetEmployeeSkillsUseCase } from './use-cases/get-employee-skills.usecase';
import { UpsertEmployeeSkillsUseCase } from './use-cases/upsert-employee-skills.usecase';
import { GetTrainingBudgetUseCase } from './use-cases/get-training-budget.usecase';
import { CreateTrainingRequestUseCase } from './use-cases/create-training-request.usecase';
import { ListTrainingRequestsUseCase } from './use-cases/list-training-requests.usecase';
import { GetTrainingRequestUseCase } from './use-cases/get-training-request.usecase';
import { ApproveTrainingRequestUseCase } from './use-cases/approve-training-request.usecase';
import { CreateTrainingCompletionUseCase } from './use-cases/create-training-completion.usecase';
import { ListTrainingCompletionsUseCase } from './use-cases/list-training-completions.usecase';
import { GetTrainingCompletionUseCase } from './use-cases/get-training-completion.usecase';
import { UpdateTrainingCompletionUseCase } from './use-cases/update-training-completion.usecase';
import { CreateSkillGapAssessmentUseCase } from './use-cases/create-skill-gap-assessment.usecase';
import { ListSkillGapAssessmentsUseCase } from './use-cases/list-skill-gap-assessments.usecase';
import { GetSkillGapAssessmentUseCase } from './use-cases/get-skill-gap-assessment.usecase';
import { GetIndividualSkillGapUseCase } from './use-cases/get-individual-skill-gap.usecase';

@ApiTags('HR Training')
@Controller('hr/training')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class TrainingController {
  constructor(
    private readonly listSkills: ListSkillsUseCase,
    private readonly createSkill: CreateSkillUseCase,
    private readonly getEmployeeSkills: GetEmployeeSkillsUseCase,
    private readonly upsertEmployeeSkills: UpsertEmployeeSkillsUseCase,
    private readonly getBudget: GetTrainingBudgetUseCase,
    private readonly createRequest: CreateTrainingRequestUseCase,
    private readonly listRequests: ListTrainingRequestsUseCase,
    private readonly getRequest: GetTrainingRequestUseCase,
    private readonly approveRequest: ApproveTrainingRequestUseCase,
    private readonly createCompletion: CreateTrainingCompletionUseCase,
    private readonly listCompletions: ListTrainingCompletionsUseCase,
    private readonly getCompletion: GetTrainingCompletionUseCase,
    private readonly updateCompletion: UpdateTrainingCompletionUseCase,
    private readonly createSkillGap: CreateSkillGapAssessmentUseCase,
    private readonly listSkillGaps: ListSkillGapAssessmentsUseCase,
    private readonly getSkillGap: GetSkillGapAssessmentUseCase,
    private readonly getIndividualGap: GetIndividualSkillGapUseCase,
  ) {}

  @Get('skills')
  @Roles(TrainingPermissions.VIEW, TrainingPermissions.MANAGE_SKILLS)
  @ApiProtected({
    path: '/api/v1/hr/training/skills',
    roles: [TrainingPermissions.VIEW, TrainingPermissions.MANAGE_SKILLS],
  })
  @ApiOperation({ summary: 'List skills' })
  listSkillsHandler(@Query('category') category?: string) {
    return this.listSkills.execute({ category });
  }

  @Post('skills')
  @Roles(TrainingPermissions.MANAGE_SKILLS)
  @ApiProtected({
    path: '/api/v1/hr/training/skills',
    roles: [TrainingPermissions.MANAGE_SKILLS],
  })
  @ApiOperation({ summary: 'Create skill' })
  @ApiBody({ schema: { type: 'object' } })
  createSkillHandler(@Body() body: CreateSkillDto) {
    return this.createSkill.execute(body);
  }

  @Get('employees/:employeeId/skills')
  @Roles(TrainingPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/employees/:employeeId/skills',
    roles: [TrainingPermissions.VIEW],
  })
  @ApiParam({ name: 'employeeId' })
  getEmployeeSkillsHandler(@Param('employeeId') employeeId: string) {
    return this.getEmployeeSkills.execute(employeeId);
  }

  @Patch('employees/:employeeId/skills')
  @Roles(TrainingPermissions.VIEW, TrainingPermissions.MANAGE_SKILLS)
  @ApiProtected({
    path: '/api/v1/hr/training/employees/:employeeId/skills',
    roles: [TrainingPermissions.VIEW, TrainingPermissions.MANAGE_SKILLS],
  })
  @ApiParam({ name: 'employeeId' })
  @ApiBody({ schema: { type: 'object' } })
  upsertEmployeeSkillsHandler(
    @Param('employeeId') employeeId: string,
    @Body() body: UpsertEmployeeSkillsDto,
  ) {
    return this.upsertEmployeeSkills.execute(employeeId, body);
  }

  @Get('budget')
  @Roles(TrainingPermissions.VIEW, TrainingPermissions.MANAGE_BUDGET)
  @ApiProtected({
    path: '/api/v1/hr/training/budget',
    roles: [TrainingPermissions.VIEW, TrainingPermissions.MANAGE_BUDGET],
  })
  @ApiOperation({ summary: 'Get team training budget' })
  getBudgetHandler(
    @Query('departmentId') departmentId: string,
    @Query('year') year: string,
  ) {
    return this.getBudget.execute(departmentId, parseInt(year, 10));
  }

  @Post('requests')
  @Roles(TrainingPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/training/requests',
    roles: [TrainingPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create training request' })
  @ApiBody({ schema: { type: 'object' } })
  createRequestHandler(@Body() body: CreateTrainingRequestDto) {
    return this.createRequest.execute(body);
  }

  @Get('requests')
  @Roles(TrainingPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/requests',
    roles: [TrainingPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List training requests' })
  listRequestsHandler(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.listRequests.execute({ employeeId, status });
  }

  @Get('requests/:id')
  @Roles(TrainingPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/requests/:id',
    roles: [TrainingPermissions.VIEW],
  })
  @ApiParam({ name: 'id' })
  getRequestHandler(@Param('id') id: string) {
    return this.getRequest.execute(id);
  }

  @Post('requests/:id/approve')
  @Roles(TrainingPermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/training/requests/:id/approve',
    roles: [TrainingPermissions.APPROVE],
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  approveRequestHandler(
    @Param('id') id: string,
    @Body() body: ApproveTrainingRequestDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const approverId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!approverId)
      throw new ForbiddenException('Authenticated user required to approve');
    return this.approveRequest.execute(id, approverId, body);
  }

  @Post('completions')
  @Roles(TrainingPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/training/completions',
    roles: [TrainingPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Record training completion' })
  @ApiBody({ schema: { type: 'object' } })
  createCompletionHandler(@Body() body: CreateTrainingCompletionDto) {
    return this.createCompletion.execute(body);
  }

  @Get('completions')
  @Roles(TrainingPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/completions',
    roles: [TrainingPermissions.VIEW],
  })
  listCompletionsHandler(@Query('employeeId') employeeId?: string) {
    return this.listCompletions.execute({ employeeId });
  }

  @Get('completions/:id')
  @Roles(TrainingPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/completions/:id',
    roles: [TrainingPermissions.VIEW],
  })
  @ApiParam({ name: 'id' })
  getCompletionHandler(@Param('id') id: string) {
    return this.getCompletion.execute(id);
  }

  @Patch('completions/:id')
  @Roles(TrainingPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/training/completions/:id',
    roles: [TrainingPermissions.CREATE],
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  updateCompletionHandler(
    @Param('id') id: string,
    @Body() body: UpdateTrainingCompletionDto,
  ) {
    return this.updateCompletion.execute(id, body);
  }

  @Post('skill-gap-assessments')
  @Roles(TrainingPermissions.SKILL_GAP)
  @ApiProtected({
    path: '/api/v1/hr/training/skill-gap-assessments',
    roles: [TrainingPermissions.SKILL_GAP],
  })
  @ApiBody({ schema: { type: 'object' } })
  createSkillGapHandler(@Body() body: CreateSkillGapAssessmentDto) {
    return this.createSkillGap.execute(body);
  }

  @Get('skill-gap-assessments')
  @Roles(TrainingPermissions.SKILL_GAP, TrainingPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/skill-gap-assessments',
    roles: [TrainingPermissions.SKILL_GAP, TrainingPermissions.VIEW],
  })
  listSkillGapsHandler(@Query('departmentId') departmentId: string) {
    return this.listSkillGaps.execute(departmentId);
  }

  @Get('skill-gap-assessments/:id')
  @Roles(TrainingPermissions.SKILL_GAP, TrainingPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/skill-gap-assessments/:id',
    roles: [TrainingPermissions.SKILL_GAP, TrainingPermissions.VIEW],
  })
  @ApiParam({ name: 'id' })
  getSkillGapHandler(@Param('id') id: string) {
    return this.getSkillGap.execute(id);
  }

  @Get('employees/:employeeId/skill-gap')
  @Roles(TrainingPermissions.SKILL_GAP, TrainingPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/employees/:employeeId/skill-gap',
    roles: [TrainingPermissions.SKILL_GAP, TrainingPermissions.VIEW],
  })
  @ApiParam({ name: 'employeeId' })
  getIndividualGapHandler(
    @Param('employeeId') employeeId: string,
    @Query('targetPositionId') targetPositionId?: string,
  ) {
    return this.getIndividualGap.execute(employeeId, targetPositionId ?? null);
  }
}
