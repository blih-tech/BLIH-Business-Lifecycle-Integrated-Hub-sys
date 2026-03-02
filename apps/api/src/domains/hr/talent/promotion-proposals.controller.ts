import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type {
  CreatePromotionProposalDto,
  ReviewPromotionProposalDto,
} from '@repo/types';
import { PromotionProposalPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
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
  @ApiOkResponse({ description: 'Promotion proposals' })
  list(@Query('userId') userId?: string, @Query('status') status?: string) {
    return this.listUseCase.execute({ userId, status });
  }

  @Get(':id')
  @Roles(PromotionProposalPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/promotion-proposals/:id',
    roles: [PromotionProposalPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get promotion proposal' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Promotion proposal' })
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
  @ApiOkResponse({ description: 'Created proposal' })
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
  @ApiOkResponse({ description: 'Reviewed proposal' })
  review(@Param('id') id: string, @Body() body: ReviewPromotionProposalDto) {
    return this.reviewUseCase.execute(id, body);
  }
}
