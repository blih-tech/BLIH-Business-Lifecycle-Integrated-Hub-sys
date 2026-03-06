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
  JobResponsibilityResponseDto,
  JobSkillResponseDto,
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
      'Request body: title, departmentId, positionId, description, experienceLevel, contractType, workLocationType, openings, salaryMin, salaryMax, currency, and applicationDeadline are required. Optional: summary, employmentType, remoteScope, city, country, benefits.',
    examples: {
      createJob: {
        summary: 'Create job payload (minimal)',
        value: {
          title: 'Senior Backend Engineer',
          departmentId: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
          positionId: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
          description: 'Lead backend architecture and delivery.',
          experienceLevel: 'SENIOR',
          contractType: 'PERMANENT',
          workLocationType: 'HYBRID',
          openings: 2,
          salaryMin: 100000,
          salaryMax: 180000,
          currency: 'USD',
          benefits: ['Health insurance', 'Annual bonus'],
          applicationDeadline: '2026-04-30T23:59:59.000Z',
        },
      },
      createJobFull: {
        summary: 'Create job payload (full structure)',
        value: {
          title: 'Senior Backend Engineer',
          departmentId: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
          positionId: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
          description: 'Lead backend architecture and delivery.',
          summary: 'Backend platform leadership role.',
          experienceLevel: 'SENIOR',
          contractType: 'PERMANENT',
          employmentType: 'FULL_TIME',
          workLocationType: 'HYBRID',
          remoteScope: 'COUNTRY',
          city: 'Addis Ababa',
          country: 'Ethiopia',
          openings: 2,
          salaryMin: 100000,
          salaryMax: 180000,
          currency: 'USD',
          benefits: ['Health insurance', 'Annual bonus'],
          applicationDeadline: '2026-04-30T23:59:59.000Z',
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
      'Request body: partial job fields (all optional). Only draft or rejected jobs can be updated. Same structure as create; send only fields to change.',
    examples: {
      updateJob: {
        summary: 'Update job payload',
        value: {
          summary: 'Drive backend architecture and delivery.',
          openings: 3,
        },
      },
      updateJobExtended: {
        summary: 'Update multiple fields',
        value: {
          title: 'Lead Backend Engineer',
          description: 'Updated description.',
          experienceLevel: 'LEAD',
          openings: 2,
          applicationDeadline: '2026-05-15T23:59:59.000Z',
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
      'Moves an APPROVED job to PUBLISHED and sets publishedAt. Only APPROVED jobs can be published.',
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
    badRequest: 'Only approved jobs can be published',
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
  @ApiOperation({ summary: 'Replace job skills list' })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiBody({
    type: UpsertJobSkillsDto,
    description:
      'Request body: skills (required) â€” array of { name (required), level (optional: BEGINNER|INTERMEDIATE|ADVANCED|EXPERT), required (optional, default true), order (optional) }. Replaces all existing skills.',
    examples: {
      upsertSkills: {
        summary: 'Skills payload',
        value: {
          skills: [
            { name: 'TypeScript', level: 'ADVANCED', required: true, order: 1 },
            {
              name: 'PostgreSQL',
              level: 'INTERMEDIATE',
              required: true,
              order: 2,
            },
          ],
        },
      },
    },
  })
  @ApiEnvelopeArrayResponse(
    JobSkillResponseDto,
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
      'Request body: responsibilities (required) â€” array of { description (required), order (optional) }. Replaces all existing responsibilities.',
    examples: {
      upsertResponsibilities: {
        summary: 'Responsibilities payload',
        value: {
          responsibilities: [
            { description: 'Design backend architecture.', order: 1 },
            { description: 'Review pull requests.', order: 2 },
          ],
        },
      },
    },
  })
  @ApiEnvelopeArrayResponse(
    JobResponsibilityResponseDto,
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
