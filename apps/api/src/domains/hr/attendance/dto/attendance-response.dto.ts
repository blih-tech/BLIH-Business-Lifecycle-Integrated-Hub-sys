import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  AttendanceAnalyticsResponseDto as AttendanceAnalyticsResponseDtoType,
  AttendanceComplianceReportResponseDto as AttendanceComplianceReportResponseDtoType,
  AttendanceCorrectionRequestResponseDto as AttendanceCorrectionRequestResponseDtoType,
  AttendanceLogResponseDto as AttendanceLogResponseDtoType,
  AttendanceStatus,
  EmployeeAttendanceAnalyticsDto as EmployeeAttendanceAnalyticsDtoType,
  FlexWorkRequestResponseDto as FlexWorkRequestResponseDtoType,
  HolidayResponseDto as HolidayResponseDtoType,
  LeaveAnalyticsResponseDto as LeaveAnalyticsResponseDtoType,
  LeaveTypeAnalyticsDto as LeaveTypeAnalyticsDtoType,
  MonthlyAttendanceReportResponseDto as MonthlyAttendanceReportResponseDtoType,
  OvertimeRequestResponseDto as OvertimeRequestResponseDtoType,
  PunctualityAlertResponseDto as PunctualityAlertResponseDtoType,
  PunctualityLogItemDto as PunctualityLogItemDtoType,
  PunctualityTrendDto as PunctualityTrendDtoType,
  RequestWorkflowStatus,
  TimesheetDayEntryDto as TimesheetDayEntryDtoType,
  TimesheetResponseDto as TimesheetResponseDtoType,
  UserWorkScheduleResponseDto as UserWorkScheduleResponseDtoType,
  WorkScheduleDayDto as WorkScheduleDayDtoType,
  WorkScheduleResponseDto as WorkScheduleResponseDtoType,
  ComplianceEmployeeIssueDto as ComplianceEmployeeIssueDtoType,
} from '@repo/types';

class AnalyticsTotalsResponseDto {
  @ApiProperty({ example: 22 })
  trackedDays!: number;

  @ApiProperty({ example: 20 })
  workedDays!: number;

  @ApiProperty({ example: 1 })
  leaveDays!: number;

  @ApiProperty({ example: 1 })
  absenceDays!: number;

  @ApiProperty({ example: 3 })
  remoteDays!: number;

  @ApiProperty({ example: 2 })
  lateCount!: number;

  @ApiProperty({ example: 1 })
  earlyDepartureCount!: number;

  @ApiProperty({ example: 9600 })
  totalWorkedMinutes!: number;

  @ApiProperty({ example: 180 })
  overtimeMinutes!: number;

  @ApiProperty({ example: 90.91 })
  attendanceRate!: number;

  @ApiProperty({ example: 90 })
  punctualityRate!: number;
}

export class AttendanceLogResponseDto implements AttendanceLogResponseDtoType {
  @ApiProperty({ example: '1ce0c93b-ae48-4f27-9bfd-ae5f732b7954' })
  id!: string;

  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  employeeId!: string;

  @ApiProperty({ example: '2026-02-18' })
  date!: string;

  @ApiPropertyOptional({ nullable: true, example: '2026-02-18T05:30:00.000Z' })
  checkInAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-02-18T14:35:00.000Z' })
  checkOutAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 545 })
  totalMinutes!: number | null;

  @ApiProperty({
    example: 'PRESENT',
    enum: [
      'PRESENT',
      'ABSENT',
      'LATE',
      'EARLY_DEPARTURE',
      'ON_LEAVE',
      'HALF_DAY',
      'REMOTE',
      'BUSINESS_TRIP',
    ],
  })
  status!: AttendanceLogResponseDtoType['status'];

  @ApiProperty({ example: false })
  isAutoCalculated!: boolean;

  @ApiPropertyOptional({ nullable: true, example: 45 })
  overtimeMinutes!: number | null;

  @ApiProperty({ example: true })
  overtimeApproved!: boolean;

  @ApiPropertyOptional({ nullable: true, example: 'biometric' })
  checkInMethod!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'biometric' })
  checkOutMethod!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '10.0.20.11' })
  checkInIp!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: () => Object,
    example: { lat: 8.9806, lng: 38.7578 },
  })
  checkInLocation!: unknown;

  @ApiPropertyOptional({ nullable: true, example: null })
  reconciledAt!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Worked onsite for sprint planning.',
  })
  notes!: string | null;

  @ApiProperty({ example: '2026-02-18T05:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-18T14:35:00.000Z' })
  updatedAt!: string;
}

