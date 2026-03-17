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
  CreateReviewPeriodConfigDto,
  CreatePerformanceReviewDto,
  UpsertPerformanceCalibrationDto,
  UpsertPerformanceReviewFeedbackDto,
  UpdateSelfAssessmentDto,
  UpdateManagerReviewDto,
} from '@repo/types';
import { PerformancePermissions } from '../../../core/rbac/constants/permissions.constants';
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
  @ApiEnvelopeArrayResponse(GenericEntityResponseDto, 'List of period configs')
  @ApiDefaultErrors({
    path: '/api/v1/hr/performance/periods',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Period config')
  @ApiDefaultErrors({
    path: '/api/v1/hr/performance/periods',
    badRequest: 'Review period payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeArrayResponse(GenericEntityResponseDto, 'List of reviews')
  @ApiDefaultErrors({
    path: '/api/v1/hr/performance/reviews',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listReviews(
    @Query('employeeId') employeeId?: string,
    @Query('periodConfigId') periodConfigId?: string,
    @Query('status') status?: string,
  ) {
    return this.listReviewsUseCase.execute({
      employeeId,
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
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Performance review')
  @ApiDefaultErrors({
    path: '/api/v1/hr/performance/reviews/:id',
    notFound: 'Performance review not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Created review')
  @ApiDefaultErrors({
    path: '/api/v1/hr/performance/reviews',
    badRequest: 'Performance review payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Updated review')
  @ApiDefaultErrors({
    path: '/api/v1/hr/performance/reviews/:id/self',
    badRequest: 'Self assessment payload is invalid',
    notFound: 'Performance review not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Updated review')
  @ApiDefaultErrors({
    path: '/api/v1/hr/performance/reviews/:id/manager',
    badRequest: 'Manager review payload is invalid',
    notFound: 'Performance review not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Completed review')
  @ApiDefaultErrors({
    path: '/api/v1/hr/performance/reviews/:id/complete',
    notFound: 'Performance review not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeArrayResponse(GenericEntityResponseDto, 'Feedback list')
  @ApiDefaultErrors({
    path: '/api/v1/hr/performance/reviews/:id/feedback',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Upserted feedback')
  @ApiDefaultErrors({
    path: '/api/v1/hr/performance/reviews/:id/feedback',
    badRequest: 'Performance feedback payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeArrayResponse(GenericEntityResponseDto, 'Calibration list')
  @ApiDefaultErrors({
    path: '/api/v1/hr/performance/calibrations',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeOkResponse(GenericEntityResponseDto, 'Calibration')
  @ApiDefaultErrors({
    path: '/api/v1/hr/performance/calibrations',
    badRequest: 'Performance calibration payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  upsertCalibration(@Body() body: UpsertPerformanceCalibrationDto) {
    return this.upsertCalibrationUseCase.execute(body);
  }

  @Get('summary/:employeeId/:year')
  @Roles(PerformancePermissions.VIEW_SUMMARY, PerformancePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/performance/summary/:employeeId/:year',
    roles: [PerformancePermissions.VIEW_SUMMARY, PerformancePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get annual performance summary' })
  @ApiParam({ name: 'employeeId' })
  @ApiParam({ name: 'year' })
  @ApiEnvelopeOkResponse(GenericMetricsResponseDto, 'Annual summary')
  @ApiDefaultErrors({
    path: '/api/v1/hr/performance/summary/:employeeId/:year',
    notFound: 'Performance summary not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  getSummary(
    @Param('employeeId') employeeId: string,
    @Param('year') year: string,
  ) {
    return this.getAnnualSummaryUseCase.execute(employeeId, parseInt(year, 10));
  }
}
