type LeaveRequestRow = {
  id: string;
  requestId: string;
  userId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  daysRequested: unknown;
  reason: string | null;
  description: string | null;
  contactDuringLeave: unknown;
  handoverDelegateId: string | null;
  handoverNotes: string | null;
  startHalfDay: boolean;
  endHalfDay: boolean;
  balanceSnapshot: unknown;
  submittedAt: Date | null;
  approvalSteps?: Array<{
    id: string;
    approverId: string;
    level: number;
    decision: string;
    comments: string | null;
    decidedAt: Date | null;
    createdAt: Date;
  }>;
  status: string;
  approvedById: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function mapLeaveRequestResponse(row: LeaveRequestRow) {
  const raw = row.daysRequested;
  const days =
    typeof raw === 'object' && raw != null && 'toNumber' in (raw as object)
      ? (raw as { toNumber: () => number }).toNumber()
      : Number(raw);
  return {
    id: row.id,
    requestId: row.requestId,
    userId: row.userId,
    leaveType: row.leaveType,
    startDate: row.startDate.toISOString().slice(0, 10),
    endDate: row.endDate.toISOString().slice(0, 10),
    daysRequested: days,
    reason: row.reason,
    description: row.description,
    contactDuringLeave: row.contactDuringLeave,
    handoverDelegateId: row.handoverDelegateId,
    handoverNotes: row.handoverNotes,
    startHalfDay: row.startHalfDay,
    endHalfDay: row.endHalfDay,
    balanceSnapshot: row.balanceSnapshot,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    approvalSteps: (row.approvalSteps ?? []).map((step) => ({
      id: step.id,
      approverId: step.approverId,
      level: step.level,
      decision: step.decision,
      comments: step.comments,
      decidedAt: step.decidedAt?.toISOString() ?? null,
      createdAt: step.createdAt.toISOString(),
    })),
    status: row.status,
    approvedById: row.approvedById,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    rejectionReason: row.rejectionReason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
