import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { validateRecruitmentRequestInput } from '../recruitment-request.validation';

@Injectable()
export class SubmitRecruitmentRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
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
    if (existing.status !== 'DRAFT')
      throw new NotFoundException('Only draft requests can be submitted');

    await validateRecruitmentRequestInput(this.prisma, {
      departmentId: existing.departmentId,
      positionId: existing.positionId,
      type: existing.type,
      replacementUserId: existing.replacementUserId,
      requirePosition: true,
      enforceHeadcount: true,
    });

    const r = await this.prisma.recruitmentRequest.update({
      where: { id },
      data: {
        status: 'PENDING',
        submittedAt: new Date(),
      },
      include: {
        department: { select: { name: true } },
        position: { select: { title: true } },
        submittedBy: { select: { email: true } },
      },
    });

    return {
      id: r.id,
      requestId: r.requestId,
      status: r.status,
      submittedAt: r.submittedAt?.toISOString() ?? null,
    };
  }
}
