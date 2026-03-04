type ApprovalRow = {
  level: number;
  role: string;
  approverId: string;
  decision: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments: string | null;
  decidedAt: Date;
};

export function mapRecruitmentApprovalStep(row: ApprovalRow) {
  return {
    level: row.level,
    role: row.role,
    approverId: row.approverId,
    decision: row.decision,
    comments: row.comments,
    decidedAt: row.decidedAt.toISOString(),
  };
}
