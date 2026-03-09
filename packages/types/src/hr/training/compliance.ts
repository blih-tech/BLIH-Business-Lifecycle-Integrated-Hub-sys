export interface TrainingComplianceRequirementResponseDto {
  trainingRequestId: string;
  employeeId: string;
  departmentId: string;
  title: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  approvedAt: string | null;
  completionId: string | null;
  completionStatus: string | null;
  expiryDate: string | null;
  isCompliant: boolean;
}

export interface TrainingComplianceStatusResponseDto {
  employeeId?: string;
  departmentId?: string;
  totalRequirements: number;
  compliantCount: number;
  overdueCount: number;
  expiringSoonCount: number;
  complianceRate: number;
}

export interface TrainingComplianceAuditEntryDto {
  trainingRequestId: string;
  employeeId: string;
  action: 'REQUEST_CREATED' | 'REQUEST_APPROVED' | 'COMPLETION_RECORDED';
  occurredAt: string;
  title: string;
  actorId: string | null;
}

export interface GenerateTrainingComplianceReportDto {
  employeeId?: string;
  departmentId?: string;
  year: number;
}

export interface TrainingComplianceReportResponseDto {
  year: number;
  employeeId?: string;
  departmentId?: string;
  totalRequirements: number;
  completedCount: number;
  activeCount: number;
  expiredCount: number;
  complianceRate: number;
}
