import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type {
  CreateOkrDto,
  ReweightKeyResultsDto,
  UpsertOkrManagerReviewDto,
  UpdateKeyResultDto,
  UpdateOkrDto,
} from '@repo/types';
import { OkrPermissions } from '@repo/types/rbac';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
  GenericEntityResponseDto,
  GenericMetricsResponseDto,
} from '../../../shared/docs/openapi';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { CreateOkrUseCase } from './use-cases/create-okr.usecase';
import { ListOkrsUseCase } from './use-cases/list-okrs.usecase';
import { GetOkrUseCase } from './use-cases/get-okr.usecase';
import { UpdateOkrUseCase } from './use-cases/update-okr.usecase';
import { UpdateKeyResultUseCase } from './use-cases/update-key-result.usecase';
import { GetOkrProgressUseCase } from './use-cases/get-okr-progress.usecase';
import { ListKeyResultUpdatesUseCase } from './use-cases/list-key-result-updates.usecase';
import { ReweightKeyResultsUseCase } from './use-cases/reweight-key-results.usecase';
import { OkrManagerReviewService } from './okr-manager-review.service';

@ApiTags('HR OKRs')
@Controller('hr/okrs')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class OkrController {
  constructor(
    private readonly createUseCase: CreateOkrUseCase,
    private readonly listUseCase: ListOkrsUseCase,
    private readonly getUseCase: GetOkrUseCase,
    private readonly updateUseCase: UpdateOkrUseCase,
    private readonly updateKeyResultUseCase: UpdateKeyResultUseCase,
    private readonly getProgressUseCase: GetOkrProgressUseCase,
    private readonly listKeyResultUpdatesUseCase: ListKeyResultUpdatesUseCase,
    private readonly reweightKeyResultsUseCase: ReweightKeyResultsUseCase,
    private readonly managerReviewService: OkrManagerReviewService,
  ) {}

  @Post()
  @Roles(OkrPermissions.CREATE)
  @ApiProtected({ path: '/api/v1/hr/okrs', roles: [OkrPermissions.CREATE] })
  @ApiOperation({ summary: 'Create OKR with optional key results' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Created OKR')
  @ApiDefaultErrors({
    path: '/api/v1/hr/okrs',
    badRequest: 'OKR payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  create(@Body() body: CreateOkrDto) {
    return this.createUseCase.execute(body);
  }

  @Get()
  @Roles(OkrPermissions.VIEW)
  @ApiProtected({ path: '/api/v1/hr/okrs', roles: [OkrPermissions.VIEW] })
  @ApiOperation({ summary: 'List OKRs' })
  @ApiEnvelopeArrayResponse(GenericEntityResponseDto, 'List of OKRs')
  @ApiDefaultErrors({
    path: '/api/v1/hr/okrs',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  list(
    @Query('employeeId') employeeId?: string,
    @Query('scope') scope?: string,
    @Query('departmentId') departmentId?: string,
    @Query('periodYear') periodYear?: string,
    @Query('periodQuarter') periodQuarter?: string,
    @Query('status') status?: string,
  ) {
    return this.listUseCase.execute({
      employeeId,
      scope,
      departmentId,
      periodYear: periodYear != null ? parseInt(periodYear, 10) : undefined,
      periodQuarter:
        periodQuarter != null ? parseInt(periodQuarter, 10) : undefined,
      status,
    });
  }

  @Get(':id/progress')
  @Roles(OkrPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/okrs/:id/progress',
    roles: [OkrPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get OKR progress' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(GenericMetricsResponseDto, 'OKR progress')
  @ApiDefaultErrors({
    path: '/api/v1/hr/okrs/:id/progress',
    notFound: 'OKR not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  getProgress(@Param('id') id: string) {
    return this.getProgressUseCase.execute(id);
  }

  @Get(':id')
  @Roles(OkrPermissions.VIEW)
  @ApiProtected({ path: '/api/v1/hr/okrs/:id', roles: [OkrPermissions.VIEW] })
  @ApiOperation({ summary: 'Get OKR' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'OKR')
  @ApiDefaultErrors({
    path: '/api/v1/hr/okrs/:id',
    notFound: 'OKR not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(OkrPermissions.UPDATE)
  @ApiProtected({ path: '/api/v1/hr/okrs/:id', roles: [OkrPermissions.UPDATE] })
  @ApiOperation({ summary: 'Update OKR' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Updated OKR')
  @ApiDefaultErrors({
    path: '/api/v1/hr/okrs/:id',
    badRequest: 'OKR payload is invalid',
    notFound: 'OKR not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  update(@Param('id') id: string, @Body() body: UpdateOkrDto) {
    return this.updateUseCase.execute(id, body);
  }

  @Patch(':id/key-results/:krId')
  @Roles(OkrPermissions.UPDATE_KEY_RESULT)
  @ApiProtected({
    path: '/api/v1/hr/okrs/:id/key-results/:krId',
    roles: [OkrPermissions.UPDATE_KEY_RESULT],
  })
  @ApiOperation({ summary: 'Update key result (recomputes progress)' })
  @ApiParam({ name: 'id', description: 'OKR id' })
  @ApiParam({ name: 'krId', description: 'Key result id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Updated key result')
  @ApiDefaultErrors({
    path: '/api/v1/hr/okrs/:id/key-results/:krId',
    badRequest: 'Key result payload is invalid',
    notFound: 'OKR or key result not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateKeyResult(
    @Param('id') okrId: string,
    @Param('krId') krId: string,
    @Body() body: UpdateKeyResultDto,
  ) {
    return this.updateKeyResultUseCase.execute(okrId, krId, body);
  }

  @Get(':id/key-results/:krId/updates')
  @Roles(OkrPermissions.VIEW_CHECKINS, OkrPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/okrs/:id/key-results/:krId/updates',
    roles: [OkrPermissions.VIEW_CHECKINS, OkrPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List key result check-in history' })
  @ApiParam({ name: 'id', description: 'OKR id' })
  @ApiParam({ name: 'krId', description: 'Key result id' })
  @ApiEnvelopeArrayResponse(
    GenericEntityResponseDto,
    'Key result update history',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/okrs/:id/key-results/:krId/updates',
    notFound: 'Key result not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listKeyResultUpdates(
    @Param('id') okrId: string,
    @Param('krId') krId: string,
  ) {
    return this.listKeyResultUpdatesUseCase.execute(okrId, krId);
  }

  @Post(':id/key-results/weights')
  @Roles(OkrPermissions.REWEIGHT)
  @ApiProtected({
    path: '/api/v1/hr/okrs/:id/key-results/weights',
    roles: [OkrPermissions.REWEIGHT],
  })
  @ApiOperation({
    summary: 'Reweight key results in a single normalized update',
  })
  @ApiParam({ name: 'id', description: 'OKR id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    GenericEntityResponseDto,
    'Updated OKR with normalized weights',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/okrs/:id/key-results/weights',
    badRequest: 'Key result weights payload is invalid',
    notFound: 'OKR not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  reweightKeyResults(
    @Param('id') okrId: string,
    @Body() body: ReweightKeyResultsDto,
  ) {
    return this.reweightKeyResultsUseCase.execute(okrId, body);
  }

  @Get(':id/manager-reviews')
  @Roles(OkrPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/okrs/:id/manager-reviews',
    roles: [OkrPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List manager reviews for an OKR' })
  @ApiParam({ name: 'id', description: 'OKR id' })
  @ApiEnvelopeArrayResponse(GenericEntityResponseDto, 'Manager review history')
  @ApiDefaultErrors({
    path: '/api/v1/hr/okrs/:id/manager-reviews',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listManagerReviews(@Param('id') okrId: string) {
    return this.managerReviewService.list(okrId);
  }

  @Post(':id/manager-reviews')
  @Roles(OkrPermissions.MANAGER_REVIEW)
  @ApiProtected({
    path: '/api/v1/hr/okrs/:id/manager-reviews',
    roles: [OkrPermissions.MANAGER_REVIEW],
  })
  @ApiOperation({ summary: 'Create or update manager OKR review' })
  @ApiParam({ name: 'id', description: 'OKR id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Manager review upserted')
  @ApiDefaultErrors({
    path: '/api/v1/hr/okrs/:id/manager-reviews',
    badRequest: 'Manager review payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  upsertManagerReview(
    @Param('id') okrId: string,
    @Body() body: UpsertOkrManagerReviewDto,
  ) {
    return this.managerReviewService.upsert(okrId, body);
  }
}
