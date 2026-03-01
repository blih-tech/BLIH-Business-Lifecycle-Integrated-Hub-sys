import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { validateRecruitmentRequestInput } from '../recruitment-request.validation';

@Injectable()
export class ApproveRecruitmentRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    body: {
      role: string;
      decision: 'APPROVE' | 'REJECT';
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
      enforceHeadcount: body.decision === 'APPROVE',
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

    const step = {
      level: approvals.length + 1,
      role: body.role,
      approverId,
      status: body.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      decision: body.decision,
      comments: body.comments ?? null,
      actedAt: new Date().toISOString(),
    };
    const newApprovals = [...approvals, step];
    const newStatus = body.decision === 'REJECT' ? 'REJECTED' : 'APPROVED';
    const level = approvals.length + 1;
    const decidedAt = new Date();

    const [r] = await this.prisma.$transaction([
      this.prisma.recruitmentRequest.update({
        where: { id },
        data: { status: newStatus, approvals: newApprovals as object },
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
      approvals: r.approvals,
    };
  }
}
