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
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  JobApprovalPermissions,
  JobPermissions,
} from '../../../core/rbac/constants/permissions.constants';
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
import type { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import {
  ApproveJobDto,
  CloseJobDto,
  CreateJobDto,
  JobListQueryDto,
  JobResponseDto,
  JobResponsibilityValueResponseDto,
  JobSkillsResponseDto,
  JobToolResponseDto,
  UpdateJobDto,
  UpsertJobResponsibilitiesDto,
  UpsertJobSkillsDto,
  UpsertJobToolsDto,
} from './dto/job.dto';
import {
  jobListResponseEnvelope,
  jobResponsibilitiesResponseEnvelope,
  jobResponseEnvelope,
  jobSkillsResponseEnvelope,
  jobToolsResponseEnvelope,
} from './recruitment.swagger-examples';
import {
  ApproveJobUseCase,
  CloseJobUseCase,
  CreateJobUseCase,
  GetJobUseCase,
  ListJobsUseCase,
  PublishJobUseCase,
  SubmitJobUseCase,
  UpdateJobUseCase,
  UpsertJobResponsibilitiesUseCase,
  UpsertJobSkillsUseCase,
  UpsertJobToolsUseCase,
} from './use-cases/jobs.usecases';

@ApiTags('HR Recruitment Jobs')
@Controller('hr/recruitment/jobs')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class JobsController {
  constructor(
    private readonly createJob: CreateJobUseCase,
    private readonly listJobs: ListJobsUseCase,
    private readonly getJobById: GetJobUseCase,
    private readonly updateJobById: UpdateJobUseCase,
    private readonly submitJobById: SubmitJobUseCase,
    private readonly approveJobById: ApproveJobUseCase,
    private readonly publishJobById: PublishJobUseCase,
    private readonly closeJobById: CloseJobUseCase,
    private readonly upsertJobSkills: UpsertJobSkillsUseCase,
    private readonly upsertJobTools: UpsertJobToolsUseCase,
    private readonly upsertJobResponsibilities: UpsertJobResponsibilitiesUseCase,
  ) {}

  @Post()
  @Roles(JobPermissions.CREATE)
  @Audit('recruitment.job.create', 'hr.job')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/jobs',
    roles: [JobPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create job' })
  @ApiBody({
    type: CreateJobDto,
    description:
      'Request body uses nested-only contract: requestForm, jobDetailsForm, applicationForm.',
    examples: {
      createJob: {
        summary: 'Create job payload (nested)',
        value: {
          priority: 'medium',
          hiringManagerId: '6e40348d-4fda-47a7-b267-13ed7b6fca68',
          requestForm: {
            jobTitle: 'Senior Frontend Engineer',
            department: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
            requestedBy: 'Alice Njeri',
            position: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
            requestType: 'replacement',
            replaceForUserId: '9f95c89f-3dcb-4fd7-a78d-33e5f1e8f12b',
            businessJustification:
              'We need to backfill a critical delivery role.',
            employmentType: 'full_time',
            workMode: 'hybrid',
            urgency: 'high',
            neededByDate: '2026-03-30',
          },
          jobDetailsForm: {
            jobTitle: 'Senior Frontend Engineer',
            location: 'Addis Ababa, Ethiopia',
            workMode: 'hybrid',
            employmentType: 'full_time',
            jobSummary: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  text: 'Lead frontend delivery for customer-facing products.',
                },
              ],
            },
            whyJoinUs: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  text: 'Join a fast-moving product team with strong ownership.',
                },
              ],
            },
            requiredSkills: ['React', 'TypeScript'],
            preferredSkills: ['Next.js'],
            responsibilities: [
              'Lead frontend delivery',
              'Collaborate with product and design',
            ],
            experienceLevel: 'senior',
            salaryMin: 2000,
            salaryMax: 3000,
            salaryCurrency: 'USD',
            salaryMode: 'competitive',
            benefits: ['Health insurance', 'Learning budget'],
            openings: 2,
            applicationDeadline: '2026-04-30T23:59:59.000Z',
          },
          applicationForm: {
            customFields: [
              {
                id: 'custom-123',
                label: 'Portfolio URL',
                type: 'text',
                required: false,
                options: [],
              },
              {
                id: 'custom-456',
                label: 'Do you need visa sponsorship?',
                type: 'select',
                required: true,
                options: ['Yes', 'No'],
              },
            ],
          },
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(JobResponseDto, 'Created job', jobResponseEnvelope)
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/jobs',
    badRequest: 'Job payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Authenticated user context is required',
  })
  create(
    @Body() body: CreateJobDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const user = req.user as AuthPrincipal | undefined;
    if (!user)
      throw new ForbiddenException('Authenticated user context is required');
    return this.createJob.execute(body, user);
  }

  @Get()
  @Roles(JobPermissions.VIEW)
  @Audit('recruitment.job.list', 'hr.job')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/jobs',
    roles: [JobPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List jobs' })
  @ApiEnvelopeArrayResponse(
    JobResponseDto,
    'List of jobs',
    jobListResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/jobs',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(@Query() query: JobListQueryDto) {
    return this.listJobs.execute(query);
  }

  @Get(':id')
  @Roles(JobPermissions.VIEW)
  @Audit('recruitment.job.get', 'hr.job')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/jobs/:id',
    roles: [JobPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get job' })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiEnvelopeOkResponse(JobResponseDto, 'Job details', jobResponseEnvelope)
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/jobs/:id',
    notFound: 'Job not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  get(@Param('id') id: string) {
    return this.getJobById.execute(id);
  }

  @Patch(':id')
  @Roles(JobPermissions.UPDATE)
  @Audit('recruitment.job.update', 'hr.job')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/jobs/:id',
    roles: [JobPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update job' })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiBody({
    type: UpdateJobDto,
    description:
      'Request body: nested job contract (requestForm, jobDetailsForm, applicationForm). Only draft or rejected jobs can be updated.',
    examples: {
      updateJob: {
        summary: 'Update job payload',
        value: {
          priority: 'high',
          requestForm: {
            jobTitle: 'Lead Frontend Engineer',
            department: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
            requestedBy: 'Alice Njeri',
            position: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
            requestType: 'replacement',
            businessJustification: 'Updated business need.',
            employmentType: 'full_time',
            workMode: 'hybrid',
            urgency: 'medium',
            neededByDate: '2026-04-15',
          },
          jobDetailsForm: {
            jobTitle: 'Lead Frontend Engineer',
            location: 'Addis Ababa, Ethiopia',
            workMode: 'hybrid',
            employmentType: 'full_time',
            jobSummary: {
              type: 'doc',
              version: 1,
              content: [{ type: 'paragraph', text: 'Updated summary' }],
            },
            requiredSkills: ['React'],
            preferredSkills: ['TypeScript'],
            responsibilities: ['Lead team', 'Ship product'],
            experienceLevel: 'lead',
            salaryMode: 'negotiable',
            openings: 1,
            applicationDeadline: '2026-05-15T23:59:59.000Z',
          },
          applicationForm: {
            customFields: [],
          },
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(JobResponseDto, 'Updated job', jobResponseEnvelope)
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/jobs/:id',
    badRequest: 'Job payload is invalid',
    notFound: 'Job not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  update(@Param('id') id: string, @Body() body: UpdateJobDto) {
    return this.updateJobById.execute(id, body);
  }

  @Post(':id/submit')
  @Roles(JobPermissions.SUBMIT)
  @Audit('recruitment.job.submit', 'hr.job')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/jobs/:id/submit',
    roles: [JobPermissions.SUBMIT],
  })
  @ApiOperation({
    summary: 'Submit job for approval workflow',
    description:
      'Submits a DRAFT or REJECTED job into approval workflow. Finance and GM stages open in parallel, and HR review is unlocked after both approve. Any rejection marks the job REJECTED immediately.',
  })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiBody({
    description: 'No request body required. Job id is provided in the path.',
    required: false,
    schema: { type: 'object', nullable: true },
  })
  @ApiEnvelopeOkResponse(JobResponseDto, 'Submitted job', jobResponseEnvelope)
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/jobs/:id/submit',
    notFound: 'Job not found',
    conflict: 'Job cannot be submitted from current state',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  submit(@Param('id') id: string) {
    return this.submitJobById.execute(id);
  }

  @Post(':id/approve')
  @Roles(JobApprovalPermissions.DECIDE)
  @Audit('recruitment.job.approve', 'hr.job_approval')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/jobs/:id/approve',
    roles: [JobApprovalPermissions.DECIDE],
  })
  @ApiOperation({
    summary: 'Approve/reject current job approval stage',
    description:
      'Records approval or rejection for a pending actionable stage. Finance and GM can be approved in parallel. Use optional stage for deterministic targeting when an actor can decide multiple stages.',
  })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiBody({
    type: ApproveJobDto,
    description:
      'Request body: decision (required) — APPROVED or REJECTED; stage (optional) — FINANCE | GM | HR_REVIEW; comments (optional).',
    examples: {
      approve: {
        summary: 'Approve stage',
        value: {
          decision: 'APPROVED',
          stage: 'GM',
          comments: 'Approved by stage owner.',
        },
      },
      reject: {
        summary: 'Reject stage',
        value: {
          decision: 'REJECTED',
          stage: 'FINANCE',
          comments: 'Budget is not approved.',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    JobResponseDto,
    'Approval decision recorded',
    jobResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/jobs/:id/approve',
    badRequest: 'Approval payload is invalid',
    notFound: 'Job not found',
    conflict: 'Approval stage already decided',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required approval role is missing',
  })
  approve(
    @Param('id') id: string,
    @Body() body: ApproveJobDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const user = req.user as AuthPrincipal | undefined;
    if (!user)
      throw new ForbiddenException('Authenticated user context is required');
    return this.approveJobById.execute(id, body, user);
  }

  @Post(':id/publish')
  @Roles(JobPermissions.PUBLISH)
  @Audit('recruitment.job.publish', 'hr.job')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/jobs/:id/publish',
    roles: [JobPermissions.PUBLISH],
  })
  @ApiOperation({
    summary: 'Publish approved job',
    description:
      'Moves a READY_TO_POST job to PUBLISHED and sets publishedAt. Only READY_TO_POST jobs can be published.',
  })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiBody({
    description: 'No request body required. Job id is provided in the path.',
    required: false,
    schema: { type: 'object', nullable: true },
  })
  @ApiEnvelopeOkResponse(JobResponseDto, 'Published job', jobResponseEnvelope)
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/jobs/:id/publish',
    badRequest: 'Only ready-to-post jobs can be published',
    notFound: 'Job not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  publish(@Param('id') id: string) {
    return this.publishJobById.execute(id);
  }

  @Post(':id/close')
  @Roles(JobPermissions.CLOSE)
  @Audit('recruitment.job.close', 'hr.job')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/jobs/:id/close',
    roles: [JobPermissions.CLOSE],
  })
  @ApiOperation({ summary: 'Close job' })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiBody({
    type: CloseJobDto,
    description:
      'Request body (optional): reason â€” optional string, e.g. "Filled" or "Position cancelled". Body may be omitted.',
    examples: {
      close: {
        summary: 'Close with reason',
        value: { reason: 'Filled' },
      },
      closeNoReason: {
        summary: 'Close without reason (empty body)',
        value: {},
      },
    },
  })
  @ApiEnvelopeOkResponse(JobResponseDto, 'Closed job', jobResponseEnvelope)
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/jobs/:id/close',
    badRequest: 'Job cannot be closed from current state',
    notFound: 'Job not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  close(@Param('id') id: string, @Body() body?: CloseJobDto) {
    return this.closeJobById.execute(id, body);
  }

  @Post(':id/skills')
  @Roles(JobPermissions.MANAGE_SKILLS)
  @Audit('recruitment.job.skills.upsert', 'hr.job')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/jobs/:id/skills',
    roles: [JobPermissions.MANAGE_SKILLS],
  })
  @ApiOperation({ summary: 'Replace job required/preferred skills' })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiBody({
    type: UpsertJobSkillsDto,
    description:
      'Request body: requiredSkills (required) and preferredSkills (optional) as string arrays. Replaces existing job skill sets.',
    examples: {
      upsertSkills: {
        summary: 'Skills payload',
        value: {
          requiredSkills: ['TypeScript', 'PostgreSQL'],
          preferredSkills: ['AWS'],
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    JobSkillsResponseDto,
    'Updated job skills',
    jobSkillsResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/jobs/:id/skills',
    badRequest: 'Skills payload is invalid',
    notFound: 'Job not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  upsertSkills(@Param('id') id: string, @Body() body: UpsertJobSkillsDto) {
    return this.upsertJobSkills.execute(id, body);
  }

  @Post(':id/tools')
  @Roles(JobPermissions.MANAGE_TOOLS)
  @Audit('recruitment.job.tools.upsert', 'hr.job')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/jobs/:id/tools',
    roles: [JobPermissions.MANAGE_TOOLS],
  })
  @ApiOperation({ summary: 'Replace job tools list' })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiBody({
    type: UpsertJobToolsDto,
    description:
      'Request body: tools (required) â€” array of { name (required), order (optional) }. Replaces all existing tools.',
    examples: {
      upsertTools: {
        summary: 'Tools payload',
        value: {
          tools: [
            { name: 'Docker', order: 1 },
            { name: 'GitHub Actions', order: 2 },
          ],
        },
      },
    },
  })
  @ApiEnvelopeArrayResponse(
    JobToolResponseDto,
    'Updated job tools',
    jobToolsResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/jobs/:id/tools',
    badRequest: 'Tools payload is invalid',
    notFound: 'Job not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  upsertTools(@Param('id') id: string, @Body() body: UpsertJobToolsDto) {
    return this.upsertJobTools.execute(id, body);
  }

  @Post(':id/responsibilities')
  @Roles(JobPermissions.MANAGE_RESPONSIBILITIES)
  @Audit('recruitment.job.responsibilities.upsert', 'hr.job')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/jobs/:id/responsibilities',
    roles: [JobPermissions.MANAGE_RESPONSIBILITIES],
  })
  @ApiOperation({ summary: 'Replace job responsibilities list' })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiBody({
    type: UpsertJobResponsibilitiesDto,
    description:
      'Request body: responsibilities (required) as a string array. Replaces all existing responsibilities.',
    examples: {
      upsertResponsibilities: {
        summary: 'Responsibilities payload',
        value: {
          responsibilities: [
            'Design backend architecture.',
            'Review pull requests.',
          ],
        },
      },
    },
  })
  @ApiEnvelopeArrayResponse(
    JobResponsibilityValueResponseDto,
    'Updated job responsibilities',
    jobResponsibilitiesResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/jobs/:id/responsibilities',
    badRequest: 'Responsibilities payload is invalid',
    notFound: 'Job not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  upsertResponsibilities(
    @Param('id') id: string,
    @Body() body: UpsertJobResponsibilitiesDto,
  ) {
    return this.upsertJobResponsibilities.execute(id, body);
  }
}
