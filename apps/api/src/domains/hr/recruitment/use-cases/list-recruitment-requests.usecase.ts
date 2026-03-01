import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapRecruitmentApprovalStep } from '../recruitment-approval.mapper';
@Injectable()
export class ListRecruitmentRequestsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { status?: string; departmentId?: string }) {
    const where: { status?: string; departmentId?: string } = {};
    if (filters.status) where.status = filters.status;
    if (filters.departmentId) where.departmentId = filters.departmentId;

    const list = await this.prisma.recruitmentRequest.findMany({
      where: where as {
        departmentId?: string;
        status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
      },
      orderBy: { createdAt: 'desc' },
      include: {
        department: { select: { name: true } },
        position: { select: { title: true } },
        approvalSteps: {
          orderBy: { level: 'asc' },
          select: {
            level: true,
            role: true,
            approverId: true,
            decision: true,
            comments: true,
            decidedAt: true,
          },
        },
        submittedBy: { select: { email: true } },
      },
    });

    return list.map((r) => {
      const withRels = r as typeof r & {
        department: { name: string };
        position: { title: string } | null;
        submittedBy: { email: string };
        approvalSteps: Array<{
          level: number;
          role: string;
          approverId: string;
          decision: 'PENDING' | 'APPROVED' | 'REJECTED';
          comments: string | null;
          decidedAt: Date;
        }>;
      };
      return {
        id: withRels.id,
        requestId: withRels.requestId,
        departmentId: withRels.departmentId,
        departmentName: withRels.department.name,
        positionId: withRels.positionId ?? null,
        positionTitle: withRels.position?.title ?? null,
        type: withRels.type,
        status: withRels.status,
        submittedById: withRels.submittedById,
        submittedByEmail: withRels.submittedBy.email,
        submittedAt: withRels.submittedAt?.toISOString() ?? null,
        approvals: withRels.approvalSteps.map(mapRecruitmentApprovalStep),
        linkedJobPostingId: withRels.linkedJobPostingId ?? null,
        createdAt: withRels.createdAt.toISOString(),
        updatedAt: withRels.updatedAt.toISOString(),
      };
    });
  }
}
