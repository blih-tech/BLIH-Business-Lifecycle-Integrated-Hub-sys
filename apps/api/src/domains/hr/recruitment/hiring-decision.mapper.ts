type HiringDecisionRow = {
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
  submittedBy?: {
    email: string;
  } | null;
  submittedAt: Date | null;
  finalDecision: 'OFFER_APPROVED' | 'OFFER_DECLINED' | 'SUSPENDED' | null;
  offerDocumentUrl: string | null;
  candidateNotifiedAt: Date | null;
  offerAccepted: boolean;
  acceptedAt: Date | null;
  offerExpiresAt: Date | null;
  employeeId: string | null;
  onboardingId: string | null;
  onboarding?: {
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

export function mapHiringDecisionResponse(row: HiringDecisionRow) {
  return {
    id: row.id,
    decisionId: row.decisionId,
    candidateId: row.candidateId,
    recruitmentRequestId: row.recruitmentRequestId,
    jobPostingId: row.jobPostingId,
    candidateSummary: row.candidateSummary,
    offer: row.offer,
    selectionReasoning: row.selectionReasoning,
    keyAssets: row.keyAssets,
    attachments: row.attachments,
    submittedById: row.submittedById,
    submittedByEmail: row.submittedBy?.email ?? null,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    finalDecision: row.finalDecision,
    offerDocumentUrl: row.offerDocumentUrl,
    candidateNotifiedAt: row.candidateNotifiedAt?.toISOString() ?? null,
    offerAccepted: row.offerAccepted,
    acceptedAt: row.acceptedAt?.toISOString() ?? null,
    offerExpiresAt: row.offerExpiresAt?.toISOString() ?? null,
    employeeId: row.employeeId,
    onboardingId: row.onboardingId,
    onboardingStatus: row.onboarding?.status ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
