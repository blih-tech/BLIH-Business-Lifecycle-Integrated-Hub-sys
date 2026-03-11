import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../../shared/guards/rbac.guard';
import { OnboardingTaskPermissions } from '../../../../core/rbac/constants/permissions.constants';
import {
  CreateOnboardingTaskDto,
  OnboardingTaskListQueryDto,
  UpdateOnboardingTaskDto,
} from './on-boarding-tasks.dto';
import {
  ApiCreateOnboardingTask,
  ApiGetOnboardingTaskById,
  ApiListAllOnboardingTasks,
  ApiListPaginatedOnboardingTasks,
  ApiOnboardingTasksTag,
  ApiUpdateOnboardingTask,
} from './onboarding-tasks.docs';
import { CreateOnboardingTaskUseCase } from './create-onboarding-tasks.usecase';
import {
  GetOnboardingTaskByIdUseCase,
  ListAllOnboardingTasksUseCase,
  ListPaginatedOnboardingTasksUseCase,
} from './query-onboarding-tasks.usecase';
import { UpdateOnboardingTaskUseCase } from './update-onboarding-tasks.usecase';

@ApiOnboardingTasksTag()
@Controller('hr/onboarding/tasks')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class OnboardingTasksController {
  constructor(
    private readonly createTask: CreateOnboardingTaskUseCase,
    private readonly listAllTasks: ListAllOnboardingTasksUseCase,
    private readonly listPaginatedTasks: ListPaginatedOnboardingTasksUseCase,
    private readonly getTaskById: GetOnboardingTaskByIdUseCase,
    private readonly updateTask: UpdateOnboardingTaskUseCase,
  ) {}

  @Post()
  @Roles(OnboardingTaskPermissions.CREATE)
  @ApiCreateOnboardingTask()
  create(@Body() body: CreateOnboardingTaskDto) {
    return this.createTask.execute(body);
  }

  @Get()
  @Roles(OnboardingTaskPermissions.VIEW)
  @ApiListAllOnboardingTasks()
  listAll(@Query() query: OnboardingTaskListQueryDto) {
    return this.listAllTasks.execute(query);
  }

  @Get('paginated')
  @Roles(OnboardingTaskPermissions.VIEW)
  @ApiListPaginatedOnboardingTasks()
  listPaginated(
    @Query() query: OnboardingTaskListQueryDto,
    @Req() req: Request,
  ) {
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    return this.listPaginatedTasks.execute(query, requestId);
  }

  @Get(':id')
  @Roles(OnboardingTaskPermissions.VIEW)
  @ApiGetOnboardingTaskById()
  getById(@Param('id') id: string) {
    return this.getTaskById.execute(id);
  }

  @Patch(':id')
  @Roles(OnboardingTaskPermissions.UPDATE)
  @ApiUpdateOnboardingTask()
  update(@Param('id') id: string, @Body() body: UpdateOnboardingTaskDto) {
    return this.updateTask.execute(id, body);
  }
}
