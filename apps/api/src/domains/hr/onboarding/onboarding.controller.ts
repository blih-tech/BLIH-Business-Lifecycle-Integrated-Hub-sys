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
  CreateOnboardingChecklistDto,
  UpdateOnboardingChecklistDto,
  UpdateOnboardingTaskDto,
} from '@repo/types';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { OnboardingChecklistPermissions } from '../../../core/rbac/constants/permissions.constants';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
  GenericEntityResponseDto,
} from '../../../shared/docs/openapi';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { CreateOnboardingChecklistUseCase } from './use-cases/create-onboarding-checklist.usecase';
import { GetOnboardingChecklistUseCase } from './use-cases/get-onboarding-checklist.usecase';
import { ListOnboardingChecklistsUseCase } from './use-cases/list-onboarding-checklists.usecase';
import { UpdateOnboardingChecklistUseCase } from './use-cases/update-onboarding-checklist.usecase';
import { UpdateOnboardingTaskUseCase } from './use-cases/update-onboarding-task.usecase';

@ApiTags('HR Onboarding')
@Controller('hr/onboarding')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class OnboardingController {
  constructor(
    private readonly createChecklistUseCase: CreateOnboardingChecklistUseCase,
    private readonly listChecklistsUseCase: ListOnboardingChecklistsUseCase,
    private readonly getChecklistUseCase: GetOnboardingChecklistUseCase,
    private readonly updateChecklistUseCase: UpdateOnboardingChecklistUseCase,
    private readonly updateTaskUseCase: UpdateOnboardingTaskUseCase,
  ) {}

  @Post('checklists')
  @Roles(OnboardingChecklistPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/onboarding/checklists',
    roles: [OnboardingChecklistPermissions.CREATE],
  })
  @ApiOperation({
    summary:
      'Create onboarding checklist; optionally generate tasks from template',
  })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Created checklist')
  @ApiDefaultErrors({
    path: '/api/v1/hr/onboarding/checklists',
    badRequest: 'Onboarding checklist payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  createChecklist(@Body() body: CreateOnboardingChecklistDto) {
    return this.createChecklistUseCase.execute(body);
  }

  @Get('checklists')
  @Roles(OnboardingChecklistPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/onboarding/checklists',
    roles: [OnboardingChecklistPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List onboarding checklists' })
  @ApiEnvelopeArrayResponse(
    GenericEntityResponseDto,
    'List of onboarding checklists',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/onboarding/checklists',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listChecklists(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.listChecklistsUseCase.execute({ employeeId, status });
  }

  @Get('checklists/:id')
  @Roles(OnboardingChecklistPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/onboarding/checklists/:id',
    roles: [OnboardingChecklistPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get onboarding checklist with tasks' })
  @ApiParam({ name: 'id', description: 'Checklist id' })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Checklist details')
  @ApiDefaultErrors({
    path: '/api/v1/hr/onboarding/checklists/:id',
    notFound: 'Onboarding checklist not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  getChecklist(@Param('id') id: string) {
    return this.getChecklistUseCase.execute(id);
  }

  @Patch('checklists/:id')
  @Roles(OnboardingChecklistPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/onboarding/checklists/:id',
    roles: [OnboardingChecklistPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update onboarding checklist' })
  @ApiParam({ name: 'id', description: 'Checklist id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Updated checklist')
  @ApiDefaultErrors({
    path: '/api/v1/hr/onboarding/checklists/:id',
    badRequest: 'Onboarding checklist payload is invalid',
    notFound: 'Onboarding checklist not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateChecklist(
    @Param('id') id: string,
    @Body() body: UpdateOnboardingChecklistDto,
  ) {
    return this.updateChecklistUseCase.execute(id, body);
  }

  @Patch('checklists/:id/tasks/:taskId')
  @Roles(OnboardingChecklistPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/onboarding/checklists/:id/tasks/:taskId',
    roles: [OnboardingChecklistPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update onboarding task (e.g. complete)' })
  @ApiParam({ name: 'id', description: 'Checklist id' })
  @ApiParam({ name: 'taskId', description: 'Task id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Updated task')
  @ApiDefaultErrors({
    path: '/api/v1/hr/onboarding/checklists/:id/tasks/:taskId',
    badRequest: 'Onboarding task payload is invalid',
    notFound: 'Onboarding checklist task not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() body: UpdateOnboardingTaskDto,
  ) {
    return this.updateTaskUseCase.execute(id, taskId, body);
  }
}
