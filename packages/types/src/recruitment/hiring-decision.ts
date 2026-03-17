export type HiringDecisionOutcome =
  | 'OFFER_APPROVED'
  | 'OFFER_DECLINED'
  | 'SUSPENDED';

export interface CreateHiringDecisionDto {
  jobId: string;
  applicantId: string;
  candidateSummary?: Record<string, unknown> | null;
  offer?: Record<string, unknown> | null;
  selectionReasoning?: string | null;
  keyAssets?: unknown[] | null;
  attachments?: unknown[] | null;
}

export interface FinalizeHiringDecisionDto {
  finalDecision: HiringDecisionOutcome;
  offer?: Record<string, unknown> | null;
  offerExpiresAt?: string | null;
  offerDocumentUrl?: string | null;
  candidateNotifiedAt?: string | null;
}

export interface AcceptOfferDto {
  accepted: boolean;
  acceptedAt?: string | null;
  employeeId: string;
  onboardingId?: string | null;
}

export interface HiringDecisionResponseDto {
  id: string;
  jobId: string;
  applicantId: string;
  candidateSummary: unknown;
  offer: unknown;
  selectionReasoning: string | null;
  keyAssets: unknown;
  attachments: unknown;
  submittedById: string;
  outcome: HiringDecisionOutcome;
  salaryOffered: string | null;
  currency: string | null;
  startDate: string | null;
  decisionNotes: string | null;
  decidedAt: string | null;
  onboardingId: string | null;
  createdAt: string;
  updatedAt: string;
}
