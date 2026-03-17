export interface EmployeeAttendanceAnalyticsDto {
  employeeId: string;
  employeeName: string | null;
  trackedDays: number;
  workedDays: number;
  leaveDays: number;
  absenceDays: number;
  remoteDays: number;
  lateCount: number;
  earlyDepartureCount: number;
  totalWorkedMinutes: number;
  overtimeMinutes: number;
  attendanceRate: number;
  punctualityRate: number;
}

export interface AttendanceAnalyticsResponseDto {
  rangeStart: string;
  rangeEnd: string;
  employeeId: string | null;
  employeeCount: number;
  totals: Omit<EmployeeAttendanceAnalyticsDto, 'employeeId' | 'employeeName'>;
  employees: EmployeeAttendanceAnalyticsDto[];
}

export interface LeaveTypeAnalyticsDto {
  leaveType: string;
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  approvedDays: number;
  pendingDays: number;
}

export interface LeaveAnalyticsResponseDto {
  rangeStart: string;
  rangeEnd: string;
  employeeId: string | null;
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  pendingRequests: number;
  cancelledRequests: number;
  approvedDays: number;
  pendingDays: number;
  types: LeaveTypeAnalyticsDto[];
}

export interface MonthlyAttendanceReportResponseDto {
  month: number;
  year: number;
  rangeStart: string;
  rangeEnd: string;
  employeeId: string | null;
  totals: Omit<EmployeeAttendanceAnalyticsDto, 'employeeId' | 'employeeName'>;
  employees: EmployeeAttendanceAnalyticsDto[];
}

export interface ComplianceEmployeeIssueDto {
  employeeId: string;
  employeeName: string | null;
  absenceDays: number;
  lateCount: number;
  earlyDepartureCount: number;
  pendingCorrections: number;
  pendingOvertimeRequests: number;
  pendingFlexRequests: number;
  pendingLeaveRequests: number;
  complianceScore: number;
}

export interface AttendanceComplianceReportResponseDto {
  rangeStart: string;
  rangeEnd: string;
  employeeId: string | null;
  employeeCount: number;
  thresholds: {
    lateCount: number;
    absenceDays: number;
  };
  flaggedEmployees: ComplianceEmployeeIssueDto[];
}
