export type DisciplinaryIncidentType = 'ATTENDANCE_VIOLATION' | 'PERFORMANCE_ISSUE' | 'CODE_OF_CONDUCT';
export type DisciplinaryActionType =
  | 'VERBAL_WARNING'
  | 'WRITTEN_WARNING'
  | 'FINAL_WARNING'
  | 'PERFORMANCE_IMPROVEMENT_PLAN'
  | 'SUSPENSION'
  | 'TERMINATION';
export type DisciplinaryStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'APPEALED';

export interface DisciplinaryActionResponseDto {
  id: string;
  userId: string;
  incidentType: DisciplinaryIncidentType;
  actionType: DisciplinaryActionType;
  incidentReportId: string | null;
  description: string;
  effectiveFrom: string;
  expiresAt: string | null;
  durationDays: number | null;
  approvedById: string | null;
  status: DisciplinaryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisciplinaryActionDto {
  userId: string;
  incidentType: DisciplinaryIncidentType;
  actionType: DisciplinaryActionType;
  incidentReportId?: string | null;
  description: string;
  effectiveFrom: string;
  expiresAt?: string | null;
  durationDays?: number | null;
  approvedById?: string | null;
}
