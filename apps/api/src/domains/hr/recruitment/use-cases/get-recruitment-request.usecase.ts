import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class GetRecruitmentRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const r = await this.prisma.recruitmentRequest.findUnique({
      where: { id },
      include: {
        department: { select: { name: true } },
        position: { select: { id: true, title: true } },
        submittedBy: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
    if (!r) throw new NotFoundException('Recruitment request not found');
    const withRels = r as typeof r & {
      department: { name: string };
      position: { id: string; title: string } | null;
      submittedBy: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
      };
    };
    return {
      id: withRels.id,
      requestId: withRels.requestId,
      departmentId: withRels.departmentId,
      departmentName: withRels.department.name,
      positionId: withRels.positionId ?? null,
      positionTitle: withRels.position?.title ?? null,
      type: withRels.type,
      replacementUserId: withRels.replacementUserId ?? null,
      rationale: withRels.rationale,
      staffing: withRels.staffing,
      schedule: withRels.schedule,
      submittedById: withRels.submittedById,
      submittedByEmail: withRels.submittedBy.email,
      submittedAt: withRels.submittedAt?.toISOString() ?? null,
      approvals: withRels.approvals,
      status: withRels.status,
      linkedJobPostingId: withRels.linkedJobPostingId ?? null,
      linkedUserId: withRels.linkedUserId ?? null,
      createdAt: withRels.createdAt.toISOString(),
      updatedAt: withRels.updatedAt.toISOString(),
    };
  }
}
