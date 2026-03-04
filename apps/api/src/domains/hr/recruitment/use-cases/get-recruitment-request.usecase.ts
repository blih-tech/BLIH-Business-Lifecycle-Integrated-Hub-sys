import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapRecruitmentApprovalStep } from '../recruitment-approval.mapper';

@Injectable()
export class GetRecruitmentRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const r = await this.prisma.recruitmentRequest.findUnique({
      where: { id },
      include: {
        department: { select: { name: true } },
        position: { select: { id: true, title: true } },
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
      replacementEmployeeId: withRels.replacementEmployeeId ?? null,
      rationale: withRels.rationale,
      staffing: withRels.staffing,
      schedule: withRels.schedule,
      submittedById: withRels.submittedById,
      submittedByEmail: withRels.submittedBy.email,
      submittedAt: withRels.submittedAt?.toISOString() ?? null,
      approvals: withRels.approvalSteps.map(mapRecruitmentApprovalStep),
      status: withRels.status,
      linkedJobPostingId: withRels.linkedJobPostingId ?? null,
      linkedEmployeeId: withRels.linkedEmployeeId ?? null,
      createdAt: withRels.createdAt.toISOString(),
      updatedAt: withRels.updatedAt.toISOString(),
    };
  }
}