export class WorkScheduleDayDto implements WorkScheduleDayDtoType {
  @ApiProperty({
    example: 'MONDAY',
    enum: [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ],
  })
  dayOfWeek!: WorkScheduleDayDtoType['dayOfWeek'];

  @ApiProperty({ example: true })
  isWorkingDay!: boolean;

  @ApiPropertyOptional({ nullable: true, example: 540 })
  startMinute?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 1020 })
  endMinute?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 480 })
  expectedMinutes?: number | null;

  @ApiPropertyOptional({ example: true })
  remoteAllowed?: boolean;
}

export class WorkScheduleResponseDto implements WorkScheduleResponseDtoType {
  @ApiProperty({ example: '723f84de-9f37-4c42-8e20-99ba66c2920a' })
  id!: string;

  @ApiProperty({ example: 'Standard Office Schedule' })
  name!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Default weekday office schedule.',
  })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Africa/Addis_Ababa' })
  timezone!: string | null;

  @ApiProperty({ example: true })
  isDefault!: boolean;

  @ApiProperty({ example: 15 })
  lateThresholdMinutes!: number;

  @ApiProperty({ example: 480 })
  standardMinutesPerDay!: number;

  @ApiProperty({ type: () => [WorkScheduleDayDto] })
  days!: WorkScheduleDayDto[];

  @ApiProperty({ example: '2026-01-05T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-05T08:00:00.000Z' })
  updatedAt!: string;
}

export class UserWorkScheduleResponseDto implements UserWorkScheduleResponseDtoType {
  @ApiProperty({ example: '2fb8ac31-ebcf-48ca-9235-8032348d63b2' })
  id!: string;

  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  employeeId!: string;

  @ApiProperty({ example: '723f84de-9f37-4c42-8e20-99ba66c2920a' })
  scheduleId!: string;

  @ApiProperty({ example: '2026-02-01' })
  effectiveFrom!: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  effectiveTo!: string | null;

  @ApiProperty({ example: 'Standard Office Schedule' })
  scheduleName!: string;

  @ApiProperty({ example: '2026-02-01T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-01T08:00:00.000Z' })
  updatedAt!: string;
}

export class HolidayResponseDto implements HolidayResponseDtoType {
  @ApiProperty({ example: 'e95a2c82-c3ee-44f3-b29d-b6193905fab3' })
  id!: string;

  @ApiProperty({ example: 'Adwa Victory Day' })
  name!: string;

  @ApiProperty({ example: '2026-03-02' })
  date!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '2c3fdc4f-1f45-4314-bcc4-2506575dd2ec',
  })
  countryId!: string | null;

  @ApiProperty({ example: true })
  isRecurringAnnual!: boolean;

  @ApiProperty({ example: '2026-01-03T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-03T08:00:00.000Z' })
  updatedAt!: string;
}

class BaseWorkflowRequestResponseDto {
  @ApiProperty({ example: 'e95a2c82-c3ee-44f3-b29d-b6193905fab3' })
  id!: string;

  @ApiProperty({ example: 'REQ-2026-0001' })
  requestId!: string;

  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  employeeId!: string;

  @ApiProperty({
    example: 'PENDING',
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
  })
  status!: RequestWorkflowStatus;

  @ApiPropertyOptional({ nullable: true, example: '2026-02-18T09:00:00.000Z' })
  submittedAt!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
  })
  approvedById!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-02-20T08:30:00.000Z' })
  approvedAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  rejectionReason!: string | null;

  @ApiProperty({ example: '2026-02-18T08:55:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-18T09:00:00.000Z' })
  updatedAt!: string;
}

