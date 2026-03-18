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
import type { ApplicantResponseDto as ApplicantResponseContract } from '@repo/types';
import { ApplicantPermissions } from '@repo/types/rbac';
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
  BulkApplicantStatusResponseDto,
  BulkUpdateApplicantStatusDto,
  ApplicantResponseDto,
  UpdateApplicantDto,
  UpdateApplicantStatusDto,
} from './dto/applicant.dto';
import {
  applicantListResponseEnvelope,
  applicantResponseEnvelope,
  bulkApplicantStatusResponseEnvelope,
} from './recruitment.swagger-examples';
import {
  BulkUpdateApplicantStatusUseCase,
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
    private readonly listApplicants: ListApplicantsUseCase,
    private readonly bulkUpdateApplicants: BulkUpdateApplicantStatusUseCase,
    private readonly getApplicantById: GetApplicantUseCase,
    private readonly updateApplicantById: UpdateApplicantUseCase,
    private readonly updateApplicantStatusById: UpdateApplicantStatusUseCase,
  ) {}

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
  list(
    @Query() query: ApplicantListQueryDto,
  ): Promise<ApplicantResponseContract[]> {
    return this.listApplicants.execute(query);
  }

  @Post('bulk-status')
  @Roles(ApplicantPermissions.UPDATE)
  @Audit('recruitment.applicant.bulk_status', 'hr.applicant')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/applicants/bulk-status',
    roles: [ApplicantPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Bulk shortlist or reject applicants' })
  @ApiBody({
    type: BulkUpdateApplicantStatusDto,
    description:
      'Bulk review endpoint restricted to SHORTLISTED and REJECTED transitions. The batch is validated and applied atomically.',
    examples: {
      bulkShortlist: {
        summary: 'Shortlist multiple applicants',
        value: {
          applicantIds: [
            '8dea40a6-4ee2-4cca-9ff3-ac9e95e50384',
            'd5711835-84d8-4f33-9adc-7ef0eaaf7b9b',
          ],
          status: 'SHORTLISTED',
          notes: 'Passed HR screening.',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    BulkApplicantStatusResponseDto,
    'Bulk applicant status update result',
    bulkApplicantStatusResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/applicants/bulk-status',
    badRequest: 'Invalid bulk applicant status transition',
    notFound: 'One or more applicants were not found',
  })
  bulkUpdateStatus(
    @Body() body: BulkUpdateApplicantStatusDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const user = req.user as AuthPrincipal | undefined;
    if (!user)
      throw new ForbiddenException('Authenticated user context is required');
    return this.bulkUpdateApplicants.execute(body, user.userId ?? user.sub);
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
  get(@Param('id') id: string): Promise<ApplicantResponseContract> {
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
  update(
    @Param('id') id: string,
    @Body() body: UpdateApplicantDto,
  ): Promise<ApplicantResponseContract> {
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
          notes: 'Passed screening and shortlisted by hiring manager.',
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
  ): Promise<ApplicantResponseContract> {
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
