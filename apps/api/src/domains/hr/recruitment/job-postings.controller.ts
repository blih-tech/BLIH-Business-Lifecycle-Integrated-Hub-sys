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
import type { CreateCandidateDto, UpdateJobPostingDto } from '@repo/types';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  JobPostingPermissions,
  CandidatePermissions,
} from '../../../core/rbac/constants/permissions.constants';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
  GenericEntityResponseDto,
} from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { CloseJobPostingUseCase } from './use-cases/close-job-posting.usecase';
import { CreateCandidateUseCase } from './use-cases/create-candidate.usecase';
import { GetJobPostingUseCase } from './use-cases/get-job-posting.usecase';
import { ListCandidatesForPostingUseCase } from './use-cases/list-candidates-for-posting.usecase';
import { ListJobPostingsUseCase } from './use-cases/list-job-postings.usecase';
import { PublishJobPostingUseCase } from './use-cases/publish-job-posting.usecase';
import { UpdateJobPostingUseCase } from './use-cases/update-job-posting.usecase';

@ApiTags('HR Job Postings')
@Controller('hr/recruitment/job-postings')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class JobPostingsController {
  constructor(
    private readonly listUseCase: ListJobPostingsUseCase,
    private readonly getUseCase: GetJobPostingUseCase,
    private readonly updateUseCase: UpdateJobPostingUseCase,
    private readonly publishUseCase: PublishJobPostingUseCase,
    private readonly closeUseCase: CloseJobPostingUseCase,
    private readonly listCandidatesUseCase: ListCandidatesForPostingUseCase,
    private readonly createCandidateUseCase: CreateCandidateUseCase,
  ) {}

  @Get()
  @Roles(JobPostingPermissions.VIEW)
  @Audit('recruitment.job_posting.list', 'hr.job_posting')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/job-postings',
    roles: [JobPostingPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List job postings' })
  @ApiEnvelopeArrayResponse(GenericEntityResponseDto, 'List of job postings')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/job-postings',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(
    @Query('status') status?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.listUseCase.execute({ status, departmentId });
  }

  @Get(':id')
  @Roles(JobPostingPermissions.VIEW)
  @Audit('recruitment.job_posting.get', 'hr.job_posting')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/job-postings/:id',
    roles: [JobPostingPermissions.VIEW],
  })
  @ApiParam({ name: 'id', description: 'Job posting id' })
  @ApiOperation({ summary: 'Get job posting' })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Job posting details')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/job-postings/:id',
    notFound: 'Job posting not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(JobPostingPermissions.UPDATE)
  @Audit('recruitment.job_posting.update', 'hr.job_posting')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/job-postings/:id',
    roles: [JobPostingPermissions.UPDATE],
  })
  @ApiParam({ name: 'id', description: 'Job posting id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOperation({ summary: 'Update job posting' })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Updated job posting')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/job-postings/:id',
    badRequest: 'Job posting payload is invalid',
    notFound: 'Job posting not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  update(@Param('id') id: string, @Body() body: UpdateJobPostingDto) {
    return this.updateUseCase.execute(id, body);
  }

  @Post(':id/publish')
  @Roles(JobPostingPermissions.PUBLISH)
  @Audit('recruitment.job_posting.publish', 'hr.job_posting')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/job-postings/:id/publish',
    roles: [JobPostingPermissions.PUBLISH],
  })
  @ApiParam({ name: 'id', description: 'Job posting id' })
  @ApiOperation({ summary: 'Publish job posting' })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Published job posting')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/job-postings/:id/publish',
    notFound: 'Job posting not found',
    conflict: 'Job posting cannot be published from its current state',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  publish(@Param('id') id: string) {
    return this.publishUseCase.execute(id);
  }

  @Post(':id/close')
  @Roles(JobPostingPermissions.PUBLISH)
  @Audit('recruitment.job_posting.close', 'hr.job_posting')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/job-postings/:id/close',
    roles: [JobPostingPermissions.PUBLISH],
  })
  @ApiParam({ name: 'id', description: 'Job posting id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOperation({ summary: 'Close job posting' })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Closed job posting')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/job-postings/:id/close',
    badRequest: 'Job posting close payload is invalid',
    notFound: 'Job posting not found',
    conflict: 'Job posting cannot be closed from its current state',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  close(
    @Param('id') id: string,
    @Body() body?: { status?: 'CANCELLED' | 'EXPIRED' | 'FILLED' },
  ) {
    return this.closeUseCase.execute(id, body);
  }

  @Get(':id/candidates')
  @Roles(JobPostingPermissions.VIEW, CandidatePermissions.VIEW)
  @Audit('recruitment.job_posting.candidates.list', 'hr.job_posting')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/job-postings/:id/candidates',
    roles: [JobPostingPermissions.VIEW, CandidatePermissions.VIEW],
  })
  @ApiParam({ name: 'id', description: 'Job posting id' })
  @ApiOperation({ summary: 'List candidates for job posting' })
  @ApiEnvelopeArrayResponse(GenericEntityResponseDto, 'Job posting candidates')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/job-postings/:id/candidates',
    notFound: 'Job posting not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listCandidates(@Param('id') id: string, @Query('status') status?: string) {
    return this.listCandidatesUseCase.execute(id, { status });
  }

  @Post(':id/applications')
  @Roles(CandidatePermissions.CREATE)
  @Audit('recruitment.candidate.create', 'hr.candidate')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/job-postings/:id/applications',
    roles: [CandidatePermissions.CREATE],
  })
  @ApiParam({ name: 'id', description: 'Job posting id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOperation({ summary: 'Create candidate application' })
  @ApiEnvelopeOkResponse(
    GenericEntityResponseDto,
    'Created candidate application',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/job-postings/:id/applications',
    badRequest: 'Candidate application payload is invalid',
    notFound: 'Job posting not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  apply(
    @Param('id') id: string,
    @Body() body: Omit<CreateCandidateDto, 'jobPostingId'>,
  ) {
    return this.createCandidateUseCase.execute({
      ...body,
      jobPostingId: id,
    });
  }
}
