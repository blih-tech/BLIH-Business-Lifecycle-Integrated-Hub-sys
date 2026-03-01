export type HiringDecisionOutcome =
  | 'OFFER_APPROVED'
  | 'OFFER_DECLINED'
  | 'SUSPENDED';

export interface OfferDto {
  totalPay?: number;
  currency?: string;
  perks?: string[];
  probationPeriodDays?: number;
  targetStartDate?: string;
  workType?: string;
}

/** When finalDecision is OFFER_APPROVED, offer must be non-null (enforce in service layer). */

export interface ApprovalDto {
  level: number;
  role: string;
  approverId?: string | null;
  status: string;
  decision?: string | null;
  comments?: string | null;
  actedAt?: string | null;
}

export interface CreateHiringDecisionDto {
  candidateId: string;
  recruitmentRequestId: string;
  jobPostingId: string;
  candidateSummary?: Record<string, unknown> | null;
  offer?: OfferDto | null;
  selectionReasoning?: string | null;
  keyAssets?: unknown[] | null;
  attachments?: unknown[] | null;
}

export interface AcceptOfferDto {
  accepted: boolean;
  acceptedAt?: string | null;
  employeeId?: string | null;
  onboardingId?: string | null;
}

export interface HiringDecisionResponseDto {
  id: string;
  decisionId: string;
  candidateId: string;
  recruitmentRequestId: string;
  jobPostingId: string;
  candidateSummary: unknown;
  offer: unknown;
  selectionReasoning: string | null;
  keyAssets: unknown;
  attachments: unknown;
  submittedById: string;
  submittedByEmail?: string | null;
  submittedAt: string | null;
  approvals: unknown;
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
