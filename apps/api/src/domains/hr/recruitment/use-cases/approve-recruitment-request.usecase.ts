import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapRecruitmentApprovalStep } from '../recruitment-approval.mapper';
import { validateRecruitmentRequestInput } from '../recruitment-request.validation';

@Injectable()
export class ApproveRecruitmentRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    body: {
      role: string;
      decision: 'APPROVED' | 'REJECTED';
      comments?: string | null;
    },
    approverId: string,
  ) {
    const existing = await this.prisma.recruitmentRequest.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        departmentId: true,
        positionId: true,
        type: true,
        replacementUserId: true,
      },
    });
    if (!existing) throw new NotFoundException('Recruitment request not found');
    if (existing.status !== 'PENDING')
      throw new NotFoundException(
        'Only pending requests can be approved/rejected',
      );

    await validateRecruitmentRequestInput(this.prisma, {
      departmentId: existing.departmentId,
      positionId: existing.positionId,
      type: existing.type,
      replacementUserId: existing.replacementUserId,
      requirePosition: true,
      enforceHeadcount: body.decision === 'APPROVED',
    });

    const approvals = await this.prisma.recruitmentApproval.findMany({
      where: { recruitmentRequestId: id },
      orderBy: { level: 'asc' },
      select: {
        level: true,
        role: true,
        approverId: true,
        decision: true,
        comments: true,
        decidedAt: true,
      },
    });

    const level = approvals.length + 1;
    const decidedAt = new Date();
    const step = {
      level,
      role: body.role,
      approverId,
      decision: body.decision,
      comments: body.comments ?? null,
      decidedAt: decidedAt.toISOString(),
    };
    const newApprovals = [...approvals.map(mapRecruitmentApprovalStep), step];
    const newStatus = body.decision === 'REJECTED' ? 'REJECTED' : 'APPROVED';

    const [r] = await this.prisma.$transaction([
      this.prisma.recruitmentRequest.update({
        where: { id },
        data: { status: newStatus },
        include: {
          department: { select: { name: true } },
          submittedBy: { select: { email: true } },
        },
      }),
      this.prisma.recruitmentApproval.create({
        data: {
          recruitmentRequestId: id,
          approverId,
          level,
          role: body.role,
          decision: body.decision,
          comments: body.comments ?? undefined,
          decidedAt,
        },
      }),
    ]);

    return {
      id: r.id,
      requestId: r.requestId,
      status: r.status,
      approvals: newApprovals,
    };
  }
}
