import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type {
  CreateTimesheetDto,
  AssignUserWorkScheduleDto,
  RejectTimesheetDto,
  CreateAttendanceCorrectionRequestDto,
  CreateHolidayDto,
  CreateOrUpdateAttendanceLogDto,
  CreateOvertimeRequestDto,
  CreateFlexWorkRequestDto,
  CreatePunctualityAlertDto,
  CreateWorkScheduleDto,
  RejectAttendanceCorrectionRequestDto,
  RejectOvertimeRequestDto,
  RejectFlexWorkRequestDto,
  UpdateTimesheetDto,
  UpdateAttendanceCorrectionRequestDto,
  UpdateOvertimeRequestDto,
  UpdateFlexWorkRequestDto,
} from '@repo/types';
import type { Request } from 'express';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  AttendanceCorrectionPermissions,
  AttendanceReportPermissions,
  AttendancePermissions,
  FlexWorkPermissions,
  OvertimePermissions,
  PunctualityPermissions,
  TimesheetPermissions,
} from '@repo/types/rbac';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
} from '../../../shared/docs/openapi';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import {
  AttendanceAnalyticsResponseDto,
  AttendanceComplianceReportResponseDto,
  AttendanceCorrectionRequestResponseDto,
  AttendanceLogResponseDto,
  FlexWorkRequestResponseDto,
  HolidayResponseDto,
  LeaveAnalyticsResponseDto,
  MonthlyAttendanceReportResponseDto,
  OvertimeRequestResponseDto,
  PunctualityAlertResponseDto,
  PunctualityLogItemDto,
  PunctualityTrendDto,
  TimesheetResponseDto,
  UserWorkScheduleResponseDto,
  WorkScheduleResponseDto,
} from './dto/attendance-response.dto';
import { AttendanceReportingService } from './attendance-reporting.service';
import { AttendanceCorrectionService } from './attendance-correction.service';
import { FlexWorkRequestService } from './flex-work-request.service';
import { GetAttendanceLogUseCase } from './use-cases/get-attendance-log.usecase';
import { ListAttendanceLogsUseCase } from './use-cases/list-attendance-logs.usecase';
import { AssignUserWorkScheduleUseCase } from './use-cases/assign-user-work-schedule.usecase';
import { CreateHolidayUseCase } from './use-cases/create-holiday.usecase';
import { CreateWorkScheduleUseCase } from './use-cases/create-work-schedule.usecase';
import { ListHolidaysUseCase } from './use-cases/list-holidays.usecase';
import { ListUserWorkSchedulesUseCase } from './use-cases/list-user-work-schedules.usecase';
import { ListWorkSchedulesUseCase } from './use-cases/list-work-schedules.usecase';
import { UpsertAttendanceLogUseCase } from './use-cases/upsert-attendance-log.usecase';
import { OvertimeRequestService } from './overtime-request.service';
import { PunctualityService } from './punctuality.service';
import { TimesheetService } from './timesheet.service';

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
    private readonly attendanceCorrectionService: AttendanceCorrectionService,
    private readonly overtimeRequestService: OvertimeRequestService,
    private readonly flexWorkRequestService: FlexWorkRequestService,
    private readonly timesheetService: TimesheetService,
    private readonly punctualityService: PunctualityService,
    private readonly reportingService: AttendanceReportingService,
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
  @ApiEnvelopeOkResponse(AttendanceLogResponseDto, 'Created or updated log')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/logs',
    badRequest: 'Attendance log payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeArrayResponse(AttendanceLogResponseDto, 'List of attendance logs')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/logs',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeOkResponse(AttendanceLogResponseDto, 'Attendance log details')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/logs/:id',
    notFound: 'Attendance log not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeOkResponse(WorkScheduleResponseDto, 'Created work schedule')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/schedules',
    badRequest: 'Work schedule payload is invalid',
    conflict: 'Work schedule name already exists',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeArrayResponse(
    WorkScheduleResponseDto,
    'Configured work schedules',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/schedules',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeOkResponse(
    UserWorkScheduleResponseDto,
    'Created employee work schedule assignment',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/schedules/assignments',
    badRequest: 'Work schedule assignment payload is invalid',
    notFound: 'Work schedule or employee not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeArrayResponse(
    UserWorkScheduleResponseDto,
    'Employee work schedule assignments',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/schedules/assignments',
    badRequest: 'Query parameter employeeId is required',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeOkResponse(HolidayResponseDto, 'Created holiday entry')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/holidays',
    badRequest: 'Holiday payload is invalid',
    conflict: 'Holiday already exists for this date',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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
  @ApiEnvelopeArrayResponse(HolidayResponseDto, 'Holiday calendar entries')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/holidays',
    badRequest: 'At least one of fromDate or toDate must be provided',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
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

  @Post('corrections')
  @Roles(AttendanceCorrectionPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/corrections',
    roles: [AttendanceCorrectionPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create attendance correction request' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    AttendanceCorrectionRequestResponseDto,
    'Created attendance correction request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/corrections',
    badRequest: 'Attendance correction payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  createCorrection(@Body() body: CreateAttendanceCorrectionRequestDto) {
    return this.attendanceCorrectionService.create(body);
  }

  @Get('corrections')
  @Roles(AttendanceCorrectionPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/corrections',
    roles: [AttendanceCorrectionPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List attendance correction requests' })
  @ApiEnvelopeArrayResponse(
    AttendanceCorrectionRequestResponseDto,
    'Attendance correction requests',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/corrections',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listCorrections(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.attendanceCorrectionService.list({ employeeId, status });
  }

  @Get('corrections/:id')
  @Roles(AttendanceCorrectionPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/corrections/:id',
    roles: [AttendanceCorrectionPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get attendance correction request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    AttendanceCorrectionRequestResponseDto,
    'Attendance correction request details',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/corrections/:id',
    notFound: 'Attendance correction request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  getCorrection(@Param('id') id: string) {
    return this.attendanceCorrectionService.get(id);
  }

  @Patch('corrections/:id')
  @Roles(AttendanceCorrectionPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/corrections/:id',
    roles: [AttendanceCorrectionPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update draft attendance correction request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    AttendanceCorrectionRequestResponseDto,
    'Updated attendance correction request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/corrections/:id',
    badRequest: 'Attendance correction payload is invalid',
    notFound: 'Attendance correction request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateCorrection(
    @Param('id') id: string,
    @Body() body: UpdateAttendanceCorrectionRequestDto,
  ) {
    return this.attendanceCorrectionService.update(id, body);
  }

  @Post('corrections/:id/submit')
  @Roles(AttendanceCorrectionPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/corrections/:id/submit',
    roles: [AttendanceCorrectionPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Submit attendance correction request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    AttendanceCorrectionRequestResponseDto,
    'Submitted attendance correction request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/corrections/:id/submit',
    badRequest:
      'Attendance correction request cannot be submitted in its current state',
    notFound: 'Attendance correction request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  submitCorrection(@Param('id') id: string) {
    return this.attendanceCorrectionService.submit(id);
  }

  @Post('corrections/:id/cancel')
  @Roles(AttendanceCorrectionPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/corrections/:id/cancel',
    roles: [AttendanceCorrectionPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Cancel attendance correction request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    AttendanceCorrectionRequestResponseDto,
    'Cancelled attendance correction request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/corrections/:id/cancel',
    badRequest:
      'Attendance correction request cannot be cancelled in its current state',
    notFound: 'Attendance correction request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  cancelCorrection(@Param('id') id: string) {
    return this.attendanceCorrectionService.cancel(id);
  }

  @Post('corrections/:id/approve')
  @Roles(AttendanceCorrectionPermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/corrections/:id/approve',
    roles: [AttendanceCorrectionPermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Approve attendance correction request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    AttendanceCorrectionRequestResponseDto,
    'Approved attendance correction request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/corrections/:id/approve',
    badRequest:
      'Attendance correction request cannot be approved in its current state',
    notFound: 'Attendance correction request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  approveCorrection(@Param('id') id: string, @Req() req: Request) {
    return this.attendanceCorrectionService.approve(id, req as never);
  }

  @Post('corrections/:id/reject')
  @Roles(AttendanceCorrectionPermissions.REJECT)
  @ApiProtected({
    path: '/api/v1/hr/attendance/corrections/:id/reject',
    roles: [AttendanceCorrectionPermissions.REJECT],
  })
  @ApiOperation({ summary: 'Reject attendance correction request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    AttendanceCorrectionRequestResponseDto,
    'Rejected attendance correction request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/corrections/:id/reject',
    badRequest: 'Attendance correction rejection payload is invalid',
    notFound: 'Attendance correction request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  rejectCorrection(
    @Param('id') id: string,
    @Body() body: RejectAttendanceCorrectionRequestDto,
    @Req() req: Request,
  ) {
    return this.attendanceCorrectionService.reject(id, body, req as never);
  }

  @Post('overtime')
  @Roles(OvertimePermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/overtime',
    roles: [OvertimePermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create overtime request' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(OvertimeRequestResponseDto, 'Created overtime request')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/overtime',
    badRequest: 'Overtime request payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  createOvertime(@Body() body: CreateOvertimeRequestDto) {
    return this.overtimeRequestService.create(body);
  }

  @Get('overtime')
  @Roles(OvertimePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/overtime',
    roles: [OvertimePermissions.VIEW],
  })
  @ApiOperation({ summary: 'List overtime requests' })
  @ApiEnvelopeArrayResponse(OvertimeRequestResponseDto, 'Overtime requests')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/overtime',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listOvertime(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.overtimeRequestService.list({ employeeId, status });
  }

  @Get('overtime/:id')
  @Roles(OvertimePermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/overtime/:id',
    roles: [OvertimePermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get overtime request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(OvertimeRequestResponseDto, 'Overtime request details')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/overtime/:id',
    notFound: 'Overtime request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  getOvertime(@Param('id') id: string) {
    return this.overtimeRequestService.get(id);
  }

  @Patch('overtime/:id')
  @Roles(OvertimePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/overtime/:id',
    roles: [OvertimePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update draft overtime request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(OvertimeRequestResponseDto, 'Updated overtime request')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/overtime/:id',
    badRequest: 'Overtime request payload is invalid',
    notFound: 'Overtime request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateOvertime(
    @Param('id') id: string,
    @Body() body: UpdateOvertimeRequestDto,
  ) {
    return this.overtimeRequestService.update(id, body);
  }

  @Post('overtime/:id/submit')
  @Roles(OvertimePermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/overtime/:id/submit',
    roles: [OvertimePermissions.CREATE],
  })
  @ApiOperation({ summary: 'Submit overtime request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    OvertimeRequestResponseDto,
    'Submitted overtime request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/overtime/:id/submit',
    badRequest: 'Overtime request cannot be submitted in its current state',
    notFound: 'Overtime request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  submitOvertime(@Param('id') id: string) {
    return this.overtimeRequestService.submit(id);
  }

  @Post('overtime/:id/cancel')
  @Roles(OvertimePermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/overtime/:id/cancel',
    roles: [OvertimePermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Cancel overtime request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    OvertimeRequestResponseDto,
    'Cancelled overtime request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/overtime/:id/cancel',
    badRequest: 'Overtime request cannot be cancelled in its current state',
    notFound: 'Overtime request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  cancelOvertime(@Param('id') id: string) {
    return this.overtimeRequestService.cancel(id);
  }

  @Post('overtime/:id/approve')
  @Roles(OvertimePermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/overtime/:id/approve',
    roles: [OvertimePermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Approve overtime request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    OvertimeRequestResponseDto,
    'Approved overtime request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/overtime/:id/approve',
    badRequest: 'Overtime request cannot be approved in its current state',
    notFound: 'Overtime request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  approveOvertime(@Param('id') id: string, @Req() req: Request) {
    return this.overtimeRequestService.approve(id, req as never);
  }

  @Post('overtime/:id/reject')
  @Roles(OvertimePermissions.REJECT)
  @ApiProtected({
    path: '/api/v1/hr/attendance/overtime/:id/reject',
    roles: [OvertimePermissions.REJECT],
  })
  @ApiOperation({ summary: 'Reject overtime request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    OvertimeRequestResponseDto,
    'Rejected overtime request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/overtime/:id/reject',
    badRequest: 'Overtime rejection payload is invalid',
    notFound: 'Overtime request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  rejectOvertime(
    @Param('id') id: string,
    @Body() body: RejectOvertimeRequestDto,
    @Req() req: Request,
  ) {
    return this.overtimeRequestService.reject(id, body, req as never);
  }

  @Post('flex-requests')
  @Roles(FlexWorkPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/flex-requests',
    roles: [FlexWorkPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create work-from-home or flex-time request' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    FlexWorkRequestResponseDto,
    'Created flex work request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/flex-requests',
    badRequest: 'Flex work request payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  createFlexRequest(@Body() body: CreateFlexWorkRequestDto) {
    return this.flexWorkRequestService.create(body);
  }

  @Get('flex-requests')
  @Roles(FlexWorkPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/flex-requests',
    roles: [FlexWorkPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List work-from-home and flex-time requests' })
  @ApiEnvelopeArrayResponse(FlexWorkRequestResponseDto, 'Flex work requests')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/flex-requests',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listFlexRequests(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('requestType') requestType?: string,
  ) {
    return this.flexWorkRequestService.list({
      employeeId,
      status,
      requestType,
    });
  }

  @Get('flex-requests/:id')
  @Roles(FlexWorkPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/flex-requests/:id',
    roles: [FlexWorkPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get flex work request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    FlexWorkRequestResponseDto,
    'Flex work request details',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/flex-requests/:id',
    notFound: 'Flex work request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  getFlexRequest(@Param('id') id: string) {
    return this.flexWorkRequestService.get(id);
  }

  @Patch('flex-requests/:id')
  @Roles(FlexWorkPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/flex-requests/:id',
    roles: [FlexWorkPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update draft flex work request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    FlexWorkRequestResponseDto,
    'Updated flex work request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/flex-requests/:id',
    badRequest: 'Flex work request payload is invalid',
    notFound: 'Flex work request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateFlexRequest(
    @Param('id') id: string,
    @Body() body: UpdateFlexWorkRequestDto,
  ) {
    return this.flexWorkRequestService.update(id, body);
  }

  @Post('flex-requests/:id/submit')
  @Roles(FlexWorkPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/flex-requests/:id/submit',
    roles: [FlexWorkPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Submit flex work request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    FlexWorkRequestResponseDto,
    'Submitted flex work request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/flex-requests/:id/submit',
    badRequest: 'Flex work request cannot be submitted in its current state',
    notFound: 'Flex work request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  submitFlexRequest(@Param('id') id: string) {
    return this.flexWorkRequestService.submit(id);
  }

  @Post('flex-requests/:id/cancel')
  @Roles(FlexWorkPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/flex-requests/:id/cancel',
    roles: [FlexWorkPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Cancel flex work request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    FlexWorkRequestResponseDto,
    'Cancelled flex work request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/flex-requests/:id/cancel',
    badRequest: 'Flex work request cannot be cancelled in its current state',
    notFound: 'Flex work request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  cancelFlexRequest(@Param('id') id: string) {
    return this.flexWorkRequestService.cancel(id);
  }

  @Post('flex-requests/:id/approve')
  @Roles(FlexWorkPermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/flex-requests/:id/approve',
    roles: [FlexWorkPermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Approve flex work request' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(
    FlexWorkRequestResponseDto,
    'Approved flex work request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/flex-requests/:id/approve',
    badRequest: 'Flex work request cannot be approved in its current state',
    notFound: 'Flex work request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  approveFlexRequest(@Param('id') id: string, @Req() req: Request) {
    return this.flexWorkRequestService.approve(id, req as never);
  }

  @Post('flex-requests/:id/reject')
  @Roles(FlexWorkPermissions.REJECT)
  @ApiProtected({
    path: '/api/v1/hr/attendance/flex-requests/:id/reject',
    roles: [FlexWorkPermissions.REJECT],
  })
  @ApiOperation({ summary: 'Reject flex work request' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    FlexWorkRequestResponseDto,
    'Rejected flex work request',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/flex-requests/:id/reject',
    badRequest: 'Flex work rejection payload is invalid',
    notFound: 'Flex work request not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  rejectFlexRequest(
    @Param('id') id: string,
    @Body() body: RejectFlexWorkRequestDto,
    @Req() req: Request,
  ) {
    return this.flexWorkRequestService.reject(id, body, req as never);
  }

  @Post('timesheets')
  @Roles(TimesheetPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/timesheets',
    roles: [TimesheetPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Create timesheet for an employee and period' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(TimesheetResponseDto, 'Created timesheet')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/timesheets',
    badRequest: 'Timesheet payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  createTimesheet(@Body() body: CreateTimesheetDto) {
    return this.timesheetService.create(body);
  }

  @Get('timesheets')
  @Roles(TimesheetPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/timesheets',
    roles: [TimesheetPermissions.VIEW],
  })
  @ApiOperation({ summary: 'List timesheets' })
  @ApiEnvelopeArrayResponse(TimesheetResponseDto, 'Timesheet list')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/timesheets',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  listTimesheets(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('periodStart') periodStart?: string,
    @Query('periodEnd') periodEnd?: string,
  ) {
    return this.timesheetService.list({
      employeeId,
      status,
      periodStart,
      periodEnd,
    });
  }

  @Get('timesheets/:id')
  @Roles(TimesheetPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/timesheets/:id',
    roles: [TimesheetPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get timesheet' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(TimesheetResponseDto, 'Timesheet details')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/timesheets/:id',
    notFound: 'Timesheet not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  getTimesheet(@Param('id') id: string) {
    return this.timesheetService.get(id);
  }

  @Patch('timesheets/:id')
  @Roles(TimesheetPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/timesheets/:id',
    roles: [TimesheetPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Update draft timesheet' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(TimesheetResponseDto, 'Updated timesheet')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/timesheets/:id',
    badRequest: 'Timesheet payload is invalid',
    notFound: 'Timesheet not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  updateTimesheet(@Param('id') id: string, @Body() body: UpdateTimesheetDto) {
    return this.timesheetService.update(id, body);
  }

  @Post('timesheets/:id/submit')
  @Roles(TimesheetPermissions.CREATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/timesheets/:id/submit',
    roles: [TimesheetPermissions.CREATE],
  })
  @ApiOperation({ summary: 'Submit timesheet for approval' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(TimesheetResponseDto, 'Submitted timesheet')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/timesheets/:id/submit',
    badRequest: 'Timesheet cannot be submitted in its current state',
    notFound: 'Timesheet not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  submitTimesheet(@Param('id') id: string) {
    return this.timesheetService.submit(id);
  }

  @Post('timesheets/:id/cancel')
  @Roles(TimesheetPermissions.UPDATE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/timesheets/:id/cancel',
    roles: [TimesheetPermissions.UPDATE],
  })
  @ApiOperation({ summary: 'Cancel timesheet' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(TimesheetResponseDto, 'Cancelled timesheet')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/timesheets/:id/cancel',
    badRequest: 'Timesheet cannot be cancelled in its current state',
    notFound: 'Timesheet not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  cancelTimesheet(@Param('id') id: string) {
    return this.timesheetService.cancel(id);
  }

  @Post('timesheets/:id/approve')
  @Roles(TimesheetPermissions.APPROVE)
  @ApiProtected({
    path: '/api/v1/hr/attendance/timesheets/:id/approve',
    roles: [TimesheetPermissions.APPROVE],
  })
  @ApiOperation({ summary: 'Approve timesheet' })
  @ApiParam({ name: 'id' })
  @ApiEnvelopeOkResponse(TimesheetResponseDto, 'Approved timesheet')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/timesheets/:id/approve',
    badRequest: 'Timesheet cannot be approved in its current state',
    notFound: 'Timesheet not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  approveTimesheet(@Param('id') id: string, @Req() req: Request) {
    return this.timesheetService.approve(id, req as never);
  }

  @Post('timesheets/:id/reject')
  @Roles(TimesheetPermissions.REJECT)
  @ApiProtected({
    path: '/api/v1/hr/attendance/timesheets/:id/reject',
    roles: [TimesheetPermissions.REJECT],
  })
  @ApiOperation({ summary: 'Reject timesheet' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(TimesheetResponseDto, 'Rejected timesheet')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/timesheets/:id/reject',
    badRequest: 'Timesheet rejection payload is invalid',
    notFound: 'Timesheet not found',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  rejectTimesheet(
    @Param('id') id: string,
    @Body() body: RejectTimesheetDto,
    @Req() req: Request,
  ) {
    return this.timesheetService.reject(id, body, req as never);
  }

  @Get('punctuality')
  @Roles(PunctualityPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/punctuality',
    roles: [PunctualityPermissions.VIEW],
  })
  @ApiOperation({
    summary: 'Get punctuality log for an employee and date range',
  })
  @ApiEnvelopeArrayResponse(PunctualityLogItemDto, 'Punctuality log')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/punctuality',
    badRequest: 'employeeId, fromDate, and toDate are required',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  punctuality(
    @Query('employeeId') employeeId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    if (!employeeId || !fromDate || !toDate) {
      throw new BadRequestException(
        'employeeId, fromDate, and toDate are required',
      );
    }

    return this.punctualityService.list(employeeId, fromDate, toDate);
  }

  @Get('punctuality/trends')
  @Roles(PunctualityPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/punctuality/trends',
    roles: [PunctualityPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get punctuality trend summary' })
  @ApiEnvelopeOkResponse(PunctualityTrendDto, 'Punctuality trends')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/punctuality/trends',
    badRequest: 'employeeId, fromDate, and toDate are required',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  punctualityTrends(
    @Query('employeeId') employeeId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    if (!employeeId || !fromDate || !toDate) {
      throw new BadRequestException(
        'employeeId, fromDate, and toDate are required',
      );
    }

    return this.punctualityService.trends(employeeId, fromDate, toDate);
  }

  @Post('punctuality/alerts')
  @Roles(PunctualityPermissions.ALERT)
  @ApiProtected({
    path: '/api/v1/hr/attendance/punctuality/alerts',
    roles: [PunctualityPermissions.ALERT],
  })
  @ApiOperation({ summary: 'Create punctuality alert notification' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiEnvelopeOkResponse(
    PunctualityAlertResponseDto,
    'Punctuality alert result',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/punctuality/alerts',
    badRequest: 'Punctuality alert payload is invalid',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  createPunctualityAlert(@Body() body: CreatePunctualityAlertDto) {
    return this.punctualityService.createAlert(body);
  }

  @Get('analytics/attendance')
  @Roles(AttendanceReportPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/analytics/attendance',
    roles: [AttendanceReportPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get attendance analytics for a date range' })
  @ApiEnvelopeOkResponse(AttendanceAnalyticsResponseDto, 'Attendance analytics')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/analytics/attendance',
    badRequest: 'fromDate and toDate are required',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  attendanceAnalytics(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    if (!fromDate || !toDate) {
      throw new BadRequestException('fromDate and toDate are required');
    }

    return this.reportingService.attendanceAnalytics(
      fromDate,
      toDate,
      employeeId,
    );
  }

  @Get('analytics/leave')
  @Roles(AttendanceReportPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/analytics/leave',
    roles: [AttendanceReportPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get leave analytics for a date range' })
  @ApiEnvelopeOkResponse(LeaveAnalyticsResponseDto, 'Leave analytics')
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/analytics/leave',
    badRequest: 'fromDate and toDate are required',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  leaveAnalytics(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    if (!fromDate || !toDate) {
      throw new BadRequestException('fromDate and toDate are required');
    }

    return this.reportingService.leaveAnalytics(fromDate, toDate, employeeId);
  }

  @Get('reports/monthly')
  @Roles(AttendanceReportPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/reports/monthly',
    roles: [AttendanceReportPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get monthly attendance report' })
  @ApiEnvelopeOkResponse(
    MonthlyAttendanceReportResponseDto,
    'Monthly attendance report',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/reports/monthly',
    badRequest: 'year and month must be valid integers',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  monthlyReport(
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    const parsedYear = Number(year);
    const parsedMonth = Number(month);

    if (!Number.isInteger(parsedYear) || !Number.isInteger(parsedMonth)) {
      throw new BadRequestException('year and month must be integers');
    }
    if (parsedMonth < 1 || parsedMonth > 12) {
      throw new BadRequestException('month must be between 1 and 12');
    }

    return this.reportingService.monthlyReport(
      parsedYear,
      parsedMonth,
      employeeId,
    );
  }

  @Get('reports/compliance')
  @Roles(AttendanceReportPermissions.VIEW)
  @ApiProtected({
    path: '/api/v1/hr/attendance/reports/compliance',
    roles: [AttendanceReportPermissions.VIEW],
  })
  @ApiOperation({ summary: 'Get attendance compliance report' })
  @ApiEnvelopeOkResponse(
    AttendanceComplianceReportResponseDto,
    'Attendance compliance report',
  )
  @ApiDefaultErrors({
    path: '/api/v1/hr/attendance/reports/compliance',
    badRequest: 'fromDate and toDate are required',
    unauthorized: 'Unauthorized: missing or invalid bearer access token',
    forbidden: 'Required roles are missing',
  })
  complianceReport(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    if (!fromDate || !toDate) {
      throw new BadRequestException('fromDate and toDate are required');
    }

    return this.reportingService.complianceReport(fromDate, toDate, employeeId);
  }
}
