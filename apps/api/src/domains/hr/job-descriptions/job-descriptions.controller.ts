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
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { EmployeePermissions } from '../../../core/rbac/constants/permissions.constants';
import { Roles } from '../../../shared/decorators/roles.decorator';
import type {
  CreateJobDescriptionDto,
  UpdateJobDescriptionDto,
} from '@repo/types';
import { ListJobDescriptionsUseCase } from './use-cases/list-job-descriptions.usecase';
import { GetJobDescriptionUseCase } from './use-cases/get-job-description.usecase';
import { CreateJobDescriptionUseCase } from './use-cases/create-job-description.usecase';
import { UpdateJobDescriptionUseCase } from './use-cases/update-job-description.usecase';

@ApiTags('HR Job Descriptions')
@Controller('hr/job-descriptions')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class JobDescriptionsController {
  constructor(
    private readonly listJobDescriptionsUseCase: ListJobDescriptionsUseCase,
    private readonly getJobDescriptionUseCase: GetJobDescriptionUseCase,
    private readonly createJobDescriptionUseCase: CreateJobDescriptionUseCase,
    private readonly updateJobDescriptionUseCase: UpdateJobDescriptionUseCase,
  ) {}

  @Get()
  @Roles(EmployeePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/job-descriptions',
    roles: [EmployeePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List job descriptions' })
  @ApiOkResponse({ description: 'List of job descriptions' })
  list(
    @Query('departmentId') departmentId?: string,
    @Query('positionId') positionId?: string,
  ) {
    return this.listJobDescriptionsUseCase.execute(departmentId, positionId);
  }

  @Get(':id')
  @Roles(EmployeePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/job-descriptions/:id',
    roles: [EmployeePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get job description' })
  @ApiParam({ name: 'id', description: 'Job description id' })
  @ApiOkResponse({ description: 'Job description' })
  get(@Param('id') id: string) {
    return this.getJobDescriptionUseCase.execute(id);
  }

  @Post()
  @Roles(EmployeePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/job-descriptions',
    roles: [EmployeePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Create job description' })
  @ApiBody({ schema: { type: 'object', required: ['title'] } })
  @ApiCreatedResponse({ description: 'Created job description' })
  create(@Body() body: CreateJobDescriptionDto) {
    return this.createJobDescriptionUseCase.execute(body);
  }

  @Patch(':id')
  @Roles(EmployeePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/job-descriptions/:id',
    roles: [EmployeePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update job description' })
  @ApiParam({ name: 'id', description: 'Job description id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Updated job description' })
  update(@Param('id') id: string, @Body() body: UpdateJobDescriptionDto) {
    return this.updateJobDescriptionUseCase.execute(id, body);
  }
}
