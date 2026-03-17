import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TrainingAnalyticsPermissions } from '../../../core/rbac/constants/permissions.constants';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { TrainingAnalyticsService } from './training-analytics.service';

@ApiTags('HR Training Analytics')
@Controller('hr/training/analytics')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class TrainingAnalyticsController {
  constructor(private readonly service: TrainingAnalyticsService) {}

  @Get('roi')
  @Roles(TrainingAnalyticsPermissions.ROI, TrainingAnalyticsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/analytics/roi',
    roles: [
      TrainingAnalyticsPermissions.ROI,
      TrainingAnalyticsPermissions.VIEW,
    ],
  })
  @ApiOperation({ summary: 'Get training ROI analytics' })
  getRoi(
    @Query('departmentId') departmentId?: string,
    @Query('year') year?: string,
  ) {
    return this.service.getRoi(
      departmentId,
      year != null ? parseInt(year, 10) : new Date().getUTCFullYear(),
    );
  }

  @Get('completion-rates')
  @Roles(TrainingAnalyticsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/analytics/completion-rates',
    roles: [TrainingAnalyticsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get training completion rate analytics' })
  getCompletionRates(
    @Query('departmentId') departmentId?: string,
    @Query('year') year?: string,
  ) {
    return this.service.getCompletionRates(
      departmentId,
      year != null ? parseInt(year, 10) : new Date().getUTCFullYear(),
    );
  }

  @Get('effectiveness')
  @Roles(TrainingAnalyticsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/analytics/effectiveness',
    roles: [TrainingAnalyticsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get training effectiveness analytics' })
  getEffectiveness(
    @Query('departmentId') departmentId?: string,
    @Query('year') year?: string,
  ) {
    return this.service.getEffectiveness(
      departmentId,
      year != null ? parseInt(year, 10) : new Date().getUTCFullYear(),
    );
  }

  @Get('budget-utilization')
  @Roles(TrainingAnalyticsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/analytics/budget-utilization',
    roles: [TrainingAnalyticsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get training budget utilization analytics' })
  getBudgetUtilization(
    @Query('departmentId') departmentId?: string,
    @Query('year') year?: string,
  ) {
    return this.service.getBudgetUtilization(
      departmentId,
      year != null ? parseInt(year, 10) : new Date().getUTCFullYear(),
    );
  }

  @Get('skill-improvement')
  @Roles(TrainingAnalyticsPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/analytics/skill-improvement',
    roles: [TrainingAnalyticsPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get training skill improvement analytics' })
  getSkillImprovement(
    @Query('departmentId') departmentId?: string,
    @Query('year') year?: string,
  ) {
    return this.service.getSkillImprovement(
      departmentId,
      year != null ? parseInt(year, 10) : new Date().getUTCFullYear(),
    );
  }
}
