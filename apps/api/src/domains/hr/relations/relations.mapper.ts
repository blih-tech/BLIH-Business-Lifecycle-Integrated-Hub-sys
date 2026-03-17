import type {
  IncidentReportResponseDto,
  DisciplinaryActionResponseDto,
  GrievanceResponseDto,
  RecognitionResponseDto,
  SurveyFormResponseDto,
  SurveyResponseRecordDto,
  ConflictMediationResponseDto,
} from '@repo/types';

function dateStr(d: Date | null): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}

export function mapIncidentReport(row: {
  id: string;
  reportId: string;
  employeeId: string;
  incidentType: string;
  severity: string;
  description: string;
  location: string | null;
  occurredAt: Date;
  peopleInvolved: unknown;
  immediateActions: unknown;
  investigatorId: string | null;
  slaHours: number | null;
  investigationDueAt: Date | null;
  investigationNotes: string | null;
  rootCause: string | null;
  preventiveActions: unknown;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): IncidentReportResponseDto {
  return {
    id: row.id,
    reportId: row.reportId,
    employeeId: row.employeeId,
    incidentType: row.incidentType as IncidentReportResponseDto['incidentType'],
    severity: row.severity as IncidentReportResponseDto['severity'],
    description: row.description,
    location: row.location,
    occurredAt: row.occurredAt.toISOString(),
    peopleInvolved: row.peopleInvolved,
    immediateActions: row.immediateActions,
    investigatorId: row.investigatorId,
    slaHours: row.slaHours,
    investigationDueAt: row.investigationDueAt?.toISOString() ?? null,
    investigationNotes: row.investigationNotes,
    rootCause: row.rootCause,
    preventiveActions: row.preventiveActions,
    status: row.status as IncidentReportResponseDto['status'],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapDisciplinaryAction(row: {
  id: string;
  employeeId: string;
  incidentType: string;
  actionType: string;
  incidentReportId: string | null;
  description: string;
  effectiveFrom: Date;
  expiresAt: Date | null;
  durationDays: number | null;
  approvedById: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): DisciplinaryActionResponseDto {
  return {
    id: row.id,
    employeeId: row.employeeId,
    incidentType:
      row.incidentType as DisciplinaryActionResponseDto['incidentType'],
    actionType: row.actionType as DisciplinaryActionResponseDto['actionType'],
    incidentReportId: row.incidentReportId,
    description: row.description,
    effectiveFrom: dateStr(row.effectiveFrom)!,
    expiresAt: dateStr(row.expiresAt),
    durationDays: row.durationDays,
    approvedById: row.approvedById,
    status: row.status as DisciplinaryActionResponseDto['status'],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapGrievance(row: {
  id: string;
  employeeId: string;
  subject: string;
  description: string;
  category: string | null;
  submittedAt: Date;
  assignedToId: string | null;
  status: string;
  resolutionNotes: string | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): GrievanceResponseDto {
  return {
    id: row.id,
    employeeId: row.employeeId,
    subject: row.subject,
    description: row.description,
    category: row.category,
    submittedAt: row.submittedAt.toISOString(),
    assignedToId: row.assignedToId,
    status: row.status as GrievanceResponseDto['status'],
    resolutionNotes: row.resolutionNotes,
    closedAt: row.closedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapRecognition(row: {
  id: string;
  nominatorId: string;
  nomineeEmployeeId: string;
  category: string;
  description: string;
  impact: string | null;
  suggestedAward: string | null;
  publicRecognition: boolean;
  approvals: unknown;
  status: string;
  approvedById: string | null;
  createdAt: Date;
  updatedAt: Date;
}): RecognitionResponseDto {
  return {
    id: row.id,
    nominatorId: row.nominatorId,
    nomineeEmployeeId: row.nomineeEmployeeId,
    category: row.category as RecognitionResponseDto['category'],
    description: row.description,
    impact: row.impact,
    suggestedAward: row.suggestedAward,
    publicRecognition: row.publicRecognition,
    approvals: row.approvals,
    status: row.status as RecognitionResponseDto['status'],
    approvedById: row.approvedById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapSurvey(row: {
  id: string;
  title: string;
  description: string | null;
  type: string;
  questions: unknown;
  anonymous: boolean;
  status: string;
  opensAt: Date | null;
  closesAt: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}): SurveyFormResponseDto {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type as SurveyFormResponseDto['type'],
    questions: Array.isArray(row.questions) ? row.questions : [],
    anonymous: row.anonymous,
    status: row.status as SurveyFormResponseDto['status'],
    opensAt: row.opensAt?.toISOString() ?? null,
    closesAt: row.closesAt?.toISOString() ?? null,
    createdById: row.createdById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapSurveyResponseRecord(row: {
  id: string;
  surveyId: string;
  employeeId: string | null;
  responses: unknown;
  submittedAt: Date;
  createdAt: Date;
}): SurveyResponseRecordDto {
  return {
    id: row.id,
    surveyId: row.surveyId,
    employeeId: row.employeeId,
    responses: row.responses,
    submittedAt: row.submittedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapConflictMediation(row: {
  id: string;
  requesterEmployeeId: string;
  otherPartyEmployeeId: string;
  nature: string;
  duration: string | null;
  attemptedResolutions: string | null;
  workImpact: string | null;
  desiredOutcome: string | null;
  mediatorId: string | null;
  sessionDates: unknown;
  agreementReached: boolean | null;
  agreementNotes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): ConflictMediationResponseDto {
  return {
    id: row.id,
    requesterEmployeeId: row.requesterEmployeeId,
    otherPartyEmployeeId: row.otherPartyEmployeeId,
    nature: row.nature,
    duration: row.duration,
    attemptedResolutions: row.attemptedResolutions,
    workImpact: row.workImpact,
    desiredOutcome: row.desiredOutcome,
    mediatorId: row.mediatorId,
    sessionDates: row.sessionDates,
    agreementReached: row.agreementReached,
    agreementNotes: row.agreementNotes,
    status: row.status as ConflictMediationResponseDto['status'],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
