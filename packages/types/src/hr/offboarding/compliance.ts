export type TerminationType =
  | 'RESIGNATION'
  | 'END_OF_CONTRACT'
  | 'TERMINATION'
  | 'LAYOFF';

export interface ComplianceChecklistResponseDto {
  id: string;
  employeeId: string;
  resignationId: string;
  terminationType: TerminationType;
  noticePeriodContractual: number | null;
  noticePeriodActual: number | null;
  payInLieu: boolean | null;
  finalDues: unknown;
  terminationLetterSent: boolean;
  exitInterviewDone: boolean;
  clearanceCertificateDone: boolean;
  unionNotified: boolean;
  laborOfficeFiled: boolean;
  noPendingClaims: boolean;
  verifiedById: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplianceChecklistDto {
  employeeId: string;
  resignationId: string;
  terminationType: TerminationType;
  noticePeriodContractual?: number | null;
  noticePeriodActual?: number | null;
  payInLieu?: boolean | null;
  finalDues?: unknown;
  terminationLetterSent?: boolean;
  exitInterviewDone?: boolean;
  clearanceCertificateDone?: boolean;
  unionNotified?: boolean;
  laborOfficeFiled?: boolean;
  noPendingClaims?: boolean;
}

export interface UpdateComplianceChecklistDto {
  terminationLetterSent?: boolean;
  exitInterviewDone?: boolean;
  clearanceCertificateDone?: boolean;
  unionNotified?: boolean;
  laborOfficeFiled?: boolean;
  noPendingClaims?: boolean;
  verifiedById?: string | null;
  verifiedAt?: string | null;
}
