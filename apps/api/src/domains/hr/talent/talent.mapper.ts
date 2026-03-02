function toIso(date: Date | null | undefined): string | null {
  return date?.toISOString() ?? null;
}

export const mapSuccessionPlan = (plan: {
  id: string;
  positionId: string;
  candidateId: string;
  readiness: string;
  riskLevel: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: plan.id,
  positionId: plan.positionId,
  candidateId: plan.candidateId,
  readiness: plan.readiness,
  riskLevel: plan.riskLevel,
  notes: plan.notes,
  createdAt: plan.createdAt.toISOString(),
  updatedAt: plan.updatedAt.toISOString(),
});

export const mapPromotionProposal = (proposal: {
  id: string;
  userId: string;
  fromPositionId: string | null;
  toPositionId: string | null;
  proposedById: string;
  justification: unknown;
  status: string;
  approvedById: string | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: proposal.id,
  userId: proposal.userId,
  fromPositionId: proposal.fromPositionId,
  toPositionId: proposal.toPositionId,
  proposedById: proposal.proposedById,
  justification:
    proposal.justification && typeof proposal.justification === 'object'
      ? (proposal.justification as Record<string, unknown>)
      : null,
  status: proposal.status,
  approvedById: proposal.approvedById,
  approvedAt: toIso(proposal.approvedAt),
  rejectedAt: toIso(proposal.rejectedAt),
  createdAt: proposal.createdAt.toISOString(),
  updatedAt: proposal.updatedAt.toISOString(),
});
