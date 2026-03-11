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
import { ApplicantPermissions } from '../../../core/rbac/constants/permissions.constants';
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
  ApplicantListQueryDto,
  ApplicantResponseDto,
  CreateApplicantDto,
  UpdateApplicantDto,
  UpdateApplicantStatusDto,
} from './dto/applicant.dto';
import {
  applicantListResponseEnvelope,
  applicantResponseEnvelope,
} from './recruitment.swagger-examples';
import {
  CreateApplicantUseCase,
  GetApplicantUseCase,
  ListApplicantsUseCase,
  UpdateApplicantStatusUseCase,
  UpdateApplicantUseCase,
} from './use-cases/applicants.usecases';

@ApiTags('HR Recruitment Applicants')
@Controller('hr/recruitment/applicants')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class ApplicantsController {
  constructor(
    private readonly createApplicant: CreateApplicantUseCase,
    private readonly listApplicants: ListApplicantsUseCase,
    private readonly getApplicantById: GetApplicantUseCase,
    private readonly updateApplicantById: UpdateApplicantUseCase,
    private readonly updateApplicantStatusById: UpdateApplicantStatusUseCase,
  ) {}

  @Post()
  @Roles(ApplicantPermissions.CREATE)
  @Audit('recruitment.applicant.create', 'hr.applicant')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/applicants',
    roles: [ApplicantPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create applicant' })
  @ApiBody({
    type: CreateApplicantDto,
    description:
      'Request body: applicant details for a specific job. Duplicate `(jobId, email)` is rejected.',
    examples: {
      createApplicant: {
        summary: 'Create applicant payload',
        value: {
          jobId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
          firstName: 'Abel',
          lastName: 'Tesfaye',
          email: 'abel.tesfaye@example.com',
          phone: '+251912345678',
          resumeUrl: 'https://cdn.example.com/cv/abel.pdf',
          linkedinUrl: 'https://linkedin.com/in/abeltesfaye',
          skills: ['React', 'TypeScript', 'GraphQL'],
          currentCompany: 'TechCorp',
          currentPosition: 'Senior Engineer',
          yearsExperience: 6,
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    ApplicantResponseDto,
    'Created applicant',
    applicantResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/applicants',
    badRequest: 'Applicant payload is invalid',
    notFound: 'Job not found',
    conflict: 'Applicant already exists for this job and email',
  })
  create(
    @Body() body: CreateApplicantDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const user = req.user as AuthPrincipal | undefined;
    if (!user)
      throw new ForbiddenException('Authenticated user context is required');
    return this.createApplicant.execute(body, user.userId ?? user.sub);
  }

  @Get()
  @Roles(ApplicantPermissions.VIEW)
  @Audit('recruitment.applicant.list', 'hr.applicant')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/applicants',
    roles: [ApplicantPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List applicants' })
  @ApiEnvelopeArrayResponse(
    ApplicantResponseDto,
    'List of applicants',
    applicantListResponseEnvelope,
  )
  list(@Query() query: ApplicantListQueryDto) {
    return this.listApplicants.execute(query);
  }

  @Get(':id')
  @Roles(ApplicantPermissions.VIEW)
  @Audit('recruitment.applicant.get', 'hr.applicant')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/applicants/:id',
    roles: [ApplicantPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get applicant' })
  @ApiParam({ name: 'id', description: 'Applicant id' })
  @ApiEnvelopeOkResponse(
    ApplicantResponseDto,
    'Applicant details',
    applicantResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/applicants/:id',
    notFound: 'Applicant not found',
  })
  get(@Param('id') id: string) {
    return this.getApplicantById.execute(id);
  }

  @Patch(':id')
  @Roles(ApplicantPermissions.UPDATE)
  @Audit('recruitment.applicant.update', 'hr.applicant')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/applicants/:id',
    roles: [ApplicantPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update applicant' })
  @ApiParam({ name: 'id', description: 'Applicant id' })
  @ApiBody({
    type: UpdateApplicantDto,
    description:
      'Request body: partial applicant fields (all optional). Same structure as create.',
    examples: {
      updateApplicant: {
        summary: 'Update applicant profile fields',
        value: {
          phone: '+251911111111',
          currentCompany: 'NextWave Labs',
          currentPosition: 'Lead Engineer',
          yearsExperience: 7,
          skills: ['Node.js', 'TypeScript', 'PostgreSQL'],
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    ApplicantResponseDto,
    'Updated applicant',
    applicantResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/applicants/:id',
    badRequest: 'Applicant payload is invalid',
    notFound: 'Applicant not found',
  })
  update(@Param('id') id: string, @Body() body: UpdateApplicantDto) {
    return this.updateApplicantById.execute(id, body);
  }

  @Post(':id/status')
  @Roles(ApplicantPermissions.UPDATE)
  @Audit('recruitment.applicant.status', 'hr.applicant')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/applicants/:id/status',
    roles: [ApplicantPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update applicant status' })
  @ApiParam({ name: 'id', description: 'Applicant id' })
  @ApiBody({
    type: UpdateApplicantStatusDto,
    description:
      'Status flow: APPLIED -> SCREENING -> SHORTLISTED -> INTERVIEW -> OFFER -> HIRED, with REJECTED/WITHDRAWN allowed from active states.',
    examples: {
      moveToInterview: {
        summary: 'Move applicant to interview stage',
        value: {
          status: 'INTERVIEW',
          note: 'Passed screening and shortlisted by hiring manager.',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    ApplicantResponseDto,
    'Updated applicant status',
    applicantResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/applicants/:id/status',
    badRequest: 'Invalid applicant status transition',
    notFound: 'Applicant not found',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateApplicantStatusDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const user = req.user as AuthPrincipal | undefined;
    if (!user)
      throw new ForbiddenException('Authenticated user context is required');
    return this.updateApplicantStatusById.execute(
      id,
      body,
      user.userId ?? user.sub,
    );
  }
}
