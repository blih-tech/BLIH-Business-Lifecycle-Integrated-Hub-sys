import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapRecruitmentApprovalStep } from '../recruitment-approval.mapper';
import {
  assertNextApprovalRole,
  determineRecruitmentApprovalFlow,
} from '../recruitment-approval-flow';
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
        replacementEmployeeId: true,
        staffing: true,
        schedule: true,
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
      replacementEmployeeId: existing.replacementEmployeeId,
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

    const requiredRoles = determineRecruitmentApprovalFlow({
      staffing: existing.staffing,
      schedule: existing.schedule,
    });
    const normalizedRole = assertNextApprovalRole(
      body.role,
      approvals.map((approval) => approval.role),
      requiredRoles,
    );

    const level = requiredRoles.indexOf(normalizedRole) + 1;
    const decidedAt = new Date();
    const step = {
      level,
      role: normalizedRole,
      approverId,
      decision: body.decision,
      comments: body.comments ?? null,
      decidedAt: decidedAt.toISOString(),
    };
    const newApprovals = [...approvals.map(mapRecruitmentApprovalStep), step];
    const newStatus =
      body.decision === 'REJECTED'
        ? 'REJECTED'
        : newApprovals.length >= requiredRoles.length
          ? 'APPROVED'
          : 'PENDING';

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
          role: normalizedRole,
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
      replacementEmployeeId: r.replacementEmployeeId ?? null,
      approvals: newApprovals,
    };
  }
}
