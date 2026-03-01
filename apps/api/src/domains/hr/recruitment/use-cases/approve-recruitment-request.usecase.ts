import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

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
      select: { id: true, status: true, approvals: true },
    });
    if (!existing) throw new NotFoundException('Recruitment request not found');
    if (existing.status !== 'PENDING')
      throw new NotFoundException(
        'Only pending requests can be approved/rejected',
      );

    const approvals = (existing.approvals as unknown[]) ?? [];
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

    const r = await this.prisma.recruitmentRequest.update({
      where: { id },
      data: { status: newStatus, approvals: newApprovals as object },
      include: {
        department: { select: { name: true } },
        submittedBy: { select: { email: true } },
      },
    });

    return {
      id: r.id,
      requestId: r.requestId,
      status: r.status,
      approvals: r.approvals,
    };
  }
}
