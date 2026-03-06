import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JobApplicationPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
} from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import {
  CreateJobApplicationDto,
  JobApplicationListQueryDto,
  JobApplicationResponseDto,
  UpdateApplicationStatusDto,
} from './dto/application.dto';
import {
  applicationListResponseEnvelope,
  applicationResponseEnvelope,
} from './recruitment.swagger-examples';
import {
  CreateJobApplicationUseCase,
  GetJobApplicationUseCase,
  ListJobApplicationsUseCase,
  UpdateJobApplicationStatusUseCase,
} from './use-cases/applications.usecases';

@ApiTags('HR Recruitment Applications')
@Controller('hr/recruitment/applications')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class JobApplicationsController {
  constructor(
    private readonly createApplication: CreateJobApplicationUseCase,
    private readonly listApplications: ListJobApplicationsUseCase,
    private readonly getApplicationById: GetJobApplicationUseCase,
    private readonly updateApplicationStatusById: UpdateJobApplicationStatusUseCase,
  ) {}

  @Post()
  @Roles(JobApplicationPermissions.CREATE)
  @Audit('recruitment.application.create', 'hr.job_application')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/applications',
    roles: [JobApplicationPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create job application' })
  @ApiBody({
    type: CreateJobApplicationDto,
    description:
      'Request body: jobId (required, UUID), candidateId (required, UUID). Optional: coverLetter, expectedSalary, sourceSnapshot (object).',
    examples: {
      createApplication: {
        summary: 'Create application payload',
        value: {
          jobId: 'a4b8e6cc-3df0-4e38-8a6d-40d6e8b1ea2f',
          candidateId: '7f4d5938-1031-4b42-9369-f64b5b3de2ca',
          coverLetter: 'I have built high-scale APIs in NestJS.',
          expectedSalary: 145000,
        },
      },
      createApplicationMinimal: {
        summary: 'Create application (minimal)',
        value: {
          jobId: 'a4b8e6cc-3df0-4e38-8a6d-40d6e8b1ea2f',
          candidateId: '7f4d5938-1031-4b42-9369-f64b5b3de2ca',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    JobApplicationResponseDto,
    'Created job application',
    applicationResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/applications',
    badRequest: 'Application payload is invalid',
    notFound: 'Job or candidate not found',
    conflict: 'Candidate already applied to this job',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  create(@Body() body: CreateJobApplicationDto) {
    return this.createApplication.execute(body);
  }

  @Get()
  @Roles(JobApplicationPermissions.VIEW)
  @Audit('recruitment.application.list', 'hr.job_application')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/applications',
    roles: [JobApplicationPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List job applications' })
  @ApiEnvelopeArrayResponse(
    JobApplicationResponseDto,
    'List of job applications',
    applicationListResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/applications',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(@Query() query: JobApplicationListQueryDto) {
    return this.listApplications.execute(query);
  }

  @Get(':id')
  @Roles(JobApplicationPermissions.VIEW)
  @Audit('recruitment.application.get', 'hr.job_application')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/applications/:id',
    roles: [JobApplicationPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get job application' })
  @ApiParam({ name: 'id', description: 'Job application id' })
  @ApiEnvelopeOkResponse(
    JobApplicationResponseDto,
    'Job application details',
    applicationResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/applications/:id',
    notFound: 'Job application not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  get(@Param('id') id: string) {
    return this.getApplicationById.execute(id);
  }

  @Post(':id/status')
  @Roles(JobApplicationPermissions.UPDATE)
  @Audit('recruitment.application.status', 'hr.job_application')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/applications/:id/status',
    roles: [JobApplicationPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update job application status' })
  @ApiParam({ name: 'id', description: 'Job application id' })
  @ApiBody({
    type: UpdateApplicationStatusDto,
    description:
      'Request body: status (required) — NEW, SCREENING, SHORTLISTED, INTERVIEW_STAGE, OFFER_PENDING, HIRED, REJECTED, or WITHDRAWN (valid transitions apply). Optional: notes.',
    examples: {
      updateStatusInterview: {
        summary: 'Move to interview stage',
        value: {
          status: 'INTERVIEW_STAGE',
          notes: 'Passed technical screening',
        },
      },
      updateStatusRejected: {
        summary: 'Reject application',
        value: {
          status: 'REJECTED',
          notes: 'Does not meet experience requirements',
        },
      },
      updateStatusHired: {
        summary: 'Mark as hired',
        value: {
          status: 'HIRED',
          notes: 'Offer accepted',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    JobApplicationResponseDto,
    'Updated job application status',
    applicationResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/applications/:id/status',
    badRequest: 'Invalid job application transition',
    notFound: 'Job application not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateApplicationStatusDto,
  ) {
    return this.updateApplicationStatusById.execute(id, body);
  }
}
