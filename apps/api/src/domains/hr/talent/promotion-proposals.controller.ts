import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type {
  CreatePromotionProposalDto,
  ReviewPromotionProposalDto,
} from '@repo/types';
import { PromotionProposalPermissions } from '@repo/types/rbac';
import { Roles } from '../../../shared/decorators/roles.decorator';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
  GenericEntityResponseDto,
} from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { CreatePromotionProposalUseCase } from './use-cases/create-promotion-proposal.usecase';
import { GetPromotionProposalUseCase } from './use-cases/get-promotion-proposal.usecase';
import { ListPromotionProposalsUseCase } from './use-cases/list-promotion-proposals.usecase';
import { ReviewPromotionProposalUseCase } from './use-cases/review-promotion-proposal.usecase';

@ApiTags('HR Talent')
@Controller('hr/promotion-proposals')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class PromotionProposalsController {
  constructor(
    private readonly createUseCase: CreatePromotionProposalUseCase,
    private readonly listUseCase: ListPromotionProposalsUseCase,
    private readonly getUseCase: GetPromotionProposalUseCase,
    private readonly reviewUseCase: ReviewPromotionProposalUseCase,
  ) {}

  @Get()
  @Roles(PromotionProposalPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/promotion-proposals',
    roles: [PromotionProposalPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List promotion proposals' })
  @ApiEnvelopeArrayResponse(GenericEntityResponseDto, 'Promotion proposals')
  @ApiDefaultErrors({
    path: '/api/v1/hr/promotion-proposals',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.listUseCase.execute({ employeeId, status });
  }

  @Get(':id')
  @Roles(PromotionProposalPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/promotion-proposals/:id',
    roles: [PromotionProposalPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get promotion proposal' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Promotion proposal')
  @ApiDefaultErrors({
    path: '/api/v1/hr/promotion-proposals/:id',
    notFound: 'Promotion proposal not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Post()
  @Roles(PromotionProposalPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/promotion-proposals',
    roles: [PromotionProposalPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create promotion proposal' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Created proposal')
  @ApiDefaultErrors({
    path: '/api/v1/hr/promotion-proposals',
    badRequest: 'Promotion proposal payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  create(@Body() body: CreatePromotionProposalDto) {
    return this.createUseCase.execute(body);
  }

  @Post(':id/review')
  @Roles(PromotionProposalPermissions.REVIEW)
  @ApiProtected({
    path: '/api/v1/hr/promotion-proposals/:id/review',
    roles: [PromotionProposalPermissions.REVIEW],
  })
  @ApiOperation({ summary: 'Approve or reject promotion proposal' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Reviewed proposal')
  @ApiDefaultErrors({
    path: '/api/v1/hr/promotion-proposals/:id/review',
    badRequest: 'Promotion review payload is invalid',
    notFound: 'Promotion proposal not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  review(@Param('id') id: string, @Body() body: ReviewPromotionProposalDto) {
    return this.reviewUseCase.execute(id, body);
  }
}
