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
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { RecruitmentRequestPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Roles } from '../../../shared/decorators/roles.decorator';
import type {
  CreateRecruitmentRequestDto,
  UpdateRecruitmentRequestDto,
} from '@blih/types';
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
  @ApiProtected({
    path: '/api/v1/hr/recruitment/requests',
    roles: [RecruitmentRequestPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List recruitment requests' })
  @ApiOkResponse({ description: 'List of recruitment requests' })
  list(
    @Query('status') status?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.listUseCase.execute({ status, departmentId });
  }

  @Get(':id')
  @Roles(RecruitmentRequestPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/recruitment/requests/:id',
    roles: [RecruitmentRequestPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get recruitment request' })
  @ApiParam({ name: 'id', description: 'Request id' })
  @ApiOkResponse({ description: 'Recruitment request' })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Post()
  @Roles(RecruitmentRequestPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/recruitment/requests',
    roles: [RecruitmentRequestPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create recruitment request' })
  @ApiBody({ schema: { type: 'object', required: ['departmentId'] } })
  @ApiOkResponse({ description: 'Created request' })
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
  @ApiProtected({
    path: '/api/v1/hr/recruitment/requests/:id',
    roles: [RecruitmentRequestPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update draft recruitment request' })
  @ApiParam({ name: 'id', description: 'Request id' })
  @ApiOkResponse({ description: 'Updated request' })
  update(@Param('id') id: string, @Body() body: UpdateRecruitmentRequestDto) {
    return this.updateUseCase.execute(id, body);
  }

  @Post(':id/submit')
  @Roles(RecruitmentRequestPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/recruitment/requests/:id/submit',
    roles: [RecruitmentRequestPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Submit request for approval' })
  @ApiParam({ name: 'id', description: 'Request id' })
  @ApiOkResponse({ description: 'Submitted' })
  submit(@Param('id') id: string) {
    return this.submitUseCase.execute(id);
  }

  @Post(':id/approve')
  @Roles(RecruitmentRequestPermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/recruitment/requests/:id/approve',
    roles: [RecruitmentRequestPermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Record approval step' })
  @ApiParam({ name: 'id', description: 'Request id' })
  @ApiBody({ schema: { type: 'object', required: ['role', 'decision'] } })
  @ApiOkResponse({ description: 'Approval recorded' })
  approve(
    @Param('id') id: string,
    @Body()
    body: {
      role: string;
      decision: 'APPROVE' | 'REJECT';
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
  @ApiOkResponse({ description: 'Created job posting' })
  createJobPosting(
    @Param('id') id: string,
    @Body()
    body: {
      position?: Record<string, unknown>;
      description?: Record<string, unknown>;
      prerequisites?: Record<string, unknown>;
      kpis?: unknown[];
      platforms?: string[];
    },
  ) {
    return this.createJobPostingUseCase.execute(id, body);
  }
}
