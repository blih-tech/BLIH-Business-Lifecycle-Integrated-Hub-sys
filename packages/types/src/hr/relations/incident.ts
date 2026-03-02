export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentType = 'SAFETY' | 'SECURITY' | 'CONFLICT' | 'HARASSMENT' | 'OTHER';
export type IncidentReportStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';

export interface IncidentReportResponseDto {
  id: string;
  reportId: string;
  userId: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  description: string;
  location: string | null;
  occurredAt: string;
  peopleInvolved: unknown;
  immediateActions: unknown;
  investigatorId: string | null;
  slaHours: number | null;
  investigationDueAt: string | null;
  investigationNotes: string | null;
  rootCause: string | null;
  preventiveActions: unknown;
  status: IncidentReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentReportDto {
  userId: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  description: string;
  location?: string | null;
  occurredAt: string;
  peopleInvolved?: unknown;
  immediateActions?: unknown;
}

export interface UpdateIncidentReportDto {
  investigatorId?: string | null;
  investigationNotes?: string | null;
  rootCause?: string | null;
  preventiveActions?: unknown;
  status?: IncidentReportStatus;
}
