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
  CreateReviewPeriodConfigDto,
  CreatePerformanceReviewDto,
  UpsertPerformanceCalibrationDto,
  UpsertPerformanceReviewFeedbackDto,
  UpdateSelfAssessmentDto,
  UpdateManagerReviewDto,
} from '@repo/types';
import { PerformancePermissions } from '../../../core/rbac/constants/permissions.constants';
import { ApiProtected } from '../../../shared/docs/openapi';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { ListReviewPeriodsUseCase } from './use-cases/list-review-periods.usecase';
import { EnsureReviewPeriodUseCase } from './use-cases/ensure-review-period.usecase';
import { CreatePerformanceReviewUseCase } from './use-cases/create-performance-review.usecase';
import { ListPerformanceReviewsUseCase } from './use-cases/list-performance-reviews.usecase';
import { GetPerformanceReviewUseCase } from './use-cases/get-performance-review.usecase';
import { UpdateSelfAssessmentUseCase } from './use-cases/update-self-assessment.usecase';
import { UpdateManagerReviewUseCase } from './use-cases/update-manager-review.usecase';
import { CompletePerformanceReviewUseCase } from './use-cases/complete-performance-review.usecase';
import { GetAnnualSummaryUseCase } from './use-cases/get-annual-summary.usecase';
import { ListPerformanceCalibrationsUseCase } from './use-cases/list-performance-calibrations.usecase';
import { ListPerformanceReviewFeedbackUseCase } from './use-cases/list-performance-review-feedback.usecase';
import { UpsertPerformanceCalibrationUseCase } from './use-cases/upsert-performance-calibration.usecase';
import { UpsertPerformanceReviewFeedbackUseCase } from './use-cases/upsert-performance-review-feedback.usecase';

