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
import { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
  GenericEntityResponseDto,
} from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { RecruitmentRequestPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Audit } from '../../../shared/decorators/audit.decorator';
import type {
  CreateRecruitmentRequestDto,
  UpdateRecruitmentRequestDto,
} from '@repo/types';
import { ListRecruitmentRequestsUseCase } from './use-cases/list-recruitment-requests.usecase';
import { GetRecruitmentRequestUseCase } from './use-cases/get-recruitment-request.usecase';
import { CreateRecruitmentRequestUseCase } from './use-cases/create-recruitment-request.usecase';
import { UpdateRecruitmentRequestUseCase } from './use-cases/update-recruitment-request.usecase';
import { SubmitRecruitmentRequestUseCase } from './use-cases/submit-recruitment-request.usecase';
import { ApproveRecruitmentRequestUseCase } from './use-cases/approve-recruitment-request.usecase';
import { CreateJobPostingFromRequestUseCase } from './use-cases/create-job-posting-from-request.usecase';

@ApiTags('HR Recruitment Requests')
@Controller('hr/recruitment/requests')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class RecruitmentRequestsController {
  constructor(
    private readonly listUseCase: ListRecruitmentRequestsUseCase,
    private readonly getUseCase: GetRecruitmentRequestUseCase,
    private readonly createUseCase: CreateRecruitmentRequestUseCase,
    private readonly updateUseCase: UpdateRecruitmentRequestUseCase,
    private readonly submitUseCase: SubmitRecruitmentRequestUseCase,
    private readonly approveUseCase: ApproveRecruitmentRequestUseCase,
    private readonly createJobPostingUseCase: CreateJobPostingFromRequestUseCase,
  ) {}

  @Get()
  @Roles(RecruitmentRequestPermissions.VIEW)
  @Audit('recruitment.request.list', 'hr.recruitment_request')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/requests',
    roles: [RecruitmentRequestPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List recruitment requests' })
  @ApiEnvelopeArrayResponse(
    GenericEntityResponseDto,
    'List of recruitment requests',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/requests',
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
  @Roles(RecruitmentRequestPermissions.VIEW)
  @Audit('recruitment.request.get', 'hr.recruitment_request')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/requests/:id',
    roles: [RecruitmentRequestPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get recruitment request' })
  @ApiParam({ name: 'id', description: 'Request id' })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Recruitment request')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/requests/:id',
    notFound: 'Recruitment request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Post()
  @Roles(RecruitmentRequestPermissions.CREATE)
  @Audit('recruitment.request.create', 'hr.recruitment_request')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/requests',
    roles: [RecruitmentRequestPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create recruitment request' })
  @ApiBody({ schema: { type: 'object', required: ['departmentId'] } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Created request')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/requests',
    badRequest: 'Recruitment request payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Authenticated user id required',
  })
  create(
    @Body() body: CreateRecruitmentRequestDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const userId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!userId) throw new ForbiddenException('Authenticated user id required');
    return this.createUseCase.execute(body, userId);
  }

  @Patch(':id')
  @Roles(RecruitmentRequestPermissions.UPDATE)
  @Audit('recruitment.request.update', 'hr.recruitment_request')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/requests/:id',
    roles: [RecruitmentRequestPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update draft recruitment request' })
  @ApiParam({ name: 'id', description: 'Request id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Updated request')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/requests/:id',
    badRequest: 'Recruitment request payload is invalid',
    notFound: 'Recruitment request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  update(@Param('id') id: string, @Body() body: UpdateRecruitmentRequestDto) {
    return this.updateUseCase.execute(id, body);
  }

  @Post(':id/submit')
  @Roles(RecruitmentRequestPermissions.UPDATE)
  @Audit('recruitment.request.submit', 'hr.recruitment_request')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/requests/:id/submit',
    roles: [RecruitmentRequestPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Submit request for approval' })
  @ApiParam({ name: 'id', description: 'Request id' })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Submitted request')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/requests/:id/submit',
    notFound: 'Recruitment request not found',
    conflict: 'Recruitment request cannot be submitted from its current state',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  submit(@Param('id') id: string) {
    return this.submitUseCase.execute(id);
  }

  @Post(':id/approve')
  @Roles(RecruitmentRequestPermissions.APPROVE)
  @Audit('recruitment.request.approve', 'hr.recruitment_request')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/requests/:id/approve',
    roles: [RecruitmentRequestPermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Record approval step' })
  @ApiParam({ name: 'id', description: 'Request id' })
  @ApiBody({ schema: { type: 'object', required: ['role', 'decision'] } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Approval recorded')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/requests/:id/approve',
    badRequest: 'Approval payload is invalid',
    notFound: 'Recruitment request not found',
    conflict: 'Recruitment request cannot be approved from its current state',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Authenticated user id required',
  })
  approve(
    @Param('id') id: string,
    @Body()
    body: {
      role: string;
      decision: 'APPROVED' | 'REJECTED';
      comments?: string | null;
    },
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const approverId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!approverId)
      throw new ForbiddenException('Authenticated user id required');
    return this.approveUseCase.execute(id, body, approverId);
  }

  @Post(':id/job-posting')
  @Roles(
    RecruitmentRequestPermissions.VIEW,
    RecruitmentRequestPermissions.UPDATE,
  )
  @Audit('recruitment.job_posting.create_from_request', 'hr.job_posting')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/requests/:id/job-posting',
    roles: [
      RecruitmentRequestPermissions.VIEW,
      RecruitmentRequestPermissions.UPDATE,
    ],
  })
  @ApiOperation({ summary: 'Create job posting from approved request' })
  @ApiParam({ name: 'id', description: 'Request id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Created job posting')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/requests/:id/job-posting',
    badRequest: 'Job posting payload is invalid',
    notFound: 'Recruitment request not found',
    conflict: 'Job posting cannot be created from the current request state',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  createJobPosting(
    @Param('id') id: string,
    @Body()
    body: {
      positionSnapshot?: Record<string, unknown>;
      description?: Record<string, unknown>;
      prerequisites?: Record<string, unknown>;
      kpis?: unknown[];
      platforms?: string[];
    },
  ) {
    return this.createJobPostingUseCase.execute(id, body);
  }
}
