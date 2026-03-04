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
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  JobPostingPermissions,
  CandidatePermissions,
} from '../../../core/rbac/constants/permissions.constants';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
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
  @ApiOkResponse({ description: 'Published job posting' })
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