@ApiTags('HR Performance')
@Controller('hr/performance')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class PerformanceController {
  constructor(
    private readonly listPeriodsUseCase: ListReviewPeriodsUseCase,
    private readonly ensurePeriodUseCase: EnsureReviewPeriodUseCase,
    private readonly createReviewUseCase: CreatePerformanceReviewUseCase,
    private readonly listReviewsUseCase: ListPerformanceReviewsUseCase,
    private readonly getReviewUseCase: GetPerformanceReviewUseCase,
    private readonly updateSelfUseCase: UpdateSelfAssessmentUseCase,
    private readonly updateManagerUseCase: UpdateManagerReviewUseCase,
    private readonly completeReviewUseCase: CompletePerformanceReviewUseCase,
    private readonly getAnnualSummaryUseCase: GetAnnualSummaryUseCase,
    private readonly listFeedbackUseCase: ListPerformanceReviewFeedbackUseCase,
    private readonly upsertFeedbackUseCase: UpsertPerformanceReviewFeedbackUseCase,
    private readonly listCalibrationsUseCase: ListPerformanceCalibrationsUseCase,
    private readonly upsertCalibrationUseCase: UpsertPerformanceCalibrationUseCase,
  ) {}

  @Get('periods')
  @Roles(PerformancePermissions.VIEW, PerformancePermissions.MANAGE_PERIODS)
  @ApiProtected({
    path: '/api/v1/hr/performance/periods',
    roles: [PerformancePermissions.VIEW, PerformancePermissions.MANAGE_PERIODS],
  })
  @ApiOperation({ summary: 'List review period configs' })
  @ApiOkResponse({ description: 'List of period configs' })
  listPeriods(@Query('year') year?: string) {
    return this.listPeriodsUseCase.execute({
      year: year != null ? parseInt(year, 10) : undefined,
    });
  }

  @Post('periods')
  @Roles(PerformancePermissions.MANAGE_PERIODS)
  @ApiProtected({
    path: '/api/v1/hr/performance/periods',
    roles: [PerformancePermissions.MANAGE_PERIODS],
  })
  @ApiOperation({ summary: 'Create or get review period config' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Period config' })
  ensurePeriod(@Body() body: CreateReviewPeriodConfigDto) {
    return this.ensurePeriodUseCase.execute(body);
  }

  @Get('reviews')
  @Roles(PerformancePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/performance/reviews',
    roles: [PerformancePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List performance reviews' })
  @ApiOkResponse({ description: 'List of reviews' })
  listReviews(
    @Query('userId') userId?: string,
    @Query('periodConfigId') periodConfigId?: string,
    @Query('status') status?: string,
  ) {
    return this.listReviewsUseCase.execute({
      userId,
      periodConfigId,
      status: status as never,
    });
  }

  @Get('reviews/:id')
  @Roles(PerformancePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/performance/reviews/:id',
    roles: [PerformancePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get performance review' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Performance review' })
  getReview(@Param('id') id: string) {
    return this.getReviewUseCase.execute(id);
  }

  @Post('reviews')
  @Roles(PerformancePermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/performance/reviews',
    roles: [PerformancePermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create performance review' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Created review' })
  createReview(@Body() body: CreatePerformanceReviewDto) {
    return this.createReviewUseCase.execute(body);
  }

  @Patch('reviews/:id/self')
  @Roles(PerformancePermissions.UPDATE_SELF)
  @ApiProtected({
    path: '/api/v1/hr/performance/reviews/:id/self',
    roles: [PerformancePermissions.UPDATE_SELF],
  })
  @ApiOperation({ summary: 'Submit self assessment' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Updated review' })
  updateSelf(@Param('id') id: string, @Body() body: UpdateSelfAssessmentDto) {
    return this.updateSelfUseCase.execute(id, body);
  }

  @Patch('reviews/:id/manager')
  @Roles(PerformancePermissions.UPDATE_MANAGER)
  @ApiProtected({
    path: '/api/v1/hr/performance/reviews/:id/manager',
    roles: [PerformancePermissions.UPDATE_MANAGER],
  })
  @ApiOperation({ summary: 'Submit manager review' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Updated review' })
  updateManager(@Param('id') id: string, @Body() body: UpdateManagerReviewDto) {
    return this.updateManagerUseCase.execute(id, body);
  }

  @Post('reviews/:id/complete')
  @Roles(PerformancePermissions.COMPLETE)
  @ApiProtected({
    path: '/api/v1/hr/performance/reviews/:id/complete',
    roles: [PerformancePermissions.COMPLETE],
  })
  @ApiOperation({ summary: 'Complete review (compute rating and raise)' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Completed review' })
  completeReview(@Param('id') id: string) {
    return this.completeReviewUseCase.execute(id);
  }

  @Get('reviews/:id/feedback')
  @Roles(PerformancePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/performance/reviews/:id/feedback',
    roles: [PerformancePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List 360 performance feedback for a review' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Feedback list' })
  listFeedback(@Param('id') id: string) {
    return this.listFeedbackUseCase.execute(id);
  }

  @Post('reviews/:id/feedback')
  @Roles(PerformancePermissions.UPDATE_FEEDBACK)
  @ApiProtected({
    path: '/api/v1/hr/performance/reviews/:id/feedback',
    roles: [PerformancePermissions.UPDATE_FEEDBACK],
  })
  @ApiOperation({ summary: 'Create or update 360 performance feedback' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Upserted feedback' })
  upsertFeedback(
    @Param('id') id: string,
    @Body() body: UpsertPerformanceReviewFeedbackDto,
  ) {
    return this.upsertFeedbackUseCase.execute(id, body);
  }

  @Get('calibrations')
  @Roles(PerformancePermissions.VIEW, PerformancePermissions.CALIBRATE)
  @ApiProtected({
    path: '/api/v1/hr/performance/calibrations',
    roles: [PerformancePermissions.VIEW, PerformancePermissions.CALIBRATE],
  })
  @ApiOperation({ summary: 'List performance calibrations' })
  @ApiOkResponse({ description: 'Calibration list' })
  listCalibrations(
    @Query('periodId') periodId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.listCalibrationsUseCase.execute({ periodId, departmentId });
  }

  @Post('calibrations')
  @Roles(PerformancePermissions.CALIBRATE)
  @ApiProtected({
    path: '/api/v1/hr/performance/calibrations',
    roles: [PerformancePermissions.CALIBRATE],
  })
  @ApiOperation({ summary: 'Create or update a calibration pack' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Calibration' })
  upsertCalibration(@Body() body: UpsertPerformanceCalibrationDto) {
    return this.upsertCalibrationUseCase.execute(body);
  }

  @Get('summary/:userId/:year')
  @Roles(PerformancePermissions.VIEW_SUMMARY, PerformancePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/performance/summary/:userId/:year',
    roles: [PerformancePermissions.VIEW_SUMMARY, PerformancePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get annual performance summary' })
  @ApiParam({ name: 'userId' })
  @ApiParam({ name: 'year' })
  @ApiOkResponse({ description: 'Annual summary' })
  getSummary(@Param('userId') userId: string, @Param('year') year: string) {
    return this.getAnnualSummaryUseCase.execute(userId, parseInt(year, 10));
  }
}