export class AttendanceCorrectionRequestResponseDto
  extends BaseWorkflowRequestResponseDto
  implements AttendanceCorrectionRequestResponseDtoType
{
  @ApiPropertyOptional({
    nullable: true,
    example: '1ce0c93b-ae48-4f27-9bfd-ae5f732b7954',
  })
  attendanceLogId!: string | null;

  @ApiProperty({ example: '2026-02-18' })
  date!: string;

  @ApiPropertyOptional({ nullable: true, example: '2026-02-18T05:15:00.000Z' })
  requestedCheckInAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-02-18T14:35:00.000Z' })
  requestedCheckOutAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'LATE' })
  requestedStatus!: AttendanceStatus | null;

  @ApiProperty({ example: 'Correcting biometric sync issue.' })
  reason!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Approved by HR after review.',
  })
  notes!: string | null;
}

export class OvertimeRequestResponseDto
  extends BaseWorkflowRequestResponseDto
  implements OvertimeRequestResponseDtoType
{
  @ApiPropertyOptional({
    nullable: true,
    example: '1ce0c93b-ae48-4f27-9bfd-ae5f732b7954',
  })
  attendanceLogId!: string | null;

  @ApiProperty({ example: '2026-02-18' })
  date!: string;

  @ApiProperty({ example: 120 })
  requestedMinutes!: number;

  @ApiProperty({ example: 'Production incident mitigation' })
  reason!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Deployment rollback support.',
  })
  notes!: string | null;
}

export class FlexWorkRequestResponseDto
  extends BaseWorkflowRequestResponseDto
  implements FlexWorkRequestResponseDtoType
{
  @ApiProperty({
    example: 'WORK_FROM_HOME',
    enum: ['WORK_FROM_HOME', 'FLEX_TIME'],
  })
  requestType!: FlexWorkRequestResponseDtoType['requestType'];

  @ApiProperty({ example: '2026-02-18' })
  startDate!: string;

  @ApiProperty({ example: '2026-02-18' })
  endDate!: string;

  @ApiPropertyOptional({ nullable: true, example: 600 })
  requestedStartMinute!: number | null;

  @ApiPropertyOptional({ nullable: true, example: 1080 })
  requestedEndMinute!: number | null;

  @ApiProperty({ example: 'Home internet outage at normal office location.' })
  reason!: string;

  @ApiPropertyOptional({
    nullable: true,
    type: () => Object,
    example: { address: 'CMC Area, Addis Ababa' },
  })
  details!: unknown;
}

export class TimesheetDayEntryDto implements TimesheetDayEntryDtoType {
  @ApiProperty({ example: '2026-02-18' })
  date!: string;

  @ApiProperty({ example: 'PRESENT' })
  status!: string;

  @ApiProperty({ example: 480 })
  totalMinutes!: number;

  @ApiProperty({ example: 45 })
  overtimeMinutes!: number;

  @ApiProperty({ example: true })
  overtimeApproved!: boolean;

  @ApiPropertyOptional({ nullable: true, example: '2026-02-18T05:30:00.000Z' })
  checkInAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-02-18T14:35:00.000Z' })
  checkOutAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  notes!: string | null;
}

export class TimesheetResponseDto implements TimesheetResponseDtoType {
  @ApiProperty({ example: '6928d01f-e23e-44d5-878c-05dcfb83711f' })
  id!: string;

  @ApiProperty({ example: 'TS-2026-02-0012' })
  timesheetId!: string;

  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  employeeId!: string;

  @ApiProperty({ example: '2026-02-01' })
  periodStart!: string;

  @ApiProperty({ example: '2026-02-29' })
  periodEnd!: string;

  @ApiProperty({ example: 20 })
  trackedDays!: number;

  @ApiProperty({ example: 18 })
  workedDays!: number;

  @ApiProperty({ example: 1 })
  leaveDays!: number;

  @ApiProperty({ example: 1 })
  absenceDays!: number;

  @ApiProperty({ example: 3 })
  remoteDays!: number;

