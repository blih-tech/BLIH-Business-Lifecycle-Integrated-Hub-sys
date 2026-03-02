import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { CreateOrUpdateAttendanceLogDto } from '@blih/types';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AttendancePermissions } from '../../../core/rbac/constants/permissions.constants';
import { ApiProtected } from '../../../shared/docs/openapi';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { GetAttendanceLogUseCase } from './use-cases/get-attendance-log.usecase';
import { ListAttendanceLogsUseCase } from './use-cases/list-attendance-logs.usecase';
import { UpsertAttendanceLogUseCase } from './use-cases/upsert-attendance-log.usecase';

@ApiTags('HR Attendance')
@Controller('hr/attendance')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class AttendanceController {
  constructor(
    private readonly upsertLogUseCase: UpsertAttendanceLogUseCase,
    private readonly listLogsUseCase: ListAttendanceLogsUseCase,
    private readonly getLogUseCase: GetAttendanceLogUseCase,
  ) {}

  @Post('logs')
  @Roles(AttendancePermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/logs',
    roles: [AttendancePermissions.CREATE],
  })
  @ApiOperation({
    summary: 'Create or update attendance log (check-in/check-out)',
  })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Created or updated log' })
  upsertLog(@Body() body: CreateOrUpdateAttendanceLogDto) {
    return this.upsertLogUseCase.execute(body);
  }

  @Get('logs')
  @Roles(AttendancePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/logs',
    roles: [AttendancePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List attendance logs by user and date range' })
  @ApiOkResponse({ description: 'List of attendance logs' })
  listLogs(
    @Query('userId') userId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.listLogsUseCase.execute({ userId, fromDate, toDate });
  }

  @Get('logs/:id')
  @Roles(AttendancePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/logs/:id',
    roles: [AttendancePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get attendance log' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Attendance log details' })
  getLog(@Param('id') id: string) {
    return this.getLogUseCase.execute(id);
  }
}
