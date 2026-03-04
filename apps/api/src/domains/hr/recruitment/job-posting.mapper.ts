type JobPostingRow = {
  id: string;
  postingId: string;
  recruitmentRequestId: string;
  positionId: string | null;
  position?: {
    title: string;
  } | null;
  positionSnapshot: unknown;
  description: unknown;
  prerequisites: unknown;
  kpis: unknown;
  platforms: string[];
  status:
    | 'DRAFT'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'PUBLISHED'
    | 'FILLED'
    | 'EXPIRED'
    | 'CANCELLED';
  postedAt: Date | null;
  expiresAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    candidates?: number;
  };
};

export function mapJobPostingResponse(row: JobPostingRow) {
  return {
    id: row.id,
    postingId: row.postingId,
    recruitmentRequestId: row.recruitmentRequestId,
    positionId: row.positionId,
    positionTitle: row.position?.title ?? null,
    positionSnapshot: row.positionSnapshot,
    description: row.description,
    prerequisites: row.prerequisites,
    kpis: row.kpis,
    platforms: row.platforms,
    status: row.status,
    postedAt: row.postedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    closedAt: row.closedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    candidatesCount: row._count?.candidates ?? 0,
  };
}