  @ApiProperty({ example: 2 })
  lateCount!: number;

  @ApiProperty({ example: 1 })
  earlyDepartureCount!: number;

  @ApiProperty({ example: 8640 })
  totalWorkedMinutes!: number;

  @ApiProperty({ example: 180 })
  overtimeMinutes!: number;

  @ApiProperty({ example: 90.91 })
  attendanceRate!: number;

  @ApiProperty({ example: 88.89 })
  punctualityRate!: number;

  @ApiProperty({ type: () => [TimesheetDayEntryDto] })
  sourceSnapshot!: TimesheetDayEntryDto[];

  @ApiPropertyOptional({ nullable: true, example: 'Submitted on time.' })
  notes!: string | null;

  @ApiProperty({ example: 'PENDING' })
  status!: string;

  @ApiPropertyOptional({ nullable: true, example: '2026-03-01T09:00:00.000Z' })
  submittedAt!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '40b5c2fb-7a2f-4af2-ac03-fad1bb3fe061',
  })
  approvedById!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  approvedAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: null })
  rejectionReason!: string | null;

  @ApiProperty({ example: '2026-03-01T08:55:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-01T09:00:00.000Z' })
  updatedAt!: string;
}

export class PunctualityLogItemDto implements PunctualityLogItemDtoType {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  employeeId!: string;

  @ApiProperty({ example: '2026-02-18' })
  date!: string;

  @ApiProperty({ example: 'LATE' })
  status!: PunctualityLogItemDtoType['status'];

  @ApiPropertyOptional({ nullable: true, example: 540 })
  expectedStartMinute!: number | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-02-18T05:48:00.000Z' })
  actualCheckInAt!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 15 })
  lateThresholdMinutes!: number | null;

  @ApiProperty({ example: 18 })
  minutesLate!: number;

  @ApiPropertyOptional({ nullable: true, example: 462 })
  totalMinutes!: number | null;
}

export class PunctualityTrendDto implements PunctualityTrendDtoType {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  employeeId!: string;

  @ApiProperty({ example: '2026-02-01' })
  fromDate!: string;

  @ApiProperty({ example: '2026-02-29' })
  toDate!: string;

  @ApiProperty({ example: 20 })
  totalTrackedDays!: number;

  @ApiProperty({ example: 2 })
  lateDays!: number;

  @ApiProperty({ example: 1 })
  earlyDepartureDays!: number;

  @ApiProperty({ example: 0 })
  absentDays!: number;

  @ApiProperty({ example: 90 })
  punctualityRate!: number;

  @ApiProperty({ example: 9 })
  averageMinutesLate!: number;
}

export class PunctualityAlertResponseDto implements PunctualityAlertResponseDtoType {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  employeeId!: string;

  @ApiProperty({ example: '2026-02-01' })
  fromDate!: string;

  @ApiProperty({ example: '2026-02-29' })
  toDate!: string;

  @ApiProperty({ example: 3 })
  thresholdLateDays!: number;

  @ApiProperty({ example: 10 })
  thresholdAverageLateMinutes!: number;

  @ApiProperty({ example: 4 })
  lateDays!: number;

  @ApiProperty({ example: 12 })
  averageMinutesLate!: number;

  @ApiProperty({ example: true })
  alertCreated!: boolean;

  @ApiPropertyOptional({
    nullable: true,
    example: '8f8e3879-8686-48c5-b883-09ca6e2547ff',
  })
  notificationId!: string | null;
}

export class EmployeeAttendanceAnalyticsDto
  extends AnalyticsTotalsResponseDto
  implements EmployeeAttendanceAnalyticsDtoType
{
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  employeeId!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Jane Doe' })
  employeeName!: string | null;
}

export class AttendanceAnalyticsResponseDto implements AttendanceAnalyticsResponseDtoType {
  @ApiProperty({ example: '2026-02-01' })
  rangeStart!: string;

  @ApiProperty({ example: '2026-02-29' })
  rangeEnd!: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  employeeId!: string | null;

