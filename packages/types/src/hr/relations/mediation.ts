export type MediationStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'AGREEMENT_REACHED'
  | 'CLOSED';

export interface ConflictMediationResponseDto {
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
  status: MediationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConflictMediationDto {
  requesterEmployeeId: string;
  otherPartyEmployeeId: string;
  nature: string;
  duration?: string | null;
  attemptedResolutions?: string | null;
  workImpact?: string | null;
  desiredOutcome?: string | null;
}

export interface UpdateConflictMediationDto {
  mediatorId?: string | null;
  sessionDates?: unknown;
  agreementReached?: boolean | null;
  agreementNotes?: string | null;
  status?: MediationStatus;
}
