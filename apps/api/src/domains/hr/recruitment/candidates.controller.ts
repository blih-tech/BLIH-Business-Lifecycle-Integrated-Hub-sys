import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type {
  CreateCandidateDto,
  CreateCvScreeningDto,
  CreateInterviewFeedbackDto,
  PipelineStatusUpdateDto,
  UpdateCandidateDto,
} from '@repo/types';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CandidatePermissions } from '../../../core/rbac/constants/permissions.constants';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import type { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import { CreateCandidateUseCase } from './use-cases/create-candidate.usecase';
import { CreateCvScreeningUseCase } from './use-cases/create-cv-screening.usecase';
import { CreateInterviewFeedbackUseCase } from './use-cases/create-interview-feedback.usecase';
import { GetCandidateUseCase } from './use-cases/get-candidate.usecase';
import { ListCandidateScreeningsUseCase } from './use-cases/list-candidate-screenings.usecase';
import { ListInterviewFeedbackUseCase } from './use-cases/list-interview-feedback.usecase';
import { UpdateCandidateStatusUseCase } from './use-cases/update-candidate-status.usecase';
import { UpdateCandidateUseCase } from './use-cases/update-candidate.usecase';

@ApiTags('HR Candidates')
@Controller('hr/recruitment/candidates')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class CandidatesController {
  constructor(
    private readonly createUseCase: CreateCandidateUseCase,
    private readonly getUseCase: GetCandidateUseCase,
    private readonly updateUseCase: UpdateCandidateUseCase,
    private readonly updateStatusUseCase: UpdateCandidateStatusUseCase,
    private readonly listScreeningsUseCase: ListCandidateScreeningsUseCase,
    private readonly createScreeningUseCase: CreateCvScreeningUseCase,
    private readonly listInterviewFeedbackUseCase: ListInterviewFeedbackUseCase,
    private readonly createInterviewFeedbackUseCase: CreateInterviewFeedbackUseCase,
  ) {}

  @Post()
  @Roles(CandidatePermissions.CREATE)
  @Audit('recruitment.candidate.create', 'hr.candidate')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/candidates',
    roles: [CandidatePermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create candidate application' })
  @ApiBody({ schema: { type: 'object' } })
  create(@Body() body: CreateCandidateDto) {
    return this.createUseCase.execute(body);
  }

  @Get(':id')
  @Roles(CandidatePermissions.VIEW)
  @Audit('recruitment.candidate.get', 'hr.candidate')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/candidates/:id',
    roles: [CandidatePermissions.VIEW],
  })
  @ApiParam({ name: 'id', description: 'Candidate id' })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(CandidatePermissions.UPDATE)
  @Audit('recruitment.candidate.update', 'hr.candidate')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/candidates/:id',
    roles: [CandidatePermissions.UPDATE],
  })
  @ApiParam({ name: 'id', description: 'Candidate id' })
  @ApiBody({ schema: { type: 'object' } })
  update(@Param('id') id: string, @Body() body: UpdateCandidateDto) {
    return this.updateUseCase.execute(id, body);
  }

  @Post(':id/status')
  @Roles(CandidatePermissions.UPDATE)
  @Audit('recruitment.candidate.status', 'hr.candidate')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/candidates/:id/status',
    roles: [CandidatePermissions.UPDATE],
  })
  @ApiParam({ name: 'id', description: 'Candidate id' })
  @ApiBody({ schema: { type: 'object' } })
  updateStatus(@Param('id') id: string, @Body() body: PipelineStatusUpdateDto) {
    return this.updateStatusUseCase.execute(id, body);
  }

  @Get(':id/screenings')
  @Roles(CandidatePermissions.VIEW, CandidatePermissions.SCREEN)
  @Audit('recruitment.candidate.screenings.list', 'hr.candidate')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/candidates/:id/screenings',
    roles: [CandidatePermissions.VIEW, CandidatePermissions.SCREEN],
  })
  @ApiParam({ name: 'id', description: 'Candidate id' })
  listScreenings(@Param('id') id: string) {
    return this.listScreeningsUseCase.execute(id);
  }

  @Post(':id/screenings')
  @Roles(CandidatePermissions.SCREEN)
  @Audit('recruitment.candidate.screenings.create', 'hr.candidate')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/candidates/:id/screenings',
    roles: [CandidatePermissions.SCREEN],
  })
  @ApiParam({ name: 'id', description: 'Candidate id' })
  @ApiBody({ schema: { type: 'object' } })
  createScreening(
    @Param('id') id: string,
    @Body() body: Omit<CreateCvScreeningDto, 'candidateId'>,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const screenedById =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!screenedById) {
      throw new ForbiddenException('Authenticated user id required');
    }

    return this.createScreeningUseCase.execute(
      {
        ...body,
        candidateId: id,
      },
      screenedById,
    );
  }

  @Get(':id/interview-feedback')
  @Roles(CandidatePermissions.VIEW, CandidatePermissions.SCREEN)
  @Audit('recruitment.candidate.interview_feedback.list', 'hr.candidate')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/candidates/:id/interview-feedback',
    roles: [CandidatePermissions.VIEW, CandidatePermissions.SCREEN],
  })
  @ApiParam({ name: 'id', description: 'Candidate id' })
  listInterviewFeedback(@Param('id') id: string) {
    return this.listInterviewFeedbackUseCase.execute(id);
  }

  @Post(':id/interview-feedback')
  @Roles(CandidatePermissions.SCREEN)
  @Audit('recruitment.candidate.interview_feedback.create', 'hr.candidate')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/candidates/:id/interview-feedback',
    roles: [CandidatePermissions.SCREEN],
  })
  @ApiParam({ name: 'id', description: 'Candidate id' })
  @ApiBody({ schema: { type: 'object' } })
  createInterviewFeedback(
    @Param('id') id: string,
    @Body() body: Omit<CreateInterviewFeedbackDto, 'candidateId'>,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const compiledById =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!compiledById) {
      throw new ForbiddenException('Authenticated user id required');
    }

    return this.createInterviewFeedbackUseCase.execute(
      {
        ...body,
        candidateId: id,
      },
      compiledById,
    );
  }
}