  @ApiProperty({ example: 1 })
  employeeCount!: number;

  @ApiProperty({ type: () => AnalyticsTotalsResponseDto })
  totals!: AttendanceAnalyticsResponseDtoType['totals'];

  @ApiProperty({ type: () => [EmployeeAttendanceAnalyticsDto] })
  employees!: EmployeeAttendanceAnalyticsDto[];
}

export class LeaveTypeAnalyticsDto implements LeaveTypeAnalyticsDtoType {
  @ApiProperty({ example: 'ANNUAL' })
  leaveType!: string;

  @ApiProperty({ example: 8 })
  totalRequests!: number;

  @ApiProperty({ example: 5 })
  approvedRequests!: number;

  @ApiProperty({ example: 2 })
  pendingRequests!: number;

  @ApiProperty({ example: 12 })
  approvedDays!: number;

  @ApiProperty({ example: 5 })
  pendingDays!: number;
}

export class LeaveAnalyticsResponseDto implements LeaveAnalyticsResponseDtoType {
  @ApiProperty({ example: '2026-02-01' })
  rangeStart!: string;

  @ApiProperty({ example: '2026-02-29' })
  rangeEnd!: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  employeeId!: string | null;

  @ApiProperty({ example: 10 })
  totalRequests!: number;

  @ApiProperty({ example: 6 })
  approvedRequests!: number;

  @ApiProperty({ example: 1 })
  rejectedRequests!: number;

  @ApiProperty({ example: 2 })
  pendingRequests!: number;

  @ApiProperty({ example: 1 })
  cancelledRequests!: number;

  @ApiProperty({ example: 16 })
  approvedDays!: number;

  @ApiProperty({ example: 5 })
  pendingDays!: number;

  @ApiProperty({ type: () => [LeaveTypeAnalyticsDto] })
  types!: LeaveTypeAnalyticsDto[];
}

export class MonthlyAttendanceReportResponseDto implements MonthlyAttendanceReportResponseDtoType {
  @ApiProperty({ example: 2 })
  month!: number;

  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: '2026-02-01' })
  rangeStart!: string;

  @ApiProperty({ example: '2026-02-29' })
  rangeEnd!: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  employeeId!: string | null;

  @ApiProperty({ type: () => AnalyticsTotalsResponseDto })
  totals!: MonthlyAttendanceReportResponseDtoType['totals'];

  @ApiProperty({ type: () => [EmployeeAttendanceAnalyticsDto] })
  employees!: EmployeeAttendanceAnalyticsDto[];
}

export class ComplianceEmployeeIssueDto implements ComplianceEmployeeIssueDtoType {
  @ApiProperty({ example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374' })
  employeeId!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Jane Doe' })
  employeeName!: string | null;

  @ApiProperty({ example: 1 })
  absenceDays!: number;

  @ApiProperty({ example: 3 })
  lateCount!: number;

  @ApiProperty({ example: 1 })
  earlyDepartureCount!: number;

  @ApiProperty({ example: 1 })
  pendingCorrections!: number;

  @ApiProperty({ example: 0 })
  pendingOvertimeRequests!: number;

  @ApiProperty({ example: 1 })
  pendingFlexRequests!: number;

  @ApiProperty({ example: 0 })
  pendingLeaveRequests!: number;

  @ApiProperty({ example: 72.5 })
  complianceScore!: number;
}

export class AttendanceComplianceReportResponseDto implements AttendanceComplianceReportResponseDtoType {
  @ApiProperty({ example: '2026-02-01' })
  rangeStart!: string;

  @ApiProperty({ example: '2026-02-29' })
  rangeEnd!: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  employeeId!: string | null;

  @ApiProperty({ example: 1 })
  employeeCount!: number;

  @ApiProperty({
    type: () => Object,
    example: { lateCount: 3, absenceDays: 1 },
  })
  thresholds!: AttendanceComplianceReportResponseDtoType['thresholds'];

  @ApiProperty({ type: () => [ComplianceEmployeeIssueDto] })
  flaggedEmployees!: ComplianceEmployeeIssueDto[];
}
