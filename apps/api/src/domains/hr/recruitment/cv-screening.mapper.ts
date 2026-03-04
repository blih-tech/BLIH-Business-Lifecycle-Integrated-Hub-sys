type CvScreeningRow = {
  id: string;
  candidateId: string;
  jobPostingId: string;
  assessments: unknown;
  aggregateRating: { toString(): string } | null;
  recommendation: 'SELECT' | 'PAUSE' | 'DECLINE' | null;
  nextPhase: string | null;
  screenedById: string;
  screenedBy?: { email: string | null } | null;
  screenedAt: Date;
  approvedById: string | null;
  approvedAt: Date | null;
  interviewScheduled: boolean;
  rejectionSent: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function mapCvScreeningResponse(row: CvScreeningRow) {
  return {
    id: row.id,
    candidateId: row.candidateId,
    jobPostingId: row.jobPostingId,
    assessments: row.assessments,
    aggregateRating: row.aggregateRating?.toString() ?? null,
    recommendation: row.recommendation,
    nextPhase: row.nextPhase,
    screenedById: row.screenedById,
    screenedByEmail: row.screenedBy?.email ?? null,
    screenedAt: row.screenedAt.toISOString(),
    approvedById: row.approvedById,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    interviewScheduled: row.interviewScheduled,
    rejectionSent: row.rejectionSent,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
