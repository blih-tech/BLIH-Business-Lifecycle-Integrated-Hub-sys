import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  AssignUserWorkScheduleDto,
  CreateHolidayDto,
  CreateOrUpdateAttendanceLogDto,
  CreateWorkScheduleDto,
} from '@repo/types';
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
import { AssignUserWorkScheduleUseCase } from './use-cases/assign-user-work-schedule.usecase';
import { CreateHolidayUseCase } from './use-cases/create-holiday.usecase';
import { CreateWorkScheduleUseCase } from './use-cases/create-work-schedule.usecase';
import { ListHolidaysUseCase } from './use-cases/list-holidays.usecase';
import { ListUserWorkSchedulesUseCase } from './use-cases/list-user-work-schedules.usecase';
import { ListWorkSchedulesUseCase } from './use-cases/list-work-schedules.usecase';
import { UpsertAttendanceLogUseCase } from './use-cases/upsert-attendance-log.usecase';

@ApiTags('HR Attendance')
@Controller('hr/attendance')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class AttendanceController {
  constructor(
    private readonly upsertLogUseCase: UpsertAttendanceLogUseCase,
    private readonly listLogsUseCase: ListAttendanceLogsUseCase,
    private readonly getLogUseCase: GetAttendanceLogUseCase,
    private readonly createWorkScheduleUseCase: CreateWorkScheduleUseCase,
    private readonly listWorkSchedulesUseCase: ListWorkSchedulesUseCase,
    private readonly assignUserWorkScheduleUseCase: AssignUserWorkScheduleUseCase,
    private readonly listUserWorkSchedulesUseCase: ListUserWorkSchedulesUseCase,
    private readonly createHolidayUseCase: CreateHolidayUseCase,
    private readonly listHolidaysUseCase: ListHolidaysUseCase,
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
  @ApiOperation({ summary: 'List attendance logs by employee and date range' })
  @ApiOkResponse({ description: 'List of attendance logs' })
  listLogs(
    @Query('employeeId') employeeId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.listLogsUseCase.execute({ employeeId, fromDate, toDate });
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

  @Post('schedules')
  @Roles(AttendancePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/schedules',
    roles: [AttendancePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Create work schedule' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Created work schedule' })
  createSchedule(@Body() body: CreateWorkScheduleDto) {
    return this.createWorkScheduleUseCase.execute(body);
  }

  @Get('schedules')
  @Roles(AttendancePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/schedules',
    roles: [AttendancePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List work schedules' })
  @ApiOkResponse({ description: 'Configured work schedules' })
  listSchedules() {
    return this.listWorkSchedulesUseCase.execute();
  }

  @Post('schedules/assignments')
  @Roles(AttendancePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/schedules/assignments',
    roles: [AttendancePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Assign a work schedule to an employee' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Created employee work schedule assignment' })
  assignSchedule(@Body() body: AssignUserWorkScheduleDto) {
    return this.assignUserWorkScheduleUseCase.execute(body);
  }

  @Get('schedules/assignments')
  @Roles(AttendancePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/schedules/assignments',
    roles: [AttendancePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List work schedule assignments for an employee' })
  @ApiOkResponse({ description: 'Employee work schedule assignments' })
  listAssignments(@Query('employeeId') employeeId?: string) {
    return this.listUserWorkSchedulesUseCase.execute(employeeId);
  }

  @Post('holidays')
  @Roles(AttendancePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/holidays',
    roles: [AttendancePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Create holiday calendar entry' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ description: 'Created holiday entry' })
  createHoliday(@Body() body: CreateHolidayDto) {
    return this.createHolidayUseCase.execute(body);
  }

  @Get('holidays')
  @Roles(AttendancePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/holidays',
    roles: [AttendancePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List holidays by date range and country' })
  @ApiOkResponse({ description: 'Holiday calendar entries' })
  listHolidays(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('countryId') countryId?: string,
  ) {
    if (!fromDate && !toDate) {
      throw new BadRequestException(
        'At least one of fromDate or toDate must be provided',
      );
    }

    return this.listHolidaysUseCase.execute({ fromDate, toDate, countryId });
  }
}
