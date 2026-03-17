import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { GenerateTrainingComplianceReportDto } from '@repo/types';
import { TrainingCompliancePermissions } from '../../../core/rbac/constants/permissions.constants';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiProtected } from '../../../shared/docs/openapi';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { TrainingComplianceService } from './training-compliance.service';

@ApiTags('HR Training Compliance')
@Controller('hr/training/compliance')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class TrainingComplianceController {
  constructor(private readonly service: TrainingComplianceService) {}

  @Get('requirements')
  @Roles(TrainingCompliancePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/compliance/requirements',
    roles: [TrainingCompliancePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List compliance training requirements' })
  listRequirements(
    @Query('employeeId') employeeId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listRequirements({ employeeId, departmentId, status });
  }

  @Get('status')
  @Roles(TrainingCompliancePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/compliance/status',
    roles: [TrainingCompliancePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get compliance training status summary' })
  getStatus(
    @Query('employeeId') employeeId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.service.getStatus({ employeeId, departmentId });
  }

  @Get('audit-trail')
  @Roles(TrainingCompliancePermissions.AUDIT)
  @ApiProtected({
    path: '/api/v1/hr/training/compliance/audit-trail',
    roles: [TrainingCompliancePermissions.AUDIT],
  })
  @ApiOperation({ summary: 'Get training compliance audit trail' })
  getAuditTrail(
    @Query('employeeId') employeeId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.getAuditTrail({ employeeId, departmentId, from, to });
  }

  @Post('reports')
  @Roles(TrainingCompliancePermissions.REPORT)
  @ApiProtected({
    path: '/api/v1/hr/training/compliance/reports',
    roles: [TrainingCompliancePermissions.REPORT],
  })
  @ApiOperation({ summary: 'Generate compliance training report' })
  @ApiBody({ schema: { type: 'object' } })
  generateReport(@Body() body: GenerateTrainingComplianceReportDto) {
    return this.service.generateReport(body);
  }

  @Get('expiring-requirements')
  @Roles(TrainingCompliancePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/training/compliance/expiring-requirements',
    roles: [TrainingCompliancePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List expiring compliance requirements' })
  listExpiringRequirements(
    @Query('employeeId') employeeId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('days') days?: string,
  ) {
    return this.service.listExpiringRequirements({
      employeeId,
      departmentId,
      days: days != null ? parseInt(days, 10) : undefined,
    });
  }
}
