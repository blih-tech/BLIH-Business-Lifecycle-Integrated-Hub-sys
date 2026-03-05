export type HiringDecisionOutcome =
  | 'OFFER_APPROVED'
  | 'OFFER_DECLINED'
  | 'SUSPENDED';

export interface CreateHiringDecisionDto {
  jobApplicationId: string;
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
  decisionId: string;
  jobApplicationId: string;
  candidateSummary: unknown;
  offer: unknown;
  selectionReasoning: string | null;
  keyAssets: unknown;
  attachments: unknown;
  submittedById: string;
  submittedAt: string | null;
  finalDecision: HiringDecisionOutcome | null;
  offerDocumentUrl: string | null;
  candidateNotifiedAt: string | null;
  offerAccepted: boolean;
  acceptedAt: string | null;
  offerExpiresAt: string | null;
  employeeId: string | null;
  onboardingId: string | null;
  createdAt: string;
  updatedAt: string;
}
