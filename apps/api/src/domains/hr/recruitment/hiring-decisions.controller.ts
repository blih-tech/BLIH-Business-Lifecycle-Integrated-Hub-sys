import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type {
  AcceptOfferDto,
  CreateHiringDecisionDto,
  FinalizeHiringDecisionDto,
} from '@repo/types';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { HiringDecisionPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Audit } from '../../../shared/decorators/audit.decorator';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
  GenericEntityResponseDto,
} from '../../../shared/docs/openapi';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import { AcceptHiringOfferUseCase } from './use-cases/accept-hiring-offer.usecase';
import { CreateHiringDecisionUseCase } from './use-cases/create-hiring-decision.usecase';
import { FinalizeHiringDecisionUseCase } from './use-cases/finalize-hiring-decision.usecase';
import { GetHiringDecisionUseCase } from './use-cases/get-hiring-decision.usecase';
import { ListHiringDecisionsUseCase } from './use-cases/list-hiring-decisions.usecase';

@ApiTags('HR Hiring Decisions')
@Controller('hr/recruitment/hiring-decisions')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class HiringDecisionsController {
  constructor(
    private readonly createUseCase: CreateHiringDecisionUseCase,
    private readonly listUseCase: ListHiringDecisionsUseCase,
    private readonly getUseCase: GetHiringDecisionUseCase,
    private readonly finalizeUseCase: FinalizeHiringDecisionUseCase,
    private readonly acceptOfferUseCase: AcceptHiringOfferUseCase,
  ) {}

  @Get()
  @Roles(HiringDecisionPermissions.VIEW)
  @Audit('recruitment.hiring_decision.list', 'hr.hiring_decision')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/hiring-decisions',
    roles: [HiringDecisionPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List hiring decisions' })
  @ApiEnvelopeArrayResponse(
    GenericEntityResponseDto,
    'List of hiring decisions',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/hiring-decisions',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(
    @Query('finalDecision') finalDecision?: string,
    @Query('recruitmentRequestId') recruitmentRequestId?: string,
    @Query('candidateId') candidateId?: string,
  ) {
    return this.listUseCase.execute({
      finalDecision,
      recruitmentRequestId,
      candidateId,
    });
  }

  @Post()
  @Roles(HiringDecisionPermissions.CREATE)
  @Audit('recruitment.hiring_decision.create', 'hr.hiring_decision')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/hiring-decisions',
    roles: [HiringDecisionPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create hiring decision' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Created hiring decision')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/hiring-decisions',
    badRequest: 'Hiring decision payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Authenticated user id required',
  })
  create(
    @Body() body: CreateHiringDecisionDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ) {
    const userId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!userId) throw new ForbiddenException('Authenticated user id required');
    return this.createUseCase.execute(body, userId);
  }

  @Get(':id')
  @Roles(HiringDecisionPermissions.VIEW)
  @Audit('recruitment.hiring_decision.get', 'hr.hiring_decision')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/hiring-decisions/:id',
    roles: [HiringDecisionPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get hiring decision' })
  @ApiParam({ name: 'id', description: 'Hiring decision id' })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Hiring decision details')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/hiring-decisions/:id',
    notFound: 'Hiring decision not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Post(':id/finalize')
  @Roles(HiringDecisionPermissions.APPROVE)
  @Audit('recruitment.hiring_decision.finalize', 'hr.hiring_decision')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/hiring-decisions/:id/finalize',
    roles: [HiringDecisionPermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Finalize hiring decision outcome' })
  @ApiParam({ name: 'id', description: 'Hiring decision id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Finalized hiring decision')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/hiring-decisions/:id/finalize',
    badRequest: 'Hiring decision finalization payload is invalid',
    notFound: 'Hiring decision not found',
    conflict: 'Hiring decision cannot be finalized from its current state',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  finalize(@Param('id') id: string, @Body() body: FinalizeHiringDecisionDto) {
    return this.finalizeUseCase.execute(id, body);
  }

  @Post(':id/accept-offer')
  @Roles(HiringDecisionPermissions.APPROVE)
  @Audit('recruitment.hiring_decision.accept_offer', 'hr.hiring_decision')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/hiring-decisions/:id/accept-offer',
    roles: [HiringDecisionPermissions.APPROVE],
  })
  @ApiOperation({
    summary: 'Accept offer and move candidate into onboarding lifecycle',
  })
  @ApiParam({ name: 'id', description: 'Hiring decision id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Offer acceptance processed')
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/hiring-decisions/:id/accept-offer',
    badRequest: 'Offer acceptance payload is invalid',
    notFound: 'Hiring decision not found',
    conflict: 'Offer cannot be accepted from the current decision state',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  acceptOffer(@Param('id') id: string, @Body() body: AcceptOfferDto) {
    return this.acceptOfferUseCase.execute(id, body);
  }
}
