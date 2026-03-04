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
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type {
  CreateOkrDto,
  ReweightKeyResultsDto,
  UpsertOkrManagerReviewDto,
  UpdateKeyResultDto,
  UpdateOkrDto,
} from '@repo/types';
import { OkrPermissions } from '../../../core/rbac/constants/permissions.constants';
import { ApiProtected } from '../../../shared/docs/openapi';
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
  @ApiOkResponse({ description: 'Created OKR' })
  create(@Body() body: CreateOkrDto) {
    return this.createUseCase.execute(body);
  }

  @Get()
  @Roles(OkrPermissions.VIEW)
  @ApiProtected({ path: '/api/v1/hr/okrs', roles: [OkrPermissions.VIEW] })
  @ApiOperation({ summary: 'List OKRs' })
  @ApiOkResponse({ description: 'List of OKRs' })
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
  @ApiOkResponse({ description: 'OKR progress' })
  getProgress(@Param('id') id: string) {
    return this.getProgressUseCase.execute(id);
  }

  @Get(':id')
  @Roles(OkrPermissions.VIEW)
  @ApiProtected({ path: '/api/v1/hr/okrs/:id', roles: [OkrPermissions.VIEW] })
  @ApiOperation({ summary: 'Get OKR' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'OKR' })
  get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(OkrPermissions.UPDATE)
  @ApiProtected({ path: '/api/v1/hr/okrs/:id', roles: [OkrPermissions.UPDATE] })
  @ApiOperation({ summary: 'Update OKR' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Updated OKR' })
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
  @ApiOkResponse({ description: 'Updated key result' })
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
  @ApiOkResponse({ description: 'Key result update history' })
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
  @ApiOkResponse({ description: 'Updated OKR with normalized weights' })
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
  @ApiOkResponse({ description: 'Manager review history' })
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
  @ApiOkResponse({ description: 'Manager review upserted' })
  upsertManagerReview(
    @Param('id') okrId: string,
    @Body() body: UpsertOkrManagerReviewDto,
  ) {
    return this.managerReviewService.upsert(okrId, body);
  }
}
