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
} from '@blih/types';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { OnboardingChecklistPermissions } from '../../../core/rbac/constants/permissions.constants';
import { ApiProtected } from '../../../shared/docs/openapi';
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
  @ApiOkResponse({ description: 'Created checklist' })
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
  @ApiOkResponse({ description: 'List of checklists' })
  listChecklists(
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    return this.listChecklistsUseCase.execute({ userId, status });
  }

  @Get('checklists/:id')
  @Roles(OnboardingChecklistPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/onboarding/checklists/:id',
    roles: [OnboardingChecklistPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get onboarding checklist with tasks' })
  @ApiParam({ name: 'id', description: 'Checklist id' })
  @ApiOkResponse({ description: 'Checklist details' })
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
  @ApiOkResponse({ description: 'Updated checklist' })
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
  @ApiOkResponse({ description: 'Updated task' })
  updateTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() body: UpdateOnboardingTaskDto,
  ) {
    return this.updateTaskUseCase.execute(id, taskId, body);
  }
}
