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
import type { OfferResponseDto as OfferResponseContract } from '@repo/types';
import { OfferPermissions } from '@repo/types/rbac';
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
  CreateOfferDto,
  OfferListQueryDto,
  OfferResponseDto,
  RespondOfferDto,
  SendOfferDto,
  UpdateOfferDto,
  WithdrawOfferDto,
} from './dto/offer.dto';
import {
  offerListResponseEnvelope,
  offerResponseEnvelope,
} from './recruitment.swagger-examples';
import {
  CreateOfferUseCase,
  GetOfferUseCase,
  ListOffersUseCase,
  RespondOfferUseCase,
  SendOfferUseCase,
  UpdateOfferUseCase,
  WithdrawOfferUseCase,
} from './use-cases/offers.usecases';

@ApiTags('HR Recruitment Offers')
@Controller('hr/recruitment/offers')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class OffersController {
  constructor(
    private readonly createOffer: CreateOfferUseCase,
    private readonly listOffers: ListOffersUseCase,
    private readonly getOfferById: GetOfferUseCase,
    private readonly updateOfferById: UpdateOfferUseCase,
    private readonly sendOfferById: SendOfferUseCase,
    private readonly respondOfferById: RespondOfferUseCase,
    private readonly withdrawOfferById: WithdrawOfferUseCase,
  ) {}

  @Post()
  @Roles(OfferPermissions.CREATE)
  @Audit('recruitment.offer.create', 'hr.offer')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/offers',
    roles: [OfferPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create offer (draft)' })
  @ApiBody({
    type: CreateOfferDto,
    description:
      'Request body: jobId (required), applicantId (required). Optional: salary/currency/startDate/payFrequency/employmentType/bonus/equity/offerLetterUrl/notes/expiresAt.',
    examples: {
      createDraftOffer: {
        summary: 'Create draft offer',
        value: {
          jobId: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
          applicantId: '8dea40a6-4ee2-4cca-9ff3-ac9e95e50384',
          salary: 145000,
          currency: 'USD',
          startDate: '2026-04-01',
          payFrequency: 'MONTHLY',
          employmentType: 'FULL_TIME',
          bonus: 5000,
          equity: 0,
          notes: 'Offer prepared after final interview.',
          expiresAt: '2026-03-31T23:59:59.000Z',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    OfferResponseDto,
    'Created offer',
    offerResponseEnvelope,
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/recruitment/offers',
    badRequest: 'Offer payload is invalid',
    notFound: 'Applicant not found',
    conflict: 'Offer already exists for this job and applicant',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  create(
    @Body() body: CreateOfferDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ): Promise<OfferResponseContract> {
    const user = req.user as AuthPrincipal | undefined;
    if (!user)
      throw new ForbiddenException('Authenticated user context is required');
    return this.createOffer.execute(body, user.userId ?? user.sub);
  }

  @Get()
  @Roles(OfferPermissions.VIEW)
  @Audit('recruitment.offer.list', 'hr.offer')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/offers',
    roles: [OfferPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List offers' })
  @ApiEnvelopeArrayResponse(
    OfferResponseDto,
    'List of offers',
    offerListResponseEnvelope,
  )
  list(@Query() query: OfferListQueryDto): Promise<OfferResponseContract[]> {
    return this.listOffers.execute(query);
  }

  @Get(':id')
  @Roles(OfferPermissions.VIEW)
  @Audit('recruitment.offer.get', 'hr.offer')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/offers/:id',
    roles: [OfferPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get offer' })
  @ApiParam({ name: 'id', description: 'Offer id' })
  @ApiEnvelopeOkResponse(
    OfferResponseDto,
    'Offer details',
    offerResponseEnvelope,
  )
  get(@Param('id') id: string): Promise<OfferResponseContract> {
    return this.getOfferById.execute(id);
  }

  @Patch(':id')
  @Roles(OfferPermissions.UPDATE)
  @Audit('recruitment.offer.update', 'hr.offer')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/offers/:id',
    roles: [OfferPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update draft offer' })
  @ApiParam({ name: 'id', description: 'Offer id' })
  @ApiBody({
    type: UpdateOfferDto,
    description:
      'Request body: partial offer fields (all optional). Only DRAFT offers can be updated.',
    examples: {
      updateOffer: {
        summary: 'Update salary and start date',
        value: { salary: 150000, startDate: '2026-04-15' },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    OfferResponseDto,
    'Updated offer',
    offerResponseEnvelope,
  )
  update(
    @Param('id') id: string,
    @Body() body: UpdateOfferDto,
  ): Promise<OfferResponseContract> {
    return this.updateOfferById.execute(id, body);
  }

  @Post(':id/send')
  @Roles(OfferPermissions.SEND)
  @Audit('recruitment.offer.send', 'hr.offer')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/offers/:id/send',
    roles: [OfferPermissions.SEND],
  })
  @ApiOperation({ summary: 'Send offer (DRAFT → SENT)' })
  @ApiParam({ name: 'id', description: 'Offer id' })
  @ApiBody({
    type: SendOfferDto,
    description: 'Request body (optional): expiresAt.',
    examples: {
      sendOffer: {
        summary: 'Send offer with expiration',
        value: { expiresAt: '2026-03-31T23:59:59.000Z' },
      },
      sendOfferNoBody: { summary: 'Send offer without body', value: {} },
    },
  })
  @ApiEnvelopeOkResponse(OfferResponseDto, 'Sent offer', offerResponseEnvelope)
  send(
    @Param('id') id: string,
    @Body() body: SendOfferDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ): Promise<OfferResponseContract> {
    const user = req.user as AuthPrincipal | undefined;
    if (!user)
      throw new ForbiddenException('Authenticated user context is required');
    return this.sendOfferById.execute(id, body, user.userId ?? user.sub);
  }

  @Post(':id/respond')
  @Roles(OfferPermissions.RESPOND)
  @Audit('recruitment.offer.respond', 'hr.offer')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/offers/:id/respond',
    roles: [OfferPermissions.RESPOND],
  })
  @ApiOperation({ summary: 'Respond to offer (SENT → ACCEPTED/DECLINED)' })
  @ApiParam({ name: 'id', description: 'Offer id' })
  @ApiBody({
    type: RespondOfferDto,
    description: 'Request body: decision — ACCEPTED or DECLINED.',
    examples: {
      accept: { summary: 'Accept offer', value: { decision: 'ACCEPTED' } },
      decline: { summary: 'Decline offer', value: { decision: 'DECLINED' } },
    },
  })
  @ApiEnvelopeOkResponse(
    OfferResponseDto,
    'Updated offer status',
    offerResponseEnvelope,
  )
  respond(
    @Param('id') id: string,
    @Body() body: RespondOfferDto,
    @Req() req: Request & { user?: AuthPrincipal },
  ): Promise<OfferResponseContract> {
    const user = req.user as AuthPrincipal | undefined;
    if (!user)
      throw new ForbiddenException('Authenticated user context is required');
    return this.respondOfferById.execute(id, body, user.userId ?? user.sub);
  }

  @Post(':id/withdraw')
  @Roles(OfferPermissions.WITHDRAW)
  @Audit('recruitment.offer.withdraw', 'hr.offer')
  @ApiProtected({
    path: '/api/v1/hr/recruitment/offers/:id/withdraw',
    roles: [OfferPermissions.WITHDRAW],
  })
  @ApiOperation({ summary: 'Withdraw offer (DRAFT/SENT → WITHDRAWN)' })
  @ApiParam({ name: 'id', description: 'Offer id' })
  @ApiBody({
    type: WithdrawOfferDto,
    description: 'Request body (optional): reason.',
    examples: {
      withdraw: {
        summary: 'Withdraw with reason',
        value: { reason: 'Position closed' },
      },
      withdrawNoBody: { summary: 'Withdraw without body', value: {} },
    },
  })
  @ApiEnvelopeOkResponse(
    OfferResponseDto,
    'Withdrawn offer',
    offerResponseEnvelope,
  )
  withdraw(
    @Param('id') id: string,
    @Body() body: WithdrawOfferDto,
  ): Promise<OfferResponseContract> {
    return this.withdrawOfferById.execute(id, body);
  }
}
