import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
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
        submittedBy: { select: { email: true } },
      },
    });

    return list.map((r) => {
      const withRels = r as typeof r & {
        department: { name: string };
        position: { title: string } | null;
        submittedBy: { email: string };
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
        linkedJobPostingId: withRels.linkedJobPostingId ?? null,
        createdAt: withRels.createdAt.toISOString(),
        updatedAt: withRels.updatedAt.toISOString(),
      };
    });
  }
}
