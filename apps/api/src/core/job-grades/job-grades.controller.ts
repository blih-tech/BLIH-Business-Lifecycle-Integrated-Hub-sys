import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { Audit } from '../../shared/decorators/audit.decorator';
import { AuditState } from '../../shared/decorators/audit-state.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import { ApiDefaultErrors, ApiProtected } from '../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import { JobGradePermissions } from '@repo/types/rbac';
import { CreateJobGradeDto } from './dto/create-job-grade.dto';
import { JobGradeResponseDto } from './dto/job-grade-response.dto';
import { UpdateJobGradeDto } from './dto/update-job-grade.dto';
import { CreateJobGradeUseCase } from './use-cases/create-job-grade.usecase';
import { DeleteJobGradeUseCase } from './use-cases/delete-job-grade.usecase';
import { GetJobGradeUseCase } from './use-cases/get-job-grade.usecase';
import { ListJobGradesUseCase } from './use-cases/list-job-grades.usecase';
import { UpdateJobGradeUseCase } from './use-cases/update-job-grade.usecase';

@ApiTags('Job Grades')
@Controller('job-grades')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class JobGradesController {
  constructor(
    private readonly createJobGradeUseCase: CreateJobGradeUseCase,
    private readonly listJobGradesUseCase: ListJobGradesUseCase,
    private readonly getJobGradeUseCase: GetJobGradeUseCase,
    private readonly updateJobGradeUseCase: UpdateJobGradeUseCase,
    private readonly deleteJobGradeUseCase: DeleteJobGradeUseCase,
  ) {}

  @Post()
  @Roles(JobGradePermissions.CREATE)
  @Audit('job_grade.create', 'system.job_grade')
  @ApiProtected({
    path: '/api/v1/job-grades',
    roles: [JobGradePermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create job grade' })
  @ApiBody({ type: CreateJobGradeDto })
  @ApiCreatedResponse({ type: JobGradeResponseDto })
  @ApiDefaultErrors({
    path: '/api/v1/job-grades',
    badRequest: 'Job grade code and name are required',
  })
  @ResponseMessage('Job grade created successfully')
  create(@Body() dto: CreateJobGradeDto) {
    return this.createJobGradeUseCase.execute(dto);
  }

  @Get()
  @Roles(JobGradePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/job-grades',
    roles: [JobGradePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List job grades' })
  @ApiOkResponse({ type: JobGradeResponseDto, isArray: true })
  @ResponseMessage('Job grades retrieved successfully')
  list() {
    return this.listJobGradesUseCase.execute();
  }

  @Get(':jobGradeId')
  @Roles(JobGradePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/job-grades/:jobGradeId',
    roles: [JobGradePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get job grade' })
  @ApiParam({ name: 'jobGradeId' })
  @ApiOkResponse({ type: JobGradeResponseDto })
  @ResponseMessage('Job grade retrieved successfully')
  get(@Param('jobGradeId') jobGradeId: string) {
    return this.getJobGradeUseCase.execute(jobGradeId);
  }

  @Put(':jobGradeId')
  @Roles(JobGradePermissions.UPDATE)
  @Audit('job_grade.update', 'system.job_grade')
  @AuditState({
    resourceIdKey: 'params.jobGradeId',
    loadBefore: true,
    entity: 'position',
  })
  @ApiProtected({
    path: '/api/v1/job-grades/:jobGradeId',
    roles: [JobGradePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update job grade' })
  @ApiParam({ name: 'jobGradeId' })
  @ApiBody({ type: UpdateJobGradeDto })
  @ApiOkResponse({ type: JobGradeResponseDto })
  @ResponseMessage('Job grade updated successfully')
  update(
    @Param('jobGradeId') jobGradeId: string,
    @Body() dto: UpdateJobGradeDto,
  ) {
    return this.updateJobGradeUseCase.execute(jobGradeId, dto);
  }

  @Delete(':jobGradeId')
  @Roles(JobGradePermissions.DELETE)
  @Audit('job_grade.delete', 'system.job_grade')
  @AuditState({
    resourceIdKey: 'params.jobGradeId',
    loadBefore: true,
    entity: 'position',
  })
  @ApiProtected({
    path: '/api/v1/job-grades/:jobGradeId',
    roles: [JobGradePermissions.DELETE],
  })
  @ApiOperation({ summary: 'Delete job grade' })
  @ApiParam({ name: 'jobGradeId' })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ResponseMessage('Job grade deleted successfully')
  delete(@Param('jobGradeId') jobGradeId: string) {
    return this.deleteJobGradeUseCase.execute(jobGradeId);
  }
}
