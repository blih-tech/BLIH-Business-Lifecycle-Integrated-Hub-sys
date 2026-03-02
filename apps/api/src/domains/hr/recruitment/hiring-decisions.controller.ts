import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type {
  AcceptOfferDto,
  CreateHiringDecisionDto,
  FinalizeHiringDecisionDto,
} from '@repo/types';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { HiringDecisionPermissions } from '../../../core/rbac/constants/permissions.constants';
import { ApiProtected } from '../../../shared/docs/openapi';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import { AcceptHiringOfferUseCase } from './use-cases/accept-hiring-offer.usecase';
import { CreateHiringDecisionUseCase } from './use-cases/create-hiring-decision.usecase';
import { FinalizeHiringDecisionUseCase } from './use-cases/finalize-hiring-decision.usecase';
import { GetHiringDecisionUseCase } from './use-cases/get-hiring-decision.usecase';

@ApiTags('HR Hiring Decisions')
@Controller('hr/recruitment/hiring-decisions')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class HiringDecisionsController {
  constructor(
    private readonly createUseCase: CreateHiringDecisionUseCase,
    private readonly getUseCase: GetHiringDecisionUseCase,
    private readonly finalizeUseCase: FinalizeHiringDecisionUseCase,
    private readonly acceptOfferUseCase: AcceptHiringOfferUseCase,
  ) {}

  @Post()
  @Roles(HiringDecisionPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/recruitment/hiring-decisions',
    roles: [HiringDecisionPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create hiring decision' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Created hiring decision' })
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
  @ApiProtected({
    path: '/api/v1/hr/recruitment/hiring-decisions/:id',
    roles: [HiringDecisionPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get hiring decision' })
  @ApiParam({ name: 'id', description: 'Hiring decision id' })
  @ApiOkResponse({ description: 'Hiring decision details' })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Post(':id/finalize')
  @Roles(HiringDecisionPermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/recruitment/hiring-decisions/:id/finalize',
    roles: [HiringDecisionPermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Finalize hiring decision outcome' })
  @ApiParam({ name: 'id', description: 'Hiring decision id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Finalized hiring decision' })
  finalize(@Param('id') id: string, @Body() body: FinalizeHiringDecisionDto) {
    return this.finalizeUseCase.execute(id, body);
  }

  @Post(':id/accept-offer')
  @Roles(HiringDecisionPermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/recruitment/hiring-decisions/:id/accept-offer',
    roles: [HiringDecisionPermissions.APPROVE],
  })
  @ApiOperation({
    summary: 'Accept offer and move candidate into onboarding lifecycle',
  })
  @ApiParam({ name: 'id', description: 'Hiring decision id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Offer acceptance processed' })
  acceptOffer(@Param('id') id: string, @Body() body: AcceptOfferDto) {
    return this.acceptOfferUseCase.execute(id, body);
  }
}
