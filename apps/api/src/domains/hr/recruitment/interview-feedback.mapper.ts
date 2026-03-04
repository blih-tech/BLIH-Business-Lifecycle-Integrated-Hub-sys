type InterviewFeedbackRow = {
  id: string;
  candidateId: string;
  interviewRound: number;
  interviewType:
    | 'HR_SCREENING'
    | 'TECHNICAL'
    | 'BEHAVIORAL'
    | 'PANEL'
    | 'FINAL';
  scheduledAt: Date | null;
  completedAt: Date | null;
  interviewers: unknown;
  ratings: unknown;
  totalRating: { toString(): string } | null;
  endorsement: 'STRONG_YES' | 'YES' | 'UNCERTAIN' | 'NO' | null;
  remarks: string | null;
  nextAction: string | null;
  compiledById: string;
  compiledBy?: { email: string | null } | null;
  compiledAt: Date;
  ranking: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export function mapInterviewFeedbackResponse(row: InterviewFeedbackRow) {
  return {
    id: row.id,
    candidateId: row.candidateId,
    interviewRound: row.interviewRound,
    interviewType: row.interviewType,
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    interviewers: row.interviewers,
    ratings: row.ratings,
    totalRating: row.totalRating?.toString() ?? null,
    endorsement: row.endorsement,
    remarks: row.remarks,
    nextAction: row.nextAction,
    compiledById: row.compiledById,
    compiledByEmail: row.compiledBy?.email ?? null,
    compiledAt: row.compiledAt.toISOString(),
    ranking: row.ranking,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
